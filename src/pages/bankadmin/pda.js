import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

// import * as userRedux from '@app/redux/models/user';
import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as globalCfg from '@app/configs/global';

import * as api from '@app/services/inkiriApi';
import * as routesService from '@app/services/routes';

import { Radio, Select, Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col, List } from 'antd';
import { Form, Input, Icon} from 'antd';
import { notification, Table, Divider, Spin } from 'antd';

import './pda.css'; 
import styles from './style.less';

import TransactionTable from '@app/components/TransactionTable';
import {columns,  DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_EXCHANGES, DISPLAY_PAYMENTS, DISPLAY_REQUESTS, DISPLAY_WITHDRAWS, DISPLAY_PROVIDER, DISPLAY_SEND, DISPLAY_SERVICE} from '@app/components/TransactionTable';
// import {columns,  DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_WITHDRAWS} from '@app/components/TransactionTable';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const SelectOption = Select.Option;
const { Search, TextArea } = Input;

const Description = ({ term, children, span = 12 }) => (
    <Col span={span}>
      <div className="description">
        <div className="term">{term}</div>
        <div className="detail">{children}</div>
      </div>
    </Col>
  );

const routes = routesService.breadcrumbForFile('pda');

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

const Info: React.SFC<{
      title: React.ReactNode;
      value: React.ReactNode;
      bordered?: boolean;
    }> = ({ title, value, bordered }) => (
      <div className="styles headerInfo">
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    );

class PDA extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:        false,
      txs:            [],
      
      page:           -1, 
      limit:           globalCfg.api.default_page_size,
      can_get_more:    true,

      stats:          {},
      active_tab:     DISPLAY_ALL_TXS
    };

    this.loadTransactionsForPDA     = this.loadTransactionsForPDA.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    // this.onTabChange                = this.onTabChange.bind(this);
    this.onTableChange              = this.onTableChange.bind(this);
  }
  
  componentDidMount(){
    this.loadTransactionsForPDA();  
  } 

  loadTransactionsForPDA(){

    let can_get_more   = this.state.can_get_more;
    if(!can_get_more)
    {
      this.setState({loading:false});
      return;
    }

    
    this.setState({loading:true});

    let page           = (this.state.page<0)?0:(this.state.page+1);
    const limit          = this.state.limit;
    let that           = this;
    
    const req_type = DISPLAY_WITHDRAWS + '|' + DISPLAY_DEPOSIT;
    const account_name = undefined;
    
    api.bank.listRequests(page, limit, req_type, account_name)
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
      this.computeStats();
  }

  
  computeStats(txs){
    let stats = this.currentStats();
    if(txs===undefined)
      txs = this.state.txs;
    const money_in  = txs.filter( tx => tx.i_sent)
                    .map(tx =>tx.quantity)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const money_out = txs.filter( tx => !tx.i_sent)
                    .map(tx =>tx.quantity)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    
    stats[this.state.active_tab] = {money_out:money_out, money_in:money_in, count:txs.length}
    this.setState({stats:stats})
  }

  currentStats(){
    const x = this.state.stats[this.state.active_tab];
    const _default = {money_in:  0,money_out: 0, count:0};
    return x?x:_default;
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  // Component Events

  // onTabChange(key) {
  //   console.log(key);
  //   this.setState({active_tab:key})
  // }
  
  onTableChange(key, txs) {
    // console.log(key);
    // this.setState({active_tab:key})
    if(key==this.state.active_tab )
      this.computeStats(txs);
  }

  // Begin RENDER section
  renderTableViewStats() 
  {
    const current_stats = this.currentStats();
    return (
      <Row>
        <Description term="Lancamentos">{current_stats.count|0}</Description>
        <Description term="Entradas"><Tag color="green">IK$ {current_stats.money_in.toFixed(2)}</Tag></Description>
        <Description term="Variacao de caja"><Tag color="red">IK$ {(current_stats.money_in - current_stats.money_out).toFixed(2)}</Tag></Description>
        <Description term="Saidas"><Tag color="red">-IK$ {current_stats.money_out.toFixed(2)}</Tag></Description>
        
      </Row>
    );
  }

  renderFooter(){
    return (<><Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadTransactionsForPDA()}>More!!</Button> </>)
  }

  renderContent(){
    
    if(this.state.active_tab==DISPLAY_ALL_TXS){
      return (<div style={{ margin: '0 0px', padding: 24, background: '#fff', minHeight: 360 }}>
        <Table
          key="table_all_txs" 
          rowKey={record => record.id} 
          loading={this.state.loading} 
          columns={columns} 
          dataSource={this.state.txs} 
          footer={() => this.renderFooter()}
          pagination={this.state.pagination}
          />
      </div>);
    }
  }
  //

  renderFilterContent ()
  {
    const form = this.renderFilterForm();
    return(
      <div className="wrap">
        <Row>
          <Col span={24}>
            {form}
          </Col>
        </Row>
      </div>
    );
  }
  //
  renderFilterForm() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
    // Only show error after a field is touched.
    const usernameError = isFieldTouched('username') && getFieldError('username');
    const passwordError = isFieldTouched('password') && getFieldError('password');
    return (
      <Form layout="inline" onSubmit={this.handleSubmit}>
        <Form.Item validateStatus={usernameError ? 'error' : ''} help={usernameError || ''}>
          {getFieldDecorator('username', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Username"
            />,
          )}
        </Form.Item>
        <Form.Item validateStatus={passwordError ? 'error' : ''} help={passwordError || ''}>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="Password"
            />,
          )}
        </Form.Item>
        <Form.Item>
            {getFieldDecorator('search', {
            rules: [],
          })(
            <Search className="styles extraContentSearch" placeholder="Search" onSearch={() => ({})} />,
          )}
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" disabled={hasErrors(getFieldsError())}>
            Filter
          </Button>
        </Form.Item>
      </Form>
    );
  }

  
  render() {
    // const content = this.renderContent();
    const filters = this.renderFilterContent();
    const content = this.renderUMIContent();
    return (
      <>
        <PageHeader
          extra={[
            <Button key="_new_deposit"  icon="plus"> Deposit</Button>,
            <Button key="_new_withdraw" icon="plus"> Withdraw</Button>,
          ]}
          breadcrumb={{ routes }}
          title="PDA"
          subTitle="List of Deposits and Withdraws"
        >
          
        </PageHeader>
        {filters}
        {content}

      </>
    );
  }
