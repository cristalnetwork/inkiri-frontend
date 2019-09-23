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
import moment from 'moment'

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import {
  Tooltip,
  Cascader,
  Select,
  Checkbox,
  DatePicker 
} from 'antd';

import { Divider, Steps, Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

// import './xxx.css'; 

const { Option } = Select;
const AutoCompleteOption = AutoComplete.Option;
const { Paragraph, Text } = Typography;

const routes = routesService.breadcrumbForFile('account');

const { Step } = Steps;

const steps = [
  {
    title: 'Account Type & Profile',
    content: 'First-content',
  },
  {
    title: 'Account details',
    content: 'Second-content',
  },
  {
    title: 'Account Roles',
    content: 'Last-content',
  },
];

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
          offset: 8,
        },
      },
    };

const dateFormat =  'YYYY/MM/DD';

class CreateAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:          false,
      
      pushingTx:        false,
      result:           undefined,
      result_object:    undefined,
      error:            {},
      
      confirmDirty:     false,
      
      current_step:     0,

      account_name:     '',
      password:         '',
      confirm_password: '',
      default_keys:     {  
                         wif:      'Generated Private Key',
                         pub_key:  'Generated Public Key',
                         seed:     ''}, 
      generated_keys:   {
                         wif:      'Generated Private Key',
                         pub_key:  'Generated Public Key',
                         seed:     ''} ,

      account_type:     undefined,
      account_overdraft:0,
      account_fee:      0,
      first_name:       '',
      last_name:        '',
      email:            '',
      legal_id:         '',
      birthday:         '1980/11/06',
      phone:            '',
      address:          { 
                        street:  '', 
                        city:    '', 
                        state:   '', 
                        zip:     '', 
                        country: ''
                      },
      business_name     : ''

    };

    this.handleSubmit              = this.handleSubmit.bind(this);
    
    this.resetPage                 = this.resetPage.bind(this); 
    this.openNotificationWithIcon  = this.openNotificationWithIcon.bind(this); 
    this.generateKeys              = this.generateKeys.bind(this); 
    this.genAccountName            = this.genAccountName.bind(this); 
    this.doCreateAccount           = this.doCreateAccount.bind(this); 
    this.handleAccountTypeChange   = this.handleAccountTypeChange.bind(this);
  }

  validateStep = () => new Promise((res, rej) => {
    const {current_step, account_name} = this.state;
    this.props.form.validateFields((err, values) => {
      if (err)
      {  
        console.log(' >> INVALID STEP >> ERR >>: ', JSON.stringify(err) )
        res( false);
      }
      console.log(' >> VALID STEP >> OK ')
      
      let new_values = Object.assign({}, values);
      if(new_values.birthday)
        new_values.birthday = values.birthday.format(dateFormat)
      
      //HACK
      if(current_step==0 && !account_name)
      {
        const my_account_name   = globalCfg.bank.isPersonalAccount(this.state.account_type) ? (values.last_name.trim() + values.first_name.trim()).toLowerCase() : (values.business_name.trim()).toLowerCase();
        values['account_name']  = (my_account_name+'123451234512345').substring(0, 12);
      }
      this.setState(values);
      res(true);

    });

  });
  
  next = async () => {
    const validStep = await this.validateStep();
    if(!validStep)
      return;
    const {current_step} = this.state;
    this.setState({ current_step:current_step + 1 });
  }

  prev() {
    const current_step = this.state.current_step - 1;
    this.setState({ current_step });
  }

  // doCreateAccountHack(){
  //   let account_name       = 'pablotutino1';
  //   let pub_key            = 'EOS7vRUpaQiNV9pncychw6a4RuXHkqiTNLjrQhGWNaVn8K65XvwCt';
  //   let account_fee        = 5;
  //   let account_overdraft  = 100;
    
  //   api.createAccount(this.props.actualPrivateKey , account_name, pub_key, account_fee, account_overdraft)
  //       .then((res)=>{
  //         console.log(' doCreateAccount() BLOCKCHAIN OK ',JSON.stringify(res))
          
  //         * Step #2: create account on private servers 
          
  //         const {first_name, last_name, email, legal_id, birthday, phone, address} = this.state;
  //         api.bank.createFullUser (account_name, first_name, last_name, email, legal_id, birthday, phone, address)
  //           .then((res2)=>{
  //             console.log(' doCreateAccount() MONGO OK ',JSON.stringify(res2))
  //           }, (err2)=>{
  //             console.log(' doCreateAccount() MONGO ERROR ',JSON.stringify(err2))          
  //           })
  //       }, (err)=>{
  //         console.log(' doCreateAccount() BLOCKCHAIN ERROR', JSON.stringify(err))
  //       })

  // }

  doCreateAccount(){
    
    console.log(' FINALLY createAccount!!!')
    const {account_name, password, confirm_password, generated_keys, account_type, account_overdraft, account_fee, first_name, last_name, email, legal_id, birthday, phone, address} = this.state;
    const that             = this;
    that.setState({pushingTx:true})
    /*
    * Step #1: create EOS account
    */
    console.log(this.props.actualPrivateKey , account_name, generated_keys.pub_key, account_fee, account_overdraft)
    api.createAccount(this.props.actualPrivateKey , account_name, generated_keys.pub_key, account_fee, account_overdraft)
      .then((res)=>{
        console.log(' doCreateAccount() BLOCKCHAIN OK ',JSON.stringify(res))
        /*
        * Step #2: create account on private servers 
        */
        api.bank.createFullUser (account_name, first_name, last_name, email, legal_id, birthday, phone, address)
          .then((res2)=>{
            that.setState({result:'ok', pushingTx:false, result_object:{account_name:account_name}});
            console.log(' doCreateAccount() MONGO OK ',JSON.stringify(res2))
          }, (err2)=>{
            that.setState({result:'error', pushingTx:false, error:JSON.stringify(err2)});
            console.log(' doCreateAccount() MONGO ERROR ',JSON.stringify(err2))          
          })
      }, (err)=>{
        that.setState({result:'error', pushingTx:false, error:JSON.stringify(err)});
        console.log(' doCreateAccount() BLOCKCHAIN ERROR', JSON.stringify(err))
      })

    
  }

  // Fields Events
  handleAccountTypeChange(value){
    // console.log(value)
    this.setState({account_type:value});
  };

  /* ************************************************* 
  * Form Events
  */

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  genAccountName(){
    // do gen account name
    // this.setState({account_name:'something_really_cool'})
    // value={this.state.account_name}
  }

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
      form.validateFields(['confirm_password'], { force: true });
    }
    callback();
  };

  validateNumberGToEZ  = (rule, value, callback) => {
    const amount = parseInt(value || 0, 10);
    if (Number.isNaN(amount)) {
      callback('Please type a valid number!');
      return;
    }
    if(amount<0) {
      callback('Please type a number greater than or equal zero!');
      return;
    }
    callback();
  }

  validateNumber  = (rule, value, callback) => {
    const amount = parseInt(value || 0, 10);
    if (Number.isNaN(amount)) {
      callback('Plese innput a valid number!');
      return;
    }
    callback();
  }

  validateAccountName  = (rule, value, callback) => {
    
    const name = value;
    let regEx = new RegExp("^([a-z1-5]){12,}$");
    if (name.length == 12 && regEx.test(name)) 
    {
      api.getAccount(value)
      .then(()=>{
        callback('Name already exists. Please visit provided links and check name by yourself!');
      },(err)=>{
        callback()
      })
    }
    else {
      callback('12 characters, a-z, 1-5');
    } 
  };

  /* ************************************************* */

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  // handleAmountChange = e => {
  //   e.preventDefault();
  //   const amount = parseInt(e.target.value || 0, 10);
  //   if (Number.isNaN(amount)) {
  //     return;
  //   }
  // };
    

  handleSubmit = e => {
    if(e)
      e.preventDefault();
  };

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/extrato`
    })
  }

  resetPage(full){
    const default_state = {current_step:     0,

      account_name:     '',
      password:         '',
      confirm_password: '',
      default_keys:     {  
                         wif:      'Generated Private Key',
                         pub_key:  'Generated Public Key',
                         seed:     ''}, 
      generated_keys:   {
                         wif:      'Generated Private Key',
                         pub_key:  'Generated Public Key',
                         seed:     ''} ,

      account_type:     undefined,
      account_overdraft:500,
      account_fee:      5,
      
      first_name:       '',
      last_name:        '',
      email:            '',
      legal_id:         '',
      birthday:         '1980/11/06',
      phone:            '',
      address:          { 
                        street:  '', 
                        city:    '', 
                        state:   '', 
                        zip:     '', 
                        country: ''
                      },
    business_name     : ''
    };
    if(full)
      this.setState({...default_state, result: undefined, result_object: undefined, error: {}});
    else
      this.setState({result: undefined, result_object: undefined, error: {}});
  }

  fieldsByAccountType(){
    const {account_type} = this.state;
    
    if(!account_type)
      return (<></>);
    //
    
    const { getFieldDecorator } = this.props.form;
    if(globalCfg.bank.isPersonalAccount(account_type))
    {
      const {account_fee, account_overdraft, first_name, last_name, email, legal_id, birthday, phone, address} = this.state;  
      return(
        <>
          <h3 style={{paddingLeft: 50}}>PROFILE SECTION</h3>
          <Form.Item
            label="Nome"
            >
              {getFieldDecorator('first_name', {
                rules: [{ required: true, message: 'Please input your name!', whitespace: true }],
                initialValue: first_name
              })(<Input />)}
            </Form.Item>

            <Form.Item
              label="Sobrenome"
            >
              {getFieldDecorator('last_name', {
                rules: [{ required: true, message: 'Please input your name!', whitespace: true }],
                initialValue: last_name
              })(<Input />)}
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
                initialValue: email
              })(<Input />)}
            </Form.Item>
            <Form.Item label="CPF">
              {getFieldDecorator('legal_id', {
                rules: [{ required: true, message: 'Please input your CPF!' }],
                initialValue: legal_id
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item label="Birthday">
              {getFieldDecorator('birthday', {
                rules: [{ required: true, message: 'Please input your birthday!' }],
                initialValue: moment(birthday, dateFormat)
              })( <DatePicker format={dateFormat} style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item label="Phone Number">
              {getFieldDecorator('phone', {
                rules: [{ required: true, message: 'Please input your phone number!' }],
                initialValue: phone
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
            
            <h4 style={{paddingLeft: 50}}>Address</h4>
            <Form.Item label="Street" extra="Street and Number, Apt, Suite, Unit, Building">
              {getFieldDecorator('address.street', {
                rules: [{ required: true, message: 'Please input Street!' }],
                initialValue: address.street
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item label="City">
              {getFieldDecorator('address.city', {
                rules: [{ required: true, message: 'Please input City!' }],
                initialValue: address.city
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item label="State/Province">
              {getFieldDecorator('address.state', {
                rules: [{ required: true, message: 'Please input State/Province!' }],
                initialValue: address.state
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item label="Zip / Postal Code">
              {getFieldDecorator('address.zip', {
                rules: [{ required: true, message: 'Please input Zip/Postal code!' }],
                initialValue: address.zip
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item label="Country">
              {getFieldDecorator('address.country', {
                rules: [{ required: true, message: 'Please input State/Province!' }],
                initialValue: address.country
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
        </>)
    }
  
    //
    if(globalCfg.bank.isBusinessAccount(account_type))
    {
      const {business_name} = this.state;
      return (<>
          <h3 style={{paddingLeft: 50}}>PROFILE SECTION</h3>
          <Form.Item
            label="Nome do Negócio"
            >
              {getFieldDecorator('business_name', {
                rules: [{ required: true, message: 'Please input a valid business name!', whitespace: true }],
                initialValue: business_name
              })(<Input />)}
            </Form.Item>
      </>);
    }
  }
  //
  renderStep(current_step){
    const { getFieldDecorator } = this.props.form;
    
    
    let content = null;
    
    if(current_step==0)
    {
      const {account_type, account_fee, account_overdraft, first_name, last_name, email, legal_id, birthday, phone, address} = this.state;  
        content = (
              <div style={{ margin: '0 0px', maxWidth: '600px', background: '#fff'}}>
                <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
                  <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                    
                    <h3 style={{paddingLeft: 50}}>ACCOUNT SECTION</h3>
                    
                    <Form.Item label="Account Type">
                      {getFieldDecorator('account_type', {
                        rules: [{ required: true, message: 'Please select an account type!' }],
                        initialValue: account_type
                      })(
                        <Select onChange={this.handleAccountTypeChange}>
                          <Option value="1">Personal Account</Option>
                          <Option value="2">Business Account</Option>
                        </Select>,
                      )}
                    </Form.Item>
                    
                    <Form.Item label="Fee">
                        {getFieldDecorator('account_fee', {
                          rules: [{ required: true, message: 'Please input fee!', whitespace: true },
                          {validator: this.validateNumberGToEZ}],
                          initialValue: account_fee
                        })(<Input  type="number"/>)}
                    </Form.Item>

                    <Form.Item
                      label="Overdraft"
                      extra="Kind of initial balance"
                      >
                        {getFieldDecorator('account_overdraft', {
                          rules: [{ required: true, message: 'Please input overdraft!', whitespace: true },
                          {validator: this.validateNumberGToEZ}],
                          initialValue: account_overdraft
                        })(<Input type="number" />)}
                      </Form.Item>

                      {this.fieldsByAccountType()}
                    
                  </Form>
                </Spin>
              </div>
          );
    }
    
    //

    if(current_step==1)
    {  
      const {account_name, password, confirm_password, default_keys, generated_keys} = this.state;  
      content = (
        <div style={{ margin: '0 0px', maxWidth: '600px', background: '#fff'}}>
          <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
            <Form {...formItemLayout} onSubmit={this.handleSubmitS1}>
              
              <h3 style={{paddingLeft: 50}}>EOS ACCOUNT NAME SECTION</h3>
              <Form.Item
                extra={<>Validate your account name if new at <a href={globalCfg.eosnode.create_account}  target="_blank">this validator</a> . </>}
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
                  rules: [
                    { required: true, message: 'Please input your account name!', whitespace: true }
                     , { max: 12, message: '12 characters max' }
                     , { min: 12, message: '12 characters min' }
                     , {
                        validator: this.validateAccountName, 
                      }
                    ],
                  initialValue: account_name
                })(<Input />)}
              </Form.Item>
              
              <Divider />
              <h3 style={{paddingLeft: 50}}>NEW EOS ACCOUNT SECTION</h3>
              <h3 style={{paddingLeft: 50}}>Fill following fields if you want to create a new EOS account</h3>
              
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
                  initialValue: password
                })(<Input />)}
              </Form.Item>
              <Form.Item label="Confirm Password" hasFeedback>
                {getFieldDecorator('confirm_password', {
                  rules: [
                    {
                      required: true,
                      message: 'Please confirm your password!',
                    },
                    {
                      validator: this.compareToFirstPassword,
                    },
                  ],
                  initialValue: confirm_password
                })(<Input onBlur={this.handleConfirmBlur} />)}
              </Form.Item>
              <Form.Item label="Generated keys" extra="PLEASE COPY PRIVATE KEY">
                <Input readOnly addonAfter={<Icon type="key" />} value={generated_keys.wif} />
                <Input readOnly addonAfter={<Icon type="global" />} value={generated_keys.pub_key}  />
              </Form.Item>
            </Form>
          </Spin>
        </div>
      );
    }
    
    //
    if(current_step==2){
      const permConf = globalCfg.bank.listPermsByAccountType();
      const xx = this.renderAllPerms(permConf[globalCfg.bank.ACCOUNT_TYPE_PERSONAL]);
      content = (xx);
    }
    
    //
    return (
      <>
        <Card 
          title={(<span><strong>{steps[current_step].title} </strong> </span> )}
          key={'new_perm'}
          style = { { marginBottom: 24, marginTop: 24 } } 
          loading={this.state.pushingTx}
          >
          {content}
        </Card>
        <div style={{ margin: '0 0px', padding: 24, background: '#fff', marginTop: 24}}>
          <div className="steps-action">
            {current_step > 0 && (
              <Button style={{ marginRight: 8 }} onClick={() => this.prev()}>
                Previous
              </Button>
            )}
            {current_step < steps.length - 1 && (
              <Button type="primary" onClick={() => this.next()}>
                Next
              </Button>
            )}
            {current_step === steps.length - 1 && (
              <Button type="primary" onClick={() => this.doCreateAccount()} disabled={this.state.pushingTx}>
                Done
              </Button>
            )}
          </div>
        </div>
      </>);
  }
  
  renderAllPerms(perms) {
    return (
      <Card 
        key={'card_master'}
        style = { { marginBottom: 24 } } 
        extra = {<Button key="_new_perm" size="small" icon="plus" disabled> Authorize account</Button>}
        tabList={perms.map(perm=>{
          return {key: perm
                  , tab: (
                    <span>{utils.capitalize(perm)}</span>
                  )}
  
        })}
        activeTabKey="owner"
        >
        <div style={{ margin: '0 auto', width:'100%', padding: 24, background: '#fff'}}>
          
        </div>
      </Card>
    );
  }
  //

  
  //
  renderResult() {
  
    if(this.state.result=='ok')
    {
      const account_name = this.state.result_object.account_name;
      const _href        = api.dfuse.getBlockExplorerAccountLink(account_name);
      // console.log(' >>>>> api.dfuse.getBlockExplorerTxLink: ', _href)
      
      return (
        <div style={{ margin: '0 0px', padding: 24, background: '#fff'}}>
          <Result
          status="success"
          title="Transaction completed successfully!"
          subTitle="User created succesfully. Cloud server takes up to 30 seconds, please wait."
          extra={[
            <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
              Go to dashboard
            </Button>,
            <Button type="link" href={_href} target="_blank" key="view-on-blockchain" icon="cloud" >View on Blockchain</Button>,
            <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetPage(true)} />
           ]}
          />
        </div>)
    }

    //
    if(this.state.result=='error')
    {

      // <Button key="re-send">Try sending again</Button>,
      return (
        <div style={{ margin: '0 0px', padding: 24, background: '#fff'}}>
          <Result
                status="error"
                title="Transaction Failed"
                subTitle="Please check and modify the following information before resubmitting."
                extra={[
                  <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>Go to dashboard</Button>,
                  <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetPage(false)} />
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
              </Result>
        </div>)
    }
    
    // ** hack for sublime renderer ** //

  }
  
  // ** hack for sublime renderer ** //

  render() {
    const {current_step, result} = this.state;
    let content = null;
    if(result)
      content = this.renderResult();
    else 
    {
      content = this.renderStep(current_step);
    }
    
    //extra={[<Button key="_new_account" icon="plus" onClick={()=>{this.doCreateAccountHack()}}> Account Hack</Button>,]} 
    return (
      <>
        <PageHeader
          breadcrumb={{ routes }}
          title="Create Account"
          subTitle=""
          
        >          
        </PageHeader>
        
          <div style={{ margin: '0 0px', padding: 24, background: '#fff', marginTop: 24}}>
            <Steps current={current_step}>
              {steps.map(item => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>
          </div>
        

          {content}
        
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
