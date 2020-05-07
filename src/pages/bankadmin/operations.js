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

import { DISPLAY_REQUESTS} from '@app/components/TransactionTable';

import { injectIntl } from "react-intl";

class Operations extends Component {
  constructor(props) {
    super(props);

    const filter_key = `${props.location.pathname}_filter`;
    const filter     = props.page_key_values && props.page_key_values[filter_key] || {};

    this.state = {
      page_key:            props.location.pathname,
      filter_key:          filter_key,
      filter:              filter,
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      
      need_refresh:        {},  
      keep_search:         this.props.location && this.props.location.state && this.props.location.state.keep_search,
      page_key_values:     props.page_key_values
    };
    
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
    
    if(!utils.objectsEqual(this.state.page_key_values, this.props.page_key_values) )
    {
      const filter     = this.props.page_key_values && this.props.page_key_values[this.state.filter_key] || {};
      new_state = {...new_state, page_key_values: this.props.page_key_values, filter:filter};
    }

    if(Object.keys(new_state).length>0)      
      this.setState(new_state);
  }

  render() {

    const {routes, isMobile, filter, filter_key, keep_search} = this.state;
    const _filter = (keep_search==true)
      ?filter
      :{};
    
    console.log('++PAGE_OPERATIONS::FILTER:STATE:', filter);
    console.log('++PAGE_OPERATIONS::FILTER:TO-PASS:', _filter);

    console.log('???keep_search:' , keep_search);

    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={this.props.intl.formatMessage({id:'pages.bankadmin.operations.title'})}
        >
        </PageHeader>

        <Card
          key="card_master"
          className="operations"
          bordered={false}
          style={{ marginTop: 24 }}
          headStyle={{display:'none'}}
        >
          <RequestListWidget 
            filter={_filter}
            request_type={DISPLAY_REQUESTS} 
            the_key={filter_key} 
            callback={this.onRequestClick} 
            onRef={ref => (this.table_widget = ref)}/>

        </Card>
      </>
    );
  }

}

//
export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:          loginRedux.actualAccountName(state),
        actualRole:                 loginRedux.actualRole(state),
        actualRoleId:               loginRedux.actualRoleId(state),
        page_key_values:            pageRedux.pageKeyValues(state),
    }),
    (dispatch)=>({
        setLastRootMenuFullpath:    bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(injectIntl(Operations))));