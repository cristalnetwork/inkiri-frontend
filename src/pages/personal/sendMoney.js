import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as routesService from '@app/services/routes';
import * as globalCfg from '@app/configs/global';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import './sendMoney.css'; 

const { Paragraph, Text } = Typography;

const routes = routesService.breadcrumbForFile('send-money');

class SendMoney extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:      false,
      receipt:      '',
      amount:       0,
      memo:         '',
      pushingTx:    false,
      result:       undefined,
      result_object:undefined,
      error:        {},
      number_validateStatus : '',
      number_help:  ''
                    
    };

    this.onSelect     = this.onSelect.bind(this); 
    this.renderContent   = this.renderContent.bind(this); 
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange     = this.onChange.bind(this); 
    this.resetPage    = this.resetPage.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
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
    // const { myKey } = this.props.location.params
    const { match, location, history } = this.props;
    // console.log( 'sendMoney::router-params >> match:' , JSON.stringify(match))
    console.log( 'sendMoney::router-params >> location:' , JSON.stringify(location))
  }
  
  onSelect(value) {
    console.log('onSelect', value);
    this.setState({receipt:value})
  }

  onChange(e) {
    e.preventDefault();
    // console.log('changed', e);
    this.setState({amount:e.target.value, number_validateStatus:'' , number_help:''})
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }


  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        //
        return;
      }
      if(isNaN(this.state.amount))
      {
        this.openNotificationWithIcon("error", this.state.amount + "Valid number required","Please type a validnumber greater than 0!")    
        this.setState({number_validateStatus:'error' , number_help:'Should be a number greater than 0'})
        return;
      }
      console.log('Received values of form: ', values);

      const privateKey = this.props.actualPrivateKey;
      // HACK! >> La tenemos que traer de localStorage? <<
      const receiver   = values.receipt;
      const sender     = this.props.actualAccountName;
      const amount     = values.amount;
      const memo       = '';
      let that         = this;
      that.setState({pushingTx:true});
      api.sendMoney(sender, privateKey, receiver, amount, memo)
      .then((data) => {
        console.log(' SendMoney::send (then#1) >>  ', JSON.stringify(data));
        that.setState({result:'ok', pushingTx:false, result_object:data});
      }, (ex) => {
        console.log(' SendMoney::send (error#1) >>  ', JSON.stringify(ex));
        that.setState({result:'error', pushingTx:false, error:JSON.stringify(ex)});
      });
      
    });
  };

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/extrato`
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
          <Button type="link" href={_href} target="_blank" key="view-on-blockchain" icon="cloud" title="View on Blockchain">B-Chain</Button>,
          <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetPage()} />
       

        ]}
      />)
    }

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

    return (
        <div style={{ margin: '0 auto', width:500, padding: 24, background: '#fff'}}>
          <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
            <Form onSubmit={this.handleSubmit}>
                
              <Form.Item style={{minHeight:60, marginBottom:12}}>
                {getFieldDecorator('receipt', {
                  rules: [{ required: true, message: 'Please input receipt account name!' }]
                })(
                  <AutoComplete
                    size="large"
                    dataSource={this.props.accounts.filter(acc=>acc.key!=this.props.actualAccountName).map(acc=>acc.key)}
                    style={{ width: '100%' }}
                    onSelect={this.onSelect}
                    placeholder=""
                    filterOption={true}
                    className="extra-large"
                  >
                    <Input suffix={<Icon type="user" style={{fontSize:20}} className="default-icon" />} />
                  </AutoComplete>
                   
                )}
              </Form.Item>

              
              <Form.Item 
                style={{minHeight:60, marginBottom:12}}
                validateStatus={this.state.number_validateStatus}
                help={this.state.number_help}>
                {getFieldDecorator('amount', {
                  rules: [{ required: true, message: 'Please input an amount to send!' }],
                  initialValue: 0
                })(
                  <Input
                    size="large"
                    style={{ width: '100%' }}
                    onChange={this.onChange}
                    className="input-money extra-large"
                    allowClear
                    prefix={<Icon type="dollar-circle" theme="filled" style={{fontSize:34}} className="certain-category-icon" />} 
                    
                  />
                  
                )}
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  Send
                </Button>
                
              </Form.Item>
            </Form>
          </Spin>
        </div>
    );
  }
  
  /*
  
  */
  
  // ** hack for sublime renderer ** //

  renderExtraContent ()
  {
    return (<></>);
  
  }
  
  // ** hack for sublime renderer ** //

  render() {
    let content = this.renderContent();
    
    return (
      <>
        <PageHeader
          breadcrumb={{ routes }}
          title="Send money"
          subTitle="Send money instantly for free"
          
        >
          <div className="wrap">
            <div className="extraContent">{this.renderExtraContent()}</div>
          </div>
        </PageHeader>

        <div style={{ margin: '0 0px', padding: 24, background: '#fff', marginTop: 24}}>
          {content}
        </div>
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
    }),
    (dispatch)=>({
        
    })
)(SendMoney) )
);
