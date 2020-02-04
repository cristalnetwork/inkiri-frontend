import React, { Component} from 'react';

import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { PageHeader, Spin, Form, Tabs } from 'antd';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

import BankAccountForm from '@app/components/Form/bank_account';
import ProfileForm from '@app/components/Form/profile';
import ConfigurationProfile, {ENUM_EVENT_EDIT_PROFILE, ENUM_EVENT_EDIT_BANK_ACCOUNT, ENUM_EVENT_NEW_BANK_ACCOUNT} from '@app/components/Views/profile';
import Skeleton from '@app/components/Views/skeleton';

import SecurityView, {ENUM_EVENT_EDIT_KEY} from '@app/components/Views/security';
import EditKeyForm from '@app/components/Form/edit_key';

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

const ACTIVE_TAB_PROFILE               = 'active_tab_profile';
const ACTIVE_TAB_PROFILE_EDIT_PROFILE  = 'active_tab_profile_edit_profile';
const ACTIVE_TAB_PROFILE_BANK_ACCOUNT  = 'active_tab_profile_add_or_update_bank_account';
const ACTIVE_TAB_ACCOUNTS              = 'active_tab_accounts';
const ACTIVE_TAB_PREFERENCES           = 'active_tab_preferences';
const ACTIVE_TAB_SECURITY              = 'active_tab_security';
const ACTIVE_TAB_SECURITY_CHANGE_KEY   = 'active_tab_security_change_key';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      referrer:        (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,
      pushingTx:           false,
      active_tab:          ACTIVE_TAB_PROFILE,
      active_tab_action:   ACTIVE_TAB_PROFILE,
      active_tab_object:   null,
      
      eos_account:        {},
      profile:            (props && props.location && props.location.state && props.location.state.profile)? props.location.state.profile : null
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.resetResult                = this.resetResult.bind(this); 
    this.userResultEvent            = this.userResultEvent.bind(this); 
    this.onConfigurationEvents      = this.onConfigurationEvents.bind(this); 
    this.onAddOrUpdateBankAccount   = this.onAddOrUpdateBankAccount.bind(this); 
    this.onUpdateProfile            = this.onUpdateProfile.bind(this); 
    this.reload                     = this.reload.bind(this);

    this.onTabChange                = this.onTabChange.bind(this); 
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

  componentDidMount(){
    this.reloadAccount()
  }

  reloadAccount = async () => {
    const eos_account = await api.getAccount(this.state.profile.account_name);
    this.setState({eos_account:eos_account.data});
    console.log(eos_account)
  }

  onConfigurationEvents = (event_type, object) => {

    console.log('**********onConfigurationEvents', event_type);

    switch (event_type){
      case ENUM_EVENT_EDIT_PROFILE:
        this.setState({active_tab_action:ACTIVE_TAB_PROFILE_EDIT_PROFILE, active_tab_object:null});
        break;
      case ENUM_EVENT_EDIT_BANK_ACCOUNT:
        this.setState({active_tab_action:ACTIVE_TAB_PROFILE_BANK_ACCOUNT, active_tab_object:object});
        break;
      case ENUM_EVENT_NEW_BANK_ACCOUNT:
        this.setState({active_tab_action:ACTIVE_TAB_PROFILE_BANK_ACCOUNT, active_tab_object:null});
        break;
    
      case ENUM_EVENT_EDIT_KEY:
        this.setState({active_tab_action:ACTIVE_TAB_SECURITY_CHANGE_KEY, active_tab_object:object});
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
    this.props.history.push({
      pathname: `/${this.props.actualRole}/dashboard`
    })
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
    const that            = this;
    const {profile}       = this.state;
    const {formatMessage} = this.props.intl;
    this.setState({pushingTx:true});
    api.bank.getProfile(profile.account_name)
        .then( (data) => {
            that.setState({pushingTx:false, profile:data})
          },
          (ex) => {
            components_helper.notif.exceptionNotification(formatMessage({id:'pages.bankadmin.profile.error_reloading_profile'}), ex);
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
    const that            = this;
    const {profile}       = this.state;
    const {formatMessage} = this.props.intl;
    this.setState({active_tab_object:values, pushingTx:true})
    let bank_accounts = [...profile.bank_accounts, values];
    api.bank.updateUserBankAccounts(profile.id, bank_accounts)
      .then((res)=>{
        that.reload();
        components_helper.notif.successNotification(formatMessage({id:'pages.bankadmin.profile.succcess.bank_account_saved'}));
        that.resetPage(ACTIVE_TAB_PROFILE);

      }, (err)=>{
        console.log(' >> onAddOrUpdateBankAccount >> ', JSON.stringify(err));
        components_helper.notif.exceptionNotification(formatMessage({id:'pages.bankadmin.profile.error.occurred_title'}), err);
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
    const {formatMessage}     = this.props.intl;
    const {account_type, first_name, last_name, email, legal_id, birthday, phone, address, business_name, alias} = new_profile;
    
    this.setState({active_tab_object:values, pushingTx:true})
    
    api.bank.createOrUpdateUser(id, account_type, account_name, first_name, last_name, email, legal_id, birthday, phone, address, business_name, alias)
      .then((res)=>{
        components_helper.notif.successNotification(formatMessage({id:'pages.bankadmin.profile.succcess.profile_updated'}));
        that.reload();
        that.resetPage(ACTIVE_TAB_PROFILE);
      }, (err)=>{
        console.log(' >> onUpdateProfile >> ', JSON.stringify(err));
        components_helper.notif.exceptionNotification(formatMessage({id:'pages.bankadmin.profile.error.occurred_title'}), err);
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
    
    const {formatMessage} = this.props.intl;
    const update_bank_account = formatMessage({id: 'pages.bankadmin.profile.update_bank_account'});
    const add_bank_account    = formatMessage({id: 'pages.bankadmin.profile.add_bank_account'});
    const pushing_transaction = formatMessage({id: 'pages.bankadmin.profile.pushing_transaction'});
    const update_profile      = formatMessage({id: 'pages.bankadmin.profile.update_profile'});
    const edit_profile        = formatMessage({id: 'components.Views.profile.edit_text'});
    const edit_key            = formatMessage({id: 'components.Views.profile_security.edit_key'});
    if(active_tab==ACTIVE_TAB_SECURITY)
    {
      if(active_tab_action==ACTIVE_TAB_SECURITY_CHANGE_KEY){

        return (
          <Skeleton 
            title={edit_key} 
            content={
              <Spin spinning={pushingTx} delay={500} tip={pushing_transaction}>
                <EditKeyForm />
              </Spin>} 
            icon="shield-alt" />  );

      }
      return <SecurityView 
        profile={this.state.profile} 
        eos_account={this.state.eos_account} 
        onEvent={this.onConfigurationEvents}
        />;
    }

    if(active_tab==ACTIVE_TAB_PROFILE){
      if(active_tab_action==ACTIVE_TAB_PROFILE_BANK_ACCOUNT)
      {
        const button_text = active_tab_object?update_bank_account:add_bank_account;
        return (
          <Skeleton
            title={button_text} 
            content={
              <Spin spinning={pushingTx} delay={500} tip={pushing_transaction}>
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
        return (
          <Skeleton 
            title={edit_profile} 
            content={
              <Spin spinning={pushingTx} delay={500} tip={pushing_transaction}>
                <ProfileForm 
                  profile={this.state.profile} 
                  alone_component={false} 
                  button_text={update_profile} 
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
          title=<InjectMessage id="pages.bankadmin.profile.title" />
          footer={
            <Tabs defaultActiveKey="1" onChange={this.onTabChange}>
              <Tabs.TabPane tab={<InjectMessage id="pages.bankadmin.profile.tab.profile" />}     key={ACTIVE_TAB_PROFILE} />
              <Tabs.TabPane tab={<InjectMessage id="pages.bankadmin.profile.tab.accounts" />}    key={ACTIVE_TAB_ACCOUNTS} disabled />
              <Tabs.TabPane tab={<InjectMessage id="pages.bankadmin.profile.tab.preferences" />} key={ACTIVE_TAB_PREFERENCES} disabled />
              <Tabs.TabPane tab={<InjectMessage id="pages.bankadmin.profile.tab.security" />}    key={ACTIVE_TAB_SECURITY} />
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

)( injectIntl(Profile)) )
);
