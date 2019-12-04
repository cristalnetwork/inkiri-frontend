import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import { Route, Redirect, withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Form, Select, Icon, Input, Card, PageHeader, Tag, Tabs, Button, Row, Col } from 'antd';
import TableStats, { buildItemUp, buildItemDown, buildItemCompute, buildItemSimple} from '@app/components/TransactionTable/stats';

import { notification, Table, Divider, Spin } from 'antd';

import * as request_helper from '@app/components/TransactionCard/helper';
import TransactionTable from '@app/components/TransactionTable';
import { columns,  DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_EXCHANGES, DISPLAY_PAYMENTS, DISPLAY_REQUESTS, DISPLAY_WITHDRAWS, DISPLAY_PROVIDER, DISPLAY_SEND, DISPLAY_SERVICE} from '@app/components/TransactionTable';

import * as utils from '@app/utils/utils';
import * as columns_helper from '@app/components/TransactionTable/columns';
import { DatePicker } from 'antd';
import moment from 'moment';

const { MonthPicker, RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search, TextArea } = Input;

const tabs = {
  [DISPLAY_ALL_TXS] : 'Movements',
  [DISPLAY_DEPOSIT] : 'Deposits',
  [DISPLAY_WITHDRAWS] : 'Withdraws',
  [DISPLAY_EXCHANGES] : 'Exchanges',
  [DISPLAY_SERVICE] : 'Services',
  [DISPLAY_PAYMENTS] : 'Payments',
  // [DISPLAY_REQUESTS] : 'Requests',
}

