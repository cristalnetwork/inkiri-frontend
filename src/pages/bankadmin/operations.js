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

import { Form, Select, Icon, Input, Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';

import { notification, Table, Divider, Spin } from 'antd';

import TransactionTable from '@app/components/TransactionTable';
import TableStats, { buildItemUp, buildItemDown, buildItemCompute, buildItemSimple} from '@app/components/TransactionTable/stats';
import { DISPLAY_PDA, DISPLAY_EXTERNAL, DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_EXCHANGES, DISPLAY_PAYMENTS, DISPLAY_REQUESTS, DISPLAY_WITHDRAWS, DISPLAY_PROVIDER, DISPLAY_SEND, DISPLAY_SERVICE} from '@app/components/TransactionTable';
import * as request_helper from '@app/components/TransactionCard/helper';
import * as columns_helper from '@app/components/TransactionTable/columns';

import * as utils from '@app/utils/utils';

import { DatePicker } from 'antd';
import moment from 'moment';

const { MonthPicker, RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search, TextArea } = Input;

const tabs = {
  [DISPLAY_ALL_TXS] :   'Blockchain transactions',       
  [DISPLAY_PDA] :       'Deposits & Withdraws requests', 
  [DISPLAY_EXTERNAL] :  'External transfers requests',   
}

class Operations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      loading:             false,
      txs:                 [],
      deposits:            [],

      stats:               {},
      
      need_refresh:        {},  

      cursor:              '',
      balance:             {},
      pagination:          { pageSize: 0 , total: 0 },
      active_tab:          DISPLAY_ALL_TXS
    };

    this.loadAllTransactions        = this.loadAllTransactions.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.onTabChange                = this.onTabChange.bind(this);
    this.onTableChange              = this.onTableChange.bind(this);
    
    this.refreshCurrentTable        = this.refreshCurrentTable.bind(this);
    this.renderFilterContent        = this.renderFilterContent.bind(this);

    this.onTransactionClick         = this.onTransactionClick.bind(this);
    this.onRequestClick             = this.onRequestClick.bind(this);
  }
  
  onTransactionClick(transaction){
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
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: `/${this.props.actualRole}/external-transfers-process-request`
      , state: { 
          request: request 
          , referrer: this.props.location.pathname
        }
    })

    // this.props.history.push({
    //   pathname: '/common/request-details'
    //   , state: { 
    //       request: request 
    //       , referrer: this.props.location.pathname
    //     }
    // })
  }

  componentDidMount(){
    this.loadAllTransactions(true);  
  } 

  loadAllTransactions(is_first){

    let that = this;
    this.setState({loading:true});
    api.dfuse.allTransactions((is_first===true?undefined:this.state.cursor) )
      .then( (res) => {
              that.onNewData(res.data, is_first);
      } ,(ex) => {
              // console.log(' -- extrato.js::listTransactions ERROR --');
              // console.log('---- ERROR:', JSON.stringify(ex));
              that.setState({loading:false});  
        } 
      );
    
  }

  onNewData(data, is_first){
    
    const _txs          = (is_first===true)?data.txs:[...this.state.txs, ...data.txs];
    const pagination    = {...this.state.pagination};
    pagination.pageSize = _txs.length;
    pagination.total    = _txs.length;

    // console.log(' >> BUSINESS EXTRATO >> data:', JSON.stringify(data.txs));
    // console.log(' >>>>>>>>>>> this.state.cursor:', this.state.cursor)
    // console.log(' >>>>>>>>>>> data.cursor:', data.cursor)
    this.setState({pagination:pagination, txs:_txs, cursor:data.cursor, loading:false})

    if(!data.txs || data.txs.length==0)
    {
      this.openNotificationWithIcon("info", "End of transactions","You have reached the end of transaction list!")
    }
    else{
      this.computeStats();
    }
  }

  computeStats(txs){
    let stats = this.currentStats();
    if(txs===undefined)
      txs = this.state.txs;
    const money_in  = txs.filter( tx => request_helper.blockchain.isNegativeTransaction(tx)===false 
                                        && request_helper.blockchain.isValidTransaction(tx))
                    .map(tx =>tx.amount)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const money_out = txs.filter( tx => request_helper.blockchain.isNegativeTransaction(tx)
                                        && request_helper.blockchain.isValidTransaction(tx))
                    .map(tx =>tx.amount)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    
    stats[this.state.active_tab] = {money_out:money_out||0, money_in:money_in||0, count:txs.length}
    this.setState({stats:stats})
  }

  currentStats(){
    const x = this.state.stats[this.state.active_tab];
    const _default = {money_in:  0,money_out: 0, count:0};
    return x?x:_default;
  }

  refreshCurrentTable(){
    const that         = this;
    const {active_tab} = this.state;

    if(active_tab==DISPLAY_ALL_TXS)
    {
      this.setState(
        {txs:[]}
        , ()=>{
          that.loadAllTransactions(true);
        })
      return;
    }

    let need_refresh = this.state.need_refresh;
    need_refresh[active_tab]=true;
    this.setState(
        {need_refresh:need_refresh}
        , ()=>{
          need_refresh[active_tab]=false;
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
  
  renderTableViewStats(){
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
    return (<><Button key="load-more-data" disabled={!this.state.cursor} onClick={()=>this.loadAllTransactions(false)}>More!!</Button> </>)
  }

  renderContent(){
    let content = null;
    
    const {active_tab} = this.state;
    
    if(active_tab==DISPLAY_PDA){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_PDA} 
          need_refresh={this.state.need_refresh[DISPLAY_PDA]}
          request_type={DISPLAY_PDA} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          multiple={true}
          i_am_admin={true}
          />
      );
    }

    //
    if(active_tab==DISPLAY_EXTERNAL){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_EXTERNAL} 
          need_refresh={this.state.need_refresh[DISPLAY_EXTERNAL]}
          request_type={DISPLAY_EXTERNAL} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          multiple={true}
          i_am_admin={true}
          />
      );
    }
    
    if(active_tab==DISPLAY_ALL_TXS){
      content = (
        <Table
          key={"table_"+DISPLAY_ALL_TXS} 
          rowKey={record => record.id} 
          loading={this.state.loading} 
          columns={ columns_helper.getColumnsForOperations(this.onTransactionClick, this.props.actualRoleId)} 
          dataSource={this.state.txs} 
          footer={() => this.renderFooter()}
          pagination={this.state.pagination}
          scroll={{ x: 700 }}
          />
      );
    }
    // className="styles listCard"
    // style={{ marginTop: 24 }}

    return (<div style={{ background: '#fff', minHeight: 360, marginTop: 24}}>
        {content}
      </div>)
  }
  //
  render() {
    const content               = this.renderContent();
    const stats                 = this.renderTableViewStats();
    const filters               = this.renderFilterContent();
    const {routes, active_tab}  = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={[
            <Button size="small" key="refresh" icon="redo" disabled={this.state.loading} onClick={()=>this.refreshCurrentTable()} ></Button>,
            
          ]}
          title="Operations"
          subTitle="List of blockchain transactions, Deposits & Withdraw requests, and Exchanges & Provider Payment requests"
        >
        </PageHeader>
        
        <div className="styles standardList" style={{ marginTop: 24 }}>
          <Card key={'card_master'} style = { { marginBottom: 24 } } 
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

//
/*
<Card key="tabs_card" bordered={false}>
            <Tabs  defaultActiveKey={DISPLAY_ALL_TXS} onChange={this.onTabChange}>
              <TabPane tab={tabs[DISPLAY_ALL_TXS]}   key={DISPLAY_ALL_TXS} />
              <TabPane tab={tabs[DISPLAY_PDA]}       key={DISPLAY_PDA} />
              <TabPane tab={tabs[DISPLAY_EXTERNAL]}  key={DISPLAY_EXTERNAL} />
            </Tabs>
          </Card>
*/
export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRole:           loginRedux.actualRole(state),
        actualRoleId:         loginRedux.actualRoleId(state),
        balance:              balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(Operations)));