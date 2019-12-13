import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';

import * as api from '@app/services/inkiriApi';
import { Route, Redirect, withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import * as columns_helper from '@app/components/TransactionTable/columns';
import TableStats from '@app/components/TransactionTable/stats'; 
import * as stats_helper from '@app/components/TransactionTable/stats';

import { Radio, Select, Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col, List } from 'antd';
import { Form, Input, Icon} from 'antd';
import { notification, Table, Divider, Spin } from 'antd';

import {DISPLAY_ALL_TXS} from '@app/components/TransactionTable';

import * as utils from '@app/utils/utils';

import _ from 'lodash';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Option } = Select;
const { Search, TextArea } = Input;

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
      // active_tab:     DISPLAY_ALL_TXS
    };

    this.loadAccounts               = this.loadAccounts.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    // this.onTabChange                = this.onTabChange.bind(this);
    // this.onTableChange              = this.onTableChange.bind(this);
    this.onButtonClick              = this.onButtonClick.bind(this);
    this.getColumns                 = this.getColumns.bind(this);
    this.onNewAccount               = this.onNewAccount.bind(this); 
    this.renderAccountTypeFilter    = this.renderAccountTypeFilter.bind(this);
    this.renderAccountStateFilter   = this.renderAccountStateFilter.bind(this);
    this.renderFilterContent        = this.renderFilterContent.bind(this);
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

    
    // let page           = (this.state.page<0)?0:(this.state.page+1);
    // const limit          = this.state.limit;
    let that           = this;
    
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
          this.openNotificationWithIcon("error", "Error loading Account info", JSON.stringify(err));
          that.setState({loading:false});  
        }

        if(!values)
        {
          this.openNotificationWithIcon("error", "Can NOT load accounts' balances neither accounts' balances.");
          // return;
        }

        if(values && !values[0])
        {
          this.openNotificationWithIcon("error", "Can NOT load accounts' balances");
        }

        if(values && !values[1])
        {
          this.openNotificationWithIcon("error", "Can NOT load accounts' aliases");
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
      this.openNotificationWithIcon("info", "End of accounts","You have reached the end of account list!")
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
        , pending:            'N/A' 
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
        , pending:           'N/A' 
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

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  // Component Events
  

  
  renderFooter(){
    return (<Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadAccounts()}>More!!</Button>)
  }

  //
  
  renderFilterContent(){
    const optTypes  = this.renderAccountTypeFilter();
    const optStates = this.renderAccountStateFilter();
    return(
      <div className="filter_wrap">
        <Row>
          <Col span={24}>
            <Form layout="inline" className="filter_form" onSubmit={this.handleSubmit}>
              <Form.Item label="Account Type">
                {optTypes}
              </Form.Item>
              <Form.Item label="Account State">
                {optStates}
              </Form.Item>
              <Form.Item  label="Search">
                  <Search className="styles extraContentSearch" placeholder="Search" onSearch={() => ({})} />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" disabled>
                  Filter
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }

  // 
  renderAccountStateFilter(){
    console.log(' ** renderAccountStateFilter')
    return (
      <Select placeholder="Account status"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">
        {globalCfg.bank.listAccountStates()
          .map( account_state => <Option key={'option'+account_state} value={account_state} label={utils.firsts(account_state)}>{ utils.capitalize(account_state) } </Option> )}
    </Select>
    )
  }
  //
  renderAccountTypeFilter(){
    console.log(' ** renderAccountTypeFilter')
    return (<Select placeholder="Account type"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">

      {globalCfg.bank.listAccountTypes()
        .map( account_type => 
          <Option key={'option_'+account_type} value={account_type} label={account_type}>{ account_type } </Option> 
        )}
      </Select>);
  }
  
  render() {
    const content               = this.renderContent();
    const stats                 = this.renderTableViewStats();
    const filters               = (null); //this.renderFilterContent();
    const _href                 = globalCfg.bank.customers;
    const {routes, loading}     = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={[
            <Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadAccounts()} ></Button>,
            <Button size="small" type="link" href={_href} target="_blank" key="view-on-blockchain_" icon="cloud" >View Accounts on Blockchain</Button>,
            <Button size="small" type="primary" key="_new_account" icon="plus" onClick={()=>{this.onNewAccount()}}> Account</Button>,
          ]}
          title="Accounts"
          subTitle="Bank Accounts Administration"
        >
          
        </PageHeader>
        
        <Card
          key="card_table_all_requests"
          className="styles listCard"
          bordered={false}
          style={{ marginTop: 24 }}
          headStyle={{display:'none'}}
        >
          {filters}
          {stats}
          {content}
        </Card>

      </>
    );
  }

  //
  renderTableViewStats(){
    const {total, pending, negative_balance, personal, business, admin, foundation} = this.currentStats();  
    const items = [
        stats_helper.buildItemSimple('TOTAL', total)
        , stats_helper.buildItemPending('PENDING', pending)
        , stats_helper.buildItemSimple('NEGATIVE', negative_balance, '#cf1322')
        , stats_helper.buildItemSimple('PERSONAL', personal)
        , stats_helper.buildItemSimple('BUSINESS', business)
        , stats_helper.buildItemSimple('ADMIN', admin)
      ]
    return (<TableStats title="STATS" stats_array={items}/>)
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
)(AdminAccounts))
);