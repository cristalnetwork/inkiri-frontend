import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Route, Redirect, withRouter } from "react-router-dom";

import { Radio, Select, Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col, List } from 'antd';
import { Form, Input, Icon} from 'antd';
import { notification, Table, Divider, Spin } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as request_helper from '@app/components/TransactionCard/helper';
import * as columns_helper from '@app/components/TransactionTable/columns';
import {columns,  DISPLAY_PDA, DISPLAY_DEPOSIT, DISPLAY_WITHDRAWS} from '@app/components/TransactionTable';

import * as utils from '@app/utils/utils';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Option } = Select;
const { Search, TextArea } = Input;


class PDA extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :        routesService.breadcrumbForPaths(props.location.pathname),
      loading:        false,
      txs:            [],
      
      page:           -1, 
      limit:           globalCfg.api.default_page_size,
      can_get_more:    true,

      stats:          {}
    };

    this.loadTransactionsForPDA     = this.loadTransactionsForPDA.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.onProcessRequestClick      = this.onProcessRequestClick.bind(this);
  }
  
  componentDidMount(){
    this.loadTransactionsForPDA();  
  } 

  getColumns(){
    // return columns(this.props.actualRoleId, this.onProcessRequestClick)
    return columns_helper.columnsForPDA(this.onProcessRequestClick);
  }

  //
  
  /*
  * Retrieves transactions
  */
  loadTransactionsForPDA(){

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
    
    const req_type = DISPLAY_WITHDRAWS + '|' + DISPLAY_DEPOSIT;
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

    stats = {
        withdraws:     withdraws
        , deposits:    deposits
        , count:       txs.length
        , deposits_ik: deposits_ik 
        , deposits_brl:deposits_brl 
        , pending:     pending};

    this.setState({stats:stats})
  }

  currentStats(){
    const x = this.state.stats;
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
  
  onProcessRequestClick(request){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: `/${this.props.actualRole}/pda-process-request`
      , state: { 
          request: request 
          , referrer: this.props.location.pathname
        }
    })

    // this.props.history.push({
    //   pathname: `/${this.props.actualRole}/pda-process-request`
    //   , state: { request: request }
    // })
  }

  renderFooter(){
    return (<><Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadTransactionsForPDA()}>More!!</Button> </>)
  }

  //
  renderSelectTxTypeOptions(){
    return (
      globalCfg.api.getTypes().map( tx_type => {return(<Option key={'option'+tx_type} value={tx_type} label={utils.firsts(tx_type.split('_')[1])}>{ utils.capitalize(tx_type.split('_')[1]) } </Option>)})
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
      <div className="filter_wrap">
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
    const {routes}  = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={[
            <Button size="small" key="_new_deposit"  icon="plus" disabled> Deposit</Button>,
            <Button size="small" key="_new_withdraw" icon="plus" disabled> Withdraw</Button>,
          ]}
          title="PDA"
          subTitle="List of Deposits and Withdraws"
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
    const {deposits_ik, deposits_brl, withdraws, pending} = this.currentStats();  
    return  (<>
      <div className="styles standardList" style={{ marginTop: 24 }}>
        <Card key="the_card_key" bordered={false}>
          <Row>
            <Col xs={24} sm={12} md={6} lg={4} xl={4}>
              <Statistic title="" value="STATS" />
            </Col>
            <Col xs={24} sm={12} md={6} lg={5} xl={5}>
              <Statistic
                title={globalCfg.currency.symbol + " DEPOSITS"}
                value={deposits_ik}
                precision={2}
                suffix={globalCfg.currency.symbol}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={5} xl={5}>
              <Statistic
                title="BRL DEPOSITS"
                value={deposits_brl}
                precision={2}
                suffix="BRL"
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={5} xl={5}>
              <Statistic
                title="WITHDRAWS"
                value={withdraws}
                precision={2}
                suffix={globalCfg.currency.symbol}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={5} xl={5}>
              <Statistic
                title="PENDING"
                value={pending}
                precision={0}
                valueStyle={{ color: '#fadb14' }}
                prefix={<Icon type="clock-circle" />}
              />
            </Col>
          </Row>
        </Card>

        <Card
          key="card_table_all_requests"
          className="styles listCard"
          bordered={false}
          title="List of Deposits and Withdraws"
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
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(PDA))
);