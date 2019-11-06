import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu'
import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

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
      receipt:      '',
      amount:       0,
      memo:         '',
      pushingTx:    false,
      
      ...DEFAULT_RESULT,
       
      request:       request,
      
      attachments:       {
        [globalCfg.api.NOTA_FISCAL]       : undefined,
        [globalCfg.api.BOLETO_PAGAMENTO]  : undefined,
        [globalCfg.api.COMPROBANTE]       : undefined,
      },
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
    const { match, location, history, lastRootMenu } = this.props;
    // console.log(' requestDetails::referrer:', JSON.stringify(location.state.referrer));
    // console.log(' requestDetails::lastRootMenu:', JSON.stringify(lastRootMenu));
    // console.log( 'processRequest::router-params >>' , JSON.stringify(this.props.location.state.request) );
    if(location && location.state && location.state.request)
    {
      // console.log(' WHAT????')
      this.setState({
          request : location.state.request
          , referrer : location.state.referrer
        })
    }
    // else{
    //   // console.log(' COOL!')
    //   this.reload('5db7627d780dab1a00f54d40')
    // }
  }
  

  reload(id){
    const that      = this;
    this.setState({pushingTx:true});
    const key = id?id:this.state.request.id;
    api.bank.getRequestById(key)
        .then( (data) => {
            // console.log(' ** fetched request object', JSON.stringify(data))
            that.setState({pushingTx:false, request:data})
          },
          (ex) => {
            this.setState({pushingTx:false});
            this.openNotificationWithIcon("error", "Cant fetch request", JSON.stringify(ex))    
            // console.log(' ** ERROR @ processRequest', JSON.stringify(ex))
          }  
        );
  }

  onSelect(value) {
    // console.log('onSelect', value);
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
      pathname: `/${this.props.actualRole}/extrato`
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
  }

  resetResult(){
    this.setState({...DEFAULT_RESULT});
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

  resetPage(){
    this.setState({result: undefined, result_object: undefined, error: {}});
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
    const buttons                   = this.getActions();
    const notaUploaderProps         = this.getPropsForUploader(globalCfg.api.NOTA_FISCAL);
    const boletoUploaderProps       = this.getPropsForUploader(globalCfg.api.BOLETO_PAGAMENTO);
    const comprobanteUploaderProps  = this.getPropsForUploader(globalCfg.api.COMPROBANTE);
    const uploader                  = {
                  [globalCfg.api.NOTA_FISCAL] :notaUploaderProps
                  ,[globalCfg.api.BOLETO_PAGAMENTO] :boletoUploaderProps
                  ,[globalCfg.api.COMPROBANTE] :comprobanteUploaderProps };
                  
    return(
      <Spin spinning={pushingTx} delay={500} tip="Pushing transaction...">
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

  attachNota(){
    
    const my_NOTA_FISCAL   = this.getAttach(globalCfg.api.NOTA_FISCAL);
    if(!my_NOTA_FISCAL)
    {
      this.openNotificationWithIcon("error", 'Nota Fiscal attachment is required', 'Please attach a Nota Fiscal PDF file.');
      return;
    }   
    const that      = this;  
    const {request} = that.state;
    
    that.setState({pushingTx:true});

    api.bank.updateExternalFiles(this.props.actualAccountName, request.id, request.state, {[globalCfg.api.NOTA_FISCAL]:my_NOTA_FISCAL})
    .then( (data) => {
        that.setState({pushingTx:false})
        that.openNotificationWithIcon("success", 'Nota uploaded successfully');
        that.reload();
      },
      (ex) => {
        // console.log(' ** ERROR @ attachNota', JSON.stringify(ex))
        that.setState({pushingTx:false})
        that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(ex));
      }  
    );
    
  }

  cancelRequest(){
    let that = this;  
    that.setState({pushingTx:true});
    confirm({
      title: 'Cancel request',
      content: 'You will cancel the request. The money will be available at your balance in 24/48hs.',
      onOk() {
        const {request} = that.state;
        api.bank.cancelExternal(that.props.actualAccountName, request.id)
        .then( (data) => {
            that.setState({pushingTx:false})
            that.openNotificationWithIcon("success", 'Request canceled successfully');
            that.reload();
          },
          (ex) => {
            console.log(' ** ERROR @ cancelRequest', JSON.stringify(ex))
            that.setState({pushingTx:false})
            that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(ex));
          }  
        );
        
      },
      onCancel() {
        that.setState({pushingTx:false})
        // console.log('Cancel');
      },
    });
  }
  
  refundRequest(){}

  rejectRequest(){}
  
  revertRequest(){}

  doRefund(new_state){}

  attachFiles(){}

  getActions(){
    const {request, pushingTx}    = this.state;
    if(!request)
      return [];
    const processButton = (<Button loading={pushingTx} size="large" onClick={() => this.processRequest()} key="processButton" type="primary" title="" >PROCESS REQUEST</Button>);
    //
    const acceptButton = (<Button loading={pushingTx} size="large" onClick={() => this.acceptRequest()} key="acceptButton" type="primary" title="" >ACCEPT</Button>);
    //
    const cancelButton = (<Button loading={pushingTx} size="large" onClick={() => this.cancelRequest()} key="cancelButton" className="danger_color" style={{marginLeft:16}} type="link" >CANCEL</Button>);
    //
    const rejectButton = (<Button loading={pushingTx} size="large" onClick={() => this.rejectRequest()} key="rejectButton" className="danger_color" style={{marginLeft:16}} type="link" >REJECT</Button>);
    //
    const revertButton = (<Button loading={pushingTx} size="large" onClick={() => this.revertRequest()} key="revertButton" className="danger_color" style={{marginLeft:16}} type="link" >REVERT AND REFUND</Button>);
    //
    const attachNotaButton  = (<Button loading={pushingTx} size="large" onClick={() => this.attachNota()} key="updateButton" type="primary" style={{marginLeft:16}} type="primary" >UPLOAD NOTA</Button>);
    //
    const attachFiles  = (<Button loading={pushingTx} size="large" onClick={() => this.attachFiles()} key="attachButton" type="primary" style={{marginLeft:16}} type="primary" >ATTACH FILES</Button>);
    //
    const refundButton = (<Button loading={pushingTx} size="large" onClick={() => this.refundRequest()} key="refundButton" type="primary" style={{marginLeft:16}} type="primary" >REFUND</Button>);
    //
    switch (request.state){
      case globalCfg.api.STATE_REQUESTED:
        if(this.props.isBusiness)
        {
          if(!request.attach_nota_fiscal_id)
            return [attachNotaButton, cancelButton];
          return [cancelButton];
        }

        if(!request.attach_nota_fiscal_id)
          return [processButton, attachNotaButton, rejectButton];
        return [processButton, rejectButton];
      break;
      case globalCfg.api.STATE_PROCESSING:
        if(this.props.isBusiness)
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

    const {request, referrer} = this.state;
    if(!request)
      return (<Spin loading="true" />)
    let content      = this.renderContent();
    let routes       = routesService.breadcrumbForFile(this.props.isAdmin?'external-transfers':'providers');
    if(referrer)
    {
      // console.log(' >> ABOUT TO GET BREADCUMBS FOR ... ', referrer);
      const xpath    = referrer.split('/');
      // routes         = routesService.breadcrumbForFile(xpath[xpath.length-1]);
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

        lastRootMenu:       menuRedux.lastRootMenu(state)
    }),
    (dispatch)=>({
        // isAdmin:    bindActionCreators(loginRedux.isAdmin, dispatch),
        // isBusiness: bindActionCreators(loginRedux.isBusiness, dispatch)
    })
)(requestDetails) )
);
