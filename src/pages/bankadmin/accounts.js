import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

// import * as userRedux from '@app/redux/models/user';
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';

import * as api from '@app/services/inkiriApi';
import * as routesService from '@app/services/routes';

import { Route, Redirect, withRouter } from "react-router-dom";

import { Radio, Select, Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col, List } from 'antd';
import { Form, Input, Icon} from 'antd';
import { notification, Table, Divider, Spin } from 'antd';

import './pda.css'; 
import styles from './style.less'; 

import {DISPLAY_ALL_TXS} from '@app/components/TransactionTable';

import * as utils from '@app/utils/utils';

import _ from 'lodash';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Option } = Select;
const { Search, TextArea } = Input;

const routes = routesService.breadcrumbForFile('accounts');


class AdminAccounts extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    return [
              {
                title: 'Full Name',
                dataIndex: 'key',
                key: 'fullname',
                sortDirections: ['descend'],
                defaultSortOrder: 'descend',
                // sorter: (a, b) => a.block_time_number - b.block_time_number,
              },
              {
                title: 'Account name',
                dataIndex: 'key',
                key: 'key'
              },
              //
              {
                title: 'Type',
                dataIndex: 'account_type',
                key: 'account_type',
                render: (account_type, record) => (
                  <span>
                   
                   <Tag key={record.key+account_type}>
                     <Icon type={globalCfg.bank.ACCOUNT_ICONS[account_type]} />
                      &nbsp;{globalCfg.bank.getAccountType(account_type).toUpperCase()}
                   </Tag>
                  </span>
                  )
              },
              {
                title: 'State',
                dataIndex: 'state',
                key: 'state',
                render: (state, record) => (
                  <span>
                   <Tag key={record.key+state}>
                        { globalCfg.bank.getAccountState(state).toUpperCase() }
                   </Tag>
                  </span>
                  )
              },
              {
                title: 'Tags',
                key: 'fee',
                dataIndex: 'fee',
                render: (fee, record) => (
                  <span>
                   <Tag color={'geekblue'} key={record.key+fee}>
                          fee: IK${parseFloat(fee).toFixed(2)}
                   </Tag>
                   <Tag color={'geekblue'} key={record.key+record.overdraft}>
                          overdraft: IK${parseFloat(record.overdraft).toFixed(2)}
                   </Tag>
                  </span>
                  )
              },
              //
              {
                title: 'Balance',
                dataIndex: 'balance',
                key: 'balance',
                render: (balance, record) => (
                  <span>
                    { parseFloat(balance).toFixed(2) }
                  </span>
                  )
              },
              //
              {
                title: 'Action',
                fixed: 'right',
                width: 100,
                key: 'action',
                render: (text, record) => {
                  return(
                    <span>
                      <Button key={'process_'+record.key} onClick={()=>{ this.onButtonClick(record) }} icon="profile" size="small">Details</Button>
                    </span>
                  )},
              },
            ];
  }

  componentDidMount(){
    this.loadAccounts();  
  } 

  onNewAccount = () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/create-account`
    })
  }

  onButtonClick(account){
    console.log( ' ACCOUNTS::onButtonClick >> ', JSON.stringify(account) )

    this.props.history.push({
      pathname: `/${this.props.actualRole}/account`
      // , search: '?query=abc'
      , state: { account: account }
    })

    // this.props.history.push({
    //   pathname: '/template',
    //   search: '?query=abc',
    //   state: { detail: response.data }
    // })
    // READ >> this.props.location.state.detail
  }


  loadAccounts = async () => {

    let can_get_more   = this.state.can_get_more;
    if(!can_get_more)
    {
      this.setState({loading:false});
      return;
    }

    this.setState({loading:true});

    
    // let page           = (this.state.page<0)?0:(this.state.page+1);
    // const limit          = this.state.limit;
    let that           = this;
    
    //api.bank.listRequests(page, limit, req_type, account_name)
    api.listBankAccounts()
    .then( (res) => {

        console.log(' >> api.listBankAccounts >>', JSON.stringify(res.data))

        api.dfuse.getAccountsBalances(res.data.accounts.map(acc=>acc.key))
          .then( (balances) => {
            console.log(' >> balances >> ', balances)
            const _balances = _.reduce(balances, function(result, value, key) {
                result[value.account] = value.balance;
                return result;
              }, {});
            const _data = res.data.accounts.map(acc => {return{...acc, balance:_balances[acc.key] }})
            console.log(JSON.stringify(_data))
            // that.onNewData(res.data);
            that.onNewData({accounts:_data, more:res.data.more});
          } ,(ex2) => {
            console.log(' dfuse.getAccountsBalances ERROR#2', JSON.stringify(ex2) )
            that.setState({loading:false});  
          });      
        

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

    // const deposits      = accounts.filter( tx => globalCfg.api.isDeposit(tx))
    //                 .map(tx =>tx.quantity)
    //                 .reduce((acc, amount) => acc + Number(amount), 0);
    // const withdraws     = accounts.filter( tx => globalCfg.api.isWithdraw(tx))
    //                 .map(tx =>tx.quantity)
    //                 .reduce((acc, amount) => acc + Number(amount), 0);
    
    const admin    = accounts.filter( acc => globalCfg.bank.isAdminAccount(acc))
                    .reduce((acc, amount) => acc + 1, 0);
    const business = accounts.filter( acc => globalCfg.bank.isBusinessAccount(acc))
                    .reduce((acc, amount) => acc + 1, 0);
    const personal = accounts.filter( acc => globalCfg.bank.isPersonalAccount(acc))
                    .reduce((acc, amount) => acc + 1, 0);
    const foundation = accounts.filter( acc => globalCfg.bank.isFoundationAccount(acc))
                    .reduce((acc, amount) => acc + 1, 0);

    this.setState({stats:{
        total : accounts?accounts.length:0
        , pending:0 
        , negative_balance:0
        , admin:admin
        , personal:personal
        , business:business
        , foundation:foundation
        }});

  }

  getDefaultStats(){
    return {
        total:0
        , pending:0 
        , negative_balance:0
        , admin:0
        , personal:0
        , business:0
        , foundation:0 };
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
      <div className="wrap">
        <Row>
          <Col span={24}>
            <Form layout="inline" onSubmit={this.handleSubmit}>
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
    //
    const filters = this.renderFilterContent();
    const content = this.renderUMIContent();
    return (
      <>
        <PageHeader
          extra={[
            <Button key="_new_account" icon="plus" onClick={()=>{this.onNewAccount()}}> Account</Button>
          ]}
          breadcrumb={{ routes }}
          title="Accounts"
          subTitle="Bank Accounts Administration"
        >
          
        </PageHeader>
        {filters}
        {content}

      </>
    );
  }
//

  renderUMIContent(){
    const {total, pending, negative_balance, personal, business, admin, foundation} = this.currentStats();  
    return  (<>
      <div className="styles standardList" style={{ marginTop: 24 }}>
        <Card bordered={false}>
          <Row>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
               <Statistic title="" value="STATS" />
            </Col>
            <Col xs={24} sm={12} md={6} lg={3} xl={3}>
               <Statistic
                title="TOTAL"
                value={total}
                precision={0}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={3} xl={3}>
              <Statistic
                title="PENDING"
                value={pending}
                precision={0}
                valueStyle={{ color: '#fadb14' }}
                prefix={<Icon type="clock-circle" />}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={3} xl={3}>
              <Statistic
                title="NEGATIVE"
                value={negative_balance}
                precision={0}
                valueStyle={{ color: '#cf1322' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={3} xl={3}>
              <Statistic
                title="PERSONAL"
                value={personal}
                precision={0}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={3} xl={3}>
              <Statistic
                title="BUSINESS"
                value={business}
                precision={0}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={3} xl={3}>
              <Statistic
                title="ADMIN"
                value={admin}
                precision={0}
              />
            </Col>
          </Row>
        </Card>

        <Card
          className="styles listCard"
          bordered={false}
          title="List of Accounts"
          style={{ marginTop: 24 }}
        >
          
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

        </Card>
      </div>
    </>)
  }

}
//
export default  (withRouter(connect(
    (state)=> ({
        actualAccount:    loginRedux.actualAccount(state),
        actualRoleId:     loginRedux.actualRoleId(state),
        actualRole:       loginRedux.actualRole(state),
    }),
    (dispatch)=>({
        // tryUserState: bindActionCreators(userRedux.tryUserState , dispatch)
    })
)(AdminAccounts))
);