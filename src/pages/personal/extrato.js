import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

// import * as userRedux from '@app/redux/models/user';
import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as globalCfg from '@app/configs/global';

import * as api from '@app/services/inkiriApi';
import * as routesService from '@app/services/routes';

import { Icon, Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';

import { notification, Table, Divider, Spin } from 'antd';

import './extrato.css'; 
import styles from './extrato.less';

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
      
      need_refresh:                 {},  

      cursor:                       '',
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
    this.onProcessRequestClick      = this.onProcessRequestClick.bind(this);
    this.refreshCurrentTable        = this.refreshCurrentTable.bind(this);
  }
  
  onProcessRequestClick(request){
    console.log( ' EXTRATO::onProcessRequestClick >> ', JSON.stringify(request) )

    // this.props.history.push({
    //   pathname: `/common/process-request`
    //   // , search: '?query=abc'
    //   , state: { request: request }
    // })
    // READ >> this.props.location.state.detail
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
    pagination.pageSize=   _txs.length;
    pagination.total=     _txs.length;

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

  // Begin RENDER section
  renderTableViewStats() 
  {
    const {money_in, money_out, count} = this.currentStats();
    const variacion = money_in-money_out;
    return (
      <div className="styles standardList" style={{ marginTop: 24 }}>
        <Card key="the_card_key" bordered={false}>
          <Row>
            <Col xs={24} sm={12} md={5} lg={5} xl={5}>
            <Statistic
                    title="Entradas"
                    value={money_in}
                    precision={2}
                    valueStyle={{ color: 'green' }}
                    prefix={<Icon type="arrow-up" />}
                  />
            </Col>
            <Col xs={24} sm={12} md={5} lg={5} xl={5}>
              <Statistic
                    title="Saidas"
                    value={money_out}
                    precision={2}
                    valueStyle={{ color: 'red' }}
                    prefix={<Icon type="arrow-down" />}
                  />
            </Col>
            <Col xs={24} sm={12} md={5} lg={5} xl={5}>
              <Statistic
                    title="Variacao de caja"
                    value={variacion}
                    precision={2}
                    valueStyle={variacion>0?{ color: 'green' }:{ color: 'red' }}
                    prefix={((variacion==0)?null:(variacion>0?<Icon type="arrow-up" />:<Icon type="arrow-down" />))}
                  />
            </Col>
            <Col xs={24} sm={12} md={4} lg={4} xl={4}>
              <Statistic
                    title="Transações"
                    value={count|0}
                    precision={0}
                    
                  />
            </Col>
            <Col xs={24} sm={12} md={5} lg={5} xl={5}>
              <Statistic
                title="Account Balance"
                value={Number(this.props.balance)}
                precision={2}
                suffix="IK$"
              />
            </Col>
          </Row>
        </Card>
      </div>
    );
  }

  renderFooter(){
    return (<><Button key="load-more-data" disabled={this.state.cursor==''} onClick={()=>this.loadTransactionsForAccount(false)}>More!!</Button> </>)
  }

  renderContent(){
    let content = null;
    if(this.state.active_tab==DISPLAY_DEPOSIT){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_DEPOSIT} 
          need_refresh={this.state.need_refresh[DISPLAY_DEPOSIT]}
          request_type={DISPLAY_DEPOSIT} 
          onChange={this.onTableChange}/>
      );
    }
    
    //

    if(this.state.active_tab==DISPLAY_ALL_TXS){
      content = (
        <Table
          key={"table_"+DISPLAY_ALL_TXS} 
          rowKey={record => record.id} 
          loading={this.state.loading} 
          columns={columns(this.props.actualRoleId, this.onProcessRequestClick)} 
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
    const content = this.renderContent();
    const stats = this.renderTableViewStats();
    return (
      <>
        <PageHeader
          extra={[
            <Button key="refresh" icon="redo" disabled={this.state.loading} onClick={()=>this.refreshCurrentTable()} ></Button>,
            
          ]}
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
        </PageHeader>
  
        {stats}
        {content}

      </>
    );
  }
}

export default connect(
    (state)=> ({
        actualAccount:    loginRedux.actualAccount(state),
        actualRole:       loginRedux.actualRole(state),
        actualRoleId:     loginRedux.actualRoleId(state),
        balance:          balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        // tryUserState: bindActionCreators(userRedux.tryUserState , dispatch)
    })
)(Extrato)