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

export const columns = [
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
    key: 'sub_header'
  },
  {
    title: 'Amount',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: 'Tags',
    key: 'tx_type',
    dataIndex: 'tx_type',
    render: (tx_type, record) => (
      <span>
       <Tag color={'volcano'} key={tx_type}>
              {tx_type.toUpperCase()}
       </Tag>
       <Tag color={'volcano'} key={record.state||'x'}>
              {(record.state||'x').toUpperCase()}
       </Tag>
      </span>
      )
  },
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => {
      if(!record.transaction_id)
      {
        return (
          <span>
            <a href="#">View Details</a>
          </span>  );
      }
      return(
          <span>
            <a href="#">View Details</a>
            <Divider type="vertical" />
            <a href={api.dfuse.getBlockExplorerTxLink(record.transaction_id)} target="_blank">View on Blockchain</a>
          </span>
        )},
  },
];


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

  componentWillReceiveProps(newProps) {
      // const {request_type, actualAccount} = this.props;
      // if(newProps.actualAccount !== actualAccount) {
      //   this.loadTxs(true)
      // }
  }  

  componentDidMount(){
    this.loadTxs();
  }

  renderFooter(){
    return (<><Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadTxs()}>More!!</Button> </>)
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
        key="table_deposits"
        rowKey={record => record.id} 
        loading={this.state.loading} 
        columns={columns} 
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
    }),
    (dispatch)=>({
        tryLogin: bindActionCreators(loginRedux.tryLogin, dispatch),
        logout: bindActionCreators(loginRedux.logout, dispatch)
    })
)(TransactionTable)