import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as accountsRedux from '@app/redux/models/accounts';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as validators from '@app/components/Form/validators';

import { withRouter } from "react-router-dom";

import * as components_helper from '@app/components/helper';

import { notification, Empty, Button, Form, message, Input, Icon } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {CopyToClipboard} from 'react-copy-to-clipboard';

import { injectIntl } from "react-intl";

class EditKeyForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authority: props.authority,
      owner: props.owner,
      callback: props.callback,

      default_keys:     {  
                         wif:      'Generated Private Key',
                         pub_key:  'Generated Public Key',
                         seed:     ''}, 
      generated_keys:   {
                         wif:      'Generated Private Key',
                         pub_key:  'Generated Public Key',
                         seed:     ''} ,

    };
    
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.onSelect                   = this.onSelect.bind(this)
  }

  componentDidUpdate(prevProps, prevState) 
  {
  }

  /*
  * Components' Events.
  */
    
  fireEvent = (error, cancel, data) => {
    const {callback} = this.state;
    if(typeof  callback === 'function') {
        callback(error, cancel, data)
    }
  }
  
  onSelect = (e) => {
  
  }

  handleSubmit = (e) => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        components_helper.notif.errorNotification( this.props.intl.formatMessage({id:'errors.validation_title'}), this.props.intl.formatMessage({id:'errors.verify_on_screen'}) )    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      values['authority'] = this.state.authority;
      this.fireEvent(null, null, values);
      
    });
  };

  resetForm(){
  }

  generateKeys(do_generate, callback){

    if(!do_generate)
    {
      const {default_keys} = this.state;
      this.setState({generated_keys:default_keys})
      return;
    }
    const { form }     = this.props;
    const account_name = form.getFieldValue('account_name')
    const password = do_generate;
    // const keys = api.eosHelper.seedPrivate(seed);
    const keys = api.keyHelper.getDerivedKey(account_name, password)
    const that = this;
    api.getKeyAccounts(keys.pub_key)
      .then(()=>{
        if(callback)
          callback(that.state.intl.account_unique_validation);
      },(err)=>{
        that.setState({generated_keys:keys})
        if(callback)
          callback()
      })

  }

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      this.generateKeys(undefined)
      callback(this.state.intl.passwords_are_not_equal);
    } else {
      this.generateKeys(value)
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm_password'], { force: true });
      callback();
      // return;
    }
    if (value && form.getFieldValue('confirm_password') && value !== form.getFieldValue('confirm_password')) {
      this.generateKeys(undefined)
      callback(this.state.intl.both_passwords_must_be_equal);
      return;
    }
    callback();
  };


  render() {
    const { getFieldDecorator }     = this.props.form;
    const { owner, generated_keys } = this.state;
    const {formatMessage}           = this.props.intl;

    return (
      
        <div className="ly-main-content content-spacing cards">
          <section className="mp-box money-transfer__box">
            <Form onSubmit={this.handleSubmit}>
            
              <div className="money-transfer">      

                  <Form.Item label={ formatMessage({id:'pages.bankadmin.create_account.password'}) } hasFeedback>
                    {getFieldDecorator('password', {
                      rules: [
                        {
                          required: true,
                          message:  formatMessage({id:'pages.bankadmin.create_account.password_validation'}),
                        }
                        ,{ min: 4, message: formatMessage({id:'pages.bankadmin.create_account.password_validation_4_chars_min'}) }
                        ,{
                          validator: this.validateToNextPassword,
                        },
                      ]
                    })(<Input.Password visibilityToggle="true" />)}
                  </Form.Item>

                  <Form.Item label={ formatMessage({id:'pages.bankadmin.create_account.confirm_password'}) } hasFeedback>
                    {getFieldDecorator('confirm_password', {
                      rules: [
                        {
                          required: true,
                          message: formatMessage({id:'pages.bankadmin.create_account.confirm_password_validation'}),
                        },
                        {
                          validator: this.compareToFirstPassword,
                        },
                      ]
                    })(<Input.Password visibilityToggle="true" onBlur={this.handleConfirmBlur} />)}
                  </Form.Item>
                  <h3>{ formatMessage({id:'pages.bankadmin.create_account.keys_section'}) }</h3>
                  <Form.Item label={ formatMessage({id: 'pages.bankadmin.create_account.private_key' }) } 
                             extra={ formatMessage({id: 'pages.bankadmin.create_account.private_key_hint'}) }>
                    <Input readOnly addonAfter={
                        <CopyToClipboard text={generated_keys.wif} onCopy={() => components_helper.notif.successNotification( formatMessage({id:'pages.bankadmin.create_account.key_copied_message'}) ) }>
                           <Button type="link" icon="copy" />
                        </CopyToClipboard>
                    } value={generated_keys.wif} />
                  </Form.Item>
                  <Form.Item label={ formatMessage({id: 'pages.bankadmin.create_account.public_key' }) } >
                    <Input readOnly addonAfter={<Icon type="global" />} value={generated_keys.pub_key}  />
                  </Form.Item>

                  <div className="mp-box__actions mp-box__shore">
                    <Button size="large" key="requestButton" htmlType="submit" type="primary" htmlType="submit" >{this.props.intl.formatMessage({id:'components.Views.profile_security.update_key'})}</Button>
                    <Button size="large" className="danger_color" type="link" onClick={()=>{this.fireEvent(null, true, null)}}>
                      {this.props.intl.formatMessage({id:'global.cancel'})}
                    </Button>
                  </div>
              </div>
            </Form>
        </section>
      </div>      
    

    );
  }

}
//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:         accountsRedux.accounts(state),
    }),
    (dispatch)=>({
        
    })
)( injectIntl(EditKeyForm) ) )
);
