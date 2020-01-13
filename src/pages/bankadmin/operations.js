import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as pageRedux from '@app/redux/models/page'
import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import { Route, Redirect, withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Tooltip, Form, Select, Icon, Input, Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';

import {  Table, Divider, Spin } from 'antd';

import RequestListWidget from '@app/components/request-list-widget';
import TxListWidget from '@app/components/tx-list-widget';

import * as request_helper from '@app/components/TransactionCard/helper';
import * as columns_helper from '@app/components/TransactionTable/columns';
import * as utils from '@app/utils/utils';
import * as ui_helper from '@app/components/helper';

import { DISPLAY_PDA, DISPLAY_EXTERNAL, DISPLAY_ALL_TXS, DISPLAY_REQUESTS} from '@app/components/TransactionTable';

import { injectIntl } from "react-intl";

const { TabPane } = Tabs;


const tabs = {
  [DISPLAY_REQUESTS] :  'requests', 
  [DISPLAY_ALL_TXS] :   'blockchain_transactions',       
  
  // [DISPLAY_PDA] :       'Deposits & Withdraws requests', 
  // [DISPLAY_EXTERNAL] :  'External transfers requests',   
}

class Operations extends Component {
  constructor(props) {
    super(props);

    
    this.state = {
      page_key:            props.location.pathname,
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      
      page_keys: {
         [DISPLAY_ALL_TXS] :   `${props.location.pathname}_${DISPLAY_ALL_TXS}`,
         [DISPLAY_PDA] :       `${props.location.pathname}_${DISPLAY_PDA}`,
         [DISPLAY_EXTERNAL] :  `${props.location.pathname}_${DISPLAY_EXTERNAL}`,
         [DISPLAY_REQUESTS] :  `${props.location.pathname}_${DISPLAY_REQUESTS}`
       },
      
      need_refresh:        {},  

      page_key_values:     props.page_key_values,
      active_tab:          utils .twoLevelObjectValueOrDefault(props.page_key_values, props.location.pathname, 'active_tab', DISPLAY_REQUESTS)
      // active_tab:           DISPLAY_ALL_TXS
    };


    this.onTabChange                = this.onTabChange.bind(this);
    
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

    //pathname: `/${this.props.actualRole}/external-transfers-process-request`
    this.props.history.push({
      pathname: `/${this.props.actualRole}/process-request`
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

  // computeStats(txs){
  //   let stats = this.currentStats();
  //   if(txs===undefined)
  //     txs = this.state.txs;
  //   const money_in  = txs.filter( tx => request_helper.blockchain.isNegativeTransaction(tx)===false 
  //                                       && request_helper.blockchain.isValidTransaction(tx))
  //                   .map(tx =>tx.amount)
  //                   .reduce((acc, amount) => acc + Number(amount), 0);
  //   const money_out = txs.filter( tx => request_helper.blockchain.isNegativeTransaction(tx)
  //                                       && request_helper.blockchain.isValidTransaction(tx))
  //                   .map(tx =>tx.amount)
  //                   .reduce((acc, amount) => acc + Number(amount), 0);
    
  //   stats[this.state.active_tab] = {money_out:money_out||0, money_in:money_in||0, count:txs.length}
  //   this.setState({stats:stats})
  // }

  onTabChange(key) {
    this.setState({active_tab:key});
    this.props.setPageKeyValue(this.props.location.pathname, {active_tab:key})
  }

  render() {

    const {routes, active_tab, isMobile, page_keys} = this.state;
    const widget_key = page_keys[active_tab];
    
    const content = (active_tab==DISPLAY_ALL_TXS)
      ? (<TxListWidget the_key={widget_key} callback={this.onTransactionClick} />)
      : (<RequestListWidget request_type={active_tab} the_key={widget_key} callback={this.onRequestClick} onRef={ref => (this.table_widget = ref)}/>);
    
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={this.props.intl.formatMessage({id:'pages.bankadmin.operations.title'})}
        >
        </PageHeader>

        <div className="styles standardList" style={{ marginTop: 24 }}>
          <Card key={'card_master'}  
            tabList={ Object.keys(tabs).map(key_tab => { return {key: key_tab, tab: this.props.intl.formatMessage({id:`pages.bankadmin.operations.tab.${tabs[key_tab]}`}) } } ) }
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
        
        page_key_values:      pageRedux.pageKeyValues(state),
    }),
    (dispatch)=>({
        setPageKeyValue:      bindActionCreators(pageRedux.setPageKeyValue, dispatch),

        setLastRootMenuFullpath:      bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(injectIntl(Operations))));