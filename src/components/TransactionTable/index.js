import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import { Button} from 'antd';
import { notification, Table } from 'antd';

import * as columns_helper from '@app/components/TransactionTable/columns';

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
      txs:           [],
      loading:       false,
      page:          -1, 
      limit:         globalCfg.api.default_page_size,
      can_get_more:  true,
      for_admin:     props.i_am_admin
    };
    // this.handleChange      = this.handleChange.bind(this);
    this.onNewData         = this.onNewData.bind(this);
    this.renderFooter      = this.renderFooter.bind(this); 
  }

  componentDidMount(){
    this.loadTxs();
  }

  renderFooter(){
    return (<><Button key={'load-more-data_'+this.props.request_type} disabled={!this.state.can_get_more} onClick={()=>this.loadTxs()}>More!!</Button> </>)
  }

  refresh(){
    const that = this;
    
      this.setState(
        {txs:[]
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
  loadTxs(){

    const can_get_more   = this.state.can_get_more;
    if(!can_get_more)
    {
      this.setState({loading:false});
      return;
    }

    const account_name = this.props.actualAccountName;
    
    
    this.setState({loading:true});

    const page           = (this.state.page<0)?0:(this.state.page+1);
    const limit          = this.state.limit;
    const that           = this;
    
    if(this.state.for_admin)
    {
      const req_type = this.props.request_type;
      api.bank.listRequests(page, limit, req_type)
        .then( (res) => {
            that.onNewData(res);
          } ,(ex) => {
            // console.log('---- ERROR:', JSON.stringify(ex));
            that.setState({loading:false});  
          } 
        )
      return;
    }

    api.bank.listMyRequests(account_name, page, limit, this.props.request_type)
    .then( (res) => {
        that.onNewData(res);
      } ,(ex) => {
        // console.log('---- ERROR:', JSON.stringify(ex));
        that.setState({loading:false});  
      } 
    );
    
  }

  onNewData(txs){
    
    if(!txs || !txs.length) txs = [];
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
      if(typeof this.props.onChange === 'function') {
        this.props.onChange(this.props.request_type, this.state.txs);
      }
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }


  render(){
    return (
      <Table 
        key={'tx_table__'+this.props.request_type}
        rowKey={record => record.id} 
        loading={this.state.loading} 
        columns={columns_helper.getDefaultColumns(this.props.actualRoleId, this.props.callback)} 
        dataSource={this.state.txs} 
        footer={() => this.renderFooter()}
        pagination={this.state.pagination}
        scroll={{ x: 700 }}
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