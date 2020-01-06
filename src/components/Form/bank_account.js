import React, {Component} from 'react'

import { connect } from 'react-redux'

import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as components_helper from '@app/components/helper';

import { withRouter } from "react-router-dom";

import { Button , Form, Input } from 'antd';

import { injectIntl } from "react-intl";

const DEFAULT_STATE = {
    _id:           null,
    bank_name:     null,
    agency:        null,
    cc:            null
      
};

class BankAccountForm extends Component {
  constructor(props) {
    super(props);
    
    const default_text = this.props.intl.formatMessage({id:'global.submit'});

    this.state = {
      bank_account    : props.bank_account || {...DEFAULT_STATE},
      alone_component : props.alone_component || false,
      button_text     : props.button_text || default_text,
      callback        : props.callback ,
    };
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.handleBankAccountChange    = this.handleBankAccountChange.bind(this);     

  }

  componentDidUpdate(prevProps, prevState) 
  {
      if(prevProps.bank_account !== this.props.bank_account) {
          this.setState({
            bank_account    : this.props.bank_account || {...DEFAULT_STATE},
            alone_component : this.props.alone_component || false,
            button_text     : this.props.button_text,
            callback        : this.props.callback 
          });
      }
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
        components_helper.notif.errorNotification( this.props.intl.formatMessage({id:'errors.validation_title'}), this.props.intl.formatMessage({id:'errors.verify_on_screen'}) )    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      if(!this.state.bank_account)
      {
        components_helper.notif.errorNotification( this.props.intl.formatMessage({id:'components.Forms.bank_account.forgot_choose_bank_account'}) )    
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
    const { getFieldDecorator }         = this.props.form;
    const { formatMessage }             = this.props.intl;
    
    const bank_name_message         = formatMessage({id:'components.forms.validators.forgot_bank_name'})
    const bank_agency_message       = formatMessage({id:'components.forms.validators.forgot_bank_agency'})
    const bank_cc_message           = formatMessage({id:'components.forms.validators.forgot_bank_cc'})
    const bank_name_placeholder     = formatMessage({id:'components.Forms.bank_account.bank_name_placeholder'})
    const bank_agency_placeholder   = formatMessage({id:'components.Forms.bank_account.bank_agency_placeholder'})
    const bank_cc_placeholder       = formatMessage({id:'components.Forms.bank_account.bank_cc_placeholder'})
    return (
      <Form onSubmit={this.handleSubmit}>
            <div className="money-transfer">
              
              <div className="money-transfer__row row-expandable row-complementary row-complementary-bottom" >
                <Form.Item label="Bank Name">
                  {getFieldDecorator('bank_account.bank_name', {
                    rules: [{ required:   true, 
                              message:    bank_name_message, 
                              whitespace: true }],
                    initialValue:bank_account.bank_name||''
                  })(
                    <Input autoFocus className="money-transfer__input" placeholder={bank_name_placeholder} />
                  )}
                </Form.Item>
              </div>

              <div className="money-transfer__row row-expandable row-complementary row-complementary-bottom" >
                <Form.Item label="Agency">
                  {getFieldDecorator('bank_account.agency', {
                    rules: [{ required:   true, 
                              message:    bank_agency_message , 
                              whitespace: true }],
                    initialValue:bank_account.agency||''
                  })(
                    <Input className="money-transfer__input"  placeholder={bank_agency_placeholder} />
                  )}
                </Form.Item>
              </div>

              <div className="money-transfer__row row-expandable row-complementary row-complementary-bottom" >
                <Form.Item label="CC">
                  {getFieldDecorator('bank_account.cc', {
                    rules: [{ required:      true
                              , message:     bank_cc_message
                              , whitespace:  true }],
                    initialValue:bank_account.cc||''
                  })(
                    <Input className="money-transfer__input"  placeholder={bank_cc_placeholder} />
                  )}
                </Form.Item>
              </div>

            </div>
            
            <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="addOrUpdateBankAccount" htmlType="submit" type="primary" >{button_text}</Button>
                <Button size="large" key="cancelBankAccount" type="link" onClick={ () => this.fireEvent(null, true, null)}>
                  {this.props.intl.formatMessage({id:'global.cancel'})}
                </Button>
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
)( injectIntl(BankAccountForm)) )
);
