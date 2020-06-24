import React, {Component} from 'react'

import { connect } from 'react-redux'

import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as components_helper from '@app/components/helper';

import AutocompleteBank from '@app/components/AutocompleteBank';

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
      bank_account      : props.bank_account || {...DEFAULT_STATE},
      alone_component   : props.alone_component || false,
      button_text       : props.button_text || default_text,
      callback          : props.callback ,
      bank_account_bank : null,
    };
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.handleBankChange           = this.handleBankChange.bind(this);     

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
  handleBankChange = (value) => {
    this.setState({'bank_account_bank' : value},
      () => {
        if(value)
          this.props.form.setFieldsValue({'bank_account.bank_keycode':value.bank_keycode})
      })
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
      
      // if(!this.state.bank_account)
      // {
      //   components_helper.notif.errorNotification( this.props.intl.formatMessage({id:'components.Forms.bank_account.forgot_choose_bank_account'}) )    
      //   return;
      // }
      
      const {bank_account_bank} = this.state;
      if(!bank_account_bank){
        components_helper.notif.errorNotification( this.props.intl.formatMessage({id:'components.Forms.bank_account.forgot_choose_bank_account'}) ) 
        return; 
      }
      if(!bank_account_bank.bank_keycode)
      {
        const bank_keycode_message  = this.props.intl.formatMessage({id: 'components.Forms.bank_account.choose_bank_account_with_keycode'})
        components_helper.notif.errorNotification(bank_keycode_message);
        return;
      }
      const _values = {...values.bank_account, ...bank_account_bank};

      this.fireEvent(null, null, _values);
      
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
    const bank_keycode_text         = formatMessage({id:'components.Forms.bank_account.bank_keycode'})
    return (
      <Form onSubmit={this.handleSubmit} className="with_labels">
            <div className="money-transfer">
              
              <div className="money-transfer__row row-expandable row-complementary row-complementary-bottom" >
                <AutocompleteBank callback={this.handleBankChange}  form={this.props.form} name="bank_account.bank_name" value={bank_account.bank_name||''} />
              </div>

              <div className="money-transfer__row row-expandable row-complementary row-complementary-bottom" >
                <Form.Item label={bank_keycode_text}>
                  {getFieldDecorator('bank_account.bank_keycode', {
                    rules: [{ required:   true, 
                              message:    bank_keycode_text , 
                              whitespace: true }],
                    initialValue:bank_account.bank_keycode||''
                  })(
                    <Input className="money-transfer__input"  placeholder={bank_keycode_text} />
                  )}
                </Form.Item>
              </div>

              <div className="money-transfer__row row-expandable row-complementary row-complementary-bottom" >
                <Form.Item label={bank_agency_placeholder}>
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
                <Form.Item label={bank_cc_placeholder}>
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
        <div className="">
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
