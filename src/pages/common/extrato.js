import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'
import * as operationsRedux from '@app/redux/models/operations'
import * as pageRedux from '@app/redux/models/page'

import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import { Route, Redirect, withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Tooltip, Form, Select, Icon, Input, Card, PageHeader, Tag, Tabs, Button, Row, Col } from 'antd';
import TableStats, { buildItemUp, buildItemDown, buildItemCompute, buildItemSimple} from '@app/components/TransactionTable/stats';
import OperationsFilter from '@app/components/Filters/operations';

import { notification, Table, Divider, Spin } from 'antd';

import TransactionTable from '@app/components/TransactionTable';
import { DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_EXCHANGES, DISPLAY_PAYMENTS, DISPLAY_REQUESTS, DISPLAY_WITHDRAWS, DISPLAY_PROVIDER, DISPLAY_SEND, DISPLAY_SERVICE} from '@app/components/TransactionTable';
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
  [globalCfg.bank.ACCOUNT_TYPE_BUSINESS]: {
    [DISPLAY_ALL_TXS]:    'Movements',
    [DISPLAY_DEPOSIT]:    'Deposits',
    [DISPLAY_WITHDRAWS]:  'Withdraws',
    [DISPLAY_PROVIDER]:   'Provider Payments',
    [DISPLAY_SERVICE]:    'Services',
    [DISPLAY_PAYMENTS]:   'Payments',
  },
  [globalCfg.bank.ACCOUNT_TYPE_PERSONAL]: {
    [DISPLAY_ALL_TXS]:    'Movements',
    [DISPLAY_DEPOSIT]:    'Deposits',
    [DISPLAY_WITHDRAWS]:  'Withdraws',
    [DISPLAY_EXCHANGES]:  'Exchanges',
    [DISPLAY_SERVICE]:    'Services',
    [DISPLAY_PAYMENTS]:   'Payments',
  }
  
  // [DISPLAY_REQUESTS] : 'Requests',
}


