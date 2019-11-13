import React, {useState, Component} from 'react';

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

// import './configuration.css'; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import BankAccountForm from '@app/components/Form/bank_account';
import ProfileForm from '@app/components/Form/profile';
import ConfigurationProfile, {ENUM_EVENT_EDIT_PROFILE, ENUM_EVENT_EDIT_BANK_ACCOUNT, ENUM_EVENT_NEW_BANK_ACCOUNT} from '@app/components/Views/profile';
import Skeleton from '@app/components/Views/skeleton';


const ACTIVE_TAB_PROFILE               = 'active_tab_profile';
const ACTIVE_TAB_PROFILE_EDIT_PROFILE  = 'active_tab_profile_edit_profile';
const ACTIVE_TAB_PROFILE_BANK_ACCOUNT  = 'active_tab_profile_add_or_update_bank_account';
const ACTIVE_TAB_ACCOUNTS              = 'active_tab_accounts';
const ACTIVE_TAB_ROLES                 = 'active_tab_roles';
const ACTIVE_TAB_PREFERENCES           = 'active_tab_preferences';
const ACTIVE_TAB_SECURITY              = 'active_tab_security';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      referrer:        (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,
      pushingTx:           false,
      active_tab:          ACTIVE_TAB_PROFILE,
      active_tab_action:   ACTIVE_TAB_PROFILE,
      active_tab_object:   null,
      
      profile:            (props && props.location && props.location.state && props.location.state.profile)? props.location.state.profile : null
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.resetResult                = this.resetResult.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.userResultEvent            = this.userResultEvent.bind(this); 
    this.onConfigurationEvents      = this.onConfigurationEvents.bind(this); 
    this.onAddOrUpdateBankAccount   = this.onAddOrUpdateBankAccount.bind(this); 
    this.onUpdateProfile            = this.onUpdateProfile.bind(this); 
    this.reload                     = this.reload.bind(this);
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

  componentDidUpdate(prevProps, prevState) 
  {
    const {profile} = this.props;
    if(prevProps.profile !== profile) {
      this.setState({ profile:profile});
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

  backToDashboard = async () => {
    // this.props.history.push({
    //   pathname: `/${this.props.actualRole}/extrato`
    // })
  }

  resetResult(){
    // this.setState({...DEFAULT_RESULT});
  }

  resetPage(active_tab){
    let my_active_tab = active_tab?active_tab:ACTIVE_TAB_PROFILE;
    this.setState({ active_tab:          my_active_tab, 
                    active_tab_action:   my_active_tab, 
                    active_tab_object:   null,
                    pushingTx:           false
                  });    
  }

  reload(){
    const that      = this;
    const {profile} = this.state;
    this.setState({pushingTx:true});
    api.bank.getProfile(profile.account_name)
        .then( (data) => {
            that.setState({pushingTx:false, profile:data})
          },
          (ex) => {
            that.openNotificationWithIcon("error", 'An error occurred reloading profile', JSON.stringify(ex));
            that.setState({pushingTx:false});
            console.log(' ** ERROR @ reload', JSON.stringify(ex))
          }  
        );
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
        that.reload();
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
    // console.log(' >> profile::OLD values: ', JSON.stringify(profile))
    // console.log(' >> profile::NEW values: ', JSON.stringify(new_profile))
    
    api.bank.createOrUpdateUser(id, account_type, account_name, first_name, last_name, email, legal_id, birthday, phone, address, business_name, alias)
      .then((res)=>{
        that.openNotificationWithIcon("success", "Profile updated successfully")    
        that.reload();
        that.resetPage(ACTIVE_TAB_PROFILE);
        // console.log(' >> onAddOrUpdateBankAccount >> ', JSON.stringify(res));
        // that.setState({result:'ok'});
        // that.setState({pushingTx:false});

      }, (err)=>{
        console.log(' >> onUpdateProfile >> ', JSON.stringify(err));
        that.openNotificationWithIcon("error", "An error occurred", JSON.stringify(err))    
        that.setState({pushingTx:false});
      })


  }

  renderContent() {
    if(this.state.result)
    {
      const result_type = this.state.result;
      const title       = null;
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      return(<TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />)
    }

    const { active_tab, active_tab_action, active_tab_object, pushingTx } = this.state;
    
    if(active_tab==ACTIVE_TAB_PROFILE){
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

    return (null);
  }

  render() {
    let content     = this.renderContent();
    const routes    = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title="Customer Profile"
          footer={
            <Tabs defaultActiveKey="1" onChange={this.onTabChange}>
              <Tabs.TabPane tab="Profile"     key={ACTIVE_TAB_PROFILE} />
              <Tabs.TabPane tab="Accounts"    key={ACTIVE_TAB_ACCOUNTS} disabled />
              <Tabs.TabPane tab="Roles"       key={ACTIVE_TAB_ROLES} disabled />
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
        actualAccountName:    loginRedux.actualAccountName(state),
        actualAccountProfile: loginRedux.actualAccountProfile(state),
        actualRole:           loginRedux.actualRole(state),
        actualPrivateKey:     loginRedux.actualPrivateKey(state),
        isLoading:            loginRedux.isLoading(state),
        personalAccount:      loginRedux.personalAccount(state),
        balance:              balanceRedux.userBalance(state),
        
        
    }),
    (dispatch) => ({
        // loadProfile:          bindActionCreators(loginRedux.loadProfile, dispatch)
    })

)(Profile) )
);
