import React, { Component } from "react";
import { Layout, Alert, Form, Icon, Input, Button, Checkbox, Col, Row, Carousel } from 'antd';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as storage from '@app/services/localStorage'; 
import * as loginRedux from '@app/redux/models/login';

import { withRouter } from "react-router-dom";
import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';
import SelectLanguage from '@app/components/InkiriHeader/SelectLang';
import * as components_helper from '@app/components/helper';
import UIFooter from '@app/components/footer';
import * as utils from '@app/utils/utils';
import VersionIndicator from '@app/components/version_indicator';
import './onboard.less'

import Loading from '@app/pages/general/loading'

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

import Slide1 from './onboarding_slides/slide1';
import Slide2 from './onboarding_slides/slide2';
import Slide3 from './onboarding_slides/slide3';

const { Header, Content, Footer } = Layout;

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading         : true,
      generating_keys : false
    };
    
    this.timeout_id = null;
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values);

        const doLogin = (password) => {
          this.props.tryLogin(values.account_name, password, values.remember);
        }
        this.setState({generating_keys:true},
          ()=>{ 
            
            setTimeout( ()=> {
              let password = values.password;
              if(!api.eosHelper.isValidPrivate(password))
              {
                const keys = api.keyHelper.getDerivedKey(values.account_name, password)
                password = keys.wif;
                
              }  
              this.setState({generating_keys:false},
                ()=>{ 
                  doLogin(password);
                });
            } ,2000);
        });  
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
    if(!utils.objectsEqual(this.state.loginError,this.props.loginError))
    {
      console.log('====componentDidUpdate:', this.props.loginError)
      this.setState({loginError:this.props.loginError})
    }
    if(!utils.objectsEqual(prevProps.account, this.props.account) )
    {
      this.timeout_id = setTimeout( () => {
        this.setState({loading:false})
      }, 250);       
    }
  }

  clearSession = () => {
    storage.clear();
    this.props.clearSession();
  }

  getError = (error) =>{
    if(!error)
      return '';

    if (error && error.stack && error.message) 
      return error.message;
    
    if(typeof error == 'string')
      return error;

    if(typeof error == 'object') 
      return JSON.stringify(error);
  }
  
  render() {
    const { getFieldDecorator }   = this.props.form;
    const { loading, loginError } = this.state;
    const { formatMessage }       = this.props.intl;
    if(loading)
      return(<Loading />);
    const error_message = this.getError(loginError);
    const login_form  = (<div className="antd-pro-pages-user-login-components-login-index-login">
        { !loginError  
              ?(null)
              :  <Alert
                    message={this.props.intl.formatMessage({id:'pages.general.login.login_error'})}
                    description={error_message}
                    type="error"
                    showIcon
                    closable
                  />
          }
        <Form onSubmit={this.handleSubmit} className="login-form ant-form ant-form-horizontal">
            
          <Form.Item>
            {getFieldDecorator('account_name', {
              rules: [{ required: true, message: formatMessage({id:'pages.general.login.input_account_message'}) }],
              // initialValue: 'inkpersonal3',
            })(
              <Input
                size="large"
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
                size="large"
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
            <a className="login-form-forgot" href="#" disabled style={{float: 'right', display:'none'}}>
              {formatMessage({id:'pages.general.login.texts_forgot_password'})}
            </a>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" block loading={this.props.isLoading||this.state.generating_keys}>
              {formatMessage({id:'pages.general.login.texts_log_in'})}
            </Button>
          </Form.Item>
          <Form.Item>
            <a href="#" disabled style={{display:'none'}}>{formatMessage({id:'pages.general.login.texts_register_now'})}</a>
            <Button type="link" className="login-form-forgot" onClick={ this.clearSession } style={{float: 'right'}}>
              {formatMessage({id:'pages.general.login.texts_reset_session'})}
            </Button>
          </Form.Item>

        </Form>
      </div>);
    //            
    const logo_small  = (<a href="/" className="logo_small">
                      <img alt="logo" src="/images/onboarding/nlUNcWIVLKoarLnWNaWS.png" />
                      <span className="antd-pro-layouts-user-layout-title">
                        <span className="cristal_network">{formatMessage({id:'cristalnetwork.title'})}</span>
                      </span>
                    </a>);
    //
    const logo_inkiri_small  = (<a href="/" className="logo_small">
                      <img alt="logo" src="/favicons/favicon-32x32.png" />
                      <span className="antd-pro-layouts-user-layout-title">
                        <span className="omnes_isologo">{formatMessage({id:'inkiri.bank.title'})}</span>
                      </span>
                    </a>);
    //
    const logo        = (<a href="/">
                      <img alt="logo" className="antd-pro-layouts-user-layout-logo" src="/favicons/favicon-32x32.png" />
                      <span className="antd-pro-layouts-user-layout-title">
                        <span className="omnes_isologo">{formatMessage({id:'inkiri.bank.title'})}</span>
                      </span>
                    </a>);
    //
    const header_logo = (null);
      // (<div className="antd-pro-layouts-user-layout-top">
      //             <div className="antd-pro-layouts-user-layout-header">
      //               {logo}
      //             </div>
      //             <div className="antd-pro-layouts-user-layout-desc">{formatMessage({id:'inkiri.bank.description'})}</div>
      //           </div>);       
    //

    // <div className="antd-pro-layouts-user-layout-lang">
    // </div>
    //<Header id="header" className="clearfix home-page-header">
    //<Footer className="ant-layout-footer" style={{padding: '0px'}}>
    return (
      <Layout style={{ minHeight: '100vh' }} theme="light" className="onboarding_layout">
        <Header id="header" className="">
          <div className="header_row">
            <div className="header_row_col">
              {logo_small}
            </div>
            <div className="lang header_row_col">
              <SelectLanguage size="big"/>
            </div>
          </div>
        </Header>
        <Content>
          <div className="antd-pro-layouts-user-layout-container">
            
            <div className="antd-pro-layouts-user-layout-content">

              <div className="onboarding onboarding_col">
                  {header_logo}
                  <div className="cards_carousel">
                    <Carousel effect="fade">
                      <div>
                        <Slide1 />
                      </div>
                      
                      <div>
                        <Slide2 />
                      </div>
                      
                    </Carousel>
                  </div>
              </div>
              <div className="login_col">
                <div className="login_col_wrapper">
                  <div className="login_col_header">{logo_inkiri_small}</div>
                  <div className="login_form">
                      {login_form}
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </Content>
        <Footer>
          <div className="ant-pro-global-footer-linksX">
            <Button type="link" title="Cristal Network" target="_blank" href="https://cristalnetwork.org">Cristal Network</Button>
            <Button type="link" title="Github"          target="_blank" href="https://github.com/cristalnetwork/" icon="github"></Button>
          </div>
          <div className="ant-pro-global-footer-copyright"><UIFooter one_line={true}/></div>
        </Footer>
    </Layout>
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