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

import {
  Tooltip,
  Cascader,
  Select,
  Checkbox,
} from 'antd';

import { Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

// import './xxx.css'; 

const { Option } = Select;
const AutoCompleteOption = AutoComplete.Option;
const { Paragraph, Text } = Typography;

const routes = routesService.breadcrumbForFile('account');

class CreateAccount extends Component {
  constructor(props) {
    super(props);
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
      number_validateStatus : '',
      number_help:  '',

      confirmDirty: false,
      autoCompleteResult: [],
  
      default_keys: {  wif:      'Generated Private Key',
                         pub_key:  'Generated Public Key',
                         seed:     ''}, 
      generated_keys: {  wif:      'Generated Private Key',
                         pub_key:  'Generated Public Key',
                         seed:     ''} 
    };

    // this.handleSearch = this.handleSearch.bind(this); 
    this.onSelect                  = this.onSelect.bind(this); 
    this.renderContent             = this.renderContent.bind(this); 
    this.handleSubmit              = this.handleSubmit.bind(this);
    this.onChange                  = this.onChange.bind(this); 
    this.resetPage                 = this.resetPage.bind(this); 
    this.openNotificationWithIcon  = this.openNotificationWithIcon.bind(this); 
    this.generateKeys              = this.generateKeys.bind(this); 

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

  // onSearch={this.handleSearch}
  handleSearch(value){
    // this.setState({
    //   dataSource: !value ? [] : [value, value + value, value + value + value],
    // });
  };

  /* ************************************************* 
  * Form Events
  */

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  generateKeys(do_generate){

    if(!do_generate)
    {
      const {default_keys} = this.state;
      this.setState({generated_keys:default_keys})
      return;
    }
    api.eosHelper.seedPrivate(do_generate)
      .then((res) => {
        // console.log(' >> GENERATED >>',JSON.stringify(res))
        this.setState({generated_keys:res.data})
      } , (error) => {
        console.log('---- generateKeys:', error, JSON.stringify(error));
      });
  }

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      this.generateKeys(undefined)
      callback('Two passwords that you enter is inconsistent!');
    } else {
      this.generateKeys(value)
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  /* ************************************************* */

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

      // const {_id, amount, requested_by, requestCounterId, deposit_currency} = this.state.request;
      // const privateKey = this.props.actualPrivateKey;
      // const receiver   = requested_by.account_name;
      // const sender     = globalCfg.currency.issuer; //this.props.actualAccount;
      
      // const fiat       = globalCfg.api.fiatSymbolToMemo(deposit_currency)
      // const memo       = `dep|${fiat}|${requestCounterId.toString()}`;

      // let that = this;
      // that.setState({pushingTx:true});
      // api.issueMoney(sender, privateKey, receiver, amount, memo)
      //   .then(data => {
      //     console.log(' processRequest::issue (then#1) >>  ', JSON.stringify(data));
      //     if(data && data.data && data.data.transaction_id)
      //     {
      //       // updeteo la tx
      //       api.bank.setDepositOk(_id, data.data.transaction_id).then(
      //         // muestro resultado
      //         (update_res) => {
      //           console.log(' processRequest::issue (then#2) >> update_res ', JSON.stringify(update_res), JSON.stringify(data));
      //           console.log(' processRequest::issue (then#2) >> data ', JSON.stringify(data));
      //           that.setState({result:'ok', pushingTx:false, result_object:data});
      //         }, (err) => {
      //           that.setState({result:'error', pushingTx:false, error:JSON.stringify(err)});
      //         }
      //       )
      //     }
      //     else{
      //       that.setState({result:'error', pushingTx:false, error:'UNKNOWN!'});
      //     }
          
      //   }, (ex)=>{
      //     console.log(' processRequest::issue (error#1) >>  ', JSON.stringify(ex));
      //     that.setState({result:'error', pushingTx:false, error:JSON.stringify(ex)});
      //   });
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

    const { autoCompleteResult } = this.state;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 4,
        },
      },
    };
    
    const websiteOptions = autoCompleteResult.map(website => (
      <AutoCompleteOption key={website}>{website}</AutoCompleteOption>
    ));

    return (
        <div style={{ margin: '0 auto', width:'80%', padding: 24, background: '#fff'}}>
          <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>

              <Form.Item
                extra={<>Validate your account name at <a href="https://api.monitor.jungletestnet.io/#account"  target="_blank">this validator</a> or <a href="https://eos-account-creator.com/choose/" target="_blank">this validator</a>. </>}
                label={
                  <span>
                    Account Name&nbsp;
                    <Tooltip title="EOS Account names must be exactly 12 characters long and consist of lower case characters and digits up until 5.">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }
              >
                {getFieldDecorator('account_name', {
                  rules: [{ required: true, message: 'Please input your account name!', whitespace: true }],
                })(<Input />)}
              </Form.Item>
              
              <Form.Item label="Account Type">
                {getFieldDecorator('account_type', {
                  rules: [{ required: true, message: 'Please select an account type!' }],
                })(
                  <Select>
                    <Option value="1">Personal Account</Option>
                    <Option value="2" disabled>Business Account</Option>
                  </Select>,
                )}
              </Form.Item>

              <Form.Item label="E-mail">
                {getFieldDecorator('email', {
                  rules: [
                    {
                      type: 'email',
                      message: 'The input is not valid E-mail!',
                    },
                    {
                      required: true,
                      message: 'Please input your E-mail!',
                    },
                  ],
                })(<Input />)}
              </Form.Item>
              <Form.Item label="Password" hasFeedback>
                {getFieldDecorator('password', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your password!',
                    },
                    {
                      validator: this.validateToNextPassword,
                    },
                  ],
                })(<Input />)}
              </Form.Item>
              <Form.Item label="Confirm Password" hasFeedback>
                {getFieldDecorator('confirm', {
                  rules: [
                    {
                      required: true,
                      message: 'Please confirm your password!',
                    },
                    {
                      validator: this.compareToFirstPassword,
                    },
                  ],
                })(<Input onBlur={this.handleConfirmBlur} />)}
              </Form.Item>
              <Form.Item label="Generated keys">
                <Input readOnly addonAfter={<Icon type="key" />} value={this.state.generated_keys.wif} />
                <Input readOnly addonAfter={<Icon type="global" />} value={this.state.generated_keys.pub_key}  />
              </Form.Item>
              <Form.Item label="Phone Number">
                {getFieldDecorator('phone', {
                  rules: [{ required: true, message: 'Please input your phone number!' }],
                })(<Input style={{ width: '100%' }} />)}
              </Form.Item>
              <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  Create Account
                </Button>
                
              </Form.Item>
            </Form>
          </Spin>
        </div>
    );
  }
  
  // ** hack for sublime renderer ** //

  // ** hack for sublime renderer ** //

  render() {
    let content = this.renderContent();
    
    return (
      <>
        <PageHeader
          breadcrumb={{ routes }}
          title="Create Account"
          subTitle=""
          
        >          
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
        accounts:         accountsRedux.accounts(state),
        actualAccount:    loginRedux.actualAccount(state),
        actualRole:       loginRedux.actualRole(state),
        actualPrivateKey: loginRedux.actualPrivateKey(state),
        isLoading:        loginRedux.isLoading(state),
        balance:          balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        
    })
)(CreateAccount) )
);
