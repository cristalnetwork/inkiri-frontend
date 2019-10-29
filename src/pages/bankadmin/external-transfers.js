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

import {columns,  DISPLAY_ALL_TXS, DISPLAY_PROVIDER, DISPLAY_EXCHANGES} from '@app/components/TransactionTable';

import * as utils from '@app/utils/utils';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as request_helper from '@app/components/TransactionCard/helper';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Option } = Select;
const { Search, TextArea } = Input;

const routes = routesService.breadcrumbForFile('external-transfers');

//

class ExternalTransfers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:        false,
      txs:            [],
      
      page:           -1, 
      limit:           globalCfg.api.default_page_size,
      can_get_more:    true,

      stats:          {},
      active_tab:     DISPLAY_ALL_TXS
    };

    this.loadExternalTxs            = this.loadExternalTxs.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    // this.onTabChange                = this.onTabChange.bind(this);
    this.onTableChange              = this.onTableChange.bind(this);
    this.onProcessRequestClick      = this.onProcessRequestClick.bind(this);
  }
  
  componentDidMount(){
    this.loadExternalTxs();  
  } 

  getColumns(){
    return [
      {
        title: 'Date',
        dataIndex: 'block_time',
        key: 'block_time',
        sortDirections: ['descend'],
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.block_time_number - b.block_time_number,
      },
      {
        title: 'Description',
        dataIndex: 'sub_header',
        key: 'sub_header',
        render: (value, record) => {
          return(<>{record.sub_header_admin}</>)
        }
      },
      //
      {
        title: 'Amount',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'right',
        render: (quantity, record) => (
          <span>
            {globalCfg.currency.toCurrencyString(quantity)}
          </span>
          )
      },
      //
      {
        title: 'Tags',
        key: 'tx_type',
        dataIndex: 'tx_type',
        render: (tx_type, record) => {

          return (
              <span key={'tags'+record.id}>
               {request_helper.getTypeTag(record)}
               <br/>
               {request_helper.getStateTag(record)}
               <br/><br/>
               <Tag color={'magenta'} key={'provider_'+record.id}>
                      {record.provider.name + ' - CNPJ:'+ record.provider.cnpj}
               </Tag>
               
               <br/><br/>
               {request_helper.getGoogleDocLinkOrNothing(record.attach_nota_fiscal_id, true, 'Nota fiscal')}
               {request_helper.getGoogleDocLinkOrNothing(record.attach_boleto_pagamento_id, true, 'Boleto Pagamento')}
               {request_helper.getGoogleDocLinkOrNothing(record.attach_comprobante_id, true, 'Comprobante Bancario')}
              </span>
              )}
      },
      //
      {
        title: 'Action',
        key: 'action',
        width: 100,
        render: (text, record) => {
          // const processButton = (<Button key={'details_'+record.id} size="small" onClick={()=>{ this.onProcessRequestClick(record) }}>Process</Button>);
          const processButton     = request_helper.getProcessButton(record, this.onProcessRequestClick);
          const viewDetailsButton = request_helper.getBlockchainLink(record, true, 'small');

            return (
              <span>
                {viewDetailsButton}
                <Divider type="vertical" />
                {processButton}
              </span>  );
        }
      },
    ];
  }
  
  //
  loadExternalTxs(){

    let can_get_more   = this.state.can_get_more;
    if(!can_get_more)
    {
      this.setState({loading:false});
      return;
    }

    
    this.setState({loading:true});

    let page           = (this.state.page<0)?0:(this.state.page+1);
    const limit          = this.state.limit;
    let that           = this;
    
    const req_type = DISPLAY_EXCHANGES + '|' + DISPLAY_PROVIDER;
    const account_name = undefined;
    
    api.bank.listRequests(page, limit, req_type, account_name)
    .then( (res) => {
        that.onNewData(res);
      } ,(ex) => {
        // console.log('---- ERROR:', JSON.stringify(ex));
        that.setState({loading:false});  
      } 
    );
    
  }

  onNewData(txs){
    
    const _txs            = [...this.state.txs, ...txs];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _txs.length;
    pagination.total      = _txs.length;

    const has_received_new_data = (txs && txs.length>0);

    this.setState({pagination:pagination, txs:_txs, can_get_more:(has_received_new_data && txs.length==this.state.limit), loading:false})

    if(!has_received_new_data)
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
    const deposits      = txs.filter( tx => globalCfg.api.isDeposit(tx))
                    .map(tx =>tx.quantity)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const withdraws     = txs.filter( tx => globalCfg.api.isWithdraw(tx))
                    .map(tx =>tx.quantity)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    
    const deposits_ik   = txs.filter( tx => globalCfg.api.isIKDeposit(tx))
                    .map(tx =>tx.quantity)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const deposits_brl  = txs.filter( tx => globalCfg.api.isBRLDeposit(tx))
                    .map(tx =>tx.quantity)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const pending      = txs.filter( tx => globalCfg.api.isProcessPending(tx))
                    .map(tx =>tx.quantity).length;

    stats[this.state.active_tab] = {
        withdraws:     withdraws
        , deposits:    deposits
        , count:       txs.length
        , deposits_ik: deposits_ik 
        , deposits_brl:deposits_brl 
        , pending:     pending};

    this.setState({stats:stats})
  }

  currentStats(){
    const x = this.state.stats[this.state.active_tab];
    const _default = {deposits:0 
              , withdraws:0
              , count:0
              , deposits_ik:0
              , deposits_brl:0
              , pending:0};
    return x?x:_default;
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  // Component Events
  
  onTableChange(key, txs) {
    // console.log(key);
    // this.setState({active_tab:key})
    if(key==this.state.active_tab )
      this.computeStats(txs);
  }

  onProcessRequestClick(request){
    
    // console.log( ' ExternalTransfers::onProcessRequestClick >> ', JSON.stringify(request) )
    this.props.history.push({
      pathname: `/${this.props.actualRole}/external-transfers-process-request`
      // , search: '?query=abc'
      , state: { request: request }
    })

    // this.props.history.push({
    //   pathname: '/template',
    //   search: '?query=abc',
    //   state: { detail: response.data }
    // })
    // READ >> this.props.location.state.detail
  }

  renderFooter(){
    return (<><Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadExternalTxs()}>More!!</Button> </>)
  }

  //
  renderSelectTxTypeOptions(){
    return (
      [globalCfg.api.TYPE_PROVIDER, globalCfg.api.TYPE_EXCHANGE ].map( tx_type => {return(<Option key={'option'+tx_type} value={tx_type} label={utils.firsts(tx_type.split('_')[1])}>{ utils.capitalize(tx_type.split('_')[1]) } </Option>)})
        )
  }
  // 
  renderSelectTxStateOptions(){
    return (
      globalCfg.api.getStates().map( tx_state => {return(<Option key={'option'+tx_state} value={tx_state} label={utils.firsts(tx_state.split('_')[1])}>{ utils.capitalize(tx_state.split('_')[1]) } </Option>)})
        )
  }
  //
  renderFilterContent() {
    return (
      <div className="wrap">
        <Row>
          <Col span={24}>
            <Form layout="inline" className="filter_form" onSubmit={this.handleSubmit}>
              <Form.Item label="Transaction type">
                  <Select placeholder="Transaction type"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">
                      {this.renderSelectTxTypeOptions()}
                  </Select>
              </Form.Item>
              <Form.Item label="Transaction status">
                <Select placeholder="Transaction status"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">
                      {this.renderSelectTxStateOptions()}
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

  
  render() {
    //
    const filters = this.renderFilterContent();
    const content = this.renderUMIContent();
    return (
      <>
        <PageHeader
          breadcrumb={{ routes }}
          title="External Transfers"
          subTitle="List of Provider Payments and Exchanges"
        >
          
        </PageHeader>
        {filters}
        {content}

      </>
    );
  }
//
  renderExtraContent (){ 
    
    return(
      <div className="styles extraContent" style={{display:'none'}}>
        <RadioGroup defaultValue="all">
          <RadioButton value="all">all</RadioButton>
          <RadioButton value="progress">progress</RadioButton>
          <RadioButton value="waiting">waiting</RadioButton>
        </RadioGroup>&nbsp;
        <Search className="styles extraContentSearch" placeholder="Search" onSearch={() => ({})} />
      </div>
    )};

    //
  
  renderUMIContent(){
    const {exchanges, exchanges_pending, providers, providers_pending, total_out} = this.currentStats();  
    return  (<>
      <div className="styles standardList" style={{ marginTop: 24 }}>
        <Card key="the_card_key" bordered={false}>
          <Row>
            <Col xs={24} sm={12} md={6} lg={4} xl={4}>
              <Statistic title="" value="STATS" />
            </Col>
            <Col xs={24} sm={12} md={6} lg={4} xl={4}>
              <Statistic
                title={"EXCHANGES"}
                value={exchanges}
                precision={2}
                suffix={globalCfg.currency.symbol}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={4} xl={4}>
              <Statistic
                title={"EXCHANGES PENDING"}
                value={exchanges_pending}
                precision={2}
                valueStyle={{ color: '#fadb14' }}
                prefix={<Icon type="clock-circle" />}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={4} xl={4}>
              <Statistic
                title="PROVIDERS PAY"
                value={providers}
                precision={2}
                suffix={globalCfg.currency.symbol}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={4} xl={4}>
              <Statistic
                title="PROVIDERS PAY PENDING"
                value={providers_pending}
                precision={2}
                valueStyle={{ color: '#fadb14' }}
                prefix={<Icon type="clock-circle" />}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={4} xl={4}>
              <Statistic
                title="TOTAL OUT"
                value={total_out}
                precision={0}
                valueStyle={{ color: '#cf1322' }}
                suffix={globalCfg.currency.symbol}
              />
            </Col>
          </Row>
        </Card>

        <Card
          key="card_table_all_requests"
          className="styles listCard"
          bordered={false}
          title="List of Provider Payments and Exchanges"
          style={{ marginTop: 24 }}
          extra={this.renderExtraContent()}
        >
          <Table
            key="table_all_requests" 
            rowKey={record => record.id} 
            loading={this.state.loading} 
            columns={this.getColumns()} 
            dataSource={this.state.txs} 
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
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRoleId:     loginRedux.actualRoleId(state),
        actualRole:       loginRedux.actualRole(state),
    }),
    (dispatch)=>({
        // tryUserState: bindActionCreators(userRedux.tryUserState , dispatch)
    })
)(ExternalTransfers))
);