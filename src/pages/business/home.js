import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as userRedux from '@app/redux/models/user'

import * as globalCfg from '@app/configs/global';

import { InboundMessageType, createDfuseClient } from '@dfuse/client';

import * as api from '@app/services/inkiriApi';

import { PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';

import './home.css'; 

import { Table, Divider } from 'antd';

import { Spin } from 'antd';

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
    key: 'block_time'
  },
  {
    title: 'Description',
    dataIndex: 'sub_header',
    key: 'sub_header',
    render: text => <a href="javascript:;">{text} </a>
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
        <a href="javascript:;">another fn()</a>
      </span>
    ),
  },
];

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      errorMessages: [],
      txs: [],
      balance: {}
    };

  }
  
  componentDidMount(){
    
    let account_name = this.props.userAccount || 'inkpersonal1';
    console.log(' pages::business::home >> this.props.userAccount:', this.props.userAccount, ' | fetching history for:', account_name)
    
    let that = this;
    this.setState({loading:true});
    api.dfuse.listTransactions(account_name)
    .then(res => 
        {
            // console.log(' -- home.js::listTransactions --');
            // console.log('---- RES:', JSON.stringify(res));
            that.setState({'txs':res.data.txs})
        } 
    )
    .catch(ex => {
            console.log(' -- home.js::listTransactions ERROR --');
            console.log('---- ERROR:', JSON.stringify(ex));
        } 
    )
    .finally(function(){
      that.setState({loading:false});
    })
  } 

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

  renderExtraContent ()
  {
    return(
    <Row>
      <Col span={12}>
        <Statistic title="Balance" prefix="IK$" value={568.08} />
      </Col>
    </Row>
    );
  }
  

  render() {
    let content;
    // if(this.state.loading)
    // {
    //   content = <Spin tip="Loading..."><div style={{ margin: '0 0px', padding: 24, background: '#fff', minHeight: 360 }}></div></Spin>;
    // }
    // else{
      content = <div style={{ margin: '0 0px', padding: 24, background: '#fff', minHeight: 360 }}>
        <Table rowKey={record => record.key} loading={this.state.loading} columns={columns} dataSource={this.state.txs} />
      </div>;
    // }
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
        userAccount: 	      userRedux.defaultAccount(state),
        allAccounts: 	      userRedux.allAccounts(state),
        isLoading: 		      userRedux.isLoading(state) 
    }),
    (dispatch)=>({
        tryUserState: bindActionCreators(userRedux.tryUserState , dispatch)
    })
)(Home)