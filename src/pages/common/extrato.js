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
import RequestsFilter from '@app/components/Filters/requests';

import { notification, Table, Divider, Spin } from 'antd';

import TransactionTable from '@app/components/TransactionTable';
import { DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_EXCHANGES, DISPLAY_PAYMENTS, DISPLAY_REQUESTS, DISPLAY_WITHDRAWS, DISPLAY_PROVIDER, DISPLAY_SEND, DISPLAY_SERVICE} from '@app/components/TransactionTable';
import * as request_helper from '@app/components/TransactionCard/helper';
import * as columns_helper from '@app/components/TransactionTable/columns';

import RequestListWidget from '@app/components/request-list-widget';
import TxListWidget from '@app/components/tx-list-widget';

import * as utils from '@app/utils/utils';

import * as gqlService from '@app/services/inkiriApi/graphql'

const { TabPane } = Tabs;
const { Option } = Select;
const { Search, TextArea } = Input;

// const tabs = {
//   [globalCfg.bank.ACCOUNT_TYPE_BUSINESS]: {
//     [DISPLAY_ALL_TXS]:    'Movements',
//     [DISPLAY_DEPOSIT]:    'Deposits',
//     [DISPLAY_WITHDRAWS]:  'Withdraws',
//     [DISPLAY_PROVIDER]:   'Provider Payments',
//     [DISPLAY_SERVICE]:    'Services',
//     [DISPLAY_PAYMENTS]:   'Payments',
//   },
//   [globalCfg.bank.ACCOUNT_TYPE_PERSONAL]: {
//     [DISPLAY_ALL_TXS]:    'Movements',
//     [DISPLAY_DEPOSIT]:    'Deposits',
//     [DISPLAY_WITHDRAWS]:  'Withdraws',
//     [DISPLAY_EXCHANGES]:  'Exchanges',
//     [DISPLAY_SERVICE]:    'Services',
//     [DISPLAY_PAYMENTS]:   'Payments',
//   },
//   [globalCfg.bank.ACCOUNT_TYPE_FOUNDATION]: {
//     [DISPLAY_ALL_TXS]:    'Movements',
//     [DISPLAY_DEPOSIT]:    'Deposits',
//     [DISPLAY_WITHDRAWS]:  'Withdraws',
//     [DISPLAY_SERVICE]:    'Services',
//     [DISPLAY_PAYMENTS]:   'Payments',
//   }
  
//   // [DISPLAY_REQUESTS] : 'Requests',
// }

const tabs = {
  [globalCfg.bank.ACCOUNT_TYPE_BUSINESS]: {
    [DISPLAY_ALL_TXS]:    'Movements',
    [DISPLAY_REQUESTS]:   'Requests',
  },
  [globalCfg.bank.ACCOUNT_TYPE_PERSONAL]: {
    [DISPLAY_ALL_TXS]:    'Movements',
    [DISPLAY_REQUESTS]:   'Requests'
  },
  [globalCfg.bank.ACCOUNT_TYPE_FOUNDATION]: {
    [DISPLAY_ALL_TXS]:    'Movements',
    [DISPLAY_REQUESTS]:   'Requests'
  }
  
  // [DISPLAY_REQUESTS] : 'Requests',
}


class Extrato extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page_key:            props.location.pathname,
      page_key_operations: `${props.location.pathname}_${DISPLAY_ALL_TXS}`,
      page_key_requests:   `${props.location.pathname}_${DISPLAY_REQUESTS}`,
      
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      loading:             props.isOperationsLoading,
      
      isMobile:            props.isMobile,

      pagination:          { pageSize: 0 , total: 0 },
      
      page_key_values:     props.page_key_values,
      // active_tab:          utils.twoLevelObjectValueOrDefault(props.page_key_values, props.location.pathname, 'active_tab', DISPLAY_ALL_TXS)
      active_tab:          utils.twoLevelObjectValueOrDefault(props.page_key_values, props.location.pathname, 'active_tab', DISPLAY_ALL_TXS)
    };

    this.onTabChange                = this.onTabChange.bind(this);
    
    this.onTransactionClick         = this.onTransactionClick.bind(this);
    this.onRequestClick             = this.onRequestClick.bind(this);

    this.requestFilterCallback      = this.requestFilterCallback.bind(this);
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
        const opers = this.props.operations[this.state.page_key]||this.props.rawOperations;

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

  // Component Events

  requestFilterCallback(error, cancel, values) {
    
    if(cancel)
    {
      return;
    }
    if(error)
    {
      return;
    }


    if(this.table_widget && values!==undefined)
    {
      const that = this;
      setTimeout(()=> {
        that.table_widget.applyFilter(values)
      } ,100);
    }

    console.log(' -- extrato::requestFilterCallback:', values)

  }

  onTabChange(key) {
    this.setState({active_tab:key});
    this.props.setPageKeyValue(this.props.location.pathname, {active_tab:key})
  }
  
  //

  render() {

    const {routes, active_tab, isMobile, page_key_operations, page_key_requests} = this.state;
    const my_tabs = tabs[this.props.actualRoleId];
    const content = (active_tab==DISPLAY_ALL_TXS)
      ? (<TxListWidget the_key={page_key_operations} callback={this.onTransactionClick} />)
      : (<RequestListWidget request_type={DISPLAY_REQUESTS} the_key={page_key_requests} callback={this.onRequestClick} onRef={ref => (this.table_widget = ref)}/>);
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title="Extrato"
          subTitle={`List of ${my_tabs[active_tab]}`}
        >
        </PageHeader>

        <div className="styles standardList" style={{ marginTop: 24 }}>
          <Card key={'card_master'}  
            tabList={ Object.keys(my_tabs).map(key_tab => { return {key: key_tab, tab: my_tabs[key_tab]} } ) }
            activeTabKey={active_tab}
            onTabChange={ (key) => this.onTabChange(key)}
            >

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

        page_key_values:      pageRedux.pageKeyValues(state),
    }),
    (dispatch)=>({
        setPageKeyValue:      bindActionCreators(pageRedux.setPageKeyValue, dispatch),

        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(Extrato)));