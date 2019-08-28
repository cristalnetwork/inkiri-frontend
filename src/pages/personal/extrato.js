import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

// import * as userRedux from '@app/redux/models/user';
import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as globalCfg from '@app/configs/global';

import * as api from '@app/services/inkiriApi';
import * as routesService from '@app/services/routes';

import { Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';

import { notification, Table, Divider, Spin } from 'antd';

import './extrato.css'; 

import TransactionTable from '@app/components/TransactionTable';
import {columns,  DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_EXCHANGES, DISPLAY_PAYMENTS, DISPLAY_REQUESTS, DISPLAY_WITHDRAWS, DISPLAY_PROVIDER, DISPLAY_SEND, DISPLAY_SERVICE} from '@app/components/TransactionTable';

const { TabPane } = Tabs;

const Description = ({ term, children, span = 12 }) => (
    <Col span={span}>
      <div className="description">
        <div className="term">{term}</div>
        <div className="detail">{children}</div>
      </div>
    </Col>
  );

const routes = routesService.breadcrumbForFile('extrato');

class Extrato extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:                      false,
      txs:                          [],
      deposits:                     [],

      stats:                        {},
      
      cursor:                       '',
      responses:                    {}, // array of { txs:[], cursor:'', page_index:0}
      balance:                      {},
      pagination:                   { pageSize: 0 , total: 0 },
      active_tab:                   DISPLAY_ALL_TXS
    };

    this.loadTransactionsForAccount = this.loadTransactionsForAccount.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.onTabChange                = this.onTabChange.bind(this);
    this.onTableChange              = this.onTableChange.bind(this);
  }
  
  componentDidMount(){
    this.loadTransactionsForAccount(true);  
  } 

  loadTransactionsForAccount(is_first){

    let account_name = this.props.actualAccount;
    console.log(' pages::personal::extrato >> this.props.actualAccount:', this.props.actualAccount, ' | fetching history for:', account_name)
    
    let that = this;
    this.setState({loading:true});
    // console.log(' <><><><><><><><><> this.state.cursor:', this.state.cursor)
    api.dfuse.listTransactions(account_name, (is_first===true?undefined:this.state.cursor) )
    .then( (res) => {
            that.onNewData(res.data);
    } ,(ex) => {
            // console.log(' -- extrato.js::listTransactions ERROR --');
            // console.log('---- ERROR:', JSON.stringify(ex));
            that.setState({loading:false});  
      } 
    );
    
  }

  onNewData(data){
    
    const _txs = [...this.state.txs, ...data.txs];
    const pagination = {...this.state.pagination};
    pagination.pageSize= _txs.length;
    pagination.total= _txs.length;

    console.log(' >>>>>>>>>>> this.state.cursor:', this.state.cursor)
    console.log(' >>>>>>>>>>> data.cursor:', data.cursor)
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
    const money_in  = txs.filter( tx => tx.i_sent)
                    .map(tx =>tx.quantity)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const money_out = txs.filter( tx => !tx.i_sent)
                    .map(tx =>tx.quantity)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    
    stats[this.state.active_tab] = {money_out:money_out, money_in:money_in, count:txs.length}
    this.setState({stats:stats})
  }

  currentStats(){
    const x = this.state.stats[this.state.active_tab];
    const _default = {money_in:  0,money_out: 0, count:0};
    return x?x:_default;
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  // Component Events

  onTabChange(key) {
    console.log(key);
    this.setState({active_tab:key})
  }
  
  onTableChange(key, txs) {
    // console.log(key);
    // this.setState({active_tab:key})
    if(key==this.state.active_tab )
      this.computeStats(txs);
  }

  // Begin RENDER section
  renderTableViewStats() 
  {
    const current_stats = this.currentStats();
    return (
      <Row>
        <Description term="Entradas"><Tag color="green">IK$ {current_stats.money_in.toFixed(2)}</Tag></Description>
        <Description term="Variacao de caja"><Tag color="red">IK$ {(current_stats.money_in - current_stats.money_out).toFixed(2)}</Tag></Description>
        <Description term="Saidas"><Tag color="red">-IK$ {current_stats.money_out.toFixed(2)}</Tag></Description>
        <Description term="Lancamentos">{current_stats.count|0}</Description>
      </Row>
    );
  }

  renderFooter(){
    return (<><Button key="load-more-data" disabled={this.state.cursor==''} onClick={()=>this.loadTransactionsForAccount(false)}>More!!</Button> </>)
  }

  renderExtraContent ()
  {
    return(
    <Row>
      <Col span={24}>
        <Card><Statistic title="Account Balance (IK$)" value={this.props.balance} precision={2} /> 
        </Card> <></>
      </Col>
    </Row>
    );
  }

  renderContent(){
    if(this.state.active_tab==DISPLAY_DEPOSIT){
      return (<div style={{ margin: '0 0px', padding: 24, background: '#fff', minHeight: 360 }}>
        <TransactionTable request_type={DISPLAY_DEPOSIT} onChange={this.onTableChange}/>
      </div>);
    }
    
    //

    if(this.state.active_tab==DISPLAY_ALL_TXS){
      return (<div style={{ margin: '0 0px', padding: 24, background: '#fff', minHeight: 360 }}>
        <Table
          key="table_all_txs" 
          rowKey={record => record.id} 
          loading={this.state.loading} 
          columns={columns(this.props.actualRoleId)} 
          dataSource={this.state.txs} 
          footer={() => this.renderFooter()}
          pagination={this.state.pagination}
          />
      </div>);
    }
  }
  //
  render() {
    const content = this.renderContent();
    
    /*
    PageHeader
      extra={[
        <Button key="3">Filter</Button>,
        <Button key="1" type="primary">
          Apply
        </Button>,
      ]}
    */
    return (
      <>
        <PageHeader
          extra={[]}
          breadcrumb={{ routes }}
          title="Extrato"
          subTitle="List of transactions"
          footer={
            <Tabs  defaultActiveKey={DISPLAY_ALL_TXS} onChange={this.onTabChange}>
              <TabPane tab="All"       key={DISPLAY_ALL_TXS} />
              <TabPane tab="Deposits"  key={DISPLAY_DEPOSIT} />
              <TabPane tab="Withdraws" key={DISPLAY_WITHDRAWS} disabled />
              <TabPane tab="Exchanges" key={DISPLAY_EXCHANGES} disabled />
              <TabPane tab="Payments"  key={DISPLAY_PAYMENTS} disabled />
              <TabPane tab="Requests"  key={DISPLAY_REQUESTS} disabled />
            </Tabs>
          }
        >
          <div className="wrap">
            <div className="content padding">{this.renderTableViewStats()}</div>
            <div className="extraContent">{this.renderExtraContent()}</div>
          </div>
        </PageHeader>

        {content}

      </>
    );
  }
}

export default connect(
    (state)=> ({
        actualAccount:    loginRedux.actualAccount(state),
        actualRoleId:       loginRedux.actualRoleId(state),
        balance:          balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        // tryUserState: bindActionCreators(userRedux.tryUserState , dispatch)
    })
)(Extrato)