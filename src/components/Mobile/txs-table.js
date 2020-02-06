import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';
import * as gqlService from '@app/services/inkiriApi/graphql'
import * as gqlRequestI18nService from '@app/services/inkiriApi/requests-i18n-graphql-helper'

import {ResizeableTable} from '@app/components/TransactionTable/resizable_columns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Dropdown, Icon, Menu, Button, Table, DatePicker } from 'antd';
import moment from 'moment';

import * as columns_helper from '@app/components/TransactionTable/columns';
import * as components_helper from '@app/components/helper';

import InjectMessage from "@app/components/intl-messages";
import { injectIntl } from "react-intl";

export const  DISPLAY_ALL_TXS    = 'all_txs';
export const  DISPLAY_REQUESTS   = 'type_all';
export const  DISPLAY_DEPOSIT    = globalCfg.api.TYPE_DEPOSIT;
export const  DISPLAY_EXCHANGES  = globalCfg.api.TYPE_EXCHANGE;
export const  DISPLAY_PAYMENTS   = globalCfg.api.TYPE_PAYMENT;
export const  DISPLAY_PROVIDER   = globalCfg.api.TYPE_PROVIDER;
export const  DISPLAY_WITHDRAWS  = globalCfg.api.TYPE_WITHDRAW;
export const  DISPLAY_SEND       = globalCfg.api.TYPE_SEND;
export const  DISPLAY_SERVICE    = globalCfg.api.TYPE_SERVICE;

export const  DISPLAY_PDA        = globalCfg.api.TYPE_DEPOSIT+'|'+globalCfg.api.TYPE_WITHDRAW;
export const  DISPLAY_EXTERNAL   = globalCfg.api.TYPE_EXCHANGE+'|'+globalCfg.api.TYPE_PROVIDER;

export const REQUEST_MODE_BANK_TRANSFERS = 'request_mode_bank_trasnfers';
export const REQUEST_MODE_EXTRATO        = 'request_mode_extrato';
export const REQUEST_MODE_ALL            = 'request_mode_all';
export const REQUEST_MODE_INNER_PAGE     = 'request_mode_inner_page';

