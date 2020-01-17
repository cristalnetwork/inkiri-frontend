import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';
import * as gqlService from '@app/services/inkiriApi/graphql'
import * as gqlRequestI18nService from '@app/services/inkiriApi/requests-i18n-graphql-helper'

import { Button, Table, DatePicker } from 'antd';

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

//
class TransactionTable extends Component {
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

      selectedRows:      [],
      payment_date:      null
    };
    // this.handleChange      = this.handleChange.bind(this);
    this.onNewData         = this.onNewData.bind(this);
    this.renderFooter      = this.renderFooter.bind(this); 
    this.getColumnsForType = this.getColumnsForType.bind(this);
    this.applyFilter       = this.applyFilter.bind(this);
    this.refresh           = this.refresh.bind(this);
  }

  getColumnsForType =() =>{

    if(this.state.mode=='external-transfers')
    {
      return columns_helper.getColumnsForExternalTransfers(this.props.callback);  
    }
    const is_admin = globalCfg.bank.isAdminAccount(this.props.actualRoleId )
    // this.props.isBusiness ||  this.props.isAdmin
    const processWages = this.props.isPersonal;
    return columns_helper.getColumnsForRequests(this.props.callback, is_admin, {process_wages:processWages, account_name:this.props.actualAccountName});
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

  loadTxs = async () =>{

    const {can_get_more, requests_filter, filter}   = this.state;
    if(!can_get_more)
    {
      this.setState({loading:false});
      return;
    }

    const account_name = this.props.isAdmin?'':this.props.actualAccountName;
    const account_name_filter = !this.props.isAdmin? {account_name:this.props.actualAccountName}:{};

    this.setState({loading:true});

    const page           = (this.state.page<0)?0:(this.state.page+1);
    const limit          = this.state.limit;
    const that           = this;
    
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
    console.log(' ---- TransactionTable filter_obj:', filter_obj);
    console.log(' ---- TransactionTable default filter:', filter)
    try{
      // const data = await gqlService.requests(filter_obj);
      const data = await gqlRequestI18nService.requests(filter_obj, this.props.intl);
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

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`::onChange:: selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      this.setState({selectedRows:selectedRows}
        , () => {this.validateState()});
    },  
    // onSelect: (record, selected, selectedRows) => {
    //   console.log('::onSelect::', record, selected, selectedRows);
    // },
    // onSelectAll: (selected, selectedRows, changeRows) => {
    //   console.log('::onSelectAll::', selected, selectedRows, changeRows);
    // },
  };

  onChange = (date, dateString) => {
    console.log(date, dateString);
    this.setState({payment_date:date})
  }

  remButtons  = () => {
    const buttons = [ 
            {
              title:     'pages.bankadmin.external-transfers.create_rem_file_empresa'
              , value:   0 
            }
            ,{
              title:     'pages.bankadmin.external-transfers.create_rem_file_instituto_projeto'
              , value:   1 
            }
            ,{
              title:     'pages.bankadmin.external-transfers.create_rem_file_instituto_ppa'
              , value:   2 
            }
    ];
    const payment_date_placeholder = this.props.intl.formatMessage({id:'pages.bankadmin.external-transfers.payment_date_placeholder'})
    const {selectedRows, payment_date} = this.state;
    const _enabled       = (selectedRows && Array.isArray(selectedRows) && selectedRows.length>0) && payment_date!=null;
    return (<>
      <DatePicker placeholder={payment_date_placeholder} name="payment_date" onChange={this.onChange} format={'YYYY/MM/DD'}/>
      {
        buttons.map( btn => 
            <Button style={{marginLeft:8}} key={`rem_button_${btn.value}`} disabled={!_enabled} type="primary" href={this.remFileLink(btn.value)} target="_blank" icon="bank" size="small" >&nbsp;<InjectMessage id={btn.title} /></Button>
          )
      }</>)
    // `
  }
  
  validateState = () => {
    const {selectedRows} = this.state;
    const wrong_state_requests = selectedRows.filter(row=>row.state!==globalCfg.api.STATE_RECEIVED).length;
    if(wrong_state_requests>0)
    {
      const title = this.props.intl.formatMessage({id:'errors.notification'})
      const msg = this.props.intl.formatMessage({id:'pages.bankadmin.external-transfers.some_requests_has_wrong_states'})
      components_helper.notif.infoNotification(title, msg)
    }
  }

  remFileLink = (conta_pagamento) => {
    const {selectedRows, payment_date} = this.state;
    const ids = selectedRows.map(row=>row._id).join(',');
    return `${globalCfg.api.rem_generator_endpoint}/${ids}/${conta_pagamento}/${payment_date}`
  }

  render(){
    const is_external = (this.state.mode=='external-transfers');
    const header = (is_external)
      ?this.remButtons()
      :(null);
    return (
      <Table 
        title={() => header}
        key={'tx_table__'+this.props.request_type}
        rowKey={record => record._id} 
        loading={this.state.loading} 
        columns={this.getColumnsForType()} 
        dataSource={this.state.txs} 
        footer={() => this.renderFooter()}
        pagination={this.state.pagination}
        scroll={{ x: 950 }}
        expandedRowRender={columns_helper.expandedRequestRowRender}
        rowSelection={is_external ? this.rowSelection : null}
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
        tryLogin: bindActionCreators(loginRedux.tryLogin, dispatch),
        logout: bindActionCreators(loginRedux.logout, dispatch)
    })
)( injectIntl(TransactionTable))