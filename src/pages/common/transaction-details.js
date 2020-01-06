import React, {Component} from 'react'

import { connect } from 'react-redux'

import * as menuRedux from '@app/redux/models/menu'
import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';

import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { withRouter } from "react-router-dom";

import { PageHeader, Spin } from 'antd';

import Tx from '@app/components/TransactionCard/tx';

import '../bankadmin/request.less';

import { injectIntl } from "react-intl";

class TransactionDetails extends Component {
  constructor(props) {
    super(props);
    const {location}  = props;
    const transaction = (location && location.state && location.state.transaction)? location.state.transaction : undefined;
    const referrer    = (location && location.state && location.state.referrer)? location.state.referrer : undefined;
    console.log( ' >> transactionDetails referrer > ', location.referrer)
    this.state = {
      loading:      false,
      
      request:      null,
      transaction:  transaction,
      referrer:     referrer,
      intl:         {}
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.onViewRequest              = this.onViewRequest.bind(this); 
  }

  componentDidMount(){
    
    const {formatMessage} = this.props.intl;
    const title = formatMessage({id:'pages.common.transaction-details.title'});
    const error_while_fetching_request = formatMessage({id:'pages.common.transaction-details.error_while_fetching_request'});
    const loading_request = formatMessage({id:'pages.common.transaction-details.loading_request'});

    this.setState({intl:{title, error_while_fetching_request, loading_request}})
    const { match, location, history, lastRootMenu } = this.props;

    console.log(' ~~~location: ', location)
    console.log(' ~~~lastRootMenu:', lastRootMenu)

    if(location && location.state && location.state.transaction)
    {
      this.setState({
          transaction : location.state.transaction
          , referrer : location.state.referrer
        });
      // console.log(' ** transactionDetails::componentDidMount() ', JSON.stringify(location.state.transaction))
      const {transaction} = location.state;
      
      if(transaction.request && (transaction.request.request_id||transaction.request.request_counter))
        this.loadRequest(transaction.request.request_id||transaction.request.request_counter)
    }
  }
  

  loadRequest(id_or_counter){
    const that      = this;
    
    this.setState({loading:true});
    if(isNaN(id_or_counter))
    {
      console.log(' GET REQUEST BY ..... getRequestById => ', id_or_counter)
      api.bank.getRequestById(id_or_counter)
        .then( (data) => {
            // console.log(' ** fetched request object', JSON.stringify(data))
            that.setState({loading:false, request:data})
          },
          (ex) => {
            that.setState({loading:false});
            components_helper.notif.exceptionNotification( this.state.intl.error_while_fetching_request ) ;
          }  
        );
    }
    else
    {
      console.log(' GET REQUEST BY ..... getRequestByCounter => ', id_or_counter)
      api.bank.getRequestByCounter(id_or_counter)
        .then( (data) => {
            // console.log(' ** fetched request object', JSON.stringify(data))
            that.setState({loading:false, request:data})
          },
          (ex) => {
            that.setState({loading:false});
            components_helper.notif.exceptionNotification( this.state.intl.error_while_fetching_request ) ;
            // console.log(' ** ERROR @ processRequest', JSON.stringify(ex))
          }  
        );
    }
  }

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/common/extrato`
    })
  }

  backToReferrer = async () => {
    // this.props.history.push({
    //   pathname: `/${this.props.actualRole}/providers-payments`
    // })
    this.props.history.push({
      pathname: this.props.location.state.referrer
    })
  }

  onViewRequest = (request) => {
    
    const pathname = (this.props.isAdmin ? `/${this.props.actualRole}/external-transfers-process-request` : '/common/request-details')
    this.props.history.push({
      pathname: pathname
      , state: { 
          request:     request
          , referrer:  this.state.referrer
        }
    })
  }

  renderContent() {
  
    const {transaction, request, loading}      = this.state;
                  
    return(
      <Spin spinning={loading} delay={500} tip={this.state.intl.loading_request }>
        <Tx 
              transaction={transaction} 
              request={request} 
              admin={this.props.isAdmin}
              onViewRequest={this.onViewRequest}
        />
      </Spin>);
  }
  
  //
  render() {

    const {referrer} = this.state;
    let content      = this.renderContent();
    let routes       = []; //routesService.breadcrumbForFile(this.props.isAdmin?'external-transfers':'providers');
    if(referrer)
    {
      // console.log(' >> ABOUT TO GET BREADCUMBS FOR ... ', referrer);
      const xpath    = referrer.split('/');
      // routes         = routesService.breadcrumbForFile(xpath[xpath.length-1]);
      routes         = routesService.breadcrumbForPaths([referrer, this.props.location.pathname]);
    }
    const title         = this.state.intl.title;
    
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={title} />
        
        {content}
        
      </>
    );
  }
  
}

//
export default (withRouter(connect(
    (state)=> ({
        accounts:           accountsRedux.accounts(state),
        actualAccountName:  loginRedux.actualAccountName(state),
        actualRole:         loginRedux.actualRole(state),
        actualPrivateKey:   loginRedux.actualPrivateKey(state),
        isLoading:          loginRedux.isLoading(state),
        balance:            balanceRedux.userBalanceFormatted(state),
        isAdmin:            loginRedux.isAdmin(state),
        isBusiness:         loginRedux.isBusiness(state),

        lastRootMenu:       menuRedux.lastRootMenu(state)
    }),
    (dispatch)=>({
        // isAdmin:    bindActionCreators(loginRedux.isAdmin, dispatch),
        // isBusiness: bindActionCreators(loginRedux.isBusiness, dispatch)
    })
)(injectIntl(TransactionDetails)) )
);
