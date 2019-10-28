import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as routesService from '@app/services/routes';
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { Modal, Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin, Descriptions } from 'antd';
import { notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import TransactionCard from '@app/components/TransactionCard';

import './request.less'; 

const { Paragraph, Text } = Typography;
const { confirm } = Modal;


const routes = routesService.breadcrumbForFile('external-transfers');

class processExternal extends Component {
  constructor(props) {
    super(props);
    const request       = (this.props && this.props.location && this.props.location.state && this.props.location.state.request)? this.props.location.state.request : undefined;
    this.state = {
      loading:      false,
      receipt:      '',
      amount:       0,
      memo:         '',
      pushingTx:    false,
      result:       undefined,
      result_object:undefined,
      error:        {},
       
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
      this.setState({request : this.props.location.state.request})
  }
  
  reload(){
    const that      = this;
    const {request} = this.state;
    this.setState({pushingTx:true});
    api.bank.getRequestById(request.id)
        .then( (data) => {
            that.setState({pushingTx:false, request:data})
          },
          (ex) => {
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

        this.setState(state => ({
          attachments : {[name]: [file]}
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
    this.setState({result: undefined, result_object: undefined, error: {}});
  }

  renderContent() {
  
    const { getFieldDecorator } = this.props.form;
    
    if(this.state.result=='ok')
    {
      const tx_id = api.dfuse.getTxId(this.state.result_object?this.state.result_object.data:{});
      const _href = api.dfuse.getBlockExplorerTxLink(tx_id);
      // console.log(' >>>>> api.dfuse.getBlockExplorerTxLink: ', _href)
      
      return (<Result
        status="success"
        title="Transaction completed successfully!"
        subTitle={`Transaction id ${tx_id}. Cloud server takes up to 30 seconds, please wait.`}
        extra={[
          <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
            Go to dashboard
          </Button>,
          <Button  key="go-to-pda" onClick={()=>this.backToReferrer()}>
            Back to External Transfers
          </Button>,
          <Button type="link" href={_href} target="_blank" key="view-on-blockchain" icon="cloud" title="View on Blockchain">B-Chain</Button>,
          
        ]}
      />)
    }
    //`
    if(this.state.result=='error')
    {

      // <Button key="re-send">Try sending again</Button>,
      return (<Result
                status="error"
                title="Transaction Failed"
                subTitle="Please check and modify the following information before resubmitting."
                extra={[
                  <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>Go to dashboard</Button>,
                  <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetPage()} />
                ]}
              >
                <div className="desc">
                  <Paragraph>
                    <Text
                      strong
                      style={{ fontSize: 16, }}
                    >
                      The content you submitted has the following error:
                    </Text>
                  </Paragraph>
                  <Paragraph>
                    <Icon style={{ color: 'red' }} type="close-circle" /> {this.state.error}
                  </Paragraph>
                </div>
              </Result>)
    }
    
    // ** hack for sublime renderer ** //
    //<Button type="primary" htmlType="submit" className="login-form-button" disabled={cant_process}>Accept Deposit & Issue</Button>
    return (
        <></>
    );
  }
  //
  
  processRequest(){
    let that = this;  
    that.setState({pushingTx:true});
    
    confirm({
      title: 'Confirm process request step',
      content: 'You will now send the required payment and upload the bank receipt.',
      onOk() {
        const {request} = that.state;
        api.bank.processProviderPayment(request.id)
        .then( (data) => {
            request.state = api.bank.STATE_PROCESSING;
            that.setState({pushingTx:false, request:request})
            that.openNotificationWithIcon("success", 'Request changed successfully');
            that.reload();
          },
          (ex) => {
            console.log(' ** ERROR @ processRequest', JSON.stringify(ex))
          }  
        );
        
      },
      onCancel() {
        console.log('Cancel');
      },
    });
    
  }

  getAttach(attach_name){
    const attachments      = this.state.attachments;
    return (attachments[attach_name] && attachments[attach_name].length>0) ? attachments[attach_name][0] : undefined; 
  }

  acceptRequest(){
    let that = this;  
    that.setState({pushingTx:true});
    
    // Check Comprobante
    
    const my_COMPROBANTE   = this.getAttach(globalCfg.api.COMPROBANTE);
    if(!my_COMPROBANTE)
    {
      this.openNotificationWithIcon("error", 'Comprobante attachments is required', 'Please attach a Comprobante pdf file.');
      return;
    }  

    confirm({
      title: 'You will accept the request',
      content: 'After accepting the request, please send the required payment and upload the bank receipt.',
      onOk() {
        const {request} = that.state;
        
        const my_COMPROBANTE   = that.getAttach(globalCfg.api.COMPROBANTE);
        console.log(' ABOUT TO CALL API.BANK ')
        console.log(' >> Comprobante:', my_COMPROBANTE);
        console.log(' >> Request:', request.id)
        api.bank.acceptProviderPayment(request.id, {[globalCfg.api.COMPROBANTE]:my_COMPROBANTE})
        .then( (data) => {
            request.state = api.bank.STATE_ACCEPTED;
            that.setState({pushingTx:false, request:request})
            that.openNotificationWithIcon("success", 'Request accepted successfully');
            that.reload();
          },
          (ex) => {
            console.log(' ** ERROR @ acceptRequest', JSON.stringify(ex))
          }  
        );
        
      },
      onCancel() {
        console.log('Cancel');
      },
    });  
  }

  attachNota(){
    let that = this;  
    that.setState({pushingTx:true});
    
    // Check Comprobante
    
    const my_NOTA_FISCAL   = this.getAttach(globalCfg.api.NOTA_FISCAL);
    if(!my_NOTA_FISCAL)
    {
      this.openNotificationWithIcon("error", 'Nota Fiscal attachment is required', 'Please attach a Nota Fiscal PDF file.');
      return;
    }   

    const {request} = that.state;
    
    api.bank.updateProviderPaymentFiles(request.id, {[globalCfg.api.NOTA_FISCAL]:my_NOTA_FISCAL})
    .then( (data) => {
        that.setState({pushingTx:false})
        that.openNotificationWithIcon("success", 'Nota uploaded successfully');
        that.reload();
      },
      (ex) => {
        console.log(' ** ERROR @ updateRequest', JSON.stringify(ex))
      }  
    );
    
  }

  doneRequest(){}
  
  cancelRequest(){}
  
  rejectRequest(){}
  
  revertRequest(){}

  getActions(){
    const {request}    = this.state;
    const processButton = (<Button size="large" onClick={() => this.processRequest()} key="processButton" type="primary" title="" >PROCESS REQUEST</Button>);
    //
    const acceptButton = (<Button size="large" onClick={() => this.acceptRequest()} key="acceptButton" type="primary" title="" >ACCEPT</Button>);
    //
    const doneButton   = (<Button size="large" onClick={() => this.doneRequest()} key="doneButton" style={{marginLeft:16}} type="primary" >UPLOAD COMPROBANTE AND FINISH</Button>);
    //
    const cancelButton = (<Button size="large" onClick={() => this.cancelRequest()} key="cancelButton" className="danger_color" style={{marginLeft:16}} type="link" >CANCEL</Button>);
    //
    const rejectButton = (<Button size="large" onClick={() => this.rejectRequest()} key="rejectButton" className="danger_color" style={{marginLeft:16}} type="link" >REJECT</Button>);
    //
    const revertButton = (<Button size="large" onClick={() => this.revertRequest()} key="revertButton" className="danger_color" style={{marginLeft:16}} type="link" >REVERT AND REFUND</Button>);
    //
    const updateFiles = (<Button size="large" onClick={() => this.attachNota()} key="updateButton" type="primary" style={{marginLeft:16}} type="primary" >UPLOAD NOTA</Button>);
    //

    switch (request.state){
      case globalCfg.api.STATE_REQUESTED:
        return [processButton, rejectButton];
      break;
      case globalCfg.api.STATE_PROCESSING:
        return [acceptButton, revertButton];
      break;
      case globalCfg.api.STATE_REJECTED:
        return [];
      break;
      case globalCfg.api.STATE_ACCEPTED:
        // return [doneButton, revertButton];
        if(!request.attach_nota_fiscal_id)
          return [updateFiles];
        return [];
      break;
      case globalCfg.api.STATE_ERROR:
      break;
      // case globalCfg.api.STATE_CONCLUDED:
      //   return [];
      // break;
      case globalCfg.api.STATE_CANCELED:
        return [];
      break;
    }
  }
  //
  render() {
    let content = this.renderContent();
    const {request}                 = this.state;
    const buttons                   = this.getActions();
    const notaUploaderProps         = this.getPropsForUploader(globalCfg.api.NOTA_FISCAL);
    const boletoUploaderProps       = this.getPropsForUploader(globalCfg.api.BOLETO_PAGAMENTO);
    const comprobanteUploaderProps  = this.getPropsForUploader(globalCfg.api.COMPROBANTE);

    return (
      <>
        <PageHeader
          breadcrumb={{ routes }}
          title="Process Request"
          subTitle="Process customer request"
          
        >
         
        </PageHeader>

        <TransactionCard request={request} uploder={{
                  [globalCfg.api.NOTA_FISCAL] :notaUploaderProps
                  ,[globalCfg.api.BOLETO_PAGAMENTO] :boletoUploaderProps
                  ,[globalCfg.api.COMPROBANTE] :comprobanteUploaderProps
        }}/>
        <div className="c-detail bottom">
          <Card style={ { marginBottom: 24, textAlign:'center' } }>
          { buttons?buttons.map(button=>button):(<></>)}
          </Card>
        </div>
      </>
    );
  }
  
  
}

//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:         accountsRedux.accounts(state),
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRole:       loginRedux.actualRole(state),
        actualPrivateKey: loginRedux.actualPrivateKey(state),
        isLoading:        loginRedux.isLoading(state),
        balance:          balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        
    })
)(processExternal) )
);
