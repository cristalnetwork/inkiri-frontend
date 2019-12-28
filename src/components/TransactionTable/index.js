import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';
import * as gqlService from '@app/services/inkiriApi/graphql'

import { Button} from 'antd';
import { Table } from 'antd';

import * as columns_helper from '@app/components/TransactionTable/columns';
import * as ui_helper from '@app/components/helper';

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
const CLEAR_TX_STATE = {}
class TransactionTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txs:               [],
      page:              -1, 
      loading:           false,
      limit:             globalCfg.api.default_page_size,
      can_get_more:      true,
      for_admin:         props.i_am_admin,
      requests_filter:   {}
    };
    // this.handleChange      = this.handleChange.bind(this);
    this.onNewData         = this.onNewData.bind(this);
    this.renderFooter      = this.renderFooter.bind(this); 
    this.getColumnsForType = this.getColumnsForType.bind(this);
    this.applyFilter       = this.applyFilter.bind(this);
  }

  getColumnsForType =() =>{

    const is_admin = globalCfg.bank.isAdminAccount(this.props.actualRoleId )
    return columns_helper.getColumnsForRequests(this.props.callback, is_admin);
  }
  
  
  componentDidMount(){
    if(typeof this.props.onRef==='function')
    {
      console.log('YES')
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
    return (<><Button key={'load-more-data_'+this.props.request_type} disabled={!this.state.can_get_more} onClick={()=>this.loadTxs()}>More!!</Button> </>)
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
    if (this.props.i_am_admin !== prevProps.i_am_admin) {
      this.setState({for_admin: this.props.i_am_admin});
    }
    
  }

  loadTxs = async () =>{

    const {can_get_more, requests_filter, for_admin}   = this.state;
    if(!can_get_more)
    {
      this.setState({loading:false});
      return;
    }

    const account_name = for_admin?'':this.props.actualAccountName;
    
    this.setState({loading:true});

    const page           = (this.state.page<0)?0:(this.state.page+1);
    const limit          = this.state.limit;
    const that           = this;
    
    const requested_type = this.props.request_type==DISPLAY_REQUESTS?'':this.props.request_type;
    if(!for_admin && (requests_filter.to||requests_filter.from))
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
    const filter_obj = {limit, account_name, page, requested_type, ...requests_filter};
    console.log(' TABLE filter_obj:', filter_obj);
    try{
      const data = await gqlService.requests(filter_obj);
      that.onNewData(data);
    }
    catch(e)
    {
      this.setState({loading:false});
      ui_helper.notif.exceptinoNotification("An error occurred while fetching requests", e);
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
      const msg = (page>0)?'You have reached the end of the list!':'Oops... there is no records for this filter!';
      ui_helper.notif.infoNotification(msg)
    }
    else
      if(typeof this.props.onChange === 'function') {
        this.props.onChange(this.props.request_type, this.state.txs);
      }
  }

  render(){
    return (
      <Table 
        key={'tx_table__'+this.props.request_type}
        rowKey={record => record._id} 
        loading={this.state.loading} 
        columns={this.getColumnsForType()} 
        dataSource={this.state.txs} 
        footer={() => this.renderFooter()}
        pagination={this.state.pagination}
        scroll={{ x: 950 }}
        expandedRowRender={columns_helper.expandedRequestRowRender}
        onRow={(record, rowIndex) => {
              return { onDoubleClick: event => { this.props.callback(record) }
              };
            }}
      />
    
    )
  }

}

export default connect(
    (state)=> ({
      actualAccountName: loginRedux.actualAccountName(state),
      actualRoleId:    loginRedux.actualRoleId(state),
    }),
    (dispatch)=>({
        tryLogin: bindActionCreators(loginRedux.tryLogin, dispatch),
        logout: bindActionCreators(loginRedux.logout, dispatch)
    })
)(TransactionTable)