import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

// import * as userRedux from '@app/redux/models/user';
import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as globalCfg from '@app/configs/global';

import * as api from '@app/services/inkiriApi';

import { Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';

import { notification, Table, Divider, Spin } from 'antd';

import './home.css'; 

const { TabPane } = Tabs;

const Description = ({ term, children, span = 12 }) => (
    <Col span={span}>
      <div className="description">
        <div className="term">{term}</div>
        <div className="detail">{children}</div>
      </div>
    </Col>
  );

const routes = [
  {
    path: 'index',
    breadcrumbName: 'Inkiri BANK',
  },
  {
    path: 'first',
    breadcrumbName: 'My money',
  },
  {
    path: 'second',
    breadcrumbName: 'Extrato',
  }
];

const columns = [
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
    render: tx_type => (
      <span>
       <Tag color={'volcano'} key={tx_type}>
              {tx_type.toUpperCase()}
       </Tag>
      </span>
      )
  },
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <span>
        <a href="javascript:;">View Details</a>
        <Divider type="vertical" />
        <a href={api.dfuse.getBlockExplorerTxLink(record.transaction_id)} target="_blank">View on Blockchain</a>
      </span>
    ),
  },
];

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:                      false,
      txs:                          [],
      cursor:                       '',
      responses:                    {}, // array of { txs:[], cursor:'', page_index:0}
      balance:                      {},
      pagination:                   { pageSize: 0 , total: 0 }
    };

    this.loadTransactionsForAccount = this.loadTransactionsForAccount.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);     
  }
  
  componentDidMount(){
    this.loadTransactionsForAccount(true);  
  } 

  loadTransactionsForAccount(is_first){

    let account_name = this.props.actualAccount;
    console.log(' pages::business::home >> this.props.actualAccount:', this.props.actualAccount, ' | fetching history for:', account_name)
    
    let that = this;
    this.setState({loading:true});
    console.log(' <><><><><><><><><> this.state.cursor:', this.state.cursor)
    api.dfuse.listTransactions(account_name, (is_first===true?undefined:this.state.cursor) )
    .then( (res) => {
            // console.log(' -- home.js::listTransactions --');
            // console.log('---- RES:', JSON.stringify(res));
            // that.buildTablePagination(res.data)
            that.onNewData(res.data);
    } ,(ex) => {
            console.log(' -- home.js::listTransactions ERROR --');
            console.log('---- ERROR:', JSON.stringify(ex));
            that.setState({loading:false});  
      } 
    );
    
  }

  onNewData(data){
    
    const _txs = [...this.state.txs, ...data.txs];
    const pagination = {...this.state.pagination};
    pagination.pageSize= _txs.length;
    pagination.total= _txs.length;

    console.log(' >>>>>>>>>>> this.state.cursor:', this.state.cursor)
    console.log(' >>>>>>>>>>> data.cursor:', data.cursor)
    this.setState({pagination:pagination, txs:_txs, cursor:data.cursor, loading:false})

    if(!data.txs || data.txs.length==0)
    {
      this.openNotificationWithIcon("info", "End of transactions","You have reached the end of transaction list!")
    }
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  // buildTablePagination(data){
    
  //   if(!data.txs || data.txs.length==0)
  //   {
  //     return;
  //   }

  //   const pageIndex_Key             = this.getResponseKey()
  //   const responses                 = { ...this.state.responses };
  //   responses[pageIndex_Key.key]    = {'txs':data.txs, cursor: data.cursor, page_index:pageIndex_Key.page_index};

  //   const pagination = { ...this.state.pagination };
  //   pagination.total = pagination.total + data.txs.length;

  //   this.setState({
  //     pagination:pagination,
  //     responses:responses
  //   })
  // }

  // getResponseKey(){
  //   const page_index  = (this.state.pagination.current || 1);
  //   const key         = '_key_'+ page_index;
  //   return {page_index:page_index, key:key};
  // }

  // getCurrentTxs(){
  //   if(!this.state.responses || this.state.responses.length==0)
  //     return [];
  //   const pageIndex_Key = this.getResponseKey()
  //   return (this.state.responses[pageIndex_Key.key]?this.state.responses[pageIndex_Key.key].txs:[])
  // }  

  // handleTableChange(pagination, filters, sorter){
  //   console.log(JSON.stringify(pagination))
  //   return;
  //   const new_pagination   = { ...this.state.pagination };
  //   new_pagination.current = pagination.current;
  //   this.setState({
  //     pagination: new_pagination,
  //   });    
  // }

  renderContent() 
  {
    return (
      <Row>
        <Description term="Entradas"><Tag color="green">IK$ 1500</Tag></Description>
        <Description term="Variacao de caja"><Tag color="red">-IK$ 88</Tag></Description>
        <Description term="Saidas"><Tag color="red">-IK$ 1588</Tag></Description>
        <Description term="Lancamentos">35</Description>
      </Row>
    );
  }

  renderFooter(){
    return (<><Button key="load-more-data" disabled={this.state.cursor==''} onClick={()=>this.loadTransactionsForAccount(false)}>More!!</Button> </>)
  }

  renderExtraContent ()
  {
    return(
    <Row>
      <Col span={24}>
        <Card><Statistic title="Account Balance (IK$)" value={this.props.balance} precision={2} /> 
        </Card> <></>
      </Col>
    </Row>
    );
  }
  
  render() {
    const content = (<div style={{ margin: '0 0px', padding: 24, background: '#fff', minHeight: 360 }}>
        <Table 
          onChange={() => this.handleTableChange}
          rowKey={record => record.id} 
          loading={this.state.loading} 
          columns={columns} 
          dataSource={this.state.txs} 
          footer={() => this.renderFooter()}
          pagination={this.state.pagination}
          />
      </div>);
    // <>
    return (
      <>
      <PageHeader
        breadcrumb={{ routes }}
        title="Extrato"
        subTitle="List of transactions"
        extra={[
          <Button key="3">Filter</Button>,
          <Button key="1" type="primary">
            Apply
          </Button>,
        ]}
        footer={
          <Tabs defaultActiveKey="1">
            <TabPane tab="All" key="1" />
            <TabPane tab="Deposits" key="2" />
            <TabPane tab="Withdraws" key="3" />
            <TabPane tab="Exchanges" key="4" />
            <TabPane tab="Payments" key="5" />
            <TabPane tab="Requests" key="6" />
          </Tabs>
        }
      >
        <div className="wrap">
          <div className="content padding">{this.renderContent()}</div>
          <div className="extraContent">{this.renderExtraContent()}</div>
        </div>
      </PageHeader>

      {content}
      </>
    );
  }
}

export default connect(
    (state)=> ({
        // userAccount: 	      userRedux.defaultAccount(state),
        actualAccount:    loginRedux.actualAccount(state),
        balance:          balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        // tryUserState: bindActionCreators(userRedux.tryUserState , dispatch)
    })
)(Home)