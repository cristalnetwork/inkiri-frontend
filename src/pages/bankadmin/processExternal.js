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


const Description = ({ term, children, span = 12 }) => (
    <Col span={span}>
      <div className="description">
        <div className="term">{term}</div>
        <div className="detail">{children}</div>
      </div>
    </Col>
  );

const routes = routesService.breadcrumbForFile('external-transfers');

class processExternal extends Component {
  constructor(props) {
    super(props);
    const request       = (this.props && this.props.location && this.props.location.state && this.props.location.state.request)? this.props.location.state.request : undefined;
    this.state = {
      loading:      false,
      dataSource:   [],
      receipt:      '',
      amount:       0,
      memo:         '',
      pushingTx:    false,
      result:       undefined,
      result_object:undefined,
      error:        {},
       
      request:       request
    
    };

    // this.handleSearch = this.handleSearch.bind(this); 
    this.onSelect                   = this.onSelect.bind(this); 
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetPage                  = this.resetPage.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.issueMoney                 = this.issueMoney.bind(this);
  }

  static propTypes = {
    match: PropTypes.object,
    location: PropTypes.object,
    history: PropTypes.object
  };

  componentDidMount(){
    const { match, location, history } = this.props;
    console.log( 'processRequest::router-params >>' , JSON.stringify(this.props.location.state.request) );
    if(this.props.location && this.props.location.state)
      this.setState({request : this.props.location.state.request})
  }
  
  onSelect(value) {
    console.log('onSelect', value);
    this.setState({receipt:value})
  }

  // onSearch={this.handleSearch}
  handleSearch(value){
    // this.setState({
    //   dataSource: !value ? [] : [value, value + value, value + value + value],
    // });
  };

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  issueMoney = async () => {
    
    // return;
    const {_id, amount, requested_by, requestCounterId, deposit_currency} = this.state.request;
    const privateKey = this.props.actualPrivateKey;
    const receiver   = requested_by.account_name;
    const sender     = globalCfg.currency.issuer; //this.props.actualAccountName;
    
    const fiat       = globalCfg.api.fiatSymbolToMemo(deposit_currency)
    const memo       = `dep|${fiat}|${requestCounterId.toString()}`;

    let that = this;
    that.setState({pushingTx:true});
    api.issueMoney(sender, privateKey, receiver, amount, memo)
      .then(data => {
        console.log(' processRequest::issue (then#1) >>  ', JSON.stringify(data));
        if(data && data.data && data.data.transaction_id)
        {
          // updeteo la tx
          api.bank.setDepositOk(_id, data.data.transaction_id).then(
            // muestro resultado
            (update_res) => {
              console.log(' processRequest::issue (then#2) >> update_res ', JSON.stringify(update_res), JSON.stringify(data));
              console.log(' processRequest::issue (then#2) >> data ', JSON.stringify(data));
              that.setState({result:'ok', pushingTx:false, result_object:data});
            }, (err) => {
              that.setState({result:'error', pushingTx:false, error:JSON.stringify(err)});
            }
          )
        }
        else{
          that.setState({result:'error', pushingTx:false, error:'UNKNOWN!'});
        }
        
      }, (ex)=>{
        console.log(' processRequest::issue (error#1) >>  ', JSON.stringify(ex));
        that.setState({result:'error', pushingTx:false, error:JSON.stringify(ex)});
      });
  }


  handleSubmit = e => {
    e.preventDefault();
    this.issueMoney();
  };

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
  
  acceptRequest(){
    let that = this;  
    that.setState({pushingTx:true});
    
    confirm({
      title: 'You will accept the request',
      content: 'After accepting the request, please send the required payment and upload the bank receipt.',
      onOk() {
        const {request} = that.state;
        api.bank.acceptProviderPayment(request.id)
        .then( (data) => {
            request.state = api.bank.STATE_ACCEPTED;
            that.setState({pushingTx:false, request:request})
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

  doneRequest(){}
  
  cancelRequest(){}
  
  rejectRequest(){}
  
  revertRequest(){}

  getActions(){
    const {request}    = this.state;
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

    switch (request.state){
      case globalCfg.api.STATE_REQUESTED:
        return [acceptButton, rejectButton];
      break;
      case globalCfg.api.STATE_PROCESSING:
        return [];
      break;
      case globalCfg.api.STATE_REJECTED:
        return [];
      break;
      case globalCfg.api.STATE_ACCEPTED:
        return [doneButton, revertButton];
      break;
      case globalCfg.api.STATE_ERROR:
      break;
      case globalCfg.api.STATE_CONCLUDED:
        return [];
      break;
      case globalCfg.api.STATE_CANCELED:
        return [];
      break;
    }
  }
  //
  render() {
    let content = this.renderContent();
    const {request} = this.state;
    const buttons   = this.getActions();
    return (
      <>
        <PageHeader
          breadcrumb={{ routes }}
          title="Process Request"
          subTitle="Process customer request"
          
        >
         
        </PageHeader>

        <TransactionCard request={request}/>
        <div className="c-detail bottom">
          <Card style={ { marginBottom: 24, textAlign:'center' } }>
          { buttons.map(button=>button)}
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
