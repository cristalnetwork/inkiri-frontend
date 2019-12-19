import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

// import * as userRedux from '@app/redux/models/user';
import * as loginRedux from '@app/redux/models/login'
import * as menuRedux from '@app/redux/models/menu';

import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import * as routesService from '@app/services/routes';
import { Route, Redirect, withRouter } from "react-router-dom";
import * as components_helper from '@app/components/helper';

import { Form, Select, Icon, Input, Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';

import { notification, Table, Divider, Spin } from 'antd';

import TransactionTable from '@app/components/TransactionTable';
import {DISPLAY_ALL_TXS, DISPLAY_PAYMENTS, DISPLAY_PROVIDER} from '@app/components/TransactionTable';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as columns_helper from '@app/components/TransactionTable/columns';

import * as utils from '@app/utils/utils';

import { DatePicker } from 'antd';
import moment from 'moment';

const { MonthPicker, RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search, TextArea } = Input;

class Providers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :         routesService.breadcrumbForPaths(props.location.pathname),
      loading:         false,
      txs:             [],
      page:            -1, 
      limit:           globalCfg.api.default_page_size,
      can_get_more:    true,

      stats:                        {},
    };

    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.onTabChange                = this.onTabChange.bind(this);
    this.onTableChange              = this.onTableChange.bind(this);
    this.onNewRequestClick          = this.onNewRequestClick.bind(this);
    this.onProcessRequestClick      = this.onProcessRequestClick.bind(this);
    this.renderFilterContent        = this.renderFilterContent.bind(this);

    this.operationDetails           = this.operationDetails.bind(this);
    this.cancelOperation            = this.cancelOperation.bind(this);
    
    this.getColumns                 = this.getColumns.bind(this);
  }
  
  cancelOperation(record){}
  
  operationDetails(record){
    // HACK
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: '/common/request-details'
      , state: { 
          request: record 
          , referrer: this.props.location.pathname
        }
    })
  }

  getColumns(){
    return columns_helper.getColumnsForRequests(this.operationDetails);
  }
  //
  onNewRequestClick(){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: `/${this.props.actualRole}/providers-payments-request`
      , state: { 
          referrer: this.props.location.pathname
        }
    })
  }

  onProcessRequestClick(request){
    console.log( ' EXTRATO::onProcessRequestClick >> ', JSON.stringify(request) )
  }

  componentDidMount(){
    this.loadProviderTxs(true);
  } 

  reloadData(){
    this.setState({
        page:        -1, 
        txs:    [],
      }, () => {
        this.loadProviderTxs(true);
      });  
  }

  loadProviderTxs = async (first_call) => {
    let can_get_more   = this.state.can_get_more;
    if(!can_get_more && this.state.page>=0)
    {
      this.setState({loading:false});
      return;
    }

    
    this.setState({loading:true});

    let page                = (this.state.page<0)?0:(this.state.page+1);
    const {limit, provider} = this.state;
    let that                = this;
    
    // const req_type = DISPLAY_PROVIDER;
    
    api.bank.listMyRequests(this.props.actualAccountName, page, limit, DISPLAY_PROVIDER)
    .then( (res) => {
        that.onNewData(res, first_call);
        // console.log('---- listMyRequests:', JSON.stringify(res));
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
    else
      this.computeStats();
  }

  computeStats(txs){
    let stats = this.currentStats();
    if(txs===undefined)
      txs = this.state.txs;
    const money_pending  = txs.filter( tx => [globalCfg.api.STATE_REQUESTED, globalCfg.api.STATE_PROCESSING].includes(tx.state))
                    .map(tx =>tx.amount)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const count_pending = txs.filter( tx => [globalCfg.api.STATE_REQUESTED, globalCfg.api.STATE_PROCESSING].includes(tx.state)).length;

    const money_out = txs.filter( tx => [globalCfg.api.STATE_ACCEPTED].includes(tx.state))
                    .map(tx =>tx.amount)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const count = txs.filter( tx => [globalCfg.api.STATE_ACCEPTED].includes(tx.state)).length;

    stats[this.state.active_tab] = { money_pending : money_pending , count_pending : count_pending , money_out : money_out , count : count }
    this.setState({stats:stats})
  }

  currentStats(){
    const x = this.state.stats[this.state.active_tab];
    const _default = {money_pending : 0 , count_pending : 0 , money_out : 0 , count : 0};
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
    const {count_pending, money_pending, money_out, count} = this.currentStats();
    return (
      <div className="styles standardList" style={{ marginTop: 24 }}>
        <Card key="the_card_key" bordered={false}>
          <Row>
            <Col xs={24} sm={12} md={4} lg={4} xl={4}>
              <Statistic
                    title="Pagamentos"
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
            <Col xs={24} sm={12} md={4} lg={4} xl={4}>
              <Statistic
                    title="Pending"
                    value={money_pending}
                    precision={2}
                    valueStyle={{ color: 'yellow' }}
                    prefix={<Icon type="arrow-down" />}
                  />
            </Col>
            <Col xs={24} sm={12} md={4} lg={4} xl={4}>
              <Statistic
                    title="Transações Pending"
                    value={count_pending|0}
                    precision={0}
                    
                  />
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Button style={{float:'right'}} key="_new_request" size="small" type="primary" icon="plus" onClick={()=>this.onNewRequestClick()}> Request Payment to Provider</Button>
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
    const {routes, loading} = this.state; 
    const stats    = this.renderTableViewStats();
    const filters  = this.renderFilterContent();
    return (
      <>
        <PageHeader
          extra={[
            <Button key="refresh" size="small" icon="redo" disabled={loading} onClick={()=>this.reloadData()} ></Button>,
            
          ]}
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title="Providers"
          subTitle="List of payments"
        >
        </PageHeader>
        
        {filters}

        {stats}
        
        <div style={{ margin: '0 0px', paddingLeft: 12, paddingRight: 12, paddingBottom: 12, background: '#fff', height: 'auto', marginTop: 0  }}>
          <Table
            key={"table_"+DISPLAY_ALL_TXS} 
            rowKey={record => record.id} 
            loading={this.state.loading} 
            columns={this.getColumns()} 
            dataSource={this.state.txs} 
            footer={() => this.renderFooter()}
            pagination={this.state.pagination}
            scroll={{ x: 700 }}
            />
        </div>
      </>
    );
  }
}

export default  (withRouter(connect(
    (state)=> ({
        actualAccountName: loginRedux.actualAccountName(state),
        actualRole:        loginRedux.actualRole(state),
        actualRoleId:      loginRedux.actualRoleId(state)
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(Providers)));