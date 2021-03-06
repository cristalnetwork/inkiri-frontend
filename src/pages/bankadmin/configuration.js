import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Card, PageHeader, Spin } from 'antd';
import { Tabs } from 'antd';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

import _ from 'lodash';

import * as utils from '@app/utils/utils';

import Skeleton from '@app/components/Views/skeleton';
import AccountRolesView, {ENUM_EVENT_RELOAD_PERMISSIONS, ENUM_AUTHORITY_CHANGE, ENUM_EVENT_NEW_PERMISSION, ENUM_EVENT_DELETE_PERMISSION} from '@app/components/Views/roles';
import AddRoleForm from '@app/components/Form/add_role';

import { injectIntl } from "react-intl";

const ACTIVE_TAB_BANK_ACCOUNTS         = 'active_tab_bank_accounts';
const ACTIVE_TAB_ROLES                 = 'active_tab_roles';
const ACTIVE_TAB_ROLES_NEW             = 'active_tab_roles_new';
const ACTIVE_TAB_PERMISSIONS           = 'active_tab_permissions';
const ACTIVE_TAB_PARAMETERS            = 'active_tab_parameters';

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
      active_tab:          ACTIVE_TAB_ROLES,
      active_tab_action:   ACTIVE_TAB_ROLES,
      active_tab_object:   null,
      
      eos_account:         props.eos_account,
      bank_account:        props.bank_account,

      role_authority:      'owner',

      ...DEFAULT_RESULT
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                = this.resetResult.bind(this); 
    this.userResultEvent            = this.userResultEvent.bind(this); 
    

    this.onCancelNewPermission      = this.onCancelNewPermission.bind(this);
    this.addPermission              = this.addPermission.bind(this);
    this.onAddPermission            = this.onAddPermission.bind(this);
    
    this.onTabChange                = this.onTabChange.bind(this); 

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
  
  reloadAccount = async () => {
    this.props.loadEosAccount(this.props.actualAccountName)
    this.props.loadBankAccount(this.props.actualAccountName)
  }
  
  onTabChange(key) {
    // console.log(key);
    this.setState({active_tab:key})
  }

  handleSubmit = e => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        const {formatMessage} = this.props.intl;
        components_helper.notif.errorNotification( formatMessage({id:'errors.validation_title'}), formatMessage({id:'errors.verify_on_screen'}) )    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
    });
  };

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/dashboard`
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
        break;
      default:
      case ENUM_EVENT_RELOAD_PERMISSIONS:
        this.props.loadEosAccount(this.props.actualAccountName);
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
    const {eos_account}  = this.state;
    const account_permission = api.permissionHelper.addAccount(eos_account, permissioned, perm_name)
    this.setAccountPermission(perm_name, account_permission);

  }

  deletePermission = async (perm_name, actor, permission) => {
    
    const {eos_account}  = this.state;
    // const account_permission = api.permissionHelper.removeAccount(eos_account, actor, permission)
    const account_permission = api.permissionHelper.removeAccount(eos_account, perm_name, actor, permission)
    this.setAccountPermission(perm_name, account_permission);
    
  }

  setAccountPermission(permission_name, new_permission){
    const {eos_account}  = this.state;
    const tx             = api.permissionHelper.getAction(eos_account.account_name, permission_name, new_permission);
    const that           = this;
    
    this.setState({pushingTx:true});
    api.setAccountPermission(tx, this.props.actualPrivateKey)
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
    this.resetPage(ACTIVE_TAB_ROLES);
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
    
    if(active_tab==ACTIVE_TAB_BANK_ACCOUNTS)
    {
      return (
        null
      );
      
    }

    if(active_tab==ACTIVE_TAB_PERMISSIONS)
    {
      return (
        null
      );
      
    }

    if(active_tab==ACTIVE_TAB_PARAMETERS)
    {
      return (
        null
      );
      
    }

    const {formatMessage}          = this.props.intl;
    const pushing_transaction_intl = formatMessage({id:'global.pushing_transaction'});

    if(active_tab==ACTIVE_TAB_ROLES){
      if(active_tab_action==ACTIVE_TAB_ROLES_NEW)
      {
        const authority             = formatMessage({id:`components.Views.roles.${active_tab_object.authority}`});
        const authority_tab_text    = formatMessage({id: 'pages.bankadmin.configuration.new_perm_title'}, {  authority: authority, bold: (str) => <b key={Math.random()}>{str}</b> });
        //  
        console.log('*****************************', active_tab_object)
        return (
          <Skeleton 
            content={
              <Spin spinning={pushingTx} delay={500} tip={pushing_transaction_intl}>
                <Card 
                  title={(<span> {authority_tab_text} </span> )}
                  key={'new_perm'}
                  style = { { marginBottom: 24 } } 
                  >
                  <AddRoleForm owner={this.state.bank_account.key} authority={active_tab_object.authority} callback={this.onAddPermission} />                  
                </Card>
              </Spin>} 
            icon="user-shield" />  );
      }


      return (
        <Skeleton 
        content={
          <Spin spinning={pushingTx} delay={500} tip={pushing_transaction_intl}>
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
    let content             = this.renderContent();
    const {routes}          = this.state;
    const {formatMessage}   = this.props.intl;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={formatMessage({id:'pages.bankadmin.configuration.title'})}
          footer={
            <Tabs defaultActiveKey={ACTIVE_TAB_ROLES} onChange={this.onTabChange}>
              <Tabs.TabPane tab={formatMessage({id:'pages.bankadmin.configuration.roles'})}         key={ACTIVE_TAB_ROLES} />
              <Tabs.TabPane tab={formatMessage({id:'pages.bankadmin.configuration.bank'})}          key={ACTIVE_TAB_BANK_ACCOUNTS} disabled />
              <Tabs.TabPane tab={formatMessage({id:'pages.bankadmin.configuration.permissions'})}   key={ACTIVE_TAB_PERMISSIONS} disabled />
              <Tabs.TabPane tab={formatMessage({id:'pages.bankadmin.configuration.parameters'})}    key={ACTIVE_TAB_PARAMETERS} disabled />
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
export default withRouter(connect(
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

)(injectIntl(Configuration)) )
;
