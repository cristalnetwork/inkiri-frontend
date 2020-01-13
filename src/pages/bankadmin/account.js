import React, {Component} from 'react';

import { connect } from 'react-redux'

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Card, PageHeader, Spin , Form , Tabs } from 'antd';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

import _ from 'lodash';

import ProfileForm from '@app/components/Form/profile';
import Skeleton from '@app/components/Views/skeleton';
import AccountView , {ENUM_EVENT_EDIT_PROFILE_ALIAS}from '@app/components/Views/account';
import AccountRolesView, {ENUM_EVENT_RELOAD_PERMISSIONS, ENUM_AUTHORITY_CHANGE, ENUM_EVENT_NEW_PERMISSION, ENUM_EVENT_DELETE_PERMISSION} from '@app/components/Views/roles';
import AddRoleForm from '@app/components/Form/add_role';

import { injectIntl } from "react-intl";

const ACTIVE_TAB_INFO                  = 'active_tab_info';
const ACTIVE_TAB_INFO_EDIT_ALIAS       = 'active_tab_info_edit_alias';
const ACTIVE_TAB_EXTRATO               = 'active_tab_extrato';
const ACTIVE_TAB_ROLES                 = 'active_tab_roles';
const ACTIVE_TAB_ROLES_NEW             = 'active_tab_roles_new';
const ACTIVE_TAB_SECURITY              = 'active_tab_security';

