import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import moment from 'moment';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Select, DatePicker, Divider, Steps, Card, PageHeader,Button, Spin } from 'antd';
import { List, Skeleton, Form, Icon, Input, } from 'antd';

import { Modal } from 'antd';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

import {CopyToClipboard} from 'react-copy-to-clipboard';
import AutocompleteAccount from '@app/components/AutocompleteAccount';

import {formItemLayout } from '@app/utils/utils';

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

const { confirm } = Modal;

const { Step } = Steps;

const steps = [
  {
    title: 'pages.bankadmin.create_account.step_1',
    content: 'First-content',
  },
  {
    title: 'pages.bankadmin.create_account.step_2',
    content: 'Second-content',
  },
  {
    title: 'pages.bankadmin.create_account.step_3',
    content: 'Last-content',
  },
];

const dateFormat =  'YYYY/MM/DD';
const DEFAULT_STATE = {
      current_step:     0,

      account_name_status: '',
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
    this.generateKeys                  = this.generateKeys.bind(this); 
    this.doCreateAccount               = this.doCreateAccount.bind(this); 
    this.validateNConfirmCreateAccount = this.validateNConfirmCreateAccount.bind(this); 
    this.handleAccountTypeChange       = this.handleAccountTypeChange.bind(this);
    this.validateStep                  = this.validateStep.bind(this);
    this.next                          = this.next.bind(this);
    this.onNewPermission               = this.onNewPermission.bind(this);
    this.onCancelNewPermission         = this.onCancelNewPermission.bind(this);
    this.onDeletePermission            = this.onDeletePermission.bind(this);
    this.handleAcountNameChange        = this.handleAcountNameChange.bind(this);
    this.userResultEvent            = this.userResultEvent.bind(this); 
    
    this.timeout_id = null;
  }

  handleAcountNameChange = (e) =>{
    
    clearTimeout(this.timeout_id);

    const {form} = this.props
    let that     = this;

    this.timeout_id = setTimeout( () => {

      const account_name        = form.getFieldValue('account_name')
      const account_name_length = (account_name||'').length;
      const account_name_status = (account_name_length==12)
      ?'Thats ok! 12 characters length'
      :`You typed ${account_name_length} characters. 12 are required!`

      // that.generateKeys(undefined);
      const {default_keys} = that.state;
      that.setState({ generated_keys:         default_keys
                      , account_name_status:  account_name_status})
      // if(account_name_length==0){
      // }
      // else{
      // }

    }, 150);
    
  }
  
  

  renderAccountTypesOptions(){
    const my_options          = globalCfg.bank.newAccountTypesOptions();
    const { getFieldDecorator } = this.props.form;
    const {account_type}        = this.state;
    
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
    const {current_step, account_name, default_keys, generated_keys} = this.state;
    console.log(` createAccount::validateStep() current_step: ${current_step} | account_name:${account_name}`);
    
    try{
      this.props.form.validateFields((err, values) => {
        // console.log('hola')
        // console.log(` createAccount::validateStep() err: ${err} | values:${values}`);
        if (err)
        {  
          // console.log(' >> INVALID STEP >> ERR >>: ', JSON.stringify(err) )
          components_helper.notif.exceptionNotification("Something went wrong!", err);
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
            ? [values.first_name.trim().toLowerCase(), values.last_name.trim().toLowerCase()] 
            : [values.business_name.trim().toLowerCase()];

          values['account_name'] = api.nameHelper.generateAccountName(seeds);
        }
        
        if(current_step==1 && default_keys.wif==generated_keys.wif)
        {
          const _seed_value = this.props.form.getFieldValue('password');
          this.generateKeys(_seed_value);
        }

        this.setState(values);
        res(true);

      });
    }catch(e){
      // console.log(` createAccount::validateStep() ex: ${e}`);
      components_helper.notif.exceptionNotification('Something went wrong!', e);
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
      components_helper.notif.exceptionNotification('Something went wrong!', e);
      return;
    } 
    
    if(!validStep)
    {
      components_helper.notif.errorNotification("Something went wrong!","Step is not valid.")        
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
    if(  (globalCfg.bank.isBusinessAccount(account_type) || globalCfg.bank.isFoundationAccount(account_type) )
        && (!permissions || !permissions['owner'] || permissions['owner'].length<1))
    {
      components_helper.notif.errorNotification("Consider authorizing at least one owner account!");  
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
        components_helper.notif.errorNotification("Account already added to authorized list")  
        return;
      }
      my_permissions[new_perm_name].push(values.permissioned)
      this.setState({permissions:my_permissions, adding_new_perm:false})
      components_helper.notif.successNotification("Account added to authorized list")
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

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/dashboard`
    })
  }

  resetPage(){
    this.setState({...DEFAULT_STATE, result: undefined, result_object: undefined, error: {}});
      
  }

  resetResult(){
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

    if(globalCfg.bank.isFoundationAccount(account_type))
    {
      const {business_name} = this.state;
      return (<>
          <h3 className="fileds_header">PROFILE SECTION</h3>
          <Form.Item
            label="Nome do Fundo"
            >
              {getFieldDecorator('business_name', {
                rules: [{ required: true, message: 'Please input a valid name!', whitespace: true }],
                initialValue: business_name
              })(<Input />)}
            </Form.Item>
      </>);
    }
  }
  //
  
  renderStep0 = () => {
    const {formatMessage}       = this.props.intl;
    const { getFieldDecorator } = this.props.form;
    const account_options       = this.renderAccountTypesOptions();
    const {account_type, account_fee, account_overdraft, first_name, last_name, email, legal_id, birthday, phone, address} = this.state;  
    return (
          <div style={{ margin: '0 0px', maxWidth: '600px', background: '#fff'}}>
            <Spin spinning={this.state.pushingTx} delay={500} tip={ formatMessage({id:'pages.bankadmin.create_account.pushing_transaction'}) } >
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                
                <h3 className="fileds_header">{ formatMessage({id:'pages.bankadmin.create_account.account_section'}) }</h3>
                
                    {account_options}
                
                <Form.Item label={formatMessage({id:'pages.bankadmin.create_account.fee'})}>
                    {getFieldDecorator('account_fee', {
                      rules: [{ required: true
                                , message: formatMessage({id:'pages.bankadmin.create_account.fee_validation_message'})
                                , whitespace: true
                                , validator: this.validateNumberGToEZ}],
                      initialValue: account_fee||0
                    })(<Input type="tel" step="0.01" />)}
                </Form.Item>

                <Form.Item
                  label={formatMessage({id:'pages.bankadmin.create_account.overdraft'})}
                  extra={formatMessage({id:'pages.bankadmin.create_account.overdraft_extra'})}
                  >
                    {getFieldDecorator('account_overdraft', {
                      rules: [{ required: true
                                , message: formatMessage({id:'pages.bankadmin.create_account.overdraft_validation_message'})
                                , whitespace: true 
                                , validator: this.validateNumberGToEZ}],
                      initialValue: account_overdraft||0
                    })(<Input type="tel" step="0.01" />)}
                  </Form.Item>

                  {this.fieldsByAccountType()}
                
              </Form>
            </Spin>
          </div>);
  }

  renderAccountHint =() =>{
    const {formatMessage} = this.props.intl;
    return ([1,2,3,4,5].map(i=>
              <span key={`key_${Math.random()}`}>{formatMessage({id:`pages.bankadmin.create_account.account_name_help_${i}`})}<br/></span>
          ))
  }
  //`
  renderStep1 = () => {
    const {formatMessage}       = this.props.intl;
    const { getFieldDecorator } = this.props.form;
    const {account_name, account_name_status, password, confirm_password, default_keys, generated_keys} = this.state;  
      
    return (
        <div style={{ margin: '0 0px', maxWidth: '600px', background: '#fff'}}>
          <Spin spinning={this.state.pushingTx} delay={500} tip={formatMessage({id:'pages.bankadmin.create_account.pushing_transaction'})}>
            <Form {...formItemLayout} onSubmit={this.handleSubmitS1}>
              
              <h3 className="fileds_header">{ formatMessage({id:'pages.bankadmin.create_account.eos_account_name_section'}) }</h3>
              <Form.Item
                extra={<>{this.renderAccountHint()}</>}
                label={formatMessage({id:'pages.bankadmin.create_account.account_name'})}
                help={account_name_status} >
                {getFieldDecorator('account_name', {
                  rules: [
                    { required: true, message: formatMessage({id:'pages.bankadmin.create_account.account_name_validation'}), whitespace: true }
                     , { max: 12, message: formatMessage({id:'pages.bankadmin.create_account.account_name_validation_12_chars_max'}) }
                     , { min: 12, message: formatMessage({id:'pages.bankadmin.create_account.account_name_validation_12_chars_min'}) }
                     , {validator: this.validateAccountName, }]
                     , onChange: (e) => this.handleAcountNameChange(e)
                     , initialValue: account_name
                })(<Input  />)}
              </Form.Item>
              
              <Divider />
              <h3 className="fileds_header">{ formatMessage({id:'pages.bankadmin.create_account.security_section'}) }</h3>
              
              <Form.Item label={ formatMessage({id:'pages.bankadmin.create_account.password'}) } hasFeedback>
                {getFieldDecorator('password', {
                  rules: [
                    {
                      required: true,
                      message:  formatMessage({id:'pages.bankadmin.create_account.password_validation'}),
                    }
                    ,{ min: 4, message: formatMessage({id:'pages.bankadmin.create_account.password_validation_4_chars_min'}) }
                    ,{
                      validator: this.validateToNextPassword,
                    },
                  ],
                  initialValue: password
                })(<Input.Password visibilityToggle="true" />)}
              </Form.Item>

              <Form.Item label={ formatMessage({id:'pages.bankadmin.create_account.confirm_password'}) } hasFeedback>
                {getFieldDecorator('confirm_password', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({id:'pages.bankadmin.create_account.confirm_password_validation'}),
                    },
                    {
                      validator: this.compareToFirstPassword,
                    },
                  ],
                  initialValue: confirm_password
                })(<Input.Password visibilityToggle="true" onBlur={this.handleConfirmBlur} />)}
              </Form.Item>
              <h3 className="fileds_header">{ formatMessage({id:'pages.bankadmin.create_account.keys_section'}) }</h3>
              <Form.Item label={ formatMessage({id: 'pages.bankadmin.create_account.private_key' }) } 
                         extra={ formatMessage({id: 'pages.bankadmin.create_account.private_key_hint'}) }>
                <Input readOnly addonAfter={
                    <CopyToClipboard text={generated_keys.wif} onCopy={() => components_helper.notif.successNotification( formatMessage({id:'pages.bankadmin.create_account.key_copied_message'}) ) }>
                       <Button type="link" icon="copy" />
                    </CopyToClipboard>
                } value={generated_keys.wif} />
              </Form.Item>
              <Form.Item label={ formatMessage({id: 'pages.bankadmin.create_account.public_key' }) } >
                <Input readOnly addonAfter={<Icon type="global" />} value={generated_keys.pub_key}  />
              </Form.Item>
            </Form>
          </Spin>
        </div>
      );
  }

  renderStep2 = () => {
    const {adding_new_perm} = this.state;

    if(!adding_new_perm){
      const {account_type} = this.state;  
      return (this.renderAllPerms(globalCfg.bank.getPermsForAccountType(account_type)));
    }
    
    const {formatMessage}       = this.props.intl;
    const {active_tab_key}      = this.state;
    const authority             = formatMessage({id:`components.Views.roles.${active_tab_key}`});
    console.log(`components.Views.roles.${active_tab_key}`, active_tab_key, '->', authority)
    const authority_tab_text    = formatMessage({id: 'pages.bankadmin.create_account.new_perm_title'}, {  authority: authority, bold: (str) => <b key={Math.random()}>{str}</b> });
    const cancel_text           = formatMessage({id:'global.cancel'});                                             
    const account_name          = globalCfg.bank.issuer;

    return (
      <Card 
        title={(<>{authority_tab_text}</> )}
        key={'_new_perm'}
        style = { { marginBottom: 24 } } 
        extra = {<Button key="_new_perm_cancel" icon="close" size="small" onClick={() => this.onCancelNewPermission()}> {cancel_text}</Button>}
        >
        <div style={{ margin: '0 auto', width:'100%', padding: 24, background: '#fff'}}>

          <Spin spinning={this.state.pushingTx} delay={500} tip={ formatMessage({id:'pages.bankadmin.create_account.pushing_transaction'}) } >
            <Form onSubmit={this.handleAddPermissionSubmit}>
              
              <AutocompleteAccount 
                  autoFocus 
                  callback={this.onSelect} 
                  form={this.props.form} 
                  name="permissioned" 
                  exclude_list={[account_name]} 
                  filter={globalCfg.bank.ACCOUNT_TYPE_PERSONAL}/>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  { formatMessage({id:'pages.bankadmin.create_account.authorize'}) }
                </Button>
                
              </Form.Item>
            </Form>
          </Spin>
        
        </div>
      </Card>
    ); 
    
  }

  renderStep(current_step){
    const { getFieldDecorator } = this.props.form;
    const {formatMessage}       = this.props.intl;
    let content = null;
    
    if(current_step==0)
      content = this.renderStep0();
    
   
    if(current_step==1)
      content = this.renderStep1();
    
    if(current_step==2)
      content = this.renderStep2()

    const step_title = formatMessage({id:steps[current_step].title});

    return (
        <>
          <Card 
            title={(<span><strong>{step_title}</strong> </span> )}
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
                  { formatMessage({id:'pages.bankadmin.create_account.nav.previous'})}
                </Button>
              )}
              {current_step < steps.length - 1 && (
                <Button type="primary" onClick={() => this.next()}>
                  { formatMessage({id:'pages.bankadmin.create_account.nav.next'})}
                </Button>
              )}
              {current_step === steps.length - 1 && (
                <Button type="primary" onClick={() => this.validateNConfirmCreateAccount()} disabled={this.state.pushingTx} disabled={this.state.adding_new_perm}>
                  { formatMessage({id:'pages.bankadmin.create_account.nav.create_account'})}
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
    const {active_tab_key}  = this.state;
    const {formatMessage}   = this.props.intl;

    return (
      <Card 
        key={'card_master'}
        style = { { marginBottom: 24 } } 
        extra = {<Button key="_new_perm" size="small" icon="plus" onClick={() => this.onNewPermission(active_tab_key)}> { formatMessage({id:'pages.bankadmin.create_account.authorize_account'})}</Button>}
        tabList={perms.filter(perm => perm=='owner' ).map(perm=>{
          return {key: perm
                  , tab: (
                    <span><InjectMessage id={`components.Views.roles.${perm}`} /> ({this.getPermissionsCount(perm)})</span>
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
    
    const {formatMessage} = this.props.intl;
    const authority       = formatMessage({id:`components.Views.roles.${perm_name}`});
    return (
      <Card 
        key={'card_'+perm_name}
        title = { formatMessage({id:'pages.bankadmin.create_account.authority_permissions', authority}) }  
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
                actions={[<a key={"delete-"+item.permission.actor+item.permission.permission}>{formatMessage({id:'pages.bankadmin.create_account.delete_permission'})}</a>]}
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
  userResultEvent = (evt_type) => {
    console.log(' ** userResultEvent -> EVT: ', evt_type)
    if(evt_type==DASHBOARD)
      this.backToDashboard();
    if(evt_type==RESET_RESULT)
      this.resetResult();
    if(evt_type==RESET_PAGE)
      this.resetPage();
    
  }
  //
  renderResult() {
    
    if(this.state.result)
    {
      const result_type = this.state.result;
      const title       = this.props.intl.formatMessage({id:'pages.bankadmin.create_account.succedd_message'});
      //const _href        = api.dfuse.getBlockExplorerAccountLink(account_name);
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      const result = (<TxResult result_type={result_type} title={title} message={message} error={error} cb={this.userResultEvent}  />);
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
                <div className="ly-main-content content-spacing cards">
                  <section className="mp-box mp-box__shadow money-transfer__box">
                    {result}
                  </section>
                </div>      
              </div>);
    }
  }
  
  //
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
          title={ this.props.intl.formatMessage({id:'pages.bankadmin.create_account.title'}) }
        />
        
          <div style={{ margin: '0 0px', padding: 24, background: '#fff', marginTop: 24}}>
            <Steps current={current_step}>
              {steps.map(item => (
                <Step key={item.title} title={<InjectMessage id={item.title} />} />
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
)(injectIntl(CreateAccount)) )
);
