import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as accountsRedux from '@app/redux/models/accounts';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as validators from '@app/components/Form/validators';

import { withRouter } from "react-router-dom";

import * as components_helper from '@app/components/helper';

import { Spin, Empty, Button, Form, message, Input, Icon } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {CopyToClipboard} from 'react-copy-to-clipboard';

import { injectIntl } from "react-intl";

const EMPTY_KEYS = {
    wif:      null, 
    pub_key:  null}
;
class EditKeyForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authority:        props.authority,
      owner:            props.owner,
      callback:         props.callback,
      generated_keys:   EMPTY_KEYS ,
      loading:          false,
      intl:             {}
    };
    
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.createKeys                 = this.createKeys.bind(this)
  }

  componentDidMount()
  {
    const {formatMessage} = this.props.intl;
    const passwords_are_not_equal = formatMessage({id:'pages.bankadmin.create_account.passwords_are_not_equal'});
    const both_passwords_must_be_equal = formatMessage({id:'pages.bankadmin.create_account.both_passwords_must_be_equal'});
    const account_unique_validation = formatMessage({id:'pages.bankadmin.create_account.account_unique_validation'});

    this.setState({intl:{passwords_are_not_equal, both_passwords_must_be_equal, account_unique_validation}})
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
  
  handleSubmit = (e) => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        components_helper.notif.errorNotification( this.props.intl.formatMessage({id:'errors.validation_title'}), this.props.intl.formatMessage({id:'errors.verify_on_screen'}) )    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      values['public_key']   = this.state.generated_keys.pub_key;
      values['account_name'] = this.props.account_name;
      this.fireEvent(null, null, values);
      
    });
  };

  resetForm(){
  }

  generateKeys(do_generate, callback){

    if(!do_generate)
    {
      this.cleanKeys();
      return;
    }
    const { form }     = this.props;
    const account_name = 'cambiodeinki'; //form.getFieldValue('account_name')
    const password = do_generate;
    // const keys = api.eosHelper.seedPrivate(seed);
    const keys = api.keyHelper.getDerivedKey_ex(account_name, password)
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

  createKeys(){
    const that = this;
    this.setState({loading:true},
      ()=>{
        setTimeout(()=> {
          const { form }             = that.props;
          const account_name         = that.props.account_name; //form.getFieldValue('account_name')
          const password             = form.getFieldValue('password');
          const confirm_password     = form.getFieldValue('confirm_password');
          if(password!=confirm_password || !password || password.trim()=='')
          {
            that.setState({generated_keys:EMPTY_KEYS})
            components_helper.notif.errorNotification( that.state.intl.both_passwords_must_be_equal );
            that.setState({loading:false});
            return;
          }
          const keys = api.keyHelper.getDerivedKey_ex(account_name, password)
          api.getKeyAccounts(keys.pub_key)
            .then(()=>{
              that.setState({generated_keys:EMPTY_KEYS})
              components_helper.notif.errorNotification( that.state.intl.account_unique_validation );
              that.setState({loading:false});
            },(err)=>{
              that.setState({generated_keys:keys})
              that.setState({loading:false});
              
            })      
        } ,200);
        
      })
    

  }

  cleanKeys = () =>{
    this.setState({generated_keys:EMPTY_KEYS})
  }
  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      // this.generateKeys(undefined)
      this.cleanKeys();
      callback(this.state.intl.passwords_are_not_equal);
    } else {
      // this.generateKeys(value)
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
      // this.generateKeys(undefined)
      callback(this.state.intl.both_passwords_must_be_equal);
      return;
    }
    callback();
  };


  render() {
    const { getFieldDecorator }     = this.props.form;
    const { owner, generated_keys } = this.state;
    const {formatMessage}           = this.props.intl;
    const can_create                = generated_keys.wif!=null;
    return (
      
        <div className="ly-main-content content-spacing cards">
          <section className="mp-box money-transfer__box">
            <Spin spinning={this.state.loading} delay={500} tip={formatMessage({id:'components.Views.profile_security.generating_keys'})}>
              <Form onSubmit={this.handleSubmit}>
              
                <div className="money-transfer">      
                    <Form.Item label={ formatMessage({id:'components.Views.profile_security.new_password_field_text'}) } hasFeedback>
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

                    <Form.Item label={ formatMessage({id:'components.Views.profile_security.confirm_new_password_field_text'}) } hasFeedback>
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
                    
                    <div style={{padding: '8px 0px', textAlign: 'right'}}>
                      <Button disabled={this.state.loading} key="generate_keys" onClick={()=>{this.createKeys()}} >{this.props.intl.formatMessage({id:'components.Views.profile_security.generate_keys_button_text'})}</Button>
                    </div>

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
                      <Button size="large" disabled={!can_create||this.state.loading} key="requestButton" htmlType="submit" type="primary" htmlType="submit" >{this.props.intl.formatMessage({id:'components.Views.profile_security.update_key'})}</Button>
                      <Button size="large" disabled={this.state.loading} className="danger_color" type="link" onClick={()=>{this.fireEvent(null, true, null)}}>
                        {this.props.intl.formatMessage({id:'global.cancel'})}
                      </Button>
                    </div>
                </div>
              </Form>
            </Spin>
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