//
  renderExtraContent (){ 
    
    return(
      <div className="styles extraContent" style={{display:'none'}}>
        <RadioGroup defaultValue="all">
          <RadioButton value="all">all</RadioButton>
          <RadioButton value="progress">progress</RadioButton>
          <RadioButton value="waiting">waiting</RadioButton>
        </RadioGroup>&nbsp;
        <Search className="styles extraContentSearch" placeholder="Search" onSearch={() => ({})} />
      </div>
    )};

    //
  
  renderUMIContent(){
    return  (<>
      <div className="styles standardList" style={{ marginTop: 24 }}>
        <Card bordered={false}>
          <Row>
            <Col sm={4} xs={24}>
              <Info title="" value="TODAY" bordered />
            </Col>
            <Col sm={5} xs={24}>
              <Info title="IK$ DEPOSITS" value="IK$ 500" bordered />
            </Col>
            <Col sm={5} xs={24}>
              <Info title="BRL DEPOSITS" value="BRL 500" bordered />
            </Col>
            <Col sm={5} xs={24}>
              <Info title="WITHDRAWS" value="IK$ 250" />
            </Col>
            <Col sm={5} xs={24}>
              <Info title="PENDING" value="2" />
            </Col>
          </Row>
        </Card>

        <Card
          className="styles listCard"
          bordered={false}
          title="List of Deposits and Withdraws"
          style={{ marginTop: 24 }}
          bodyStyle={{ padding: '0 32px 40px 32px' }}
          extra={this.renderExtraContent()}
        >
          <Button type="dashed" style={{ display:'none', width: '50%', marginBottom: 8 }} key="_new_deposit"  icon="plus"> Deposit</Button>
          <Button type="dashed" style={{ display:'none',width: '50%', marginBottom: 8 }} key="_new_withdraw" icon="plus"> Withdraw</Button>
          
          <Table
            key="table_all_txs" 
            rowKey={record => record.id} 
            loading={this.state.loading} 
            columns={columns} 
            dataSource={this.state.txs} 
            footer={() => this.renderFooter()}
            pagination={this.state.pagination}
            />

        </Card>
      </div>
    </>)
  }

}
//
export default Form.create() (connect(
    (state)=> ({
        actualAccount:    loginRedux.actualAccount(state),
        balance:          balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        // tryUserState: bindActionCreators(userRedux.tryUserState , dispatch)
    })
)(PDA)
);