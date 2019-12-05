import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import moment from 'moment';

import PropTypes from "prop-types";

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';


import {
  Tooltip,
  Cascader,
  Select,
  Checkbox,
  DatePicker 
} from 'antd';

import { Divider, Steps, Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { List, Skeleton, notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import { Modal } from 'antd';

import {CopyToClipboard} from 'react-copy-to-clipboard';

import {formItemLayout,tailFormItemLayout } from '@app/utils/utils';

const { confirm } = Modal;
const { Option } = Select;
const AutoCompleteOption = AutoComplete.Option;
const { Paragraph, Text } = Typography;

const { Step } = Steps;

const steps = [
  {
    title: 'Account Info + Profile Info',
    content: 'First-content',
  },
  {
    title: 'Account Details',
    content: 'Second-content',
  },
  {
    title: 'Account Roles',
    content: 'Last-content',
  },
];

const dateFormat =  'YYYY/MM/DD';
const DEFAULT_STATE = {
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
      business_name:    '',
      permissions:      undefined,
      alias:            '',
    };
class CreateAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      referrer:        (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,
      loading:          false,
      
      pushingTx:        false,
      result:           undefined,
      result_object:    undefined,
      error:            {},
      
      confirmDirty:     false,
      
      ...DEFAULT_STATE,
      
      // PERMS
      active_tab_key:  'owner',
      new_perm_name:   '',
      delete_permission:undefined,
      adding_new_perm:  false,
      
    };

    this.handleAddPermissionSubmit = this.handleAddPermissionSubmit.bind(this);
    
    this.resetPage                     = this.resetPage.bind(this); 
    this.openNotificationWithIcon      = this.openNotificationWithIcon.bind(this); 
    this.generateKeys                  = this.generateKeys.bind(this); 
    this.genAccountName                = this.genAccountName.bind(this); 
    this.doCreateAccount               = this.doCreateAccount.bind(this); 
    this.validateNConfirmCreateAccount = this.validateNConfirmCreateAccount.bind(this); 
    this.handleAccountTypeChange       = this.handleAccountTypeChange.bind(this);
    this.validateStep                  = this.validateStep.bind(this);
    this.next                          = this.next.bind(this);
    this.onNewPermission               = this.onNewPermission.bind(this);
    this.onCancelNewPermission         = this.onCancelNewPermission.bind(this);
    this.onDeletePermission            = this.onDeletePermission.bind(this);

  }

  renderAccountTypesOptions(){
    const my_options          = globalCfg.bank.newAccountTypesOptions();
    const { getFieldDecorator } = this.props.form;
    const {account_type}        = this.state;
    /*
    <Form.Item label="Account Type">
                      {getFieldDecorator('account_type', {
                        rules: [{ required: true, message: 'Please select an account type!' }],
                        initialValue: account_type
                      })(
                        <Select onChange={this.handleAccountTypeChange}>
                          <Option value="1">Personal Account</Option>
                          <Option value="2">Business Account</Option>
                        </Select>
                      )}
                    </Form.Item>
                    */
    return (
      <Form.Item label="Account Type" className="money-transfer__rowX">
          {getFieldDecorator( 'account_type', {
            rules: [{ required: true, message: 'Please select an account type!'}]
            , initialValue: account_type
            , onChange: (e) => this.handleAccountTypeChange(e)
          })(
            <Select placeholder={'Choose an account type'} >
            {my_options.map( opt => <Select.Option key={opt.key} value={opt.key} label={opt.title}>{ opt.title } </Select.Option> )}
            </Select>
          )}
      </Form.Item>
    )
  }
  //
  validateStep = () => new Promise((res, rej) => {
    
    console.log(' createAccount::validateStep() ENTER');
    const {current_step, account_name} = this.state;
    console.log(` createAccount::validateStep() current_step: ${current_step} | account_name:${account_name}`);
    
    try{
      this.props.form.validateFields((err, values) => {
        // console.log('hola')
        // console.log(` createAccount::validateStep() err: ${err} | values:${values}`);
        if (err)
        {  
          // console.log(' >> INVALID STEP >> ERR >>: ', JSON.stringify(err) )
          this.openNotificationWithIcon('error', 'Something went wrong!', JSON.stringify(err))
          rej(JSON.stringify(err));
          return;
        }

        // console.log(' >> VALID STEP >> OK ')
        
        let new_values = Object.assign({}, values);
        if(new_values.birthday)
          new_values.birthday = values.birthday.format(dateFormat)
        
        //HACK
        if(current_step==0 && !account_name)
        {
          // const my_account_name   = globalCfg.bank.isPersonalAccount(this.state.account_type) ? (values.last_name.trim() + values.first_name.trim()).toLowerCase() : (values.business_name.trim()).toLowerCase();
          // values['account_name']  = (my_account_name.replace(/ /g, '')+'123451234512345').substring(0, 12);
          
          const seeds = globalCfg.bank.isPersonalAccount(this.state.account_type) 
            ? [values.last_name.trim().toLowerCase(), values.first_name.trim().toLowerCase()] 
            : [values.business_name.trim().toLowerCase()];

          values['account_name'] = api.nameHelper.generateAccountName(seeds);
        }
        this.setState(values);
        res(true);

      });
    }catch(e){
      // console.log(` createAccount::validateStep() ex: ${e}`);
      this.openNotificationWithIcon('error', 'Something went wrong!', JSON.stringify(e))
      rej(e)
    } 
    

  });
  
  next = async () => {
    console.log(' createAccount::next() ENTER');
    let validStep = false;
    try{
      validStep = await this.validateStep();
    }
    catch(e)
    {
      this.openNotificationWithIcon("error", "Something went wrong!");        
      return;
    } 
    
    if(!validStep)
    {
      this.openNotificationWithIcon("error", "Something went wrong!","Step is not valid.")        
      return;
    }
    const {current_step} = this.state;
    this.setState({ current_step:current_step + 1 });
  }

  prev() {
    const current_step = this.state.current_step - 1;
    this.setState({ current_step });
  }

  getAccountDescription = () => {
    const { business_name, account_name, password, confirm_password, generated_keys, account_type, account_overdraft, account_fee, first_name, last_name, email, legal_id, birthday, phone, address} = this.state; 
    const complete_name = (globalCfg.bank.isPersonalAccount(account_type))?`${first_name} ${last_name}`:business_name
    const type_desc     = utils.capitalize(globalCfg.bank.getAccountType(account_type));
    const _fee          = globalCfg.currency.toCurrencyString(account_fee);
    const _overdraft    = globalCfg.currency.toCurrencyString(account_overdraft)
    return (<span>Please confirm creation of a <b>{type_desc} Account</b>. <br/>Account name: <b>{account_name}</b>.<br/> Name: <b>{complete_name}</b>.<br/> Fee: {_fee}<br/> Overdraft: {_overdraft}</span>);
  }
  //

  validateNConfirmCreateAccount = () => {

    /* Manual Validation
     * Check if it's a business account -> must have at least one manager account */
    const {account_type, permissions} = this.state;
    if(globalCfg.bank.isBusinessAccount(account_type) && (!permissions || !permissions['owner'] || permissions['owner'].length<1))
    {
      this.openNotificationWithIcon("error", "Consider authorizing at least one owner account!","")  
      return;
    }
    const modal_content = this.getAccountDescription();
    const that          = this;
    confirm({
      title: 'Create Account',
      content: modal_content,
      onOk() {
        that.doCreateAccount();
      },
      onCancel() {},
    });
  }

  doCreateAccount(){
    console.log(' FINALLY createAccount!!!')
    const {permissions, business_name, alias, account_name, password, confirm_password, generated_keys, account_type, account_overdraft, account_fee, first_name, last_name, email, legal_id, birthday, phone, address} = this.state;
    const that             = this;
    that.setState({pushingTx:true})
    
    /*
    * Step #1: create EOS account
    */
    console.log('actualPrivateKey:', this.props.actualPrivateKey 
      , ' | account_name:', account_name
      , ' | generated_keys.pub_key:', generated_keys.pub_key, 
      ' | account_fee:', account_fee, 
      ' | account_overdraft:', account_overdraft, 
      ' | account_type:', account_type, 
      ' | permissions:', JSON.stringify(permissions));

    api.createAccount(this.props.actualPrivateKey 
                        , account_name
                        , generated_keys.pub_key
                        , account_type
                        , account_fee
                        , account_overdraft
                        , permissions)
      .then((res)=>{
        console.log(' doCreateAccount() BLOCKCHAIN OK ',JSON.stringify(res))
        /*
        * Step #2: create account on private servers 
        */
        api.bank.createOrUpdateUser(null, account_type, account_name, first_name, last_name, email, legal_id, birthday, phone, address, business_name, alias)
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

  // Events
  componentDidMount(){
    
    // console.log('BEGIN generateAccountName')
    // const test       = api.nameHelper.generateAccountName(['biz#1']);
    // const valid_test = api.nameHelper.isValidAccountName(test);
    // console.log(test, valid_test?'VALID':'INVALID')
    // console.log('END generateAccountName')

    this.props.loadAccounts();
  }

  handleAddPermissionSubmit = e => {

    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        //
        return;
      }
      const {new_perm_name} = this.state;
      console.log(' >> addPermission ?? >>', JSON.stringify(values), ' | new_perm_name >> ', new_perm_name)
      let my_permissions = this.state.permissions;
      if(!my_permissions)
        my_permissions={};
      if(!my_permissions[new_perm_name])
        my_permissions[new_perm_name]=[];
      if(my_permissions[new_perm_name].indexOf(values.permissioned)>-1)
      {
        this.openNotificationWithIcon("warning", "Account already added to authorized list","")  
        return;
      }
      my_permissions[new_perm_name].push(values.permissioned)
      this.setState({permissions:my_permissions, adding_new_perm:false})
      this.openNotificationWithIcon("success", "Account added to authorized list","")
    });
    
  };

  onTabChange = (tabKey) => {
    this.setState({
      active_tab_key: tabKey,
    });
  }

  onNewPermission(perm_name){
    this.setState({adding_new_perm:true, new_perm_name:perm_name})
  }

  onDeletePermission(perm_name, actor){
    let my_permissions = this.state.permissions;
    const idx_to_rm = my_permissions[perm_name].indexOf(actor)
    my_permissions[perm_name].splice(idx_to_rm, 1);
    this.setState({permissions:my_permissions})
  }
  onCancelNewPermission(){
    // this.setState({result:'', new_perm_name:''})
    this.setState({adding_new_perm:false, new_perm_name:''})
  }


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

  generateKeys(do_generate, callback){

    if(!do_generate)
    {
      const {default_keys} = this.state;
      this.setState({generated_keys:default_keys})
      return;
    }
    const { form }     = this.props;
    const account_name = form.getFieldValue('account_name')
    let seed       = null;
    const password = do_generate;
    try{
      seed = globalCfg.eos.generateSeed(account_name, password);
    }catch(e){
      callback(JSON.strnigify(e));
      return;
    }
    const keys = api.eosHelper.seedPrivate(seed);
    const that = this;
    api.getKeyAccounts(keys.pub_key)
      .then(()=>{
        if(callback)
          callback('Name already exists. Please visit provided links and check name by yourself!');
      },(err)=>{
        that.setState({generated_keys:keys})
        if(callback)
          callback()
      })

  }

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      this.generateKeys(undefined)
      callback('Passwords are not equal!');
    } else {
      this.generateKeys(value)
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm_password'], { force: true });
      callback();
      // return;
    }
    if (value && form.getFieldValue('confirm_password') && value !== form.getFieldValue('confirm_password')) {
      this.generateKeys(undefined)
      callback('Both passwords are not equal!');
      return;
    }
    callback();
  };

  validateNumberGToEZ  = (rule, value, callback) => {
    console.log(` -- validateNumberGToEZ -- ${value}`)
    if (Number.isNaN(value)) {
      callback('Please type a valid number!');
      return;
    }
    if(parseFloat(value)<0) {
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
    
    if (api.nameHelper.isValidAccountName(name)) 
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

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/dashboard`
    })
  }

  resetPage(full){
    if(full)
      this.setState({...DEFAULT_STATE, result: undefined, result_object: undefined, error: {}});
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
          <h3 className="fileds_header">PROFILE SECTION</h3>
          <Form.Item
            label="Nome">
              {getFieldDecorator('first_name', {
                rules: [{ required: true, message: 'Please input first name!', whitespace: true }],
                initialValue: first_name
              })(<Input />)}
            </Form.Item>

            <Form.Item
              label="Sobrenome">
              {getFieldDecorator('last_name', {
                rules: [{ required: true, message: 'Please input last name!', whitespace: true }],
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
                    message: 'Please input E-mail!',
                  },
                ],
                initialValue: email
              })(<Input />)}
            </Form.Item>
            <Form.Item label="CPF">
              {getFieldDecorator('legal_id', {
                rules: [{ required: true, message: 'Please input CPF!' }],
                initialValue: legal_id
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item label="Phone Number">
              {getFieldDecorator('phone', {
                rules: [{ required: true, message: 'Please input phone number!' }],
                initialValue: phone
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item label="Birthday">
              {getFieldDecorator('birthday', {
                rules: [{ required: false, message: 'Please input birthday!' }],
                initialValue: moment(birthday, dateFormat)
              })( <DatePicker format={dateFormat} style={{ width: '100%' }} />)}
            </Form.Item>
            
            <h3 className="fileds_header">ADDRESS</h3>
            <Form.Item label="Street" extra="Street and Number, Apt, Suite, Unit, Building">
              {getFieldDecorator('address.street', {
                rules: [{ required: false, message: 'Please input Street!' }],
                initialValue: address.street
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item label="City">
              {getFieldDecorator('address.city', {
                rules: [{ required: false, message: 'Please input City!' }],
                initialValue: address.city
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item label="State/Province">
              {getFieldDecorator('address.state', {
                rules: [{ required: false, message: 'Please input State/Province!' }],
                initialValue: address.state
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item label="Zip / Postal Code">
              {getFieldDecorator('address.zip', {
                rules: [{ required: false, message: 'Please input Zip/Postal code!' }],
                initialValue: address.zip
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item label="Country">
              {getFieldDecorator('address.country', {
                rules: [{ required: false, message: 'Please input State/Province!' }],
                initialValue: address.country
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
        </>)
    }
  
    //
    if(globalCfg.bank.isBusinessAccount(account_type))
    {
      const {business_name, alias} = this.state;
      return (<>
          <h3 className="fileds_header">PROFILE SECTION</h3>
          <Form.Item
            label="Nome do Negócio"
            >
              {getFieldDecorator('business_name', {
                rules: [{ required: true, message: 'Please input a valid business name!', whitespace: true }],
                initialValue: business_name
              })(<Input />)}
            </Form.Item>
          <Form.Item
            label="IUGU alias"
            >
              {getFieldDecorator('alias', {
                rules: [{ required: true, message: 'Please input a valid IUGU alias!', whitespace: true }],
                initialValue: alias
              })(<Input />)}
            </Form.Item>
      </>);
    }
  }
  //
  
  renderStep(current_step){
    const { getFieldDecorator } = this.props.form;
    const account_options       = this.renderAccountTypesOptions();
    
    let content = null;
    
    if(current_step==0)
    {
      const {account_type, account_fee, account_overdraft, first_name, last_name, email, legal_id, birthday, phone, address} = this.state;  
        content = (
              <div style={{ margin: '0 0px', maxWidth: '600px', background: '#fff'}}>
                <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
                  <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                    
                    <h3 className="fileds_header">ACCOUNT SECTION</h3>
                    
                        {account_options}
                    
                    <Form.Item label="Fee">
                        {getFieldDecorator('account_fee', {
                          rules: [{ required: true, message: 'Please input fee!', whitespace: true, validator: this.validateNumberGToEZ}],
                          initialValue: account_fee||0
                        })(<Input type="tel" step="0.01" />)}
                    </Form.Item>

                    <Form.Item
                      label="Overdraft"
                      extra="Credit. Kind of initial balance"
                      >
                        {getFieldDecorator('account_overdraft', {
                          rules: [{ required: true, message: 'Please input overdraft!', whitespace: true , validator: this.validateNumberGToEZ}],
                          initialValue: account_overdraft||0
                        })(<Input type="tel" step="0.01" />)}
                      </Form.Item>

                      {this.fieldsByAccountType()}
                    
                  </Form>
                </Spin>
              </div>
          );
    }
    
    //
    /*
      , account_name_validating, account_name_validated
      addonAfter={<Button type="link" icon="check" loading={account_name_validating} onClick={() => {this.validateAccountName()}} />}
    */
    if(current_step==1)
    {  
      const {account_name, password, confirm_password, default_keys, generated_keys} = this.state;  
      content = (
        <div style={{ margin: '0 0px', maxWidth: '600px', background: '#fff'}}>
          <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
            <Form {...formItemLayout} onSubmit={this.handleSubmitS1}>
              
              <h3 className="fileds_header">EOS ACCOUNT NAME SECTION</h3>
              <Form.Item
                extra={<>EOS Account names must be exactly 12 characters long and consist of lower case characters and digits up until 5. <br/>Validate account name if new at <a href={globalCfg.eos.create_account}  target="_blank">this validator</a> . </>}
                label="Account name">
                {getFieldDecorator('account_name', {
                  rules: [
                    { required: true, message: 'Please input account name!', whitespace: true }
                     , { max: 12, message: '12 characters max' }
                     , { min: 12, message: '12 characters min' }
                     , {
                        validator: this.validateAccountName, 
                      }
                    ],
                  initialValue: account_name
                })(<Input  />)}
              </Form.Item>
              
              <Divider />
              <h3 className="fileds_header">SECURITY</h3>
              
              <Form.Item label="Password" hasFeedback>
                {getFieldDecorator('password', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input password!',
                    }
                    ,{ min: 4, message: '4 characters min' }
                    ,{
                      validator: this.validateToNextPassword,
                    },
                  ],
                  initialValue: password
                })(<Input.Password visibilityToggle="true" />)}
              </Form.Item>
              <Form.Item label="Confirm Password" hasFeedback>
                {getFieldDecorator('confirm_password', {
                  rules: [
                    {
                      required: true,
                      message: 'Please confirm password!',
                    },
                    {
                      validator: this.compareToFirstPassword,
                    },
                  ],
                  initialValue: confirm_password
                })(<Input.Password visibilityToggle="true" onBlur={this.handleConfirmBlur} />)}
              </Form.Item>
              <h3 className="fileds_header">KEYS GENERATED FROM PASSWORD</h3>
              <Form.Item label="Private Key" extra="You can copy and keep this private key for security reasons.">
                <Input readOnly addonAfter={
                    <CopyToClipboard text={generated_keys.wif} onCopy={() => this.openNotificationWithIcon("success", "Key copied successfully","") }>
                       <Button type="link" icon="copy" />
                    </CopyToClipboard>
                } value={generated_keys.wif} />
              </Form.Item>
              <Form.Item label="Public key">
                <Input readOnly addonAfter={<Icon type="global" />} value={generated_keys.pub_key}  />
              </Form.Item>
            </Form>
          </Spin>
        </div>
      );
    }
    
    const {adding_new_perm} = this.state;

    if(current_step==2 && !adding_new_perm){
      const {account_type} = this.state;  
      // const permConf = globalCfg.bank.listPermsByAccountType();
      // const xx = this.renderAllPerms(permConf[account_type]);
      const xx = this.renderAllPerms(globalCfg.bank.getPermsForAccountType(account_type));
      content = (xx);
    }
    
    if(current_step==2 && adding_new_perm)
    {
      const {active_tab_key} = this.state;
      const account_name = globalCfg.bank.issuer;
      content = (
        <Card 
          title={(<span>New Permission for <strong>{utils.capitalize(active_tab_key)} </strong> </span> )}
          key={'_new_perm'}
          style = { { marginBottom: 24 } } 
          extra = {<Button key="_new_perm_cancel" icon="close" size="small" onClick={() => this.onCancelNewPermission()}> Cancel</Button>}
          >
          <div style={{ margin: '0 auto', width:'100%', padding: 24, background: '#fff'}}>

            <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
              <Form onSubmit={this.handleAddPermissionSubmit}>
                  
                <Form.Item style={{minHeight:60, marginBottom:12}}>
                  {getFieldDecorator('permissioned', {
                    rules: [{ required: true, message: 'Please input account name!' }]
                  })(
                    <AutoComplete
                      autoFocus
                      size="large"
                      dataSource={this.props.accounts.filter(acc=>acc.key!=account_name).map(acc=>acc.key)}
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

                <Form.Item>
                  <Button type="primary" htmlType="submit" className="login-form-button">
                    Authorize
                  </Button>
                  
                </Form.Item>
              </Form>
            </Spin>
          
          </div>
        </Card>
      ); 
    }

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
                <Button type="primary" onClick={() => this.validateNConfirmCreateAccount()} disabled={this.state.pushingTx} disabled={this.state.adding_new_perm}>
                  Create Account
                </Button>
              )}
            </div>
          </div>
        </>);
    
  }
  
  getPermissionsCount = (perm_name) => {
    const {permissions} = this.state;
    return (permissions && permissions[perm_name])?permissions[perm_name].length:0;
  }

  renderAllPerms(perms) {
    const {active_tab_key} = this.state;
    return (
      <Card 
        key={'card_master'}
        style = { { marginBottom: 24 } } 
        extra = {<Button key="_new_perm" size="small" icon="plus" onClick={() => this.onNewPermission(active_tab_key)}> Authorize account</Button>}
        tabList={perms.filter(perm => {return perm=='owner';}).map(perm=>{
          return {key: perm
                  , tab: (
                    <span>{utils.capitalize(perm)} ({this.getPermissionsCount(perm)})</span>
                  )}
  
        })}
        activeTabKey={active_tab_key}
        onTabChange={this.onTabChange}
        >
        <div style={{ margin: '0 auto', width:'100%', padding: 24, background: '#fff'}}>
          {this.renderPermContent(active_tab_key)}
        </div>
      </Card>
    );
  }
  //

  renderPermContent(perm_name) {
    
    const { permissions } = this.state;
    let list = [];
    if(permissions && permissions[perm_name] && permissions[perm_name].length>0)
      list = permissions[perm_name];
    
    return (
          
          <List
            itemLayout="horizontal"
            dataSource={list}
            renderItem={item => (
              <List.Item
                actions={[<a  key={"delete-"+perm_name+item} 
                              onClick={() => this.onDeletePermission(perm_name, item )}
                            >DELETE</a>]}
              >
                <Skeleton avatar title={false} loading={item.loading} active>
                  <List.Item.Meta
                    avatar={
                      <span className="ant-avatar"><Icon style={{fontSize:16, color: 'rgba(0, 0, 0, 0.65)' }} type="key" /> </span>
                    }
                    title={<a href="#">{item}</a>}
                    description={'@'+perm_name}
                  />
                  <div></div>
                </Skeleton>
              </List.Item>
            )}
          />
    
    );
  }

  renderPerm(perm_name) {
    if(!this.state.eos_account)
      return(null);

    const { eos_account, loading } = this.state;
    let perm = eos_account.permissions.filter( perm => perm.perm_name==perm_name )
    let list = [];
    if(perm && perm.length>0)
      list = perm[0].required_auth.accounts.filter(acc => acc.permission.actor.trim()!=eos_account.account_name.trim());
    //<Icon type="user" />
    // console.log(' >> reduced perm_name >> ', perm_name,JSON.stringify(list))
    return (
      <Card 
        key={'card_'+perm_name}
        title = { utils.capitalize(perm_name) + " Permissions" }  
        style = { { marginBottom: 24 } } 
        extra = {<a key={'new_'+perm_name} href="#">+ New</a>}
        >
        <div style={{ margin: '0 auto', width:'100%', padding: 24, background: '#fff'}}>
          
          <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={list}
            renderItem={item => (
              <List.Item
                actions={[<a key={"delete-"+item.permission.actor+item.permission.permission}>DELETE</a>]}
              >
                <Skeleton avatar title={false} loading={item.loading} active>
                  <List.Item.Meta
                    avatar={
                      <span className="ant-avatar"><Icon style={{fontSize:16, color: 'rgba(0, 0, 0, 0.65)' }} type="key" /> </span>
                    }
                    title={<a href="#">{item.permission.actor}</a>}
                    description={'@'+item.permission.permission}
                  />
                  <div></div>
                </Skeleton>
              </List.Item>
            )}
          />
        </div>
      </Card>
    );
  }

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
          title="Account created successfully!"
          subTitle="Transaction completed succesfully. Blockchain takes up to 30 seconds to reveal changes, please wait."
          extra={[
            <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
              Go to dashboard
            </Button>,
            <Button type="link" href={_href} target="_blank" key="view-on-blockchain" icon="cloud" title="View on Blockchain">B-Chain</Button>,
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
    
    const routes    = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
    
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
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRole:       loginRedux.actualRole(state),
        actualPrivateKey: loginRedux.actualPrivateKey(state),
        isLoading:        loginRedux.isLoading(state),
        balance:          balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
      loadAccounts: bindActionCreators(accountsRedux.loadAccounts, dispatch)        
    })
)(CreateAccount) )
);
