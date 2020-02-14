import React, { Component } from "react";
import { Alert, Form, Icon, Input, Button, Checkbox } from 'antd';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import * as loginRedux from '@app/redux/models/login';
import { withRouter } from "react-router-dom";
import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';
import SelectLanguage from '@app/components/InkiriHeader/SelectLang';
import * as components_helper from '@app/components/helper';
import * as utils from '@app/utils/utils';

import './login.css'

import Loading from '@app/pages/general/loading'

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading : true
    };
    
    this.timeout_id = null;
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values);

        let password = values.password;
        if(!api.eosHelper.isValidPrivate(password))
        {
          const keys = api.keyHelper.getDerivedKey(account_name, password)
          password = keys.wif;
        }  

        this.props.tryLogin(values.account_name, password, values.remember);
      }
    });
  };

  componentDidMount(){
    clearTimeout(this.timeout_id);
    this.timeout_id = setTimeout( () => {
      this.setState({loading:false})
    }, 250);
  }
  
  componentWillUnmount(){
    clearTimeout(this.timeout_id);
  }
  componentDidUpdate(prevProps, prevState) {
    if(prevProps.loginError!=this.props.loginError)
    {
      this.setState({loginError:this.props.loginError})
    }
    if(!utils.objectsEqual(prevProps.account, this.props.account) )
    {
      this.timeout_id = setTimeout( () => {
        this.setState({loading:false})
      }, 250);       
    }


  }

  render() {
    const { getFieldDecorator }   = this.props.form;
    const { loading, loginError } = this.state;
    const { formatMessage }       = this.props.intl;
    
    if(loading)
      return(<Loading />);
    
    return (
      <div className="login">
        <div className="login-header">
          <div className="login-wrapper">
            <h1 align="center">
            <img src="/favicons/favicon-32x32.png" alt="" />&nbsp;<span className="omnes_isologo">{formatMessage({id:'inkiri.bank.title'})}</span>
            </h1>
          </div>     
        </div> 
        <Form onSubmit={this.handleSubmit} className="login-form">
            <SelectLanguage />
            { !loginError  
                ?(null)
                :  <Alert
                      message={this.props.intl.formatMessage({id:'pages.general.login.login_error'})}
                      description={JSON.stringify(loginError)}
                      type="error"
                      showIcon
                      closable
                    />
            }
          
          <Form.Item>
            {getFieldDecorator('account_name', {
              rules: [{ required: true, message: formatMessage({id:'pages.general.login.input_account_message'}) }],
              // initialValue: 'inkpersonal3',
            })(
              <Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder={formatMessage({id:'global.account_name'})}
                autoFocus
                autoCapitalize="off"
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: formatMessage({id:'pages.general.login.input_password_message'}) }],
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder={formatMessage({id:'pages.general.login.input_password_placeholder'})}
                
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(<Checkbox>{formatMessage({id:'pages.general.login.texts_remember_me'})}</Checkbox>)}
            <a className="login-form-forgot" href="#" disabled >
              {formatMessage({id:'pages.general.login.texts_forgot_password'})}
            </a>
            <Button type="primary" htmlType="submit" className="login-form-button" loading={this.props.isLoading}>
              {formatMessage({id:'pages.general.login.texts_log_in'})}
            </Button>
            <a href="#" disabled >{formatMessage({id:'pages.general.login.texts_register_now'})}</a>
            <Button type="link" className="login-form-forgot" onClick={ () => this.props.clearSession() }>
              {formatMessage({id:'pages.general.login.texts_reset_session'})}
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
// 
export default Form.create() (withRouter(connect(
    (state)=> ({
        isLoading:     loginRedux.isLoading(state),
        loginError:    loginRedux.loginError(state),
        isAuth:        loginRedux.isAuth(state),
        account:       loginRedux.account(state),
    }),
    (dispatch)=>({
        tryLogin:      bindActionCreators(loginRedux.tryLogin, dispatch),
        clearSession:  bindActionCreators(loginRedux.clearSession, dispatch)
    })
)(injectIntl(Login))
));