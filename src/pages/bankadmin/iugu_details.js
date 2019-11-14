import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';

import PropTypes from "prop-types";

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Modal, Card, PageHeader, Tag, Button, Spin } from 'antd';
import { notification, Form, Icon, InputNumber, Input } from 'antd';

import TransactionCard from '@app/components/TransactionCard';
import TransactionAccount from '@app/components/TransactionCard/account';
import TransactionTitleAndAmount from '@app/components/TransactionCard/title_amount';
import IuguAlias from '@app/components/TransactionCard/iugu_alias';
import TransactionTitle from '@app/components/TransactionCard/title';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

const DEFAULT_RESULT = {
  result:             undefined,
  result_object:      undefined,
  error:              {},
}

const DEFAULT_ATTACHS = {
  attachments:       {
        [globalCfg.api.NOTA_FISCAL]       : undefined,
        [globalCfg.api.BOLETO_PAGAMENTO]  : undefined,
        [globalCfg.api.COMPROBANTE]       : undefined,
      }
}
class iuguDetails extends Component {
  constructor(props) {
    super(props);
    const invoice       = (props && props.location && props.location.state && props.location.state.invoice)? props.location.state.invoice : undefined;
    this.state = {
      referrer:        (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,
      loading:      false,
      receipt:      '',
      amount:       0,
      memo:         '',
      pushingTx:    false,
      
      ...DEFAULT_RESULT,
      
      invoice:       invoice,
      
      ...DEFAULT_ATTACHS,
    };

    // this.handleSearch = this.handleSearch.bind(this); 
    this.onSelect                   = this.onSelect.bind(this); 
    this.renderContent              = this.renderContent.bind(this); 
    this.resetPage                  = this.resetPage.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.userResultEvent            = this.userResultEvent.bind(this); 
  }

  static propTypes = {
    match: PropTypes.object,
    location: PropTypes.object,
    history: PropTypes.object
  };

  componentDidMount(){
    const { match, location, history } = this.props;
    // console.log( 'processRequest::router-params >>' , JSON.stringify(this.props.location.state.request) );
    if(this.props.location && this.props.location.state)
    {
      this.setState({  invoice : this.props.location.state.invoice })
    }
  }

  reload(){
    const that      = this;
    const {invoice} = this.state;
    this.setState({pushingTx:true});
    api.bank.getIuguInvoiceById(invoice.id)
        .then( (data) => {
            that.setState({pushingTx:false, invoice:data})
          },
          (ex) => {
            that.openNotificationWithIcon("error", 'An error occurred reloading invoice', JSON.stringify(ex));
            that.setState({pushingTx:false});
            console.log(' ** ERROR @ iuguDetails', JSON.stringify(ex))
          }  
        );
  }

  onSelect(value) {
    console.log('onSelect', value);
    this.setState({receipt:value})
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/dashboard`
    })
  }

  backToReferrer = async () => {
    this.props.history.push({
      pathname: this.state.referrer
    })
  }

  resetPage(){
    this.setState({...DEFAULT_RESULT});
  }

  resetResult(){
    this.setState({...DEFAULT_RESULT});
  }

  userResultEvent = (evt_type) => {
    console.log(' ** userResultEvent -> EVT: ', evt_type)
    if(evt_type==DASHBOARD)
      this.backToDashboard();
    if(evt_type==RESET_RESULT)
      this.resetResult();
    if(evt_type==RESET_PAGE)
      this.resetPage();
    
  }

  renderContent() {
    
    if(this.state.result)
    {
      const result_type = this.state.result;
      const title       = null;
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      const result = (<TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />);
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
                <div className="ly-main-content content-spacing cards">
                  <section className="mp-box mp-box__shadow money-transfer__box">
                    {result}
                  </section>
                </div>      
              </div>);
    }
    //
    const {invoice, pushingTx}      = this.state;
    const buttons                   = this.getActionsForInvoice();
     
    // monto
    // descripcion
    // alias (receptor)
    // recepcion
    //   link a cuenta receptora o error si no hay cuenta receptor
    // error si tiene y no es de cuenta receptora
    // link a iugu
    // link a blockchain

    return (
      <Spin spinning={pushingTx} delay={500} tip="Pushing transaction...">
        <div className="c-detail">
          <TransactionTitle title="IUGU Payment" button={(null)} />
          <TransactionTitleAndAmount title='Amount'  amount={parseFloat(invoice.amount).toFixed(2)}/>
          <IuguAlias profile={{alias:invoice.receipt_alias}}/>          
          

        </div>
        <div className="c-detail bottom">
          <Card style={ { marginBottom: 24, textAlign:'center' } }>
          { buttons?buttons.map(button=>button):(<></>)}
          </Card>
        </div>
      </Spin>);
  }
  
  processInvoice(){
    let that = this;  
    that.setState({pushingTx:true});
    
    Modal.confirm({
      title: 'Confirm process invoice',
      content: 'You will now try to issue to receipt alias.',
      onOk() {
        const {request} = that.state;
        api.bank.processIuguInvoiceById(that.state.invoice.id)
        .then( (data) => {
            that.setState({pushingTx:false})
            that.openNotificationWithIcon("success", 'Invoice processed successfully');
            that.reload();
          },
          (ex) => {
            that.setState({pushingTx:false})
            that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(ex));
            console.log(' ** ERROR @ processInvoice', JSON.stringify(ex))
          }  
        );
        
      },
      onCancel() {
        console.log('Cancel');
        that.setState({pushingTx:false})
      },
    });
    
  }
  
  
  getActionsForInvoice(){
    const {invoice, pushingTx}    = this.state;
    
    const processButton = (<Button loading={pushingTx} size="large" onClick={() => this.processInvoice()} key="processButton" type="primary" title="" >PROCESS INVOICE</Button>);
    //
    switch (invoice.state){
      case request_helper.iugu.STATE_ERROR:
      case request_helper.iugu.STATE_ISSUE_ERROR:
        return [processButton];
      break;
      default:
        return[]
      break;
    }
  }

  //
  render() {
    let content     = this.renderContent();
    const title     = 'Process invoice';
    const routes    = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={title}>
        </PageHeader>

        {content}

      </>
    );
  }
  
}

//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:           accountsRedux.accounts(state),
        actualAccountName:  loginRedux.actualAccountName(state),
        actualRole:         loginRedux.actualRole(state),
        actualPrivateKey:   loginRedux.actualPrivateKey(state),
        isLoading:          loginRedux.isLoading(state),
        balance:            balanceRedux.userBalanceFormatted(state),
        isAdmin:            loginRedux.isAdmin(state),
        isBusiness:         loginRedux.isBusiness(state)
    }),
    (dispatch)=>({
        // isAdmin:    bindActionCreators(loginRedux.isAdmin, dispatch),
        // isBusiness: bindActionCreators(loginRedux.isBusiness, dispatch)
    })
)(iuguDetails) )
);
