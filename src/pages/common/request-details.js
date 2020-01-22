import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu'
import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'
import * as apiRedux from '@app/redux/models/api';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';
import { withRouter } from "react-router-dom";

import { Modal, Card, PageHeader, Button, Spin } from 'antd';
import { Form, } from 'antd';

import TransactionCard from '@app/components/TransactionCard';

import '../bankadmin/request.less';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

import { injectIntl } from "react-intl";
import * as gqlService from '@app/services/inkiriApi/graphql'
import * as gqlRequestI18nService from '@app/services/inkiriApi/requests-i18n-graphql-helper'

const { confirm } = Modal;


const DEFAULT_RESULT = {
  result:             undefined,
  result_object:      undefined,
  error:              {},
}

class RequestDetails extends Component {
  constructor(props) {
    super(props);
    const {location} = props;
    const request    = (props && props.location && props.location.state && props.location.state.request)? props.location.state.request : undefined;
    const referrer   = (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined;
    this.state = {
      loading:      false,
      isFetching:   false,
      
      ...DEFAULT_RESULT,
       
      request:      request,
      referrer:     referrer,

      intl:         {},
      attachments:       {
        [globalCfg.api.NOTA_FISCAL]       : undefined,
        [globalCfg.api.BOLETO_PAGAMENTO]  : undefined,
        [globalCfg.api.COMPROBANTE]       : undefined,
      },
    };

    // this.handleSearch = this.handleSearch.bind(this); 
    this.renderContent              = this.renderContent.bind(this); 
    this.resetPage                  = this.resetPage.bind(this); 
    this.userResultEvent            = this.userResultEvent.bind(this); 
  }
  
  componentDidMount(){
    const { match, location, history, lastRootMenu } = this.props;
    if(location && location.state && location.state.request)
    {
      // console.log(' WHAT????')
      this.setState({
          request : location.state.request
          , referrer : location.state.referrer
        })
    }
    const {formatMessage} = this.props.intl;
    const title = formatMessage( { id:'pages.common.request-details.title'});
    const cant_fetch_request = formatMessage( { id:'pages.common.request-details.cant_fetch_request'});
    const only_one_file = formatMessage( { id:'pages.common.request-details.only_one_file'});
    const pushing_transaction = formatMessage( { id:'pages.common.request-details.pushing_transaction'});
    const loading_request = formatMessage( { id:'pages.common.request-details.loading_request'});
    const valid_number_required_description = formatMessage( { id:'pages.common.request-details.valid_number_required_description'});
    const confirm_payment = formatMessage( { id:'pages.common.request-details.confirm_payment'});
    const error_service_price_mismatch = formatMessage( { id:'pages.common.request-details.error_service_price_mismatch'});
    const confirm_accept_service = formatMessage( { id:'pages.common.request-details.confirm_accept_service'});
    const confirm_accept_service_message = formatMessage( { id:'pages.common.request-details.confirm_accept_service_message'});
    const receipt_attach_required = formatMessage( { id:'pages.common.request-details.receipt_attach_required'});
    const receipt_attach_required_message = formatMessage( { id:'pages.common.request-details.receipt_attach_required_message'});
    const cancel_service = formatMessage( { id:'pages.common.request-details.cancel_service'});
    const cancel_service_message = formatMessage( { id:'pages.common.request-details.cancel_service_message'});
    const cancel_request = formatMessage( { id:'pages.common.request-details.cancel_request'});
    const cancel_request_message = formatMessage( { id:'pages.common.request-details.cancel_request_message'});
    const cancel_request_and_refund_message = formatMessage( { id:'pages.common.request-details.cancel_request_and_refund_message'});
    const reject_service_request = formatMessage( { id:'pages.common.request-details.reject_service_request'});
    const reject_service_request_message = formatMessage( { id:'pages.common.request-details.reject_service_request_message'});
    const reject_payment_request = formatMessage( { id:'pages.common.request-details.reject_payment_request'});
    const reject_payment_request_message = formatMessage( { id:'pages.common.request-details.reject_payment_request_message'});
    const action_process_request = formatMessage( { id:'pages.common.request-details.action.process_request'});
    const action_accept = formatMessage( { id:'pages.common.request-details.action.accept'});
    const action_accept_and_send = formatMessage( { id:'pages.common.request-details.action.accept_and_send'});
    const action_cancel = formatMessage( { id:'pages.common.request-details.action.cancel'});
    const action_cancel_get_refunded = formatMessage( { id:'pages.common.request-details.action.cancel_get_refunded'});
    const action_reject = formatMessage( { id:'pages.common.request-details.action.reject'});
    const action_revert_and_refund = formatMessage( { id:'pages.common.request-details.action.revert_and_refund'});
    const action_upload_nota = formatMessage( { id:'pages.common.request-details.action.upload_nota'});
    const action_attach_files = formatMessage( { id:'pages.common.request-details.action.attach_files'});
    const action_refund = formatMessage( { id:'pages.common.request-details.action.refund'});
    this.setState({intl:{action_cancel_get_refunded, title, cant_fetch_request, only_one_file, pushing_transaction, loading_request, valid_number_required_description, confirm_payment, error_service_price_mismatch, confirm_accept_service, confirm_accept_service_message, receipt_attach_required, receipt_attach_required_message, cancel_service, cancel_service_message, cancel_request, cancel_request_message, cancel_request_and_refund_message, reject_service_request, reject_service_request_message, reject_payment_request, reject_payment_request_message, action_process_request, action_accept, action_accept_and_send, action_accept, action_cancel, action_reject, action_cancel, action_cancel, action_reject, action_revert_and_refund, action_upload_nota, action_attach_files, action_refund}});
  }
  
  componentDidUpdate(prevProps, prevState) 
  {
    let new_state = {};
    if(prevProps.isFetching!=this.props.isFetching){
      new_state = {...new_state, isFetching:this.props.isFetching}
    }
    const errors_changed = !utils.arraysEqual(prevProps.getErrors, this.props.getErrors);
    if(errors_changed ){
      const that = this;
      setTimeout(()=> that.reload() ,100);
    }
    if(!utils.arraysEqual(prevProps.getResults, this.props.getResults) ){
      
      const lastResult = this.props.getLastResult;
      if(lastResult)
      {
        const that = this;
        setTimeout(()=> that.reload() ,100);
      }
    }


    if(Object.keys(new_state).length>0)      
        this.setState(new_state);
  }

  reload = async () => {
    const that      = this;
    this.setState({loading:true});
    const key = this.state.request.id;

    try{
      const data = await gqlRequestI18nService.request({id:key, account_name:this.props.actualAccountName}, this.props.intl);
      console.log(data)
      this.setState({request:data})
    }
    catch(e)
    {
      this.setState({loading:false});
      components_helper.notif.exceptionNotification(this.state.intl.cant_fetch_request, e);
    }
    this.setState({loading:false});
    
  }

  getPropsForUploader(name){
    const filelist = this.state.attachments[name] || [];
    return {
      onRemove: file => {
        this.setState(state => {
          const index         = state.attachments[name].indexOf(file);
          const newFileList   = state.attachments[name].slice();
          newFileList.splice(index, 1);
          return {
            attachments: {[name]: newFileList}
          };
        });
      },
      beforeUpload: file => {
        if(this.state.attachments[name] && this.state.attachments[name].length>0)
        {
          components_helper.notif.infoNotification(this.state.intl.only_one_file);
          return false;
        }

        let attachments = this.state.attachments || {};
        attachments[name]= [file];
        this.setState(state => ({
          ...attachments
        }));
        return false;
      },
      fileList: filelist,
      className: filelist.length>0?'icon_color_green':'icon_color_default'
    };
  }
  

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/common/extrato`
    })
  }

  backToReferrer = async () => {
    this.props.history.push({
      pathname: this.props.location.state.referrer
    })
  }

  resetPage(){
    this.setState({...DEFAULT_RESULT});
    this.props.clearAll();
  }

  resetResult(){
    this.setState({...DEFAULT_RESULT});
    // reset Errors and results
    this.props.clearAll();
  }

  userResultEvent = (evt_type) => {
    // console.log(' ** userResultEvent -> EVT: ', evt_type)
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

    const {request, isFetching, loading}= this.state;
    const buttons                       = this.getActions();
    const notaUploaderProps             = this.getPropsForUploader(globalCfg.api.NOTA_FISCAL);
    const boletoUploaderProps           = this.getPropsForUploader(globalCfg.api.BOLETO_PAGAMENTO);
    const comprobanteUploaderProps      = this.getPropsForUploader(globalCfg.api.COMPROBANTE);
    const uploader                      = {
                  [globalCfg.api.NOTA_FISCAL] :notaUploaderProps
                  ,[globalCfg.api.BOLETO_PAGAMENTO] :boletoUploaderProps
                  ,[globalCfg.api.COMPROBANTE] :comprobanteUploaderProps };
                  
    return(
      <Spin spinning={isFetching||loading} delay={500} tip={loading?this.state.intl.loading_request:this.state.intl.pushing_transaction}>
        <TransactionCard 
              request={request} 
              admin={this.props.isAdmin}
              uploader={uploader}
        />
        <div className="c-detail bottom">
          <Card style={ { marginBottom: 24, textAlign:'center' } }  >
          { buttons?buttons.map(button=>button):(<></>)}
          </Card>
        </div>
      </Spin>);
  }
  //
  
  getAttach(attach_name){
    const attachments      = this.state.attachments;
    return (attachments[attach_name] && attachments[attach_name].length>0) ? attachments[attach_name][0] : undefined; 
  }

  // Accepts money request and send the money .
  acceptAndSendRequest(){
    const {request}      = this.state;
    const {_id, amount, requested_by, requested_to, requestCounterId, description} = request;
    const privateKey     = this.props.actualPrivateKey;
    const receiver       = requested_by.account_name;
    // const sender         = requested_to.account_name;
    const sender         = this.props.actualAccountName;
    const memo           = description
    
    if(isNaN(amount))
    {
      components_helper.notif.errorNotification(this.state.intl.valid_number_required_description);
      return;
    }
    if(parseFloat(amount)>parseFloat(this.props.balance))
    {
      const balance_txt = globalCfg.currency.toCurrencyString(this.props.balance);
      const minimum_amount_required = this.props.intl.formatMessage( { id:'pages.common.request-details.minimum_amount_required'}, {balance:balance_txt});
      components_helper.notif.errorNotification(minimum_amount_required);
      return;
    } 
    //`
    const that = this;
    const confirm_payment_message = this.props.intl.formatMessage( { id:'pages.common.request-details.confirm_payment_message'}
          , {  amount:     globalCfg.currency.toCurrencyString(amount)
              , receiver:  receiver
              , bold:      (str) => <b key={Math.random()}>{str}</b>});
    //
    Modal.confirm({
      title:   this.state.intl.confirm_payment,
      content: confirm_payment_message,
      onOk() {
        
        const _function = globalCfg.api.isPayment(request)?'sendPayment':'sendMoney';   
        //ToDo
        const steps= [
          {
            _function:           _function
            , _params:           [sender, privateKey, receiver, amount, memo, requestCounterId]
          }, 
          {
            _function:           'bank.updatePaymentRequest'
            , _params:           [sender, _id, api.bank.REQUEST_RECEIVER ] 
            , last_result_param: [{field_name:'transaction_id', result_idx_diff:-1}]
          },
        ]
        that.props.callAPIEx(steps)
        
      },
      onCancel() {
        // that.setState({pushingTx:false})
        console.log('Cancel');
      },
    }); 
  }

