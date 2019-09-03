import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'

import AmountInput from '@app/components/AmountInput';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import * as routesService from '@app/services/routes';

import './deposit.css'; 

const { Paragraph, Text } = Typography;


const routes = routesService.breadcrumbForFile('deposit');

class DepositMoney extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:      true,
      value:       {amount:0, currency:''},
      pushingTx:    false,
      envelope_id:  '--loading--',
      result:       undefined,
      result_object:undefined,
      error:        {},
      number_validateStatus : '',
      number_help:  ''
                    
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.onChange                   = this.onChange.bind(this); 
    this.resetResult                = this.resetResult.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderConfirmRequest       = this.renderConfirmRequest.bind(this);
    this.getNextEnvelopeId          = this.getNextEnvelopeId.bind(this);
  }

  static propTypes = {
    // match: PropTypes.object.isRequired,
    // location: PropTypes.object.isRequired,
    // history: PropTypes.object.isRequired
    match: PropTypes.object,
    location: PropTypes.object,
    history: PropTypes.object
  };

  componentDidMount(){
    
    this.getNextEnvelopeId();
  }
  
  getNextEnvelopeId(){
    api.bank.nextEnvelopeId (this.props.actualAccount).then(  
      (res)=>{
        this.setState ({loading:false, envelope_id: res});
      },
      (err)=>{
        // console.log(' ERROR FETCHING ENV ID ->', err);
        this.setState ({loading:false});
        this.openNotificationWithIcon("error", "Cant fetch next envelope ID", "Please check if you are logged in bank service. " + JSON.stringify(err))      
      },
    )
  }
  onChange(e) {
    // e.preventDefault();
    console.log(' amountInput --> changed', JSON.stringify(e));
    this.setState({value : e})

  }


  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/extrato`
    })
  }

   handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.setState({result:'should-confirm'});
      }
    });
  };

  checkPrice = (rule, value, callback) => {
    if (value.amount > 0) {
      callback();
      return;
    }
    callback('Amount must greater than zero!');
  };

  resetResult(){
    this.setState({result: undefined, result_object: undefined, error: {}});
    this.getNextEnvelopeId();
  }

  doDeposit(){
    // guarda
    api.bank.createDeposit(this.props.actualAccount, this.state.value.amount, this.state.value.currency)
    .then((res)=>{
      console.log(' >> doDeposit >> ', JSON.stringify(res));
      this.setState({result:'ok'});
    }, (err)=>{
      this.setState({result:'error', error:err});
    })
    

  }

  renderContent() {
  
    const { getFieldDecorator } = this.props.form;
    
    let result_or_confirm = null;
    if(this.state.result=='should-confirm'){
      result_or_confirm = this.renderConfirmRequest();
    }

    if(this.state.result=='ok')
    {
      const tx_id = api.dfuse.getTxId(this.state.result_object?this.state.result_object.data:{});
      const _href = api.dfuse.getBlockExplorerTxLink(tx_id);
      // console.log(' >>>>> api.dfuse.getBlockExplorerTxLink: ', _href)
      
      result_or_confirm = (<Result
        status="success"
        title="Deposit Requested Succesfully!"
        subTitle="Please wait until deposit is validated and cedited to your account."
        extra={[
          <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
            Go to dashboard
          </Button>,
          <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetResult()} />
        ]}
      />)
    }

    if(this.state.result=='error')
    {
      result_or_confirm = (<Result
                status="error"
                title="Transaction Failed"
                subTitle="Please check and modify the following information before resubmitting."
                extra={[
                  <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
                    Go to dashboard
                  </Button>,
                  <Button key="re-send">Try deposit again</Button>,
                  <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetResult()} />
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
                    <Icon style={{ color: 'red' }} type="close-circle" /> {JSON.stringify(this.state.error)}
                  </Paragraph>
                </div>
              </Result>)
    }
    //
    
    if(result_or_confirm)
      return(
        <div style={{ margin: '0 0px', padding: 24, background: '#fff', marginTop: 24  }}>
          {result_or_confirm}
        </div>);

    // ** hack for sublime renderer ** //
    const envelope = this.renderEnvelopeId();
    const {pushingTx, loading} = this.state;
    const loading_text = pushingTx?'Pushing transaction...':(loading?'Loading...':'');
    return (
        <>
          {envelope}
          
          <div style={{ margin: '0 0px', padding: 24, background: '#fff', marginTop: 24  }}>
            <div className="dashboard_page_content">
              <Spin spinning={pushingTx||loading} delay={500} tip={loading_text}>
                <Form onSubmit={this.handleSubmit}>
                  
                  <Form.Item>
                    {getFieldDecorator('amount', {
                      initialValue: { amount: 0, currency: globalCfg.currency.symbol },
                      rules: [{ validator: this.checkPrice }],
                    })(<AmountInput size="large" onChange={this.onChange} />)}
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                      Deposit
                    </Button>
                    
                  </Form.Item>
                </Form>
              </Spin>
            </div>    
          </div>
        </>
    );
  }
  
  // ** hack for sublime renderer ** //

  renderEnvelopeId ()
  {
    if(this.state.result)
    {  
      return (<></>);
    }
    //
    return(
      <div style={{ margin: '0 0px', padding: 24, background: '#fff', marginTop: 24  }}>
        <div className="dashboard_page_content">
          <Row>
            <Col span={24}>
              <Card>
              <Statistic 
                title="Type this ID onto the envelope" 
                value={this.state.envelope_id} formatter={(value)=>{return value.toString()}}  />
                </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  
  }
  //
  render() {
    let content = this.renderContent();
    
    return (
      <>
        <PageHeader
          breadcrumb={{ routes }}
          title="Deposit money"
          subTitle="Deposit paper money and receive Inkiri on your account"
          
        >
          
        </PageHeader>

        
          {content}
        
      </>
    );
  }

  renderConfirmRequest(){
    const {amount, currency}      = this.state.value;
    const env                     = this.state.envelope_id;
    return (<Result
      icon={<Icon type="question-circle" theme="twoTone" />}
      title={`You will deposit ${currency} ${amount} on envelope ${env}`} 
      subTitle="Please confirm operation."
      extra={[<Button key="do_deposit" type="primary" onClick={() => {this.doDeposit()} }>Confirm Deposit</Button>,
              <Button key="cancel" onClick={() => {this.resetResult()} }>Cancel</Button>]}/>)
  }
}

//
export default Form.create() (withRouter(connect(
    (state)=> ({
        actualAccount:    loginRedux.actualAccount(state),
        actualRole:       loginRedux.actualRole(state),
        isLoading:        loginRedux.isLoading(state)
    }),
    (dispatch)=>({
        
    })
)(DepositMoney) ));