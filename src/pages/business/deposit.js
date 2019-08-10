import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';
import { Steps, message, Select } from 'antd';

import './deposit.css'; 

const { Step } = Steps;
const { Paragraph, Text } = Typography;
const { Option } = Select;

const routes = [
  {
    path: 'index',
    breadcrumbName: 'Inkiri BANK',
  },
  {
    path: 'first',
    breadcrumbName: 'My money',
  },
  {
    path: 'second',
    breadcrumbName: 'Deposit',
  }
];

class Deposit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:      false,
      dataSource:   [],
      receipt:      '',
      amount:       0,
      currency:     'BRL',
      envelope_id:  'xxxxxxx',
      pushingTx:    false,
      result:       undefined,
      result_object:undefined,
      error:        {},

      current: 0,

      number_validateStatus : '',
      number_help:  ''
      
    };

    this.onSelect         = this.onSelect.bind(this); 
    this.renderSteps      = this.renderSteps.bind(this); 
    this.onChange         = this.onChange.bind(this); 
    this.resetPage        = this.resetPage.bind(this); 

    this.handleSubmit     = this.handleSubmit.bind(this);
    this.renderEnvelopeId = this.renderEnvelopeId.bind(this);
    this.renderConfirmRequest = this.renderConfirmRequest.bind(this);
    let that = this;
    this.steps = [
      {
        title: 'Input amount and currency',
        content: (<div>hihiihhihi</div>),
        renderContent : function() { return that.renderAmountForm() },
      },
      {
        title: 'Envelope ID',
        content: 'Second-content',
        renderContent: function() { return that.renderEnvelopeId() },
      },
      {
        title: 'Confirm transaction',
        content: 'Last-content',
        renderContent: function() { return that.renderConfirmRequest() },
      },
    ];
  }

  
  next() {
    const current = this.state.current + 1;
    this.setState({ current });
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  
  onSelect(value) {
    console.log('onSelect', value);
    this.setState({receipt:value})
  }

  onChange(e) {
    // console.log('changed', value);
    e.preventDefault();
    this.setState({amount:e.target.value})
  }

  
  backToDashboard = async () => {
    this.props.history.push({
      pathname: '/business/extrato'
    })
  }

  handleCurrencyChange(value){
    this.setState({currency:value})
  }

  handleSubmit = e => {
    e.preventDefault();
  }

  resetPage(){
    this.setState({result: undefined, result_object: undefined, error: {}});
  }

  doDeposit(){
    
  }
  renderSelectCurrency() {
    return(
      <Select onChange={this.handleCurrencyChange.bind(this)} defaultValue="BRL" style={{ width: 90 }}>
        <Option value="BRL">BRL</Option>
        <Option value="INK">{globalCfg.currency.symbol}</Option>
      </Select>
    )
  };

  renderConfirmRequest(){
    const curr      = this.state.currency;
    const amount    = this.state.amount;
    const env       = this.state.envelope_id;
    return (<Result
      icon={<Icon type="question-circle" theme="twoTone" />}
      title={`You will deposit ${curr}${amount} on envelope ${env}`}
      subTitle="Please confirm operation."
      extra={<Button type="primary" onclick={doDeposit}>Confirm Deposit</Button>}
    />)
  }

  renderEnvelopeId(){
    const curr   = this.state.currency;
    const amount = this.state.amount.toString();
    return (
        <div style={{ margin: '0 auto', width:500, padding: 24, background: '#fff'}}>
            <Row gutter={16}>
              <Col span={24}>
                <Statistic valueStyle={{fontSize:36, color:'#108ee9'}} title="Type this ID onto the envelope" value={this.state.envelope_id} prefix={<Icon type="red-envelope" />} />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <div className="ant-result-subtitle">You will deposit amount: {curr} {amount}</div>
              </Col>
            </Row>
        </div>
    );
  }
  
  renderAmountForm() {
  
    const { getFieldDecorator } = this.props.form;
    return (
        <div style={{ margin: '0 auto', width:500, padding: 24, background: '#fff'}}>
          <Form onSubmit={this.handleSubmit}>
            <Form.Item 
              style={{minHeight:60, marginBottom:12}}
              validateStatus={this.state.number_validateStatus}
              help={this.state.number_help}>
              {getFieldDecorator('amount', {
                rules: [{ required: true, message: 'Please input an amount to send!' }],
              })(
                <Input
                  size="large"
                  style={{ width: '100%' }}
                  onChange={this.onChange}
                  className="input-money extra-large"
                  allowClear
                  addonBefore={this.renderSelectCurrency()}  
                  defaultValue={this.state.amount}
                />
                

              )}
            </Form.Item>
          </Form>
          
        </div>
    );
  }

  renderResult() {
  
    if(this.state.result=='ok')
    {
      const tx_id = api.dfuse.getTxId(this.state.result_object?this.state.result_object.data:{});
      const _href = api.dfuse.getBlockExplorerTxLink(tx_id);
      
      return (<Result
        status="success"
        title="Transaction completed successfully!"
        subTitle="Transaction id ${tx_id}. Cloud server takes up to 30 seconds, please wait."
        extra={[
          <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
            Go to dashboard
          </Button>,
          <Button type="link" href={_href} target="_blank" key="view-on-blockchain" icon="cloud" >View on Blockchain</Button>,
          <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetPage()} />
       

        ]}
      />)
    }

    if(this.state.result=='error')
    {

      return (<Result
                status="error"
                title="Transaction Failed"
                subTitle="Please check and modify the following information before resubmitting."
                extra={[
                  <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
                    Go to dashboard
                  </Button>,
                  <Button key="re-send">Try sending again</Button>,
                  <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetPage()} />
                ]}
              >
                <div className="desc">
                  <Paragraph>
                    <Text
                      strong
                      style={{
                        fontSize: 16,
                      }}
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
    //<>

    
  }
  
  renderSteps() {
    const { current } = this.state;
    const content = this.steps[current].renderContent();
    //const content = this.renderAmountForm();
    return(
      <>
        <Steps current={current}>
          {this.steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content">{content}</div>
        <div className="steps-action">
          {current > 0 && (
            <Button style={{ marginRight: 8 }} onClick={() => this.prev()}>
              Previous
            </Button>
          )}
          {current < this.steps.length - 1 && (
            <Button type="primary" onClick={() => this.next()}>
              Next
            </Button>
          )}
          {current === this.steps.length - 1 && (
            <Button type="primary" onClick={() => message.success('Processing complete!')}>
              Done
            </Button>
          )}
        </div>
      </>
    );
    //<>
  }

  render() {
    let content = this.renderSteps();
    
    return (
      <>
        <PageHeader
          breadcrumb={{ routes }}
          title="Deposit"
          subTitle="Deposit BRL and IK$"
          
        >
         
        </PageHeader>

        <div style={{ margin: '0 0px', padding: 24, background: '#fff'}}>
          {content}
        </div>
      </>
    );
  }

  
}

export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:         accountsRedux.accounts(state),
        actualAccount:    loginRedux.actualAccount(state),
        isLoading:        loginRedux.isLoading(state),
        balance:          balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        
    })
)(Deposit) )
);