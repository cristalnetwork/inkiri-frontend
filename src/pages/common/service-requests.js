import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as globalCfg from '@app/configs/global';

import * as api from '@app/services/inkiriApi';
import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { DISPLAY_SERVICE} from '@app/components/TransactionTable';
import * as columns_helper from '@app/components/TransactionTable/columns';
import TableStats from '@app/components/TransactionTable/stats'; 
import * as stats_helper from '@app/components/TransactionTable/stats';

import { Card, PageHeader, Tabs, Button,  Modal, Table, Spin } from 'antd';

import RequestListWidget from '@app/components/request-list-widget';

import { injectIntl } from "react-intl";

class ServiceRequests extends Component {
  constructor(props) {
    super(props);
    const props_provider = (props && props.location && props.location.state && props.location.state.provider)? props.location.state.provider : null;
    const props_service  = (props && props.location && props.location.state && props.location.state.service)? props.location.state.service : null;
    this.state = {
      referrer:           (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,
      loading:            false,
      pushingTx:          false,
      
      provider:           props_provider || props.actualAccountProfile,
      service:            props_service || null,

      page_key_requests:   `${props.location.pathname}_${DISPLAY_SERVICE}`,

      intl:               {}
    };

    this.onRequestClick   = this.onRequestClick.bind(this);
    this.goBack           = this.goBack.bind(this); 
  }

  goBack(){
    this.props.history.goBack();
  }

  componentDidMount = async () => {

    const {formatMessage} = this.props.intl;
    const title           = formatMessage({id:'pages.common.service_requests.title'});
    this.setState({intl:{title}})

    const { location } = this.props;
    if(location && location.state)
    {
      this.setState({
          provider: location.state.provider || this.props.actualAccountProfile,
          service:  location.state.service
      }, async () => {
          
          // const _y_dummy = await this.loadServiceRequests();  
      });
    }
  } 

  componentDidUpdate(prevProps, prevState) 
  {
    if(prevProps.referrer !== this.props.referrer) {
      this.setState({
        referrer         : this.props.referrer,
      });
    }

    const {provider, service, actualAccountProfile} = this.props;
    if(prevProps.provider !== provider) {
      this.setState({ provider:provider || actualAccountProfile, service: service});
    }
  }

  onRequestClick(request){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: '/common/request-details'
      , state: { 
          request: request 
          , referrer: this.props.location.pathname
        }
    })
  }
  
  // Component Events
  
  render() {
    const service_info            = this.renderServiceInfo();
    const {service, loading, intl, page_key_requests}         = this.state;
    const title                   = intl.title;
    
    // const routes    = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    // const routes    = routesService.breadcrumbForPaths([this.props.location.pathname]);
    // breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}

    const request_filter = {account_name:this.props.actualAccountName
      , page:           "0"
      , limit:           "100"
      , requested_type: globalCfg.api.TYPE_SERVICE 
      , state:          `${globalCfg.api.STATE_REQUESTED},${globalCfg.api.STATE_REJECTED},${globalCfg.api.STATE_ERROR},${globalCfg.api.STATE_CANCELED}`
      , from:           this.props.actualAccountName
      , service_id:     service._id}
    return (
      <>
        <PageHeader
          title={title}
          onBack={()=>this.goBack()}
        />
          
          {service_info}
          
          <div className="styles standardList" style={{ marginTop: 24 }}>
          <Card key={'card_master'}  >
            <RequestListWidget filter_hidden_fields={['from', 'requested_type']}
                               filter={ request_filter } 
                               request_type={DISPLAY_SERVICE} 
                               the_key={page_key_requests} 
                               callback={this.onRequestClick} onRef={ref => (this.table_widget = ref)}/>
          </Card>
        </div>
      </>
    );
  }
  //
  renderServiceInfo(){
    const {title, description, amount, state} = this.state.service;  
    const {intl} = this.state;
  
    const items = [
        stats_helper.buildItemSimple(intl.stat_title_service, title)
        , stats_helper.buildItemSimple(intl.stat_title_desc, description)
        , stats_helper.buildItemMoney(intl.stat_title_price, amount)
        , stats_helper.buildItemSimple(intl.stat_title_state, state)
      ]
    return (<div style={{ background: '#fff', padding: 24, marginTop: 24}}>
        <TableStats stats_array={items} visible={true} can_close={false}/>
      </div>)
  }
}
//
export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRoleId:         loginRedux.actualRoleId(state),
        actualRole:           loginRedux.actualRole(state),
        actualAccountProfile: loginRedux.actualAccountProfile(state),
        actualPrivateKey:     loginRedux.actualPrivateKey(state),
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch),
        loadBalance:             bindActionCreators(balanceRedux.loadBalance, dispatch)
    })
)(injectIntl(ServiceRequests)))
);