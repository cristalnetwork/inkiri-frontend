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
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Select, Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { Upload, notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';
import { Tabs } from 'antd';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

import './configuration.css'; 
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as utils from '@app/utils/utils';

import BankAccountForm from '@app/components/Form/bank_account';
import ProfileForm from '@app/components/Form/profile';
import ConfigurationProfile, {ENUM_EVENT_EDIT_PROFILE, ENUM_EVENT_EDIT_BANK_ACCOUNT, ENUM_EVENT_NEW_BANK_ACCOUNT} from '@app/components/Views/profile';
import Skeleton from '@app/components/Views/skeleton';
import AccountRolesView, {ENUM_AUTHORITY_CHANGE, ENUM_EVENT_NEW_PERMISSION, ENUM_EVENT_DELETE_PERMISSION} from '@app/components/Views/roles';
import AddRoleForm from '@app/components/Form/add_role';
import AccountView , {ENUM_EVENT_EDIT_PROFILE_ALIAS}from '@app/components/Views/account';

const ACTIVE_TAB_PROFILE               = 'active_tab_profile';
const ACTIVE_TAB_PROFILE_EDIT_PROFILE  = 'active_tab_profile_edit_profile';
const ACTIVE_TAB_INFO                  = 'active_tab_info';
const ACTIVE_TAB_INFO_EDIT_ALIAS       = 'active_tab_info_edit_alias';
const ACTIVE_TAB_PROFILE_BANK_ACCOUNT  = 'active_tab_profile_add_or_update_bank_account';
const ACTIVE_TAB_ACCOUNTS              = 'active_tab_accounts';
const ACTIVE_TAB_ROLES                 = 'active_tab_roles';
const ACTIVE_TAB_ROLES_NEW             = 'active_tab_roles_new';
const ACTIVE_TAB_PREFERENCES           = 'active_tab_preferences';
const ACTIVE_TAB_SECURITY              = 'active_tab_security';

const DEFAULT_RESULT = {
  result:             undefined,
  result_object:      undefined,
  error:              {},
}

class Configuration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      pushingTx:           false,
      active_tab:          ACTIVE_TAB_PROFILE,
      active_tab_action:   ACTIVE_TAB_PROFILE,
      active_tab_object:   null,
      profile:             props.actualAccountProfile,
      eos_account:         props.eos_account,
      bank_account:        props.bank_account,

      role_authority:      'owner',

      ...DEFAULT_RESULT
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                = this.resetResult.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.userResultEvent            = this.userResultEvent.bind(this); 
    this.onConfigurationEvents      = this.onConfigurationEvents.bind(this); 
    this.onAddOrUpdateBankAccount   = this.onAddOrUpdateBankAccount.bind(this); 

    this.onCancelNewPermission      = this.onCancelNewPermission.bind(this);
    this.addPermission              = this.addPermission.bind(this);
    this.onAddPermission            = this.onAddPermission.bind(this);
    this.onUpdateProfile            = this.onUpdateProfile.bind(this);

    this.onTabChange                = this.onTabChange.bind(this); 

  }
 
  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  /*
  * Components Events
  */
  componentDidMount(){
    const {eos_account, bank_account} = this.state;
    if(!eos_account)
      this.props.loadEosAccount(this.props.actualAccountName)
    if(!bank_account)
      this.props.loadBankAccount(this.props.actualAccountName)
  }

  componentDidUpdate(prevProps, prevState) 
  {
    const {actualAccountProfile, eos_account, bank_account} = this.props;
    if(prevProps.actualAccountProfile !== actualAccountProfile) {
      this.setState({ profile:actualAccountProfile});
    }
    if(prevProps.eos_account !== eos_account) {
      console.log('updating_eos_account:', eos_account)
      this.setState({ eos_account:eos_account});
    }
    if(prevProps.bank_account !== bank_account) {
      console.log('updating_bank_account:', bank_account)
      this.setState({ bank_account:bank_account});
    }

  }
    
  onConfigurationEvents = (event_type, object) => {

    switch (event_type){
      case ENUM_EVENT_EDIT_PROFILE:
        // this.openNotificationWithIcon("info", "We are developing this function!")    
        this.setState({active_tab_action:ACTIVE_TAB_PROFILE_EDIT_PROFILE, active_tab_object:null});
        break;
      case ENUM_EVENT_EDIT_BANK_ACCOUNT:
        this.setState({active_tab_action:ACTIVE_TAB_PROFILE_BANK_ACCOUNT, active_tab_object:object});
        break;
      case ENUM_EVENT_NEW_BANK_ACCOUNT:
        this.setState({active_tab_action:ACTIVE_TAB_PROFILE_BANK_ACCOUNT, active_tab_object:null});
        break;
      default:
        break;
    }
  }

  onTabChange(key) {
    // console.log(key);
    this.setState({active_tab:key})
  }

  handleSubmit = e => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        this.openNotificationWithIcon("error", "Validation errors","Please verifiy errors on screen!")    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
    });
  };

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/extrato`
    })
  }

  resetResult(){
    this.setState({...DEFAULT_RESULT});
  }

  resetPage(active_tab){
    let my_active_tab = active_tab?active_tab:this.state.active_tab;
    this.setState({ active_tab:          my_active_tab, 
                    active_tab_action:   my_active_tab, 
                    active_tab_object:   null,
                    pushingTx:           false,
                    ...DEFAULT_RESULT
                  });    
  }

  userResultEvent = (evt_type) => {
    console.log(' ** userResultEvent -> EVT: ', evt_type)
    if(evt_type==DASHBOARD)
      this.backToDashboard();
    if(evt_type==RESET_RESULT)
      this.resetResult();
    if(evt_type==RESET_PAGE)
      this.resetPage();
    
  }

  onUpdateProfile(error, cancel, values){
    if(cancel)
    {
      this.setState({  
          active_tab_action:   ACTIVE_TAB_PROFILE, 
          active_tab_object:   null
      });
      return;
    }
    if(error)
    {
      return;
    }
  
    const that                = this;
    const {id, account_name}  = this.state.profile;
    const new_profile         = values;
    const {account_type, first_name, last_name, email, legal_id, birthday, phone, address, business_name, alias} = new_profile;
    
    this.setState({active_tab_object:values, pushingTx:true})
    
    api.bank.createOrUpdateUser(id, account_type, account_name, first_name, last_name, email, legal_id, birthday, phone, address, business_name, alias)
      .then((res)=>{
        that.openNotificationWithIcon("success", "Profile updated successfully")    
        that.props.loadProfile(that.props.actualAccountName);
        that.resetPage(ACTIVE_TAB_PROFILE);
        
      }, (err)=>{
        console.log(' >> onUpdateProfile >> ', JSON.stringify(err));
        that.openNotificationWithIcon("error", "An error occurred", JSON.stringify(err))    
        that.setState({pushingTx:false});
      })


  }

  onAddOrUpdateBankAccount(error, cancel, values){
    if(cancel)
    {
      this.setState({  
          active_tab_action:   ACTIVE_TAB_PROFILE, 
          active_tab_object:   null
      });
      return;
    }
    if(error)
    {
      return;
    }
    const that = this;
    const {profile} = this.state;
    this.setState({active_tab_object:values, pushingTx:true})
    // console.log(' >> onAddOrUpdateBankAccount::values: ', JSON.stringify(values))
    let bank_accounts = [...profile.bank_accounts, values];
    // console.log(' >> onAddOrUpdateBankAccount:: bank_accounts: ', JSON.stringify(bank_accounts))
    api.bank.updateUserBankAccounts(profile.id, bank_accounts)
      .then((res)=>{
        that.props.loadProfile(that.props.actualAccountName);
        that.openNotificationWithIcon("success", "Bank account saved successfully")    
        that.resetPage(ACTIVE_TAB_PROFILE);
        // console.log(' >> onAddOrUpdateBankAccount >> ', JSON.stringify(res));
        // that.setState({result:'ok'});

      }, (err)=>{
        console.log(' >> onAddOrUpdateBankAccount >> ', JSON.stringify(err));
        that.openNotificationWithIcon("error", "An error occurred", JSON.stringify(err))    
        that.setState({pushingTx:false});
      })


  }


  /* *********************** */
  /* ACCOUNT ROLE MANAGEMENT */
  onRoleEvents    = (event_type, object) => {
    console.log(` EVENT onRoleEvents(${event_type}, `, object, ')')
    switch(event_type){
      case ENUM_EVENT_NEW_PERMISSION:
        this.setState({active_tab_action:ACTIVE_TAB_ROLES_NEW, active_tab_object:{authority:object}});
        break;
      case ENUM_EVENT_DELETE_PERMISSION:
        const {permission} = object;
        this.deletePermission(permission.name, permission.actor, permission.permission);
        break;
      case ENUM_AUTHORITY_CHANGE:
        this.setState({role_authority:object});
      default:
        break;
    }
  }

  onAddPermission(error, cancel, values){
    console.log(` ## onAddPermission(error:${error}, cancel:${cancel}, values:${values})`)
    if(cancel)
    {
      this.onCancelNewPermission()
      return;
    }
    if(error)
    {
      return;
    }

    this.addPermission(values.permissioned, values.authority);

  }
  addPermission = async (permissioned, perm_name) => {
    this.setState({pushingTx:true});
    const {eos_account}  = this.state;
    console.log(' addPermission: => ',eos_account)
    const new_perm       = api.getNewPermissionObj (eos_account, permissioned, perm_name)
    this.setAccountPermission(perm_name, new_perm);
  }

  deletePermission = async (perm_name, actor, permission) => {
    
    this.setState({pushingTx:true});
    
    const {eos_account}  = this.state;
    let the_authority = eos_account.permissions.filter( perm => perm.perm_name==perm_name )[0]
    
    
    let new_authority = Object.assign({}, the_authority); 

    _.remove(new_authority.required_auth.accounts, function(e) {
      return e.permission.actor === actor && e.permission.permission === permission;
    });
    
    this.setAccountPermission(perm_name, new_authority.required_auth);
    
  }

  setAccountPermission(perm_name, new_perm){
    // this.setState({pushingTx:false});
    // console.log(` ### setAccountPermission >>> ABOUT TO SET -> ${perm_name}`, JSON.stringify(new_perm))
    // return;

    const {eos_account}  = this.state;
    const that = this;
    
    api.setAccountPermission(eos_account.account_name, this.props.actualPrivateKey, perm_name, new_perm)
      .then(data => {
        console.log(' ### setAccountPermission >>> ', JSON.stringify(data))
        that.props.loadEosAccount(that.props.actualAccountName);
        that.setState({result:'ok', pushingTx:false, result_object:data});
      }, (ex)=>{
        console.log( ' ### setAccountPermission >>> ERROR >> ', JSON.stringify(ex))
        that.props.loadEosAccount(that.props.actualAccountName);
        that.setState({pushingTx:false, result:'error', error:JSON.stringify(ex)});
      });
  }

  onCancelNewPermission(){
    // this.setState({active_tab_action:ACTIVE_TAB_ROLES, active_tab_object:{authority:object}});
    this.resetPage(ACTIVE_TAB_ROLES);
  }

  /* *********************** */
  onAccountEvents = (event_type, object) => {

    switch (event_type){
      case ENUM_EVENT_EDIT_PROFILE_ALIAS:
      console.log(' EVENTO -> ', ENUM_EVENT_EDIT_PROFILE_ALIAS);
      this.setState({active_tab_action:ACTIVE_TAB_INFO_EDIT_ALIAS, active_tab_object:this.state.profile});
      break;
      // case ENUM_EVENT_EDIT_PROFILE:
      //   // this.openNotificationWithIcon("info", "We are developing this function!")    
      //   this.setState({active_tab_action:ACTIVE_TAB_PROFILE_EDIT_PROFILE, active_tab_object:null});
      //   break;
      // case ENUM_EVENT_EDIT_BANK_ACCOUNT:
      //   this.setState({active_tab_action:ACTIVE_TAB_PROFILE_BANK_ACCOUNT, active_tab_object:object});
      //   break;
      // case ENUM_EVENT_NEW_BANK_ACCOUNT:
      //   this.setState({active_tab_action:ACTIVE_TAB_PROFILE_BANK_ACCOUNT, active_tab_object:null});
      //   break;
      default:
        break;
    }
  }
  renderContent() {
    if(this.state.result)
    {
      const result_type = this.state.result;
      const title       = null;
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      return(<div style={{ margin: '0 0px', padding: 24, marginTop: 24, backgroundColor:'#ffffff'}}>
        <div className="ly-main-content content-spacing cards">          
          <TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />
        </div>
      </div>);
    }

    const { active_tab, active_tab_action, active_tab_object, pushingTx } = this.state;
    
    if(active_tab==ACTIVE_TAB_PROFILE)
    {
      if(active_tab_action==ACTIVE_TAB_PROFILE_BANK_ACCOUNT)
      {
        const button_text = active_tab_object?'UPDATE BANK ACCOUNT':'ADD BANK ACCOUNT';
        return (
          <Skeleton 
            content={
              <Spin spinning={pushingTx} delay={500} tip="Pushing transaction...">
                <BankAccountForm 
                  bank_account={active_tab_object} 
                  alone_component={false} 
                  button_text={button_text} 
                  callback={this.onAddOrUpdateBankAccount}/>
              </Spin>} 
            icon="university" />  );
      }
            
      if(active_tab_action==ACTIVE_TAB_PROFILE_EDIT_PROFILE)
      {
        const button_text = active_tab_object?'UPDATE BANK ACCOUNT':'ADD BANK ACCOUNT';
        return (
          <Skeleton 
            content={
              <Spin spinning={pushingTx} delay={500} tip="Pushing transaction...">
                <ProfileForm 
                  profile={this.state.profile} 
                  alone_component={false} 
                  button_text={'SAVE CHANGES'} 
                  callback={this.onUpdateProfile}/>
              </Spin>} 
            icon="user" />  );
      }
      
      return (
        <ConfigurationProfile profile={this.state.profile} onEvent={()=>this.onConfigurationEvents}/>
      );
      
    }

    if(active_tab==ACTIVE_TAB_ROLES){
      if(active_tab_action==ACTIVE_TAB_ROLES_NEW)
      {
        const {authority} = active_tab_object;
        return (
          <Skeleton 
            content={
              <Spin spinning={pushingTx} delay={500} tip="Pushing transaction...">
                <Card 
                  title={(<span>New permission for <strong>{utils.capitalize(authority)} </strong> </span> )}
                  key={'new_perm'}
                  style = { { marginBottom: 24 } } 
                  >
                  <AddRoleForm owner={this.state.bank_account.key} authority={authority} callback={this.onAddPermission} />                  
                </Card>
              </Spin>} 
            icon="user-shield" />  );
      }


      return (
        <Skeleton 
        content={
          <Spin spinning={pushingTx} delay={500} tip="Pushing transaction...">
            <div className="c-detail">
              <AccountRolesView 
                account={this.state.bank_account} 
                eos_account={this.state.eos_account} 
                onEvent={()=>this.onRoleEvents} 
                authority={this.state.role_authority}/>
            </div>
          </Spin>
        } icon="shield-alt" />
      );
    }
    return (null);
  }

  render() {
    let content     = this.renderContent();
    const {routes}  = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title="Configuration"
          footer={
            <Tabs defaultActiveKey={ACTIVE_TAB_PROFILE} onChange={this.onTabChange}>
              <Tabs.TabPane tab="Profile"     key={ACTIVE_TAB_PROFILE} />
              <Tabs.TabPane tab="Accounts"    key={ACTIVE_TAB_ACCOUNTS} disabled />
              <Tabs.TabPane tab="Roles"       key={ACTIVE_TAB_ROLES} />
              <Tabs.TabPane tab="Preferences" key={ACTIVE_TAB_PREFERENCES} disabled />
              <Tabs.TabPane tab="Security"    key={ACTIVE_TAB_SECURITY} disabled />
            </Tabs>
          }>
        </PageHeader>
        
        <div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          
          <section className="mp-main__content __configuration">
            {content}      
          </section>      
        </div>
      </>
    );
  }
  //

  
}
//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:             accountsRedux.accounts(state),
        eos_account:          accountsRedux.eos_account(state),
        bank_account:         accountsRedux.bank_account(state),

        actualAccountName:    loginRedux.actualAccountName(state),
        actualAccountProfile: loginRedux.actualAccountProfile(state),
        actualRole:           loginRedux.actualRole(state),
        actualPrivateKey:     loginRedux.actualPrivateKey(state),
        isLoading:            loginRedux.isLoading(state),
        personalAccount:      loginRedux.personalAccount(state),
        balance:              balanceRedux.userBalance(state),
        
        
    }),
    (dispatch) => ({
        loadProfile:          bindActionCreators(loginRedux.loadProfile, dispatch),
        loadBankAccount:      bindActionCreators(accountsRedux.loadBankAccount, dispatch),
        loadEosAccount:       bindActionCreators(accountsRedux.loadEosAccount, dispatch)
    })

)(Configuration) )
);
