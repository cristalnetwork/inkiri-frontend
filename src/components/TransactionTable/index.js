import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import styles from './index.less';

import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import { Tag, Button, Statistic, Row, Col } from 'antd';
import { notification, Table, Divider, Spin } from 'antd';


export const  DISPLAY_ALL_TXS    = 'all_txs';
export const  DISPLAY_DEPOSIT    = 'type_deposit';
export const  DISPLAY_EXCHANGES  = 'type_exchange';
export const  DISPLAY_PAYMENTS   = 'type_payment';
export const  DISPLAY_REQUESTS   = 'type_all';
export const  DISPLAY_WITHDRAWS  = 'type_withdraw';
export const  DISPLAY_PROVIDER   = 'type_provider';
export const  DISPLAY_SEND       = 'type_send';
export const  DISPLAY_SERVICE    = 'type_service';


// deposit, exchange, payment, withdraw, provider, send, service

export const columns = (account_type, onButtonClick) => {
  return [
  {
    title: 'Date',
    dataIndex: 'block_time',
    key: 'block_time',
    sortDirections: ['descend'],
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.block_time_number - b.block_time_number,
  },
  {
    title: 'Description',
    dataIndex: 'sub_header',
    key: 'sub_header',
    render: (value, record) => {
      if(globalCfg.bank.isAdminAccount(account_type))
        return(<>{record.sub_header_admin||record.sub_header}</>)  
      return(<>{record.sub_header}</>)
    }
  },
  //
  {
    title: 'Amount',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: 'Tags',
    key: 'tx_type',
    dataIndex: 'tx_type',
    render: (tx_type, record) => {
      let extras = null;
      if(globalCfg.api.isDeposit(record))
      {
        const envelope_id = api.bank.envelopeIdFromRequest(record);
        extras = (< ><br/><span key={'envelope_'+record.id}>ENVELOPE ID: <b>{envelope_id}</b></span></>);
      }
      return (
          <span key={'tags'+record.id}>
           <Tag color={'geekblue'} key={'type'+record.id}>
                  {tx_type.toUpperCase()}
           </Tag><br/>
           <Tag color={'geekblue'} key={'state'+record.id}>
                  {(record.state||'COMPLETED').toUpperCase()}
           </Tag>
           {extras}
          </span>
          )}
  },
  //
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => {
      // console.log('ADDING ROW >> ', record.id);
      let processButton = (null);
      if(typeof onButtonClick === 'function' && globalCfg.bank.isAdminAccount(account_type)){
        processButton = (<Button key={'process_'+record.id} onClick={()=>{ onButtonClick(record) }}>Process</Button>);
      } //
      let viewDetailsButton = (null);
      const onBlockchain = globalCfg.api.isOnBlockchain(record);
      if(onBlockchain){
        const _href = api.dfuse.getBlockExplorerTxLink(onBlockchain);
        viewDetailsButton = (<Button type="link" href={_href} target="_blank" key={'view-on-blockchain_'+record.id} icon="cloud" >View on Blockchain</Button>);
      } //

      if(!globalCfg.api.isFinished(record))
      {
        return (
          <span>
            {viewDetailsButton}
            <Divider type="vertical" />
            {processButton}
          </span>  );
      }
      //
      return(
        <span>
          {viewDetailsButton}
        </span>
      )},
  },
]};

//

class TransactionTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txs:           [],
      loading:       false,
      page:          -1, 
      limit:         globalCfg.api.default_page_size,
      can_get_more : true
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
  }
  loadTxs(){

    let can_get_more   = this.state.can_get_more;
    if(!can_get_more)
    {
      this.setState({loading:false});
      return;
    }

    let account_name = this.props.actualAccount;
    
    
    this.setState({loading:true});

    let page           = (this.state.page<0)?0:(this.state.page+1);
    let limit          = this.state.limit;
    let that           = this;
    
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
        columns={columns(this.props.actualRoleId)} 
        dataSource={this.state.txs} 
        footer={() => this.renderFooter()}
        pagination={this.state.pagination}
      />
    
    )
  }

}

export default connect(
    (state)=> ({
      actualAccount: loginRedux.actualAccount(state),
      actualRoleId:    loginRedux.actualRoleId(state),
    }),
    (dispatch)=>({
        tryLogin: bindActionCreators(loginRedux.tryLogin, dispatch),
        logout: bindActionCreators(loginRedux.logout, dispatch)
    })
)(TransactionTable)