class Extrato extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      loading:             props.isOperationsLoading,
      txs:                 props.operations,
      cursor:              props.operationsCursor,
      filter_key_values:   props.filterKeyValues,

      isMobile:            props.isMobile,

      stats:               {},
      
      need_refresh:        {},  

      pagination:          { pageSize: 0 , total: 0 },
      
      //active_tab:          DISPLAY_ALL_TXS
      page_key_values:     props.page_key_values,
      active_tab:          utils .twoLevelObjectValueOrDefault(props.page_key_values, props.location.pathname, 'active_tab', DISPLAY_ALL_TXS)
    };

    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onTabChange                = this.onTabChange.bind(this);
    this.onTableChange              = this.onTableChange.bind(this);
    
    this.refreshCurrentTable        = this.refreshCurrentTable.bind(this);

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
      pathname: '/common/request-details'
      , state: { 
          request: request 
          , referrer: this.props.location.pathname
        }
    })
  }

  componentDidMount(){
    this.loadBlockchainTXs();
  } 

  loadBlockchainTXs = () => {
    const {txs, active_tab} = this.state;
    if((!txs||txs.length==0)&&active_tab==DISPLAY_ALL_TXS)
      this.props.loadBlockchainOperations();
  } 

  componentDidUpdate(prevProps, prevState) 
  {
      let new_state = {};
      if(this.props.isMobile!=prevProps.isMobile)
      {
        new_state = {...new_state, isMobile:this.props.isMobile};
      }

      if(prevProps.operations !== this.props.operations )
      {
        const opers = this.props.operations;
        const pagination    = {...this.state.pagination};
        pagination.pageSize = opers.length;
        pagination.total    = opers.length;
        new_state = {...new_state, txs: opers, pagination:pagination};
        this.computeStats(opers);
        // console.log(JSON.stringify(opers))
      }
      if(prevProps.operationsCursor !== this.props.operationsCursor )
      {
        new_state = {...new_state, cursor: this.props.operationsCursor};
      }
      if(prevProps.isOperationsLoading !== this.props.isOperationsLoading )
      {
        new_state = {...new_state, loading: this.props.isOperationsLoading};
      }
      
      if(prevProps.filterKeyValues !== this.props.filterKeyValues)
      {
        // new_state = {...new_state, filter: this.props.filterKeyValues};        
      }

      if(prevProps.page_key_values !== this.props.page_key_values )
      {
        const active_tab = utils .twoLevelObjectValueOrDefault(this.props.page_key_values, this.props.location.pathname, 'active_tab', DISPLAY_ALL_TXS)
        new_state = {...new_state
            , page_key_values: this.props.page_key_values
            , active_tab: active_tab};        

      }

      if(Object.keys(new_state).length>0)      
        this.setState(new_state);


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
    const that = this;
    const {active_tab} = this.state;
    
    if(active_tab==DISPLAY_ALL_TXS)
    {
      this.props.loadBlockchainOperations();
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
    //this.setState({active_tab:key})
    this.setState({active_tab:key}, 
        ()=>{
          this.loadBlockchainTXs();
        });
    this.props.setPageKeyValue(this.props.location.pathname, {active_tab:key})
  }
  
  onTableChange(key, txs) {
    // console.log(key);
    // this.setState({active_tab:key})
    if(key==this.state.active_tab )
      this.computeStats(txs);
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
    return (<><Button key="load-more-data" disabled={!this.state.cursor} onClick={()=>this.loadOldBlockchainOperations(false)}>More!!</Button> </>)
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
    if(this.state.active_tab==DISPLAY_PROVIDER){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_PROVIDER} 
          need_refresh={this.state.need_refresh[DISPLAY_PROVIDER]}
          request_type={DISPLAY_PROVIDER} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          />
      );
    }

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
        <>
          <div className="code-box-actions">
            <Tooltip title="Refresh! Click to  load new operations.">
              <Button 
                type="link" 
                icon="down" 
                onClick={() => this.props.loadNewBlockchainOperations()} 
                style={{color:'#697B8C', width:250}} 
                disabled={this.props.isOperationsLoading} 
                />
            </Tooltip>
          </div>
          <Table
            key={"table_"+DISPLAY_ALL_TXS} 
            rowKey={record => record.id} 
            loading={this.state.loading} 
            columns={ columns_helper.getColumnsBlockchainTXs(this.onTransactionClick)} 
            dataSource={this.state.txs} 
            footer={() => this.renderFooter()}
            pagination={this.state.pagination}
            scroll={{ x: 700 }}
            />
        </>
      );
    
    }

    return (<div style={{ margin: '0 0px', background: '#fff', minHeight: 360, marginTop: 0  }}>
      {content}</div>)
  }
  //
  render() {
    const {routes, active_tab, isMobile} = this.state;
    const content              = this.renderContent();
    const stats                = this.renderTableViewStats();
    const my_tabs              = tabs[this.props.actualRoleId];
    
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
            tabList={ Object.keys(my_tabs).map(key_tab => { return {key: key_tab, tab: my_tabs[key_tab]} } ) }
            activeTabKey={active_tab}
            onTabChange={ (key) => this.onTabChange(key)}
            >

              { 
                isMobile
                  ?(null)
                  :<OperationsFilter the_key="__key__main_operations_list" /> 
              }

              {stats}
              
              {content}

          </Card>
        </div>
      </>
    );
  }
}

//
export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRole:           loginRedux.actualRole(state),
        actualRoleId:         loginRedux.actualRoleId(state),
        isMobile :            menuRedux.isMobile(state),

        operations:           operationsRedux.operations(state),
        isOperationsLoading:  operationsRedux.isOperationsLoading(state),
        operationsCursor:     operationsRedux.operationsCursor(state),
        filterKeyValues:      operationsRedux.filterKeyValues(state),
    

        page_key_values:      pageRedux.pageKeyValues(state),
    }),
    (dispatch)=>({
        setPageKeyValue:              bindActionCreators(pageRedux.setPageKeyValue, dispatch),


        loadOldBlockchainOperations:  bindActionCreators(operationsRedux.loadOldBlockchainOperations, dispatch),
        loadBlockchainOperations:     bindActionCreators(operationsRedux.loadBlockchainOperations, dispatch),
        loadNewBlockchainOperations:  bindActionCreators(operationsRedux.loadNewBlockchainOperations, dispatch),

        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(Extrato)));