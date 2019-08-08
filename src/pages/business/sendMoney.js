import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import { Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { Form, Icon, InputNumber, Input, AutoComplete } from 'antd';

import './sendMoney.css'; 

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
    breadcrumbName: 'Pay',
  },
  {
    path: 'second',
    breadcrumbName: 'Send money',
  }
];


class SendMoney extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:      false,
      dataSource:   [],
      receipt:      '',
      amount:       0,
      memo:         '',
      pushing:      false
    };

    // this.handleSearch = this.handleSearch.bind(this); 
    this.onSelect     = this.onSelect.bind(this); 
    this.renderForm   = this.renderForm.bind(this); 
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange     = this.onChange.bind(this); 
  }


  onSelect(value) {
    console.log('onSelect', value);
    this.setState({receipt:value})
  }

  onChange(value) {
    console.log('changed', value);
    this.setState({amount:value})
  }

  // onSearch={this.handleSearch}
  handleSearch(value){
    // this.setState({
    //   dataSource: !value ? [] : [value, value + value, value + value + value],
    // });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);

      const privateKey = api.dummyPrivateKeys[this.props.actualAccount] 
      // HACK! >> La tenemos que traer de localStorage? <<
      const receiver   = values.receipt;
      const sender     = this.props.actualAccount;
      const amount     = values.amount;

      api.sendMoney(sender, privateKey, receiver, amount)
      .then(data => {
        console.log(' SendMoney::send (then#1) >>  ', JSON.stringify(data));
      })
      .catch(ex=>{
        console.log(' SendMoney::send (error#1) >>  ', JSON.stringify(ex));
      })
    });
  };

  renderForm() {
    const { getFieldDecorator } = this.props.form;
    
     return (
      <div style={{ margin: '0 0px', padding: 24, background: '#fff'}}>
        <Spin spinning={this.state.pushing} delay={500} tip="Pushing transaction...">
          
          <Form onSubmit={this.handleSubmit} className="login-formX">
            
            <Form.Item style={{'minHeight':60}}>
              {getFieldDecorator('receipt', {
                rules: [{ required: true, message: 'Please input receipt account name!' }]
              })(

                <AutoComplete
                  size="large"
                  dataSource={this.props.accounts.filter(acc=>acc.key!=this.props.actualAccount).map(acc=>acc.key)}
                  style={{ width: 400 }}
                  onSelect={this.onSelect}
                  placeholder="Receipt account name"
                  filterOption={true}

                >
                  <Input suffix={<Icon type="user" className="certain-category-icon" />} />
                </AutoComplete>
                 
              )}
            </Form.Item>

            
            <Form.Item style={{'minHeight':60}}>
              {getFieldDecorator('amount', {
                rules: [{ required: true, message: 'Please input an amount to send!' }],
              })(
                <InputNumber
                  size="large"
                  style={{ width: 400 }}
                  defaultValue={0}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  onChange={this.onChange}
                />,
              )}
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-form-button">
                Send
              </Button>
              
            </Form.Item>
          </Form>
        </Spin>
      </div>
    );
  }

  renderExtraContent ()
  {
    return(
    <Row>
      <Col span={24}>
        <Card><Statistic title="Account Balance (IK$)" value={this.props.balance} precision={2} /></Card>
      </Col>
    </Row>
    );
  
  }
  

  render() {
    let content = this.renderForm();
    
    return (
      <>
      <PageHeader
        breadcrumb={{ routes }}
        title="Send money"
        subTitle="Send money instantly for free"
        
      >
        <div className="wrap">
          <div className="extraContent">{this.renderExtraContent()}</div>
        </div>
      </PageHeader>

      {content}
      
      </>
    );
  }

  
}

export default Form.create() (connect(
    (state)=> ({
        accounts:         accountsRedux.accounts(state),
        actualAccount:    loginRedux.actualAccount(state),
        isLoading:        loginRedux.isLoading(state),
        balance:          balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        
    })
)(SendMoney)
);