  acceptServiceRequest = async () =>{

    const {_id, amount, service, service_extra, requested_by, requested_to, requestCounterId} = this.state.request;
    const private_key    = this.props.actualPrivateKey;
    const provider       = requested_by.account_name;
    const customer       = requested_to.account_name;
    const sender         = globalCfg.currency.issuer; //this.props.actualAccountName;
    const auth_account   = this.props.actualAccountName;
    const begins_at      = api.pap_helper.getServiceBeginTimestamp(service_extra.begins_at)
    const periods        = api.pap_helper.getServicePeriods(service_extra)

    if(amount!=service.amount)
    {
      const error_service_price_mismatch_message = this.props.intl.formatMessage( { id:'pages.common.request-details.error_service_price_mismatch_message'}, {amount:amount, service_amount:service.amount});
      components_helper.notif.warningNotification(this.state.intl.error_service_price_mismatch, error_service_price_mismatch_message);
      return;
    } 
    
    const that = this;
    
    Modal.confirm({
      title:   this.state.intl.confirm_accept_service, 
      content: this.state.intl.confirm_accept_service_message,
      onOk() {
          
        //ToDo
        const steps= [
          {
            _function:           'acceptService'
            , _params:           [auth_account, private_key, customer, provider, service.serviceCounterId, service.amount, begins_at, periods, request.requestCounterId]
          }, 
          {
            _function:           'bank.acceptServiceRequest'
            , _params:           [auth_account, _id, api.bank.REQUEST_RECEIVER] 
            , last_result_param: [{field_name:'transaction_id', result_idx_diff:-1}]
          },
        ]
        that.props.callAPIEx(steps)
        
      },
      onCancel() {
        // that.setState({pushingTx:false})
        console.log('Cancel');
      },
    });  
        
  }

  
  attachNota(){
    
    const my_NOTA_FISCAL   = this.getAttach(globalCfg.api.NOTA_FISCAL);
    if(!my_NOTA_FISCAL)
    {
      components_helper.notif.errorNotification(this.state.intl.receipt_attach_required, this.state.intl.receipt_attach_required_message);
      return;
    }   
    const that      = this;  
    const {request} = that.state;
    
    const step ={
            _function:   'bank.updateExternalFiles'
            , _params:   [this.props.actualAccountName, request.id, request.state, {[globalCfg.api.NOTA_FISCAL]:my_NOTA_FISCAL}]
          }
        
    that.props.callAPI(step._function, step._params)
    
  }

