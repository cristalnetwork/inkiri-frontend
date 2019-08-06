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
    breadcrumbName: 'First-level Menu',
  },
  {
    path: 'first',
    breadcrumbName: 'Second-level Menu',
  },
  {
    path: 'second',
    breadcrumbName: 'Third-level Menu',
  },
];

const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    render: text => <a href="javascript:;">{text}</a>,
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: tags => (
      <span>
        {tags.map(tag => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </span>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <span>
        <a href="javascript:;">Invite {record.name}</a>
        <Divider type="vertical" />
        <a href="javascript:;">Delete</a>
      </span>
    ),
  },
];

const data = [
  {
    key: '1',
    date: 'John Brown',
    description: 32,
    amount: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    date: 'Jim Green',
    description: 42,
    amount: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    date: 'Joe Black',
    description: 32,
    amount: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      errorMessages: [],
      // txs: data,
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
            console.log(' -- dfuse::listTransactions --');
            console.log('---- RES:', JSON.stringify(res));
        } 
    )
    .catch(ex => {
            console.log(' -- dfuse::listTransactions --');
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
    if(this.state.loading)
    {
      content = <Spin tip="Loading..."><div style={{ margin: '0 0px', padding: 24, background: '#fff', minHeight: 360 }}></div></Spin>;
    }
    else{
      content = <div style={{ margin: '0 0px', padding: 24, background: '#fff', minHeight: 360 }}>
        <Table columns={columns} dataSource={this.state.txs} />
      </div>;
    }
    return (
      <>
      <PageHeader
        breadcrumb={{ routes }}
        title="Extrato"
        subTitle="This is a subtitle"
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