import React, {useState, Component} from 'react'

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

import PropTypes from "prop-types";

import { Modal, Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin, Descriptions } from 'antd';
import { notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import TransactionCard from '@app/components/TransactionCard';

import '../bankadmin/request.less';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

const { Paragraph, Text } = Typography;
const { confirm } = Modal;


const DEFAULT_RESULT = {
  result:             undefined,
  result_object:      undefined,
  error:              {},
}

class requestDetails extends Component {
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

      attachments:       {
        [globalCfg.api.NOTA_FISCAL]       : undefined,
        [globalCfg.api.BOLETO_PAGAMENTO]  : undefined,
        [globalCfg.api.COMPROBANTE]       : undefined,
      },
    };

    // this.handleSearch = this.handleSearch.bind(this); 
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
    const { match, location, history, lastRootMenu } = this.props;
    if(location && location.state && location.state.request)
    {
      // console.log(' WHAT????')
      this.setState({
          request : location.state.request
          , referrer : location.state.referrer
        })
    }
  }
  
  componentDidUpdate(prevProps, prevState) 
  {
    let new_state = {};
    if(prevProps.isFetching!=this.props.isFetching){
      new_state = {...new_state, isFetching:this.props.isFetching}
    }
    if(prevProps.getErrors!=this.props.getErrors){
      const ex = this.props.getLastError;
      new_state = {...new_state, 
          getErrors:     this.props.getErrors, 
          result:        ex?'error':undefined, 
          error:         ex?JSON.stringify(ex):null}
      if(ex)
        components_helper.notif.exceptionNotification("An error occurred!", ex);
    }
    if(prevProps.getResults!=this.props.getResults){
      const lastResult = this.props.getLastResult;
      new_state = {...new_state, 
        getResults:      this.props.getResults, 
        result:          lastResult?'ok':undefined, 
        result_object:   lastResult};
      if(lastResult)
        components_helper.notif.successNotification('Operation completed successfully')
    }


    if(Object.keys(new_state).length>0)      
        this.setState(new_state);
  }

  reload(id){
    const that      = this;
    this.setState({loading:true});
    const key = id?id:this.state.request.id;
    api.bank.getRequestById(key)
        .then( (data) => {
            // console.log(' ** fetched request object', JSON.stringify(data))
            that.setState({loading:false, request:data})
          },
          (ex) => {
            this.setState({loading:false});
            this.openNotificationWithIcon("error", "Cant fetch request", JSON.stringify(ex))    
            // console.log(' ** ERROR @ processRequest', JSON.stringify(ex))
          }  
        );
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  getPropsForUploader(name){
    const filelist = this.state.attachments[name] || [];
    // console.log(' FILELIST OF '+name, JSON.stringify(filelist) )
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
          this.openNotificationWithIcon("info", "Only 1 file allowed")    
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
    };
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

  resetPage(){
    this.setState({...DEFAULT_RESULT});
    // this.setState({...DEFAULT_RESULT, ...DEFAULT_STATE});
    // reset Errors and results
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

    const {request, isFetching, loading} = this.state;
    const buttons                       = this.getActions();
    const notaUploaderProps             = this.getPropsForUploader(globalCfg.api.NOTA_FISCAL);
    const boletoUploaderProps           = this.getPropsForUploader(globalCfg.api.BOLETO_PAGAMENTO);
    const comprobanteUploaderProps      = this.getPropsForUploader(globalCfg.api.COMPROBANTE);
    const uploader                      = {
                  [globalCfg.api.NOTA_FISCAL] :notaUploaderProps
                  ,[globalCfg.api.BOLETO_PAGAMENTO] :boletoUploaderProps
                  ,[globalCfg.api.COMPROBANTE] :comprobanteUploaderProps };
                  
    return(
      <Spin spinning={isFetching||loading} delay={500} tip={loading?'Loading...':'Pushing transaction...'}>
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
  
  processRequest(){
  }

  getAttach(attach_name){
    const attachments      = this.state.attachments;
    return (attachments[attach_name] && attachments[attach_name].length>0) ? attachments[attach_name][0] : undefined; 
  }

  acceptRequest(){
    
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
      this.openNotificationWithIcon('warning', 'The service price requested by provider is different than the service price.', `Requested price: ${amount}. Service listing price:${service.amount}.`); //`
      return;
    } 
    
    const that = this;
    // that.setState({pushingTx:true});
    
    // console.log(_id, 
    //     auth_account
    //     , private_key
    //     , customer
    //     , provider
    //     , service.serviceCounterId
    //     , service.amount
    //     , begins_at
    //     , periods);
    
    Modal.confirm({
      title: 'You will accept the service provisioning request',
      content: 'Please confirm service provisioning acceptance. This contract cant be cancelled by you.',
      onOk() {
          
        //ToDo
        const steps= [
          {
            _function:           'acceptService'
            , _params:           [auth_account, private_key, customer, provider, service.serviceCounterId, service.amount, begins_at, periods]
          }, 
          {
            _function:           'bank.acceptServiceRequest'
            , _params:           [auth_account, _id] 
            , last_result_param: [{field_name:'transaction_id', result_idx_diff:-1}]
          },
        ]
        that.props.callAPIEx(steps)
        // api.acceptService(auth_account
        //                   , private_key
        //                   , customer
        //                   , provider
        //                   , service.serviceCounterId
        //                   , service.amount
        //                   , begins_at
        //                   , periods)
        // .then((data)=>{
        //       console.log(' requestDetails::issue (then#1) >>  ', JSON.stringify(data));
        //       if(data && data.data && data.data.transaction_id)
        //       {
        //         // updeteo la tx
        //         api.bank.acceptServiceRequest(auth_account, _id, data.data.transaction_id)
        //           .then( (update_res) => {
        //               console.log(' requestDetails::issue (then#2) >> update_res ', JSON.stringify(update_res), JSON.stringify(data));
        //               console.log(' requestDetails::issue (then#2) >> data ', JSON.stringify(data));
        //               that.reload();
        //               that.setState({result:'ok', pushingTx:false, result_object:data});
        //               that.openNotificationWithIcon("success", 'Service provisioning request accepted successfully');
        //             }, (err) => {
                      
        //               that.setState({result:'error', pushingTx:false, error:JSON.stringify(err)});
        //               that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(err));
        //             });
        //       }
        //       else{
        //         that.setState({result:'error', pushingTx:false, error:'UNKNOWN!'});
        //         that.openNotificationWithIcon("error", 'An error occurred', 'UNKNOWN!'+JSON.stringify(data));
        //       }
              
        //     }, (ex)=>{
        //       console.log(' requestDetails::issue (error#1) >>  ', JSON.stringify(ex));
        //       that.setState({result:'error', pushingTx:false, error:JSON.stringify(ex)});
        //       that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(ex));

        //     });
        
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
      this.openNotificationWithIcon("error", 'Nota Fiscal attachment is required', 'Please attach a Nota Fiscal PDF file.');
      return;
    }   
    const that      = this;  
    const {request} = that.state;
    
    that.setState({loading:true});

    api.bank.updateExternalFiles(this.props.actualAccountName, request.id, request.state, {[globalCfg.api.NOTA_FISCAL]:my_NOTA_FISCAL})
    .then( (data) => {
        that.setState({loading:false})
        that.openNotificationWithIcon("success", 'Nota uploaded successfully');
        that.reload();
      },
      (ex) => {
        // console.log(' ** ERROR @ attachNota', JSON.stringify(ex))
        that.setState({loading:false})
        that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(ex));
      }  
    );
    
  }

  cancelService(){
    let that = this;  
    confirm({
      title: 'Cancel service provisioneinig request',
      content: `You will cancel the request. Confirm to proceed.`,
      onOk() {

        //ToDo
        callAPI()
        // that.setState({pushingTx:true});
        // const {request} = that.state;
        // api.bank.cancelService(that.props.actualAccountName, request.id)
        // .then( (data) => {
        //     that.setState({pushingTx:false})
        //     that.openNotificationWithIcon("success", 'Request canceled successfully');
        //     that.reload();
        //   },
        //   (ex) => {
        //     console.log(' ** ERROR @ cancelRequest', JSON.stringify(ex))
        //     that.setState({pushingTx:false})
        //     that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(ex));
        //   }  
        );
        
      },
      onCancel() {
        // that.setState({pushingTx:false})
        // console.log('Cancel');
      },
    });
  }

  cancelRequest(refund_message){
    let that = this;  
    confirm({
      title: 'Cancel request',
      content: `You will cancel the request. ${refund_message?'The money will be available at your balance in 24/48hs.':''}`,
      onOk() {
        that.setState({pushingTx:true});
        const {request} = that.state;
        
        //ToDo
        callAPI()
        // api.bank.cancelExternal(that.props.actualAccountName, request.id)
        // .then( (data) => {
        //     that.setState({pushingTx:false})
        //     that.openNotificationWithIcon("success", 'Request canceled successfully');
        //     that.reload();
        //   },
        //   (ex) => {
        //     console.log(' ** ERROR @ cancelRequest', JSON.stringify(ex))
        //     that.setState({pushingTx:false})
        //     that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(ex));
        //   }  
        // );
        
      },
      onCancel() {
        // that.setState({pushingTx:false})
        // console.log('Cancel');
      },
    });
  }
  
  refundRequest(){}

  rejectRequest(){
    const that       = this;
    Modal.confirm({
      title: 'You will REJECT the request',
      content: 'Please confirm to proceed.',
      onOk() {
        that.doRejectService();
      },
      onCancel() {
        that.setState({pushingTx:false})
        console.log('Cancel');
      },
    });  
    
  }
  
  doRejectService(){
    
    const that       = this;
    const {request}  = that.state;

    that.setState({pushingTx:true});
    
    const sender      = this.props.actualAccountName;
    // const amount      = request.amount;
    // const privateKey  = this.props.actualPrivateKey;
    
    //ToDo
    callAPI()
    // api.bank.rejectService(sender, request.id)
    //   .then((data) => {

    //       // that.clearAttachments();
    //       that.setState({uploading: false, result:'ok', pushingTx:false, result_object:null });
    //       that.reload();
    //       that.openNotificationWithIcon("success", 'Request rejected successfully');

    //     }, (ex) => {
    //       console.log(' processExternal::refund (error#2) >>  ', JSON.stringify(ex));
    //       that.openNotificationWithIcon("error", 'Refund completed succesfully but could not update request', JSON.stringify(ex));
    //       that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex)});
    //   });
  }
  
  revertRequest(){}

  attachFiles(){}

  getActions(){
    const {request, pushingTx}    = this.state;
    if(!request)
      return [];
    const processButton       = (<Button loading={pushingTx} size="large" onClick={() => this.processRequest()} key="processButton" type="primary" title="" >PROCESS REQUEST</Button>);
    //
    const acceptButton        = (<Button loading={pushingTx} size="large" onClick={() => this.acceptRequest()} key="acceptButton" type="primary" title="" >ACCEPT</Button>);
      //
    const acceptServiceButton = (<Button loading={pushingTx} size="large" onClick={() => this.acceptServiceRequest()} key="acceptServiceButton" type="primary" title="" >ACCEPT</Button>);
    //
    const cancelServiceButton = (<Button loading={pushingTx} size="large" onClick={() => this.cancelService(false)} key="cancelServiceButton" className="danger_color" style={{marginLeft:16}} type="link" >CANCEL</Button>);
    //
    const cancelRefundButton  = (<Button loading={pushingTx} size="large" onClick={() => this.cancelRequest(true)} key="cancelRefundButton" className="danger_color" style={{marginLeft:16}} type="link" >CANCEL</Button>);
    //
    const rejectButton        = (<Button loading={pushingTx} size="large" onClick={() => this.rejectRequest()} key="rejectButton" className="danger_color" style={{marginLeft:16}} type="link" >REJECT</Button>);
    //
    const revertButton        = (<Button loading={pushingTx} size="large" onClick={() => this.revertRequest()} key="revertButton" className="danger_color" style={{marginLeft:16}} type="link" >REVERT AND REFUND</Button>);
    //
    const attachNotaButton    = (<Button loading={pushingTx} size="large" onClick={() => this.attachNota()} key="updateButton" type="primary" style={{marginLeft:16}} type="primary" >UPLOAD NOTA</Button>);
    //
    const attachFiles         = (<Button loading={pushingTx} size="large" onClick={() => this.attachFiles()} key="attachButton" type="primary" style={{marginLeft:16}} type="primary" >ATTACH FILES</Button>);
    //
    const refundButton        = (<Button loading={pushingTx} size="large" onClick={() => this.refundRequest()} key="refundButton" type="primary" style={{marginLeft:16}} type="primary" >REFUND</Button>);
    //
    switch (request.state){
      case globalCfg.api.STATE_REQUESTED:
        // Special case for Service request.
        if(this.props.isPersonal && globalCfg.api.isService(request))
        {
          return [acceptServiceButton, rejectButton]; 
        }

        if(this.props.isBusiness && globalCfg.api.isService(request) && request.requested_by.account_name==this.props.actualAccountName)
        {
          return [cancelServiceButton]; 
        }

        if(this.props.isBusiness && globalCfg.api.isService(request) && request.requested_by.account_name!=this.props.actualAccountName)
        {
          return [acceptServiceButton, rejectButton]; 
        }

        if(this.props.isBusiness || this.props.isPersonal)
        {
          if(!request.attach_nota_fiscal_id)
            return [attachNotaButton, cancelRefundButton];
          return [cancelRefundButton];
        }

        if(!request.attach_nota_fiscal_id)
          return [processButton, attachNotaButton, rejectButton];
        return [processButton, rejectButton];
      break;
      case globalCfg.api.STATE_PROCESSING:
        // Special case for Service request.
        if(this.props.isPersonal && globalCfg.api.isService(request))
        {
          return []; 
        }

        if(this.props.isBusiness || this.props.isPersonal)
          if(!request.attach_nota_fiscal_id)
            return [attachNotaButton];
          else
            return [];
        return [acceptButton, revertButton];
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
        if(this.props.isPersonal && globalCfg.api.isService(request))
        {
          return []; 
        }

        if(this.props.isBusiness && globalCfg.api.isService(request))
        {
          return []; 
        }

        if(!request.attach_nota_fiscal_id)
          return [attachNotaButton];
        return [];
      break;
      case globalCfg.api.STATE_ERROR:
        return [];
      break;
      case globalCfg.api.STATE_CANCELED:
        if(this.props.isBusiness || this.props.isPersonal)
          return [];
        return [refundButton];
      break;
    }
  }
  //
  render() {

    const {request, referrer} = this.state;
    if(!request)
      return (<Spin loading="true" />)
    let content      = this.renderContent();
    let routes       = routesService.breadcrumbForFile(this.props.isAdmin?'external-transfers':'providers');
    if(referrer)
    {
      routes         = routesService.breadcrumbForPaths([referrer, this.props.location.pathname]);
    }
    const title         = this.props.isAdmin?'Process External Transfer':'Request details';
    const subTitle      = this.props.isAdmin?'Process customer request':'';
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={title}
          subTitle={subTitle}>
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
)(requestDetails) )
);