  cancelService(){
    let that = this;  
    confirm({
      title:   this.state.intl.cancel_service,
      content: this.state.intl.cancel_service_message,
      onOk() {

        const {request} = that.state;
        const step ={
            _function:   'bank.cancelService'
            , _params:   [that.props.actualAccountName, api.bank.REQUEST_SENDER,request.id]
          }
        
        that.props.callAPI(step._function, step._params)
        
      },
      onCancel() {
        
      },
    });
  }

  cancelRequest(){
    let that = this;  
    
    confirm({
      title:   this.state.intl.cancel_request,
      content: this.state.intl.cancel_request_message,
      onOk() {
        const {request} = that.state;
        //ToDo
        const step ={
            _function:   'bank.cancelExternal'
            , _params:   [that.props.actualAccountName, request.id]
          }
        that.props.callAPI(step._function, step._params)
      },
      onCancel() {
      },
    });
  }
  
  getRefund(){
    let that = this;  
    
    confirm({
      title:   this.state.intl.cancel_request,
      content: this.state.intl.cancel_request_and_refund_message,
      onOk() {
        const {request} = that.state;
        //ToDo
        const step ={
            _function:   'bank.getRefundExternal'
            , _params:   [that.props.actualAccountName, request.id]
          }
        that.props.callAPI(step._function, step._params)
      },
      onCancel() {
      },
    });
  }

