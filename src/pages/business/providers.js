import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

// import * as userRedux from '@app/redux/models/user';
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';

import * as api from '@app/services/inkiriApi';
import * as routesService from '@app/services/routes';
import { Route, Redirect, withRouter } from "react-router-dom";
import { Form, Select, Icon, Input, Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';

import { notification, Table, Divider, Spin } from 'antd';

import './providers.css'; 
import styles from './providers.less';

import TransactionTable from '@app/components/TransactionTable';
import {columns,  DISPLAY_ALL_TXS, DISPLAY_PAYMENTS} from '@app/components/TransactionTable';

import * as utils from '@app/utils/utils';

import { DatePicker } from 'antd';
import moment from 'moment';

const { MonthPicker, RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search, TextArea } = Input;

const routes = routesService.breadcrumbForFile('providers');

class Providers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:         false,
      txs:             [],
      page:            -1, 
      limit:           globalCfg.api.default_page_size,
      can_get_more:    true,

      stats:                        {},
      
      need_refresh:                 {},  

      pagination:                   { pageSize: 0 , total: 0 }
    };

    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.onTabChange                = this.onTabChange.bind(this);
    this.onTableChange              = this.onTableChange.bind(this);
    this.onNewRequestClick          = this.onNewRequestClick.bind(this);
    this.onProcessRequestClick      = this.onProcessRequestClick.bind(this);
    this.refreshCurrentTable        = this.refreshCurrentTable.bind(this);
    this.renderFilterContent        = this.renderFilterContent.bind(this);
  }
  
  onNewRequestClick(){
    this.props.history.push({
      pathname: `/${this.props.actualRole}/providers-payments-request`
    })
  }

  onProcessRequestClick(request){
    console.log( ' EXTRATO::onProcessRequestClick >> ', JSON.stringify(request) )
  }

  componentDidMount(){
    this.loadProviderTxs(true);
  } 

  loadProviderTxs = async (first_call) => {
    let can_get_more   = this.state.can_get_more;
    if(!can_get_more)
    {
      this.setState({loading:false});
      return;
    }

    
    this.setState({loading:true});

    let page                = (this.state.page<0)?0:(this.state.page+1);
    const {limit, provider} = this.state;
    let that                = this;
    
    // const req_type = DISPLAY_PROVIDER;
    
    api.bank.listMyRequests(this.props.actualAccountName, page, limit, DISPLAY_PAYMENTS)
    .then( (res) => {
        that.onNewData(res, first_call);
      } ,(ex) => {
        // console.log('---- ERROR:', JSON.stringify(ex));
        that.setState({loading:false});  
      } 
    );
  }

  onNewData(txs, first_call){
    
    const _txs            = [...this.state.txs, ...txs];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _txs.length;
    pagination.total      = _txs.length;

    const has_received_new_data = (txs && txs.length>0);

    this.setState({pagination:pagination, txs:_txs, can_get_more:(has_received_new_data && txs.length==this.state.limit), loading:false})

    if(!has_received_new_data && !first_call)
    {
      this.openNotificationWithIcon("info", "End of transactions","You have reached the end of transaction list!")
    }
    // else
    //   this.computeStats();
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

  /* *********************************
   * Begin RENDER section
  */
  
  //
  renderSelectTxStateOptions(){
    return (
      globalCfg.api.getStates().map( tx_state => {return(<Option key={'option'+tx_state} value={tx_state} label={utils.firsts(tx_state.split('_')[1])}>{ utils.capitalize(tx_state.split('_')[1]) } </Option>)})
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
              <Form.Item label="Operation State">
                  <Select placeholder="Operation State"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">
                      {this.renderSelectTxStateOptions()}
                  </Select>
              </Form.Item>
              <Form.Item label="Date Range">
                  <RangePicker
                    defaultValue={[moment('2015/01/01', dateFormat), moment('2015/01/01', dateFormat)]}
                    format={dateFormat}
                  />
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
    const {money_in, money_out, count} = this.currentStats();
    return (
      <div className="styles standardList" style={{ marginTop: 24 }}>
        <Card key="the_card_key" bordered={false}>
          <Row>
            <Col xs={24} sm={12} md={4} lg={4} xl={4}>
              <Statistic
                    title="Saidas"
                    value={money_out}
                    precision={2}
                    valueStyle={{ color: 'red' }}
                    prefix={<Icon type="arrow-down" />}
                  />
            </Col>
            <Col xs={24} sm={12} md={4} lg={4} xl={4}>
              <Statistic
                    title="Transações"
                    value={count|0}
                    precision={0}
                    
                  />
            </Col>
            <Col xs={24} sm={12} md={16} lg={16} xl={16}>
              <Button style={{float:'right'}} key="_new_request" size="medium" icon="plus" onClick={()=>this.onNewRequestClick()}> Request Payment to Provider</Button>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }

  renderFooter(){
    return (<><Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadProviderTxs()}>More!!</Button> </>)
  }

  render() {
    const stats = this.renderTableViewStats();
    const filters = this.renderFilterContent();
    return (
      <>
        <PageHeader
          extra={[
            <Button key="refresh" icon="redo" disabled={this.state.loading} onClick={()=>this.refreshCurrentTable()} ></Button>,
            
          ]}
          breadcrumb={{ routes }}
          title="Providers"
          subTitle="List of payments"
          footer={
           <></>   
          }
        >
        </PageHeader>
        
        {filters}

        {stats}
        
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

      </>
    );
  }
}

export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRole:       loginRedux.actualRole(state),
        actualRoleId:     loginRedux.actualRoleId(state)
    }),
    (dispatch)=>({
        // tryUserState: bindActionCreators(userRedux.tryUserState , dispatch)
    })
)(Providers)));