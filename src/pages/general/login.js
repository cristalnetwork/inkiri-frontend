import React, { Component } from "react";
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import UserSelector from '@app/components/InkiriHeader/userSelector'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import * as loginRedux from '@app/redux/models/login';
import { withRouter } from "react-router-dom";
import * as global from '@app/configs/global';

import './login.css'

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      save: false,
      
    };
    
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.props.tryLogin(values.account_name, values.password, values.remember);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <>
        <div className="login-header">
          <h1 align="center"><img src="/favicons/favicon-32x32.png" alt="" /> Inkiri Bank</h1>
        </div> 
        <Form onSubmit={this.handleSubmit} className="login-form">
          <Form.Item>
            {getFieldDecorator('account_name', {
              rules: [{ required: true, message: 'Please input your account_name!' }],
              // initialValue: 'inkpersonal3',
            })(
              <Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Account name"
                autoFocus
                autoCapitalize="off"
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password!' }],
              // initialValue: '5J6SLtH69Rf8HgSFDiYZ2B7CpRnDQisupKqkmjQpyxHFLgtX8CS',
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="Password"
                
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(<Checkbox>Remember me</Checkbox>)}
            <a className="login-form-forgot" href="#" disabled>
              Forgot password
            </a>
            <Button type="primary" htmlType="submit" className="login-form-button" loading={this.props.isLoading}>
              Log in
            </Button>
            Or <a href="#" disabled >register now!</a>
          </Form.Item>
        </Form>
      </>
    );
  }
//
  renderXX() {   
    
    return (
      <Form className="login-form">
        <Form.Item>
          <UserSelector onChange={(account) => this.setState({account})} className="login-user-selector" />
        </Form.Item>
        <Form.Item>
          <Checkbox value={this.state.save} onChange={(e) => this.setState({save: e.target.checked})}>Remember me</Checkbox>
          <Button type="primary" disabled={!this.state.account} onClick={()=>this.props.tryLogin(this.state.account, this.state.save)}   className="login-form-button">
            Login
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

// 
export default Form.create() (withRouter(connect(
    (state)=> ({
        isLoading: loginRedux.isLoading(state)
    }),
    (dispatch)=>({
        tryLogin: bindActionCreators(loginRedux.tryLogin, dispatch)
    })
)(Login)
));