  rejectServiceRequest(){
    const that       = this;
    
    Modal.confirm({
      title:   this.state.intl.reject_service_request,
      content: this.state.intl.reject_service_request_message,
      onOk() {
        const {request}  = that.state;
        const sender     = that.props.actualAccountName;
        const step ={
                _function:   'bank.rejectService'
                , _params:   [sender, api.bank.REQUEST_RECEIVER, request.id]
              }
        
        that.props.callAPI(step._function, step._params)
      },
      onCancel() {
        // that.setState({pushingTx:false})
        console.log('Cancel');
      },
    });  
    
  }

  rejectPaymentRequest(){
    const that       = this;
    
    Modal.confirm({
      title:   this.state.intl.reject_payment_request,
      content: this.state.intl.reject_payment_request_message,
      onOk() {
        const {request}  = that.state;
        const sender     = that.props.actualAccountName;
        const step ={
                _function:   'bank.rejectPaymentRequest'
                , _params:   [sender, request.id, api.bank.REQUEST_RECEIVER]
              }
        
        that.props.callAPI(step._function, step._params)
      },
      onCancel() {
        
        console.log('Cancel');
      },
    });  
    
  }
  
  getActions(){
    const {request, isFetching, intl}    = this.state;
    if(!request)
      return [];
    
    const acceptAndSendButton = (<Button loading={isFetching} size="large" onClick={() => this.acceptAndSendRequest()} key="acceptSendButton" type="primary" title="" >
      {intl.action_accept_and_send}</Button>);
    //
    const acceptServiceButton = (<Button loading={isFetching} size="large" onClick={() => this.acceptServiceRequest()} key="acceptServiceButton" type="primary" title="" >
      {intl.action_accept}</Button>);
    //
    const cancelServiceButton = (<Button loading={isFetching} size="large" onClick={() => this.cancelService(false)} key="cancelServiceButton" className="danger_color" style={{marginLeft:16}} type="link" >
      {intl.action_cancel}</Button>);
    //
    const rejectServiceButton = (<Button loading={isFetching} size="large" onClick={() => this.rejectServiceRequest()} key="rejectServiceButton" className="danger_color" style={{marginLeft:16}} type="link" >
      {intl.action_reject}</Button>);
    //
    const getRefundButton  = (<Button loading={isFetching} size="large" onClick={() => this.getRefund()} key="getRefundButton" className="danger_color" style={{marginLeft:16}} type="link" >
      {intl.action_cancel_get_refunded}</Button>);
    //
    const cancelButton        = (<Button loading={isFetching} size="large" onClick={() => this.cancelRequest()} key="cancelButton" className="danger_color" style={{marginLeft:16}} type="link" >
      {intl.action_cancel}</Button>);    
    //
    const rejectButton        = (<Button loading={isFetching} size="large" onClick={() => this.rejectPaymentRequest()} key="rejectButton" className="danger_color" style={{marginLeft:16}} type="link" >
      {intl.action_reject}</Button>);
    //
    // const revertButton        = (<Button loading={isFetching} size="large" onClick={() => this.revertRequest()} key="revertButton" className="danger_color" style={{marginLeft:16}} type="link" >
    //   {intl.action_revert_and_refund}</Button>);
    //
    const attachNotaButton    = (<Button loading={isFetching} size="large" onClick={() => this.attachNota()} key="updateButton" type="primary" style={{marginLeft:16}} type="primary" >
      {intl.action_upload_nota}</Button>);
    //
    // const attachFiles         = (<Button loading={isFetching} size="large" onClick={() => this.attachFiles()} key="attachButton" type="primary" style={{marginLeft:16}} type="primary" >
    //   {intl.action_attach_files}</Button>);
    //
    // const refundButton        = (<Button loading={isFetching} size="large" onClick={() => this.refundRequest()} key="refundButton" type="primary" style={{marginLeft:16}} type="primary" >
    //   {intl.action_refund}</Button>);
    
    //
    const requires_attachment = globalCfg.api.requiresAttach(request);
    
    switch (request.state){
      case globalCfg.api.STATE_REQUESTED:

        // Special case for Service request.
        if(this.props.isPersonal && globalCfg.api.isService(request))
        {
          return [acceptServiceButton, rejectServiceButton]; 
        }

        if(this.props.isBusiness && globalCfg.api.isService(request) && request.requested_by.account_name==this.props.actualAccountName)
        {
          return [cancelServiceButton]; 
        }

        if(this.props.isBusiness && globalCfg.api.isService(request) && request.requested_by.account_name!=this.props.actualAccountName)
        {
          return [acceptServiceButton, rejectServiceButton]; 
        }

        if(globalCfg.api.isSendOrPayment(request)){
          if(request.requested_by.account_name==this.props.actualAccountName)
          {
            return [cancelButton];
          }
          return [acceptAndSendButton, rejectButton];
        }

        return [cancelButton];
        break;
      
      case globalCfg.api.STATE_RECEIVED:
        const can_refund = globalCfg.api.canRefund(request);
        if(!request.attach_nota_fiscal_id)
          return [(requires_attachment&&attachNotaButton), (can_refund&&getRefundButton)];
        
        return [(can_refund&&getRefundButton)];
        break;
      
      case globalCfg.api.STATE_PROCESSING:
        
        if(this.props.isBusiness || this.props.isPersonal)
          if(!request.attach_nota_fiscal_id && requires_attachment)
            return [attachNotaButton];
          
        return [];
      break;
      case globalCfg.api.STATE_REJECTED:
        return [];
      break;
      case globalCfg.api.STATE_REVERTED:
        return [];
        break;
      case globalCfg.api.STATE_REFUNDED:
        return [];
      break;
      break;
      case globalCfg.api.STATE_ACCEPTED:
        // Special case for Service request.
        
        if(!request.attach_nota_fiscal_id && requires_attachment)
          return [attachNotaButton];
        return [];
      break;
      case globalCfg.api.STATE_ERROR:
        return [];
      break;
      case globalCfg.api.STATE_CANCELED:
        return [];
      break;
    }
  }
  //
  render() {

    const {request, referrer, loading, intl} = this.state;
    if(!request)
      return (<Spin loading="true" />)
    let content      = this.renderContent();
    let routes       = routesService.breadcrumbForFile(this.props.isAdmin?'external-transfers':'providers');
    if(referrer)
    {
      routes         = routesService.breadcrumbForPaths([referrer, this.props.location.pathname]);
    }
    
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={[<Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reload()} ></Button>]}
          title={intl.title} />
        
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
        isBusiness:         loginRedux.isBusiness(state),
        isPersonal:         loginRedux.isPersonal(state),
        lastRootMenu:       menuRedux.lastRootMenu(state),

        isFetching:       apiRedux.isFetching(state),
        getErrors:        apiRedux.getErrors(state),
        getLastError:     apiRedux.getLastError(state),
        getResults:       apiRedux.getResults(state),
        getLastResult:    apiRedux.getLastResult(state),
    }),
    (dispatch)=>({
        callAPI:          bindActionCreators(apiRedux.callAPI, dispatch),
        callAPIEx:        bindActionCreators(apiRedux.callAPIEx, dispatch),
        clearAll:         bindActionCreators(apiRedux.clearAll, dispatch),

    })
)(injectIntl(RequestDetails)) )
);
