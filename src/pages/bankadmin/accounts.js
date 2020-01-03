import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';

import * as api from '@app/services/inkiriApi';
import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import * as columns_helper from '@app/components/TransactionTable/columns';
import TableStats from '@app/components/TransactionTable/stats'; 
import * as stats_helper from '@app/components/TransactionTable/stats';

import { Radio, Select, Card, PageHeader, Tabs, Button } from 'antd';
import { Form, Input} from 'antd';
import { Table, Spin } from 'antd';

import _ from 'lodash';

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

class AdminAccounts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :        routesService.breadcrumbForPaths(props.location.pathname),
      loading:        false,
      accounts:       [],
      
      page:           -1, 
      limit:          globalCfg.api.default_page_size,
      can_get_more:   true,
      cursor:         '',
      stats:          undefined,
    };

    this.loadAccounts               = this.loadAccounts.bind(this);  
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.onButtonClick              = this.onButtonClick.bind(this);
    this.getColumns                 = this.getColumns.bind(this);
    this.onNewAccount               = this.onNewAccount.bind(this); 
  }

  getColumns(){
    return columns_helper.columnsForAccounts(this.onButtonClick);
  }
  
  componentDidMount(){
    this.loadAccounts();  
  } 

  onNewAccount = () => {
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: `/${this.props.actualRole}/create-account`
      , state: { 
          referrer: this.props.location.pathname
        }
    })

  }

  onButtonClick(account){
    console.log( ' ACCOUNTS::onButtonClick >> ', JSON.stringify(account) )

    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    // this.props.history.push({
    //   pathname: `/${this.props.actualRole}/account`
    //   , state: { 
    //       referrer: this.props.location.pathname,
    //       account:  account
    //     }
    // })

    this.props.history.push({
      pathname: `/${this.props.actualRole}/account`
      , state: { 
          referrer: this.props.location.pathname,
          account:  account
        }
    })

  }

  reloadAccounts(){
    this.setState({
        page:       -1, 
        accounts:   [],
      }, () => {
        this.loadAccounts();
      });  
  }
  //

  loadAccounts = async () => {

    let can_get_more   = this.state.can_get_more;
    if(!can_get_more && this.state.page>=0)
    {
      this.setState({loading:false});
      return;
    }

    this.setState({loading:true});

    
    const {formatMessage} = this.props.intl;
    let that              = this;
    
    api.listBankAccounts()
    .then( async (res) => {

        console.log(' >> api.listBankAccounts >>', JSON.stringify(res.data))
        const account_names = res.data.accounts.map(acc=>acc.key)
        let promises = [
          api.dfuse.getAccountsBalances(account_names)
          , api.bank.listProfiles(null, account_names.length, {account_names:account_names})
        ];

        let values;
        try{
          values = await Promise.all(promises);
        }
        catch(err){
          components_helper.notif.exceptionNotification( formatMessage({id:'pages.bankadmin.accounts.error.loading_account'}), err);
          that.setState({loading:false});  
        }

        if(!values)
        {
          components_helper.notif.errorNotification( formatMessage({id:'pages.bankadmin.accounts.error.cant_load_balances_profiles'}));
          // return;
        }

        if(values && !values[0])
        {
          components_helper.notif.errorNotification( formatMessage({id:'pages.bankadmin.accounts.error.cant_load_balances'}));
        }

        if(values && !values[1])
        {
          components_helper.notif.errorNotification( formatMessage({id:'pages.bankadmin.accounts.error.cant_load_profiles'}));          
        }

        const __balances = (values&&values.length>0)?values[0]:[];
        const _balances  = _.reduce(__balances, function(result, value, key) {
          result[value.account] = value.balance;
          return result;
        }, {});
        
        const __aliases = (values&&values.length>1)?values[1]:[];
        const _aliases  = _.reduce(__aliases, function(result, value, key) {
          result[value.account_name] = value.alias;
          return result;
        }, {});
        
        const _data = res.data.accounts.map(acc => {return{...acc, balance:_balances[acc.key] , alias:_aliases[acc.key]}})
        
        that.onNewData({accounts:_data, more:res.data.more});
        
      } ,(ex) => {
        console.log(' dfuse.getAccountsBalances ERROR#1', JSON.stringify(ex) )
        that.setState({loading:false});  
      } 
    );
    
  }

  onNewData(data){
    

    const _accounts       = [...this.state.accounts, ...data.accounts];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _accounts.length;
    pagination.total      = _accounts.length;

    const has_received_new_data = (data.accounts && data.accounts.length>0);

    this.setState({pagination:pagination, accounts:_accounts, can_get_more:data.more, loading:false})

    if(!has_received_new_data)
    {
      const {formatMessage} = this.props.intl;
      components_helper.notif.infoNotification(
        formatMessage({id:'pages.bankadmin.accounts.end_of_accounts'})
        , formatMessage({id:'pages.bankadmin.accounts.end_of_accounts_message'}) 
      );
    }
    else
      this.computeStats();
  }

  
  computeStats(){
    let stats      = this.state.stats;
    const accounts = this.state.accounts;
    if(!accounts)
    {
      this.setState({stats:this.getDefaultStats()});
      return;
    }

    const negative = accounts.filter( acc => (parseFloat(acc.balance) - parseFloat(acc.overdraft))<0).length;
    
    const admin    = accounts.filter( acc => globalCfg.bank.isAdminAccount(acc))
                    .reduce((acc, amount) => acc + 1, 0);
    const business = accounts.filter( acc => globalCfg.bank.isBusinessAccount(acc))
                    .reduce((acc, amount) => acc + 1, 0);
    const personal = accounts.filter( acc => globalCfg.bank.isPersonalAccount(acc))
                    .reduce((acc, amount) => acc + 1, 0);
    const foundation = accounts.filter( acc => globalCfg.bank.isFoundationAccount(acc))
                    .reduce((acc, amount) => acc + 1, 0);

    this.setState({stats:{
        total :               accounts?accounts.length:0
        , pending:            this.props.intl.formatMessage({id: 'pages.bankadmin.accounts.not_available'})
        , negative_balance:   negative
        , admin:              admin
        , personal:           personal
        , business:           business
        , foundation:         foundation
        }});

  }

  getDefaultStats(){
    return {
        total:               0
        , pending:           this.props.intl.formatMessage({id: 'pages.bankadmin.accounts.not_available'})
        , negative_balance:  0
        , admin:             0
        , personal:          0
        , business:          0
        , foundation:        0 };
  }

  currentStats(){
    const x = this.state.stats;
    return x?x:this.getDefaultStats();
  }

  // Component Events
  renderFooter(){
    return (<Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadAccounts()}>
        { this.props.intl.formatMessage({id: 'pages.bankadmin.accounts.load_more_records'})}
      </Button>)
  }
  //
  render() {
    const content               = this.renderContent();
    const stats                 = this.renderTableViewStats();
    const _href                 = globalCfg.bank.customers;
    const {routes, loading}     = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={[
            <Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadAccounts()} ></Button>,
            <Button size="small" href={_href} target="_blank" key="view-on-blockchain_" icon="cloud" >
              &nbsp; <InjectMessage id="pages.bankadmin.accounts.list_accounts_on_blockchain" /> 
            </Button>,
            <Button size="small" type="primary" key="_new_account" icon="plus" onClick={()=>{this.onNewAccount()}}>&nbsp;<InjectMessage id="pages.bankadmin.accounts.new_account_text" /> </Button>,
          ]}
          title={this.props.intl.formatMessage({id: 'pages.bankadmin.accounts.title'})}
        >
          
        </PageHeader>
        
        <Card
          key="card_table_all_requests"
          className="styles listCard"
          bordered={false}
          style={{ marginTop: 24 }}
          headStyle={{display:'none'}}
        >
          {stats}
          {content}
        </Card>

      </>
    );
  }

  //
  renderTableViewStats(){
    const {total, pending, negative_balance, personal, business, admin, foundation} = this.currentStats();  
    const {formatMessage} = this.props.intl;
    const items = [
        stats_helper.buildItemSimple(    formatMessage({id:'pages.bankadmin.accounts.total'}), total)
        , stats_helper.buildItemPending( formatMessage({id:'pages.bankadmin.accounts.pending'}), pending)
        , stats_helper.buildItemSimple(  formatMessage({id:'pages.bankadmin.accounts.negative'}), negative_balance, '#cf1322')
        , stats_helper.buildItemSimple(  formatMessage({id:'pages.bankadmin.accounts.personal'}), personal)
        , stats_helper.buildItemSimple(  formatMessage({id:'pages.bankadmin.accounts.business'}), business)
        , stats_helper.buildItemSimple(  formatMessage({id:'pages.bankadmin.accounts.admin'}), admin)
      ]
    return (<TableStats title={formatMessage({id:'pages.bankadmin.accounts.stats'})} stats_array={items}/>)
  }

  renderContent(){

    return (
      <div style={{ background: '#fff', minHeight: 360, marginTop: 24}}>
        <Table
            key="table_all_txs" 
            rowKey={record => record.key} 
            loading={this.state.loading} 
            columns={this.getColumns()} 
            dataSource={this.state.accounts} 
            footer={() => this.renderFooter()}
            pagination={this.state.pagination}
            scroll={{ x: 700 }}
            />
      </div>
      )
  }

}
//
export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRoleId:     loginRedux.actualRoleId(state),
        actualRole:       loginRedux.actualRole(state),
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(injectIntl(AdminAccounts)))
);