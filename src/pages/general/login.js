import React, { Component } from "react";
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import UserSelector from '@app/components/InkiriHeader/userSelector'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import * as loginRedux from '@app/redux/models/login';
import { withRouter } from "react-router-dom";
import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

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
        // console.log('Received values of form: ', values);

        let password = values.password;
        if(!api.eosHelper.isValidPrivate(password))
        {
          const seed = globalCfg.eos.generateSeed(password);
          password = api.eosHelper.seedPrivate(seed).wif;
        }  

        this.props.tryLogin(values.account_name, password, values.remember);
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
                placeholder="Private key or Password"
                
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
            <Button type="link" className="login-form-forgot" onClick={ () => this.props.clearSession() }>
              Reset session
            </Button>
          </Form.Item>
        </Form>
      </>
    );
  }
}
// 
export default Form.create() (withRouter(connect(
    (state)=> ({
        isLoading: loginRedux.isLoading(state)
    }),
    (dispatch)=>({
        tryLogin: bindActionCreators(loginRedux.tryLogin, dispatch),
        clearSession: bindActionCreators(loginRedux.clearSession, dispatch)
    })
)(Login)
));