class Extrato extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      isMobile:            props.isMobile,
      loading:             false,
      txs:                 [],
      // deposits:         [],
      // withdraws:        [],

      stats:               {},
      
      need_refresh:        {},  

      cursor:              '',
      balance:             {},
      pagination:          { pageSize: 0 , total: 0 },
      active_tab:          DISPLAY_ALL_TXS
    };

    this.loadTransactionsForAccount = this.loadTransactionsForAccount.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.onTabChange                = this.onTabChange.bind(this);
    this.onTableChange              = this.onTableChange.bind(this);
    this.onTransactionClick         = this.onTransactionClick.bind(this);
    this.onRequestClick             = this.onRequestClick.bind(this);
    this.refreshCurrentTable        = this.refreshCurrentTable.bind(this);
    this.renderFilterContent        = this.renderFilterContent.bind(this);
  }
  
  onTransactionClick(transaction){
    // console.log( ' EXTRATO::onTransactionClick >> transaction', JSON.stringify(transaction) )
    console.log( ' EXTRATO::onTransactionClick >> referrer: ', this.props.location.pathname)
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: '/common/transaction-details'
      , state: { 
          transaction: transaction
          , referrer: this.props.location.pathname
        }
    })
  }

  onRequestClick(request){
    // console.log( ' EXTRATO::onRequestClick >> ', JSON.stringify(request) )

    console.log( ' EXTRATO::onRequestClick >> ')
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: '/common/request-details'
      , state: { 
          request: request 
          , referrer: this.props.location.pathname
        }
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.props.isMobile!=prevProps.isMobile)
      this.setState({isMobile:this.props.isMobile})
  }

  componentDidMount(){
    this.loadTransactionsForAccount(true);  
  } 

  
  loadTransactionsForAccount(is_first){

    let account_name = this.props.actualAccountName;
    
    let that = this;
    this.setState({loading:true});
    // console.log(' <><><><><><><><><> this.state.cursor:', this.state.cursor)
    api.listTransactions(account_name, (is_first===true?undefined:this.state.cursor) )
    .then( (res) => {
        that.onNewData(res.data);
      } ,(ex) => {
        // console.log(' -- extrato.js::listTransactions ERROR --');
        // console.log('---- ERROR:', JSON.stringify(ex));
        this.openNotificationWithIcon('error', 'An error occurred when loading transactions.', JSON.stringify(ex))
        that.setState({loading:false});  
      } 
    );
    
  }

  onNewData(data){
    
    const _txs           = [...this.state.txs, ...data.txs];
    const pagination     = {...this.state.pagination};
    pagination.pageSize  = _txs.length;
    pagination.total     = _txs.length;

    // console.log(' >>>>>>>>>>> this.state.cursor:', this.state.cursor)
    // console.log(' >>>>>>>>>>> data.cursor:', data.cursor)
    // console.log(' >> PERSONAL EXTRATO >> data:', JSON.stringify(data.txs));
    
    this.setState({pagination:pagination, txs:_txs, cursor:data.cursor, loading:false})


    if(!data.txs || data.txs.length==0)
    {
      this.openNotificationWithIcon("info", "End of transactions","You have reached the end of transaction list!")
    }
    else{
      this.computeStats(_txs);
    }
  }

  computeStats(txs){
    let stats = this.currentStats();
    
    if(txs===undefined)
      txs = this.state.txs;
    
    const money_in  = txs.filter( tx => !request_helper.blockchain.isNegativeTransaction(tx) 
                                        && request_helper.blockchain.isValidTransaction(tx))
                    .map(tx =>tx.amount)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const money_out = txs.filter( tx => request_helper.blockchain.isNegativeTransaction(tx)
                                        && request_helper.blockchain.isValidTransaction(tx))
                    .map(tx =>tx.amount)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    
    stats[this.state.active_tab] = {money_out:money_out, money_in:money_in, count:txs.length}
    this.setState({stats:stats})
  }

  currentStats(){
    const x = this.state.stats[this.state.active_tab];
    const _default = {money_in:  0,money_out: 0, count:0};
    return x?x:_default;
  }

  refreshCurrentTable(){
    const that = this;
    
    if(this.state.active_tab==DISPLAY_ALL_TXS)
    {
      this.setState(
        {txs:[]}
        , ()=>{
          that.loadTransactionsForAccount(true);
        })
      return;
    }

    let need_refresh = this.state.need_refresh;
    need_refresh[this.state.active_tab]=true;
    this.setState(
        {need_refresh:need_refresh}
        , ()=>{
          need_refresh[this.state.active_tab]=false;
          that.setState({need_refresh:need_refresh})
        })
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  // Component Events

  onTabChange(key) {
    // console.log(key);
    this.setState({active_tab:key})
  }
  
  onTableChange(key, txs) {
    // console.log(key);
    // this.setState({active_tab:key})
    if(key==this.state.active_tab )
      this.computeStats(txs);
  }

  /* *********************************
   * Begin RENDER section
  */
  
  //
  renderSelectTxTypeOptions(){
    return (
      globalCfg.api.getTypes().map( tx_type => {return(<Option key={'option'+tx_type} value={tx_type} label={utils.firsts(tx_type.split('_')[1])}>{ utils.capitalize(tx_type.split('_')[1]) } </Option>)})
        )
  }
  // 
  renderSelectInOutOptions(){
    return (
      ['all', 'in', 'out'].map( tx_state => {return(<Option key={'option'+tx_state} value={tx_state} label={utils.firsts(tx_state)}>{ utils.capitalize(tx_state) } </Option>)})
        )
  }
  // 
  renderSelectAccountTypeOptions(){
    return (
      globalCfg.bank.listAccountTypes().map( tx_state => {return(<Option key={'option'+tx_state} value={tx_state} label={utils.firsts(tx_state)}>{ utils.capitalize(tx_state) } </Option>)})
        )
  }
  //
  renderFilterContent() {
    if(this.state.isMobile)
      return (null);
    const dateFormat = 'YYYY/MM/DD';
    return (
      <div className="filter_wrap">
        <Row>
          <Col span={24}>
            <Form layout="inline" className="filter_form" onSubmit={this.handleSubmit}>
              <Form.Item label="Operation">
                  <Select placeholder="Operation"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">
                      {this.renderSelectTxTypeOptions()}
                  </Select>
              </Form.Item>
              <Form.Item label="Date Range">
                  <RangePicker
                    defaultValue={[moment('2015/01/01', dateFormat), moment('2015/01/01', dateFormat)]}
                    format={dateFormat}
                  />
              </Form.Item>
              <Form.Item label="In-Out">
                <Select placeholder="In-Out"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">
                      {this.renderSelectInOutOptions()}
                  </Select>
              </Form.Item>
              <Form.Item label="Account type">
                <Select placeholder="Account type"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">
                      {this.renderSelectAccountTypeOptions()}
                  </Select>
              </Form.Item>
              <Form.Item label="Search">
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
  renderTableViewStats() 
  {
    if(this.state.isMobile)
      return (null);

    const {money_in, money_out, count} = this.currentStats();
    const items = [
        buildItemUp('Entradas', money_in)
        , buildItemDown('Saidas', money_out)
        , buildItemCompute('Variacao de caja', (money_in-money_out))
        , buildItemSimple('Transações', (count||0))
      ]
    return (<TableStats stats_array={items}/>)

  }

  renderFooter(){
    return (<><Button key="load-more-data" disabled={!this.state.cursor} onClick={()=>this.loadTransactionsForAccount(false)}>More!!</Button> </>)
  }

  renderContent(){
    let content = null;
    if(this.state.active_tab==DISPLAY_DEPOSIT){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_DEPOSIT} 
          need_refresh={this.state.need_refresh[DISPLAY_DEPOSIT]}
          request_type={DISPLAY_DEPOSIT} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          />
      );
    }
    //
    if(this.state.active_tab==DISPLAY_WITHDRAWS){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_WITHDRAWS} 
          need_refresh={this.state.need_refresh[DISPLAY_WITHDRAWS]}
          request_type={DISPLAY_WITHDRAWS} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          />
      );
    }
    //
    if(this.state.active_tab==DISPLAY_EXCHANGES){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_EXCHANGES} 
          need_refresh={this.state.need_refresh[DISPLAY_EXCHANGES]}
          request_type={DISPLAY_EXCHANGES} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          />
      );
    }
    //
    if(this.state.active_tab==DISPLAY_SERVICE){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_SERVICE} 
          need_refresh={this.state.need_refresh[DISPLAY_SERVICE]}
          request_type={DISPLAY_SERVICE} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          />
      );
    }
    //

    if(this.state.active_tab==DISPLAY_ALL_TXS){
      content = (
        <Table
          key={"table_"+DISPLAY_ALL_TXS} 
          rowKey={record => record.id} 
          loading={this.state.loading} 
          columns={ columns_helper.getColumnsForPersonalExtrato(this.onTransactionClick, this.props.actualRoleId)} 
          dataSource={this.state.txs} 
          footer={() => this.renderFooter()}
          pagination={this.state.pagination}
          scroll={{ x: 700 }}
          />
      );
    }

    return (<div style={{ margin: '0 0px', padding: 24, background: '#fff', minHeight: 360, marginTop: 24  }}>
      {content}</div>)
  }
  //
  render() {
    const {routes, active_tab} = this.state;
    const content              = this.renderContent();
    const stats                = this.renderTableViewStats();
    const filters              = this.renderFilterContent();
    return (
      <>
        <PageHeader
          extra={[
            <Button size="small" key="refresh" icon="redo" disabled={this.state.loading} onClick={()=>this.refreshCurrentTable()} ></Button>,
            
          ]}
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title="Extrato"
          subTitle="List of transactions"
        >
        </PageHeader>

        <div className="styles standardList" style={{ marginTop: 24 }}>
          <Card key={'card_master'}  
            tabList={ Object.keys(tabs).map(key_tab => { return {key: key_tab, tab: tabs[key_tab]} } ) }
            activeTabKey={active_tab}
            onTabChange={ (key) => this.onTabChange(key)}
            >

              {filters}

              {stats}
              
              {content}

          </Card>
        </div>
      </>
    );
  }
  
}

export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:        loginRedux.actualAccountName(state),
        actualRole:               loginRedux.actualRole(state),
        actualRoleId:             loginRedux.actualRoleId(state),
        balance:                  balanceRedux.userBalanceFormatted(state),
        isMobile :                menuRedux.isMobile(state)
    }),
    (dispatch)=>({
        setLastRootMenuFullpath:  bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(Extrato)));