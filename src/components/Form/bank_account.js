import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as validators from '@app/components/Form/validators';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { notification, Select, Button , Form, Icon, InputNumber, Input } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const DEFAULT_STATE = {
    _id:           null,
    bank_name:     null,
    agency:        null,
    cc:            null
      
};

class BankAccountForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bank_account    : props.bank_account || {...DEFAULT_STATE},
      alone_component : props.alone_component || false,
      button_text     : props.button_text || 'SUBMIT',
      callback        : props.callback ,
    };
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.handleBankAccountChange    = this.handleBankAccountChange.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 

  }

  componentDidUpdate(prevProps, prevState) 
  {
      if(prevProps.bank_account !== this.props.bank_account) {
          this.setState({
            bank_account    : this.props.bank_account || {...DEFAULT_STATE},
            alone_component : this.props.alone_component || false,
            button_text     : this.props.button_text || 'SUBMIT',
            callback        : this.props.callback 
          });
      }
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  /*
  * Components' Events.
  */
  handleBankAccountChange = (value) => {

    
  }

  fireEvent = (error, cancel, data) => {
    const {callback} = this.state;
    if(typeof  callback === 'function') {
        callback(error, cancel, data)
    }
  }
  handleSubmit = e => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        this.openNotificationWithIcon("error", "Validation errors","Please verifiy errors on screen!")    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      if(!this.state.bank_account)
      {
        this.openNotificationWithIcon("error", 'You must choose a Bank Account!');
        return;
      }
      
      this.fireEvent(null, null, values.bank_account);
      
    });
  };

  resetForm(){
    
    // this.setState({...DEFAULT_STATE});
  }

  renderContent() {  
    const { bank_account, button_text } = this.state;
    const { getFieldDecorator }                  = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit}>
            <div className="money-transfer">
              
              <div className="money-transfer__row row-expandable row-complementary row-complementary-bottom" >
                <Form.Item label="Bank Name">
                  {getFieldDecorator('bank_account.bank_name', {
                    rules: [{ required: true, message: 'Please input a Bank name!', whitespace: true }],
                    initialValue:bank_account.bank_name||''
                  })(
                    <Input className="money-transfer__input" placeholder="Bank Name" />
                  )}
                </Form.Item>
              </div>

              <div className="money-transfer__row row-expandable row-complementary row-complementary-bottom" >
                <Form.Item label="Agency">
                  {getFieldDecorator('bank_account.agency', {
                    rules: [{ required: true, message: 'Please input an Agency!', whitespace: true }],
                    initialValue:bank_account.agency||''
                  })(
                    <Input className="money-transfer__input"  placeholder="Agency" />
                  )}
                </Form.Item>
              </div>

              <div className="money-transfer__row row-expandable row-complementary row-complementary-bottom" >
                <Form.Item label="CC">
                  {getFieldDecorator('bank_account.cc', {
                    rules: [{ required: true, message: 'Please input a CC!', whitespace: true }],
                    initialValue:bank_account.cc||''
                  })(
                    <Input className="money-transfer__input"  placeholder="CC" />
                  )}
                </Form.Item>
              </div>

            </div>
            
            <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="addOrUpdateBankAccount" htmlType="submit" type="primary" >{button_text}</Button>
                <Button size="large" key="cancelBankAccount" type="link" onClick={ () => this.fireEvent(null, true, null)}>CANCEL</Button>
            </div>

        </Form>
     
    );

  }
  //

  render() {
    let content     = this.renderContent();
    

    if(!this.state.alone_component)
      return content;

    return (
      <div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
        <div className="ly-main-content content-spacing cards">
          <section className="mp-box mp-box__shadow money-transfer__box">
            {content}
          </section>
        </div>      
      </div>
    );
  }

  
}
//
export default Form.create() (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualAccountProfile: loginRedux.actualAccountProfile(state),
        actualRole:           loginRedux.actualRole(state),
        actualPrivateKey:     loginRedux.actualPrivateKey(state),
        isLoading:            loginRedux.isLoading(state),
        personalAccount:      loginRedux.personalAccount(state),
        balance:              balanceRedux.userBalance(state),
    }),
    (dispatch)=>({
        
    })
)(BankAccountForm) )
);