const DEFAULT_RESULT = {
  result:             undefined,
  result_object:      undefined,
  error:              {},
}

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      referrer:            (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,
      pushingTx:           false,
      loading:             true,
      active_tab:          ACTIVE_TAB_INFO,
      active_tab_action:   ACTIVE_TAB_INFO,
      active_tab_object:   null,
      ...DEFAULT_RESULT,
      account:            (props && props.location && props.location.state && props.location.state.account)? props.location.state.account : null,
      eos_account:        null,
      profile:            null,
      role_authority:     'owner'
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.resetResult                = this.resetResult.bind(this); 
    this.userResultEvent            = this.userResultEvent.bind(this); 
    this.onAccountEvents            = this.onAccountEvents.bind(this); 
    this.onRoleEvents               = this.onRoleEvents.bind(this); 
    this.reload                     = this.reload.bind(this);
    this.onTabChange                = this.onTabChange.bind(this);
    this.reloadAccount              = this.reloadAccount.bind(this);
    this.onCancelNewPermission      = this.onCancelNewPermission.bind(this);
    this.addPermission              = this.addPermission.bind(this);
    this.onAddPermission            = this.onAddPermission.bind(this);
    this.onUpdateProfile            = this.onUpdateProfile.bind(this);

  }
 
  /*
  * Components Events
  */
  componentDidMount(){
    this.reloadAccount()
    this.reloadProfile()
  }

  reloadAccount = async () => {
    var eos_account = await api.getAccount(this.state.account.key);
    this.setState({eos_account:eos_account.data});
  }

  reloadProfile = async () => {
    this.setState({pushingTx:true});
    const that = this;
    api.bank.getProfile(this.state.account.key)
      .then( (data) => {
          that.setState({pushingTx:false, profile:data})
        },
        (ex) => {
          components_helper.notif.exceptionNotification( that.props.intl.formatMessage({id:'pages.bankadmin.account.error_reloading_profile'}), ex );    
          that.setState({pushingTx:false});
        }  
      );
    

  }

  componentDidUpdate(prevProps, prevState) 
  {
    const {account} = this.props;
    if(prevProps.account !== account) {
      this.setState({ account:account});
    }
  }
  
  /* *********************** */
  /* ACCOUNT ROLE MANAGEMENT */
  onRoleEvents    = (event_type, object) => {
    console.log(` EVENT onRoleEvents(${event_type}, `, object, ')')
    switch(event_type){
      case ENUM_EVENT_NEW_PERMISSION:
        this.setState({active_tab_action:ACTIVE_TAB_ROLES_NEW, active_tab_object:object});
        break;
      case ENUM_EVENT_DELETE_PERMISSION:
        const {permission} = object;
        this.deletePermission(permission.name, permission.actor, permission.permission);
        break;
      case ENUM_AUTHORITY_CHANGE:
        this.setState({role_authority:object});
        break;
      case ENUM_EVENT_RELOAD_PERMISSIONS:
        this.reloadAccount()
        break;
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
        that.reloadAccount();
        that.setState({result:'ok', pushingTx:false, result_object:data});
      }, (ex)=>{
        console.log( ' ### setAccountPermission >>> ERROR >> ', JSON.stringify(ex))
        that.reloadAccount();
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

  onUpdateProfile(error, cancel, values){
    if(cancel)
    {
      this.setState({  
          active_tab_action:   ACTIVE_TAB_INFO, 
          active_tab_object:   null
      });
      return;
    }
    if(error)
    {
      return;
    }
  
    const that                = this;
    const {id, account_name, account_type, first_name, last_name, email, legal_id, birthday, phone, address}  = this.state.profile;
    const new_profile         = values;
    const {business_name, alias} = new_profile;
    
    this.setState({active_tab_object:values, pushingTx:true})
    
    api.bank.createOrUpdateUser(id, account_type, account_name, first_name, last_name, email, legal_id, birthday, phone, address, business_name, alias)
      .then((res)=>{
        components_helper.notif.successNotification(  that.props.intl.formatMessage({id:'pages.bankadmin.account.success_alias_updated'}) );
        that.reloadProfile();
        that.resetPage(ACTIVE_TAB_INFO);
        

      }, (err)=>{
        console.log(' >> onUpdateProfile >> ', JSON.stringify(err));
        components_helper.notif.exceptionNotification(  that.props.intl.formatMessage({id:'errors.occurred_title'}), err );       
        that.setState({pushingTx:false});
      })


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
    this.setState({...DEFAULT_RESULT});
  }

  resetPage(active_tab){
    let my_active_tab = active_tab?active_tab:ACTIVE_TAB_INFO;
    this.setState({ active_tab:          my_active_tab, 
                    active_tab_action:   my_active_tab, 
                    active_tab_object:   null,
                    pushingTx:           false,
                    ...DEFAULT_RESULT
                  });    
  }

  reload(){
    const that      = this;
    const {account} = this.state;
    this.setState({pushingTx:true});
    // getBankAccount
    api.getBankAccount(account.account_name)
        .then( (data) => {
            that.setState({pushingTx:false, account:data})
          },
          (ex) => {
            components_helper.notif.exceptionNotification(  that.props.intl.formatMessage({id:'pages.bankadmin.account.error_reloading_account'}), ex );
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
      this.resetPage(this.state.active_tab);
    
  }

  renderContent() {
    if(this.state.result)
    {
      const result_type = this.state.result;
      const title       = null;
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      //<section className="mp-box mp-box__shadow money-transfer__box"></section>
      return(<div style={{ margin: '0 0px', padding: 24, marginTop: 24, backgroundColor:'#ffffff'}}>
        <div className="ly-main-content content-spacing cards">
            <TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />
        </div>
      </div>);
    }

    const { account, active_tab, active_tab_action, active_tab_object, pushingTx } = this.state;
    const {formatMessage}          = this.props.intl;
    const pushing_transaction_intl = formatMessage({id:'global.pushing_transaction'});

    if(active_tab==ACTIVE_TAB_INFO){
      if(active_tab_action==ACTIVE_TAB_INFO_EDIT_ALIAS)
      {
        const button_text = formatMessage({id:'pages.bankadmin.account.update_alias_button'});
        return (
          <Skeleton 
            content={
              <Spin spinning={pushingTx} delay={500} tip={pushing_transaction_intl} >
                <ProfileForm 
                  profile={this.state.profile} 
                  alone_component={false} 
                  button_text={button_text} 
                  callback={this.onUpdateProfile}
                  mode="alias" />
              </Spin>} 
            icon="user" />  );
      }

      return (
        <AccountView profile={this.state.profile} account={this.state.account} onEvent={()=>this.onAccountEvents}/>
      );
      
    }

    if(active_tab==ACTIVE_TAB_ROLES){
      if(active_tab_action==ACTIVE_TAB_ROLES_NEW)
      {
        const authority             = formatMessage({id:`components.Views.roles.${active_tab_object}`});
        const authority_tab_text    = formatMessage({id: 'pages.bankadmin.account.new_perm_title'}, {  authority: authority, bold: (str) => <b key={Math.random()}>{str}</b> });
        //
        return (
          <Skeleton 
            content={
              <Spin spinning={pushingTx} delay={500} tip={pushing_transaction_intl}>
                <Card 
                  title={(<span>{authority_tab_text}</span> )}
                  key={'new_perm'}
                  style = { { marginBottom: 24 } } 
                  >
                  <AddRoleForm owner={account.key} authority={active_tab_object} callback={this.onAddPermission} />                  
                </Card>
              </Spin>} 
            icon="user-shield" />  );
      }
      //
      return (
        <Skeleton 
        content={
          <Spin spinning={pushingTx} delay={500} tip={pushing_transaction_intl}>
            <div className="c-detail">
              <AccountRolesView 
                account={this.state.account} 
                eos_account={this.state.eos_account} 
                onEvent={()=>this.onRoleEvents}
                authority={this.state.role_authority}
                />
            </div>
          </Spin>
        } icon="shield-alt" />
      );
    }

    return (null);
  }

  render() {
    let content               = this.renderContent();
    const routes              = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    const {account}           = this.state;
    const {formatMessage}     = this.props.intl;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={(<>{account.key}@{globalCfg.bank.getAccountType(account.account_type)}</>)}
          footer={
            <Tabs defaultActiveKey="1" onChange={this.onTabChange}>
              <Tabs.TabPane tab={formatMessage({id:'pages.bankadmin.account.tab.info'})}      key={ACTIVE_TAB_INFO} />
              <Tabs.TabPane tab={formatMessage({id:'pages.bankadmin.account.tab.roles'})}     key={ACTIVE_TAB_ROLES} />
              <Tabs.TabPane tab={formatMessage({id:'pages.bankadmin.account.tab.extrato'})}   key={ACTIVE_TAB_EXTRATO} disabled />
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

) ( injectIntl(Profile) ) )
);
