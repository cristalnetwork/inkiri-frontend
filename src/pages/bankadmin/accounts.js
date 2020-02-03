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

import {ResizeableTable} from '@app/components/TransactionTable/resizable_columns';
import * as gqlService from '@app/services/inkiriApi/graphql'
import AccountFilter from '@app/components/Filters/account';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Radio, Select, Card, PageHeader, Tabs, Button } from 'antd';
import { Form, Input, Table, Spin } from 'antd';

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
      limit:           globalCfg.api.default_page_size,
      can_get_more:    true,

      filter:         {},

      stats:          undefined,
    };

    this.loadAccounts               = this.loadAccounts.bind(this);  
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.onButtonClick              = this.onButtonClick.bind(this);
    this.getColumns                 = this.getColumns.bind(this);
    this.onNewAccount               = this.onNewAccount.bind(this); 
    this.filterCallback             = this.filterCallback.bind(this);

    this.myExportRef    = React.createRef();
    this.timeout_id     = null;   
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

  getAccountFilter = (increase_page_if_needed) => {
    const page             = (this.state.page<=0)
      ?0
      :(increase_page_if_needed)
        ?(this.state.page+1)
        :this.state.page;

    const {limit, filter}  = this.state;
    
    return {limit:limit.toString(), page:page.toString(), ...filter};
  }

  loadAccounts = async () => {
    let that      = this;
    const filter = this.getAccountFilter(true);
    try{
      const data = await gqlService.listUsers(filter);
      console.log(data)
      that.onNewData(data);
    }
    catch(ex){
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'pages.bankadmin.iugu.error_loading'}), ex);
      that.setState({loading:false});  
    }

  }

  onNewData(accounts){
    
    const _accounts       = [...this.state.accounts, ...accounts];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _accounts.length;
    pagination.total      = _accounts.length;

    const has_received_new_data = (accounts && accounts.length>0);

    const page           = (this.state.page<0)?0:(this.state.page+1);
    this.setState({pagination:    pagination
                , accounts:       _accounts
                , can_get_more:   (has_received_new_data && accounts.length==this.state.limit)
                , loading:        false
                , page:           page})

    if(!has_received_new_data)
    {
      const {formatMessage} = this.props.intl;
      components_helper.notif.infoNotification(
        formatMessage({id:'pages.bankadmin.accounts.end_of_accounts'})
        , formatMessage({id:'pages.bankadmin.accounts.end_of_accounts_message'}) 
      );
    }
    // else
    //   this.computeStats();
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

  //
  filterCallback = (error, cancel, values, refresh) => {
    
    if(cancel)
    {
      return;
    }
    if(error)
    {
      return;
    }

    if(refresh)
    {
      clearTimeout(this.timeout_id);
      this.timeout_id = setTimeout(()=> {
        this.reloadAccounts();
      } ,100);
      return;
    }
    
    console.log(' accountFilter: ', JSON.stringify(values));
    /*
      {"state":"state_error","to":"centroinkiri","date_from":"2020-01-02T00:13:52.742Z","date_to":"2020-01-25T00:13:52.742Z"}
    */

    
    clearTimeout(this.timeout_id);
    this.timeout_id = setTimeout(()=> {
      this.setState({filter:(values||{})}, ()=>{
        this.reloadAccounts();
      })
    } ,100);
    
  }

  exportButton = () => [<a className="hidden" key="export_button_dummy" ref={this.myExportRef}  href={this.state.sheet_href} target="_blank" >x</a>, <Button key="export_button" onClick={this.handleExportClick} size="small" style={{position: 'absolute', right: '8px', top: '16px'}} title={this.props.intl.formatMessage({id:'global.export_sheet_remember_allowing_popups'})}><FontAwesomeIcon icon="file-excel" size="sm" color="black"/>&nbsp;<InjectMessage id="global.export_list_to_spreadsheet" /></Button>];
  //
  handleExportClick = async () => {

    const filter = this.getAccountFilter(false);
      
    console.log(filter)
    if(!filter)
      return;

    this.setState({loading:true});
    const that       = this;
    try{
      const data = await gqlService.exportUsers(filter);
      
      this.setState({loading:false});
      console.log(data)
      if(data && data.file_id)
      {
        console.log('SETTING STATE')
        this.setState( { sheet_href: `https://docs.google.com/spreadsheets/d/${data.file_id}` }
                        , () => { 
                          console.log('CALLING BUTTON?')
                         if(!this.myExportRef)    
                            return;
                          console.log('YES')
                          this.myExportRef.current.click();
                        });
        
        return;
      } 
      console.log('NOooooooooooooooo')
      if(data && data.error)
      {
        components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'components.TransactionTable.index.error_exporting'}), data.error);
        return;
      }
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'components.TransactionTable.index.error_exporting'}));
    }
    catch(e)
    {
      this.setState({loading:false});
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'components.TransactionTable.index.error_exporting'}), e);
      return;
    }

    this.setState({loading:false});
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
          <AccountFilter 
            callback={this.filterCallback} />

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
      <div style={{ background: '#fff', minHeight: 360}}>
        <ResizeableTable
            title = { () => this.exportButton() }
            key="table_all_txs" 
            rowKey={record => record.account_name} 
            loading={this.state.loading} 
            columns_def={this.getColumns()} 
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