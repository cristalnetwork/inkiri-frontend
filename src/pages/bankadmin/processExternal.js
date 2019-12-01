import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import PropTypes from "prop-types";

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Modal, Card, PageHeader, Tag, Button, Spin } from 'antd';
import { notification, Form, Icon, InputNumber, Input } from 'antd';

import TransactionCard from '@app/components/TransactionCard';

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
class processExternal extends Component {
  constructor(props) {
    super(props);
    const request       = (props && props.location && props.location.state && props.location.state.request)? props.location.state.request : undefined;
    const pathname      = props.location?props.location.pathname.split('/').slice(-1)[0]:'';
    this.state = {
      referrer:        (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,
      loading:      false,
      receipt:      '',
      amount:       0,
      memo:         '',
      pushingTx:    false,
      
      ...DEFAULT_RESULT,
      
      pathname:      pathname,   
      request:       request,
      
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
      this.setState({request : this.props.location.state.request
                      , pathname : this.props.location?this.props.location.pathname.split('/').slice(-1)[0]:''
                      , ...DEFAULT_ATTACHS})
    }
  }

  reload(){
    const that      = this;
    const {request} = this.state;
    this.setState({pushingTx:true});
    api.bank.getRequestById(request.id)
        .then( (data) => {
            that.setState({pushingTx:false, request:data, ...DEFAULT_ATTACHS})
          },
          (ex) => {
            that.openNotificationWithIcon("error", 'An error occurred reloading request', JSON.stringify(ex));
            that.setState({pushingTx:false, ...DEFAULT_ATTACHS});
            console.log(' ** ERROR @ processRequest', JSON.stringify(ex))
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
      pathname: `/${this.props.actualRole}/dashboard`
    })
  }

  backToReferrer = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/external-transfers`
    })
  }

  resetPage(){
    this.setState({...DEFAULT_RESULT, ...DEFAULT_ATTACHS});
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
    const {request, pushingTx}      = this.state;
    const buttons                   = this.getActionsForRequest();
    const notaUploaderProps         = this.getPropsForUploader(globalCfg.api.NOTA_FISCAL);
    const boletoUploaderProps       = this.getPropsForUploader(globalCfg.api.BOLETO_PAGAMENTO);
    const comprobanteUploaderProps  = this.getPropsForUploader(globalCfg.api.COMPROBANTE);
    const uploader                  = {
                  [globalCfg.api.NOTA_FISCAL] :notaUploaderProps
                  ,[globalCfg.api.BOLETO_PAGAMENTO] :boletoUploaderProps
                  ,[globalCfg.api.COMPROBANTE] :comprobanteUploaderProps };
                   
    return (
      <Spin spinning={pushingTx} delay={500} tip="Pushing transaction...">
        <TransactionCard 
                request={request} 
                admin={this.props.isAdmin}
                uploader={uploader}
        />
        <div className="c-detail bottom">
          <Card style={ { marginBottom: 24, textAlign:'center' } }>
          { buttons?buttons.map(button=>button):(<></>)}
          </Card>
        </div>
      </Spin>);
  }
  
  processRequest(){
    let that = this;  
    that.setState({pushingTx:true});
    
    Modal.confirm({
      title: 'Confirm process request step',
      content: 'You will now send the wire transfer and upload the bank receipt.',
      onOk() {
        const {request} = that.state;
        api.bank.processExternal(that.props.actualAccountName, request.id)
        .then( (data) => {
            that.setState({pushingTx:false})
            that.openNotificationWithIcon("success", 'Request changed successfully');
            that.reload();
          },
          (ex) => {
            that.setState({pushingTx:false})
            that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(ex));
            console.log(' ** ERROR @ processRequest', JSON.stringify(ex))
          }  
        );
        
      },
      onCancel() {
        console.log('Cancel');
        that.setState({pushingTx:false})
      },
    });
    
  }

  getAttach(attach_name){
    const attachments      = this.state.attachments;
    return (attachments[attach_name] && attachments[attach_name].length>0) ? attachments[attach_name][0] : undefined; 
  }

  acceptWithComprobanteRequest(){
    let that = this;  
    // Check Comprobante
    
    const my_COMPROBANTE   = this.getAttach(globalCfg.api.COMPROBANTE);
    if(!my_COMPROBANTE)
    {
      this.openNotificationWithIcon("error", 'Comprobante attachments is required', 'Please attach a Comprobante pdf file.');
      return;
    }  
    let attachs = {[globalCfg.api.COMPROBANTE]:my_COMPROBANTE};

    const my_NOTA          = this.getAttach(globalCfg.api.NOTA_FISCAL);
    if(my_NOTA)
      attachs[globalCfg.api.NOTA_FISCAL]=my_NOTA;
    // console.log(attachs)
    
    

    that.setState({pushingTx:true});
    
    Modal.confirm({
      title: 'You will accept the request',
      content: 'Please confirm if you already have sent the money via wire transfer/boleto pagamento.',
      onOk() {
        const {request} = that.state;
        
        const my_COMPROBANTE   = that.getAttach(globalCfg.api.COMPROBANTE);
        console.log(' ABOUT TO CALL API.BANK ')
        console.log(' >> Comprobante:', my_COMPROBANTE);
        console.log(' >> Request:', request.id)
        api.bank.acceptExternal(that.props.actualAccountName, request.id, attachs)
        .then( (data) => {
            that.setState({pushingTx:false})
            that.openNotificationWithIcon("success", 'Request accepted successfully');
            that.reload();
          },
          (ex) => {
            console.log(' ** ERROR @ acceptWithComprobanteRequest', JSON.stringify(ex));
            that.setState({pushingTx:false})
            that.openNotificationWithIcon("error", 'An error occurred!', JSON.stringify(ex));
          }  
        );
        
      },
      onCancel() {
        that.setState({pushingTx:false})
        console.log('Cancel');
      },
    });  
  }

  refundRequest(){
    this.doRefund(globalCfg.api.STATE_REFUNDED);  
  }
  
  rejectRequest(){
    const that       = this;
    Modal.confirm({
      title: 'You will REJECT the request',
      content: 'The request will be rejected and the amount will be refunded to the customer account.',
      onOk() {
        that.doRefund(globalCfg.api.STATE_REJECTED);
      },
      onCancel() {
        that.setState({pushingTx:false})
        console.log('Cancel');
      },
    });  
    
  }
  
  revertRequest(){
    const that       = this;
    Modal.confirm({
      title: 'You will REVERT the request',
      content: 'The request will be rejected and reverted, and the amount will be refunded to the customer account.',
      onOk() {
        that.doRefund(globalCfg.api.STATE_REVERTED);  
      },
      onCancel() {
        that.setState({pushingTx:false})
        console.log('Cancel');
      },
    });  
    
  }

  doRefund(new_state){
    
    const that       = this;
    const {request}  = that.state;

    that.setState({pushingTx:true});
    
    const sender      = this.props.actualAccountName;
    const amount      = request.amount;
    const privateKey  = this.props.actualPrivateKey;
    // api.refund(sender, privateKey, request.from, amount, request.id, request.tx_id) // -> Error de uso de CPU :(
    api.refund(sender, privateKey, request.from, amount, request.id, '')
      .then((data) => {

        const send_tx             = data;
        console.log(' processExternal::refund (then#1) >>  ', JSON.stringify(send_tx));
        
        api.bank.refundExternal(sender, request.id, new_state, send_tx.data.transaction_id)
          .then((data2) => {

              // that.clearAttachments();
              that.setState({uploading: false, result:'ok', pushingTx:false, result_object:{transaction_id : send_tx.data.transaction_id, request_id:request.id} });
              that.reload();
              that.openNotificationWithIcon("success", 'Request refunded successfully');

            }, (ex2) => {
              console.log(' processExternal::refund (error#2) >>  ', JSON.stringify(ex2));
              that.openNotificationWithIcon("error", 'Refund completed succesfully but could not update request', JSON.stringify(ex2));
              that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex2)});
          });

      }, (ex1) => {
        
        console.log(' processExternal::refund (error#1) >>  ', JSON.stringify(ex1));
        that.openNotificationWithIcon("error", 'Refund could not be completed', JSON.stringify(ex1));
        that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex1)});

      });
  }

  attachNota(){
    
    const my_NOTA_FISCAL   = this.getAttach(globalCfg.api.NOTA_FISCAL);
    if(!my_NOTA_FISCAL)
    {
      this.openNotificationWithIcon("error", 'Nota Fiscal attachment is required', 'Please attach a Nota Fiscal PDF file.');
      return;
    }   
    
    const that = this;  
    that.setState({pushingTx:true});
    const {request} = that.state;
    
    // api.bank.updateProviderPaymentFiles(this.props.actualAccountName ,request.id, request.state, {[globalCfg.api.NOTA_FISCAL]:my_NOTA_FISCAL})
    api.bank.updateExternalFiles(this.props.actualAccountName ,request.id, request.state, {[globalCfg.api.NOTA_FISCAL]:my_NOTA_FISCAL})
    .then( (data) => {
        that.setState({pushingTx:false})
        that.openNotificationWithIcon("success", 'Nota uploaded successfully');
        that.reload();
      },
      (ex) => {
        that.setState({pushingTx:false})
        that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(ex));
        console.log(' ** ERROR @ updateRequest', JSON.stringify(ex))
      }  
    );
  }
  
  cancelRequest(){}

  acceptRequest(){
    const that = this;
    that.setState({pushingTx:true});
    
    Modal.confirm({
      title: 'You will accept the request',
      content: 'Please confirm if you already gave the paper money to the customer.',
      onOk() {
        const {request} = that.state;
          
        api.bank.acceptWithdrawRequest(that.props.actualAccountName, request.id)
        .then( (data) => {
            that.setState({pushingTx:false})
            that.openNotificationWithIcon("success", 'Withdraw request accepted successfully');
            that.reload();
          },
          (ex) => {
            console.log(' ** ERROR @ acceptWithdraw', JSON.stringify(ex));
            that.setState({pushingTx:false})
            that.openNotificationWithIcon("error", 'An error occurred!', JSON.stringify(ex));
          }  
        );
        
      },
      onCancel() {
        that.setState({pushingTx:false})
        console.log('Cancel');
      },
    });  
  }

  doRejectAndRefundWithdraw(){
    
    const that       = this;
    const {request}  = that.state;

    that.setState({pushingTx:true});
    
    const sender      = this.props.actualAccountName;
    const amount      = request.amount;
    const privateKey  = this.props.actualPrivateKey;
    api.refund(sender, privateKey, request.from, amount, request.id, '')
      .then((data) => {

        const send_tx             = data;
        console.log(' processExternal::refund (then#1) >>  ', JSON.stringify(send_tx));
        
        api.bank.refundWithdrawRequest(sender, request.id, send_tx.data.transaction_id)
          .then((data2) => {

              // that.clearAttachments();
              that.setState({uploading: false, result:'ok', pushingTx:false, result_object:{transaction_id : send_tx.data.transaction_id, request_id:request.id} });
              that.reload();
              that.openNotificationWithIcon("success", 'Request refunded successfully');

            }, (ex2) => {
              console.log(' processExternal::refund (error#2) >>  ', JSON.stringify(ex2));
              that.openNotificationWithIcon("error", 'Refund completed succesfully but could not update request', JSON.stringify(ex2));
              that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex2)});
          });

      }, (ex1) => {
        
        console.log(' processExternal::refund (error#1) >>  ', JSON.stringify(ex1));
        that.openNotificationWithIcon("error", 'Refund could not be completed', JSON.stringify(ex1));
        that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex1)});

      });
  }

  /*
  * DEPOSIT
  */
  acceptDepositAndIssue(){
    const {id, amount, requested_by, requestCounterId, deposit_currency} = this.state.request;
    const privateKey = this.props.actualPrivateKey;
    const receiver   = requested_by.account_name;
    const sender     = globalCfg.currency.issuer; //this.props.actualAccountName;
    const admin_name = this.props.actualAccountName;

    const fiat       = globalCfg.api.fiatSymbolToMemo(deposit_currency)
    const memo       = `dep|${fiat}|${requestCounterId.toString()}`;

    const that       = this;
    const content    = `You will ISSUE ${globalCfg.currency.symbol}${amount} to ${requested_by.account_name}`;
    Modal.confirm({
      title: 'Please confirm issue operation ' + this.props.actualAccountName,
      content: content,
      onOk() {
      
          that.setState({pushingTx:true});
          api.issueMoney(sender, privateKey, receiver, amount, memo)
            .then(data => {
              console.log(' processRequest::issue (then#1) >>  ', JSON.stringify(data));
              if(data && data.data && data.data.transaction_id)
              {
                // updeteo la tx
                api.bank.setDepositOk(admin_name, id, data.data.transaction_id)
                .then( (update_res) => {
                    console.log(' processRequest::issue (then#2) >> update_res ', JSON.stringify(update_res), JSON.stringify(data));
                    console.log(' processRequest::issue (then#2) >> data ', JSON.stringify(data));
                    that.reload();
                    that.setState({result:'ok', pushingTx:false, result_object:data});

                  }, (err) => {
                    
                    that.setState({result:'error', pushingTx:false, error:JSON.stringify(err)});
                    that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(err));
                  }
                )
              }
              else{
                that.setState({result:'error', pushingTx:false, error:'UNKNOWN!'});
                that.openNotificationWithIcon("error", 'An error occurred', 'UNKNOWN!'+JSON.stringify(data));
              }
              
            }, (ex)=>{
              console.log(' processRequest::issue (error#1) >>  ', JSON.stringify(ex));
              that.setState({result:'error', pushingTx:false, error:JSON.stringify(ex)});
              that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(ex));

            });
        },
      onCancel() {
        that.setState({pushingTx:false})
        console.log('Cancel');
      },
    });
  }
  
  getActionsForRequest(){
    const {request, pushingTx}    = this.state;
    const processButton = (<Button loading={pushingTx} size="large" onClick={() => this.processRequest()} key="processButton" type="primary" title="" >PROCESS REQUEST</Button>);
    //
    const acceptWithComprobanteButton = (<Button loading={pushingTx} size="large" onClick={() => this.acceptWithComprobanteRequest()} key="acceptWithComprobanteButton" type="primary" title="" >ACCEPT</Button>);
    //
    const cancelButton                = (<Button loading={pushingTx} size="large" onClick={() => this.cancelRequest()} key="cancelButton" className="danger_color" style={{marginLeft:16}} type="link" >CANCEL</Button>);
    //
    const rejectButton                = (<Button loading={pushingTx} size="large" onClick={() => this.rejectRequest()} key="rejectButton" className="danger_color" style={{marginLeft:16}} type="link" >REJECT</Button>);
    //
    const revertButton                = (<Button loading={pushingTx} size="large" onClick={() => this.revertRequest()} key="revertButton" className="danger_color" style={{marginLeft:16}} type="link" >REVERT AND REFUND</Button>);
    //
    const attachNotaButton            = (<Button loading={pushingTx} size="large" onClick={() => this.attachNota()} key="updateButton" type="primary" style={{marginLeft:16}} type="primary" >UPLOAD NOTA</Button>);
    //
    const attachFiles                 = (<Button loading={pushingTx} size="large" onClick={() => this.attachFiles()} key="attachButton" type="primary" style={{marginLeft:16}} type="primary" >ATTACH FILES</Button>);
    //
    const refundButton                = (<Button loading={pushingTx} size="large" onClick={() => this.refundRequest()} key="refundButton" type="primary" style={{marginLeft:16}} type="primary" >REFUND</Button>);
    //
    const acceptAndIssueButton        = (<Button loading={pushingTx} size="large" onClick={() => this.acceptDepositAndIssue()} key="acceptAndIssueButton" type="primary" style={{marginLeft:16}} type="primary" >ACCEPT AND ISSUE</Button>);
    //
    const acceptButton                = (<Button loading={pushingTx} size="large" onClick={() => this.acceptRequest()} key="acceptButton" style={{marginLeft:16}} type="primary" >ACCEPT</Button>);
    //
    const rejectWithdrawButton        = (<Button loading={pushingTx} size="large" onClick={() => this.doRejectAndRefundWithdraw()} key="rejectWithdrawButton" className="danger_color" style={{marginLeft:16}} type="link" >REJECT AND REFUND</Button>);
    //
    switch (request.state){
      case globalCfg.api.STATE_REQUESTED:
        if(globalCfg.api.isDeposit(request))
        {
          return [acceptAndIssueButton, rejectButton];
        }
        if(globalCfg.api.isWithdraw(request))
        {
          return [acceptButton, rejectWithdrawButton];
        }

        if(!request.attach_nota_fiscal_id)
          return [processButton, attachNotaButton, rejectButton];
        return [processButton, rejectButton];
      break;
      case globalCfg.api.STATE_PROCESSING:
        if(!request.attach_nota_fiscal_id)
          return [acceptWithComprobanteButton, attachNotaButton, revertButton];
        return [acceptWithComprobanteButton, revertButton];
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
      case globalCfg.api.STATE_ACCEPTED:
        if(globalCfg.api.isWithdraw(request) || globalCfg.api.isDeposit(request))
          return [];
        if(!request.attach_nota_fiscal_id)
          return [attachNotaButton];
        return [];
      break;
      case globalCfg.api.STATE_ERROR:
        return [];
      break;
      case globalCfg.api.STATE_CANCELED:
        if(this.props.isBusiness)
          return [];
        return [refundButton];
      break;
    }
  }

  //
  render() {
    let content     = this.renderContent();
    const title     = 'Process request';
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
)(processExternal) )
);
