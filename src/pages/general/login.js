import React, { Component } from "react";
import { Form, Button, Checkbox } from 'antd';
import UserSelector from '@app/components/InkiriHeader/userSelector'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import * as loginRedux from '@app/redux/models/login';

import * as global from '@app/configs/global';

import {Keystore, Keygen} from 'eosjs-keygen';
// import {Eos} from 'eosjs';
import * as myEOS from 'eosjs';
// import { Api, JsonRpc, RpcError } from 'eosjs';

import './login.css'

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      save: false,
      
    };
    
    
  }

  render() {   
    
    return (
      <Form className="login-form">
        <Form.Item>
          <UserSelector onChange={(account) => this.setState({account})} className="login-user-selector" />
        </Form.Item>
        <Form.Item>
          <Checkbox value={this.state.save} onChange={(e) => this.setState({save: e.target.checked})}>Remember me</Checkbox>
          <Button type="primary" disabled={!this.state.account} onClick={()=>this.props.tryLogin(this.state.account, this.state.save)} loading={this.props.isLoading}  className="login-form-button">
            Login
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default connect(
    (state)=> ({
        isLoading: loginRedux.isLoading(state)
    }),
    (dispatch)=>({
        tryLogin: bindActionCreators(loginRedux.tryLogin, dispatch)
    })
)(Login)