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

import TransactionTable from '@app/components/TransactionTable';
//import {columns,  DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_EXCHANGES, DISPLAY_PAYMENTS, DISPLAY_REQUESTS, DISPLAY_WITHDRAWS, DISPLAY_PROVIDER, DISPLAY_SEND, DISPLAY_SERVICE} from '@app/components/TransactionTable';
import {columns,  DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_WITHDRAWS} from '@app/components/TransactionTable';

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

const routes = routesService.breadcrumbForFile('pda');

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

class PDA extends Component {
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

    this.loadTransactionsForPDA     = this.loadTransactionsForPDA.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    // this.onTabChange                = this.onTabChange.bind(this);
    this.onTableChange              = this.onTableChange.bind(this);
    this.onProcessRequestClick      = this.onProcessRequestClick.bind(this);
  }
  
  componentDidMount(){
    this.loadTransactionsForPDA();  
  } 

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
    console.log( ' PDA::onProcessRequestClick >> ', JSON.stringify(request) )

    this.props.history.push({
      pathname: `/${this.props.actualRole}/process-request`
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
    return (<><Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadTransactionsForPDA()}>More!!</Button> </>)
  }

  renderFilterContent (){
    const form = this.renderFilterForm();
    return(
      <div className="wrap">
        <Row>
          <Col span={24}>
            {form}
          </Col>
        </Row>
      </div>
    );
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
  renderFilterForm() {
    return (
      <Form layout="inline" onSubmit={this.handleSubmit}>
        <Form.Item>
            <Select placeholder="Transaction type"
              mode="multiple"
              style={{ minWidth: '250px' }}
              defaultValue={['ALL']}
              optionLabelProp="label">
                {this.renderSelectTxTypeOptions()}
            </Select>
        </Form.Item>
        <Form.Item>
          <Select placeholder="Transaction status"
              mode="multiple"
              style={{ minWidth: '250px' }}
              defaultValue={['ALL']}
              optionLabelProp="label">
                {this.renderSelectTxStateOptions()}
            </Select>
        </Form.Item>
        <Form.Item>
            <Search className="styles extraContentSearch" placeholder="Search" onSearch={() => ({})} />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit">
            Filter
          </Button>
        </Form.Item>
      </Form>
    );
  }

  
  render() {
    //
    const filters = this.renderFilterContent();
    const content = this.renderUMIContent();
    return (
      <>
        <PageHeader
          extra={[
            <Button key="_new_deposit"  icon="plus"> Deposit</Button>,
            <Button key="_new_withdraw" icon="plus"> Withdraw</Button>,
          ]}
          breadcrumb={{ routes }}
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
    const current_stats = this.currentStats();  
    return  (<>
      <div className="styles standardList" style={{ marginTop: 24 }}>
        <Card bordered={false}>
          <Row>
            <Col sm={4} xs={24}>
              <Info title="" value="TODAY" bordered />
            </Col>
            <Col sm={5} xs={24}>
              <Info title="IK$ DEPOSITS" value={'IK$ ' + current_stats.deposits_ik.toFixed(2)} bordered />
            </Col>
            <Col sm={5} xs={24}>
              <Info title="BRL DEPOSITS" value={'BRL ' + current_stats.deposits_brl.toFixed(2)} bordered />
            </Col>
            <Col sm={5} xs={24}>
              <Info title="WITHDRAWS" value={'IK$ ' + current_stats.withdraws.toFixed(2)} />
            </Col>
            <Col sm={5} xs={24}>
              <Info title="PENDING" value={current_stats.pending.toString()} />
            </Col>
          </Row>
        </Card>

        <Card
          className="styles listCard"
          bordered={false}
          title="List of Deposits and Withdraws"
          style={{ marginTop: 24 }}
          bodyStyle={{ padding: '0 32px 40px 32px' }}
          extra={this.renderExtraContent()}
        >
          <Button type="dashed" style={{ display:'none', width: '50%', marginBottom: 8 }} key="_new_deposit"  icon="plus"> Deposit</Button>
          <Button type="dashed" style={{ display:'none',width: '50%', marginBottom: 8 }} key="_new_withdraw" icon="plus"> Withdraw</Button>
          
          <Table
            key="table_all_txs" 
            rowKey={record => record.id} 
            loading={this.state.loading} 
            columns={columns(this.props.actualRoleId, this.onProcessRequestClick)} 
            dataSource={this.state.txs} 
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
)(PDA))
);