//
class TxsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txs:               [],
      page:              -1, 
      loading:           false,
      limit:             globalCfg.api.default_page_size,
      can_get_more:      true,
      mode:              props.mode,
      filter:            props.filter,
      requests_filter:   {},

      
    };
    // this.handleChange      = this.handleChange.bind(this);
    this.onNewData           = this.onNewData.bind(this);
    this.renderFooter        = this.renderFooter.bind(this); 
    this.getColumnsForType   = this.getColumnsForType.bind(this);
    this.applyFilter         = this.applyFilter.bind(this);
    this.refresh             = this.refresh.bind(this);
    
  }

  getColumnsForType =() =>{

    const processWages = this.props.isPersonal;
    return columns_helper.getColumnsForMobileExtrato(
              this.props.callback
              , false
              , {  process_wages:processWages, account_name:this.props.actualAccountName}
              , this.props.actualAccountName);
  }
  
  
  componentDidMount(){
    if(typeof this.props.onRef==='function')
    {
      this.props.onRef(this);
    }

    this.loadTxs();
  }
  
  componentWillUnmount() {
    if(typeof this.props.onRef==='function')
      this.props.onRef(undefined)
  }

  applyFilter = (filter) =>{
    console.log(' -- table-widget::applyFilter:', filter)
    this.setState({
      requests_filter:filter
    },() => {
      this.refresh();
    });
  }

  renderFooter(){
    return (<><Button key={'load-more-data_'+this.props.request_type} disabled={!this.state.can_get_more} onClick={()=>this.loadTxs()}>
                <InjectMessage id="components.TransactionTable.index.load_more_records" />
              </Button> </>)
  }

  refresh(){
    const that = this;
    this.setState({
      txs:[]
      , can_get_more:true
      , page:-1}
    , ()=>{
      that.loadTxs();
    })
    return;
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.need_refresh !== prevProps.need_refresh && this.props.need_refresh) {
      this.refresh();
    }
    if (this.props.mode !== prevProps.mode) {
      this.setState({mode: this.props.mode});
    }
    
    if (this.props.filter !== prevProps.filter) {
      this.setState({filter: this.props.filter});
    } 
  }

  getCurrentFilter = (increase_page_if_needed) => {
    const {can_get_more, requests_filter, filter}   = this.state;
    const account_name = this.props.isAdmin?'':this.props.actualAccountName;
    const account_name_filter = !this.props.isAdmin? {account_name:this.props.actualAccountName}:{};
    const page           = (this.state.page<0)
      ?0
      :(increase_page_if_needed
        ?this.state.page+1
        :this.state.page);
    const limit          = this.state.limit;
    
    if(this.state.mode==REQUEST_MODE_EXTRATO)
    {
      const filter_obj = {limit, page, account_name, ...requests_filter, ...(filter||{})};
      return filter_obj;
      
    }

    const requested_type = this.props.request_type==DISPLAY_REQUESTS?'':this.props.request_type;
    if(!this.props.isAdmin && (requests_filter.to||requests_filter.from))
    {
      if(requests_filter.to)
      {  
        requests_filter.from=account_name;
      }
      else
        if(requests_filter.from)
        {
          requests_filter.to=account_name;
        }
    }
    const filter_obj = {limit, account_name, page, requested_type, ...requests_filter, ...(filter||{}), ...(account_name_filter||{})};
    // console.log(' ---- TransactionTable filter_obj:', filter_obj);
    // console.log(' ---- TransactionTable default filter:', filter)
    return filter_obj;
  }

  loadTxs = async () =>{

    const {can_get_more}   = this.state;
    if(!can_get_more)
    {
      this.setState({loading:false});
      return;
    }
    
    this.setState({loading:true});

    const filter_obj = this.getCurrentFilter(true);
    if(!filter_obj)
      return;

    const that       = this;
    let data = null;

    // console.log(' ====================== request-table -> ', filter_obj)
    try{
      if(this.state.mode==REQUEST_MODE_EXTRATO)  
        data = await gqlRequestI18nService.extrato(filter_obj, this.props.intl);
      else
        data = await gqlRequestI18nService.requests(filter_obj, this.props.intl);
      that.onNewData(data);
    }
    catch(e)
    {
      this.setState({loading:false});
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'components.TransactionTable.index.error_loading'}), e);
      return;
    }
    
  }

  onNewData(txs){
    
    if(!txs || !txs.length) txs = [];
    const _txs            = [...this.state.txs, ...txs];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _txs.length;
    pagination.total      = _txs.length;

    const has_received_new_data = (txs && txs.length>0);

    const {page}   = this.state;
    const the_page = has_received_new_data?(page+1):page;
    this.setState({
      page:           the_page,
      pagination:     pagination, 
      txs:            _txs, 
      can_get_more:   (has_received_new_data && txs.length==this.state.limit), 
      loading:        false
    });

    if(!has_received_new_data)
    {
      const end_of_list           = this.props.intl.formatMessage({id:'components.TransactionTable.index.end_of_list'})
      const no_records_for_filter = this.props.intl.formatMessage({id:'components.TransactionTable.index.no_records_for_filter'})
      const msg = (page>0)
        ?end_of_list
        :no_records_for_filter;
      components_helper.notif.infoNotification(msg)
    }
    else
      if(typeof this.props.onChange === 'function') {
        this.props.onChange(this.props.request_type, this.state.txs);
      }
  }

 
  
  
  render(){
    
    return (
      <ResizeableTable 
        key={'tx_table__'+this.props.request_type}
        rowKey={record => record._id} 
        loading={this.state.loading} 
        columns_def={this.getColumnsForType()} 
        dataSource={this.state.txs} 
        footer={() => this.renderFooter()}
        pagination={this.state.pagination}
        scroll={{ x: 950 }}
        rowClassName={ (record, rowIndex) => {
                  return (rowIndex%2==0)
                    ? 'even'
                    : 'odd';
            }}
        onRow={ (record, rowIndex) => {
                  return { 
                    onDoubleClick: event => { this.props.callback(record) }
                  };
            }}
      />
      
    )
  }

}

export default connect(
    (state)=> ({
      actualAccountName: loginRedux.actualAccountName(state),
      actualRoleId:      loginRedux.actualRoleId(state),
      isPersonal:        loginRedux.isPersonal(state),
      isBusiness:        loginRedux.isBusiness(state),
      isAdmin:           loginRedux.isAdmin(state),
    }),
    (dispatch)=>({
        
    })
)( injectIntl(TxsTable))