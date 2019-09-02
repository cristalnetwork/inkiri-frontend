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

const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Option } = Select;
const { Search, TextArea } = Input;

const Description = ({ term, children, span = 12 }) => (
    <Col span={span}>
      <div className="description">
        <div className="term">{term}</div>
        <div className="detail">{children}</div>
      </div>
    </Col>
  );

const routes = routesService.breadcrumbForFile('accounts');

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

const Info: React.SFC<{
      title: React.ReactNode;
      value: React.ReactNode;
      bordered?: boolean;
    }> = ({ title, value, bordered }) => (
      <div className="styles headerInfo">
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    );
//

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
                title: 'Action',
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

     "https://mainnet.eos.dfuse.io/v0/state/tables/scopes?account=inkiritoken1&scopes=inkirimaster|inkpersonal2|inkpersonal3&table=accounts&block_num=25000000&json=true"
  
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

        // // HACK!!!!!!!!!!!!!!!!!
        // that.props.history.push({
        //   pathname: `/${that.props.actualRole}/account`
        //   // , search: '?query=abc'
        //   , state: { account: res.data.accounts[0] }
        // })

        that.onNewData(res.data);

      } ,(ex) => {
        // console.log('---- ERROR:', JSON.stringify(ex));
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
  
  renderFilterContent (){
    const optTypes  = null; //this.renderSelectAccountTypeOptions();
    const optStates = null; //this.renderSelectAccountStateOptions();
    return(
      <div className="wrap">
        <Row>
          <Col span={24}>
            <Form layout="inline" onSubmit={this.handleSubmit}>
              <Form.Item>
                {optTypes}
              </Form.Item>
              <Form.Item>
                {optStates}
              </Form.Item>
              <Form.Item>
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
  renderSelectAccountStateOptions(){
    console.log(' ** renderSelectAccountStateOptions')
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
  renderSelectAccountTypeOptions(){
    console.log(' ** renderSelectAccountTypeOptions')
    return (<Select placeholder="Account type"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">

      {globalCfg.bank.listAccountTypes()
        .map( account_type => <Option key={'option'+account_type} value={account_type} label={utils.firsts(account_type)}>{ utils.capitalize(account_type) } </Option> )}
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
            <Button key="_new_account" icon="plus"> Account</Button>
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
            <Col sm={4} xs={24}>
              <Info title="" value="ACCOUNTS" bordered />
            </Col>
            <Col sm={3} xs={24}>
              <Info title="TOTAL" value={total} bordered />
            </Col>
            <Col sm={4} xs={24}>
              <Info title="PENDING" value={pending} bordered />
            </Col>
            <Col sm={4} xs={24}>
              <Info title="NEGATIVE BALANCE" value={negative_balance} />
            </Col>
            <Col sm={3} xs={24}>
              <Info title="PERSONAL" value={personal} />
            </Col>
            <Col sm={3} xs={24}>
              <Info title="BUSINESS" value={business} />
            </Col>
            <Col sm={3} xs={24}>
              <Info title="ADMIN" value={admin} />
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