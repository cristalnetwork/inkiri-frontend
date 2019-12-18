import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as validators from '@app/components/Form/validators';
import * as components_helper from '@app/components/helper';
import {ACTIVE_TAB_PROFILE, ACTIVE_TAB_PROFILE_BANK_ACCOUNT} from '@app/pages/common/configuration';
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { Upload, notification, Select, Button , Form, Icon, InputNumber, Input } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const DEFAULT_STATE = {
      input_amount      :
                          {  
                            style   : {maxWidth: 370, fontSize: 100, width: 60}
                             , value : undefined 
                             , symbol_style : {fontSize: 60}
                           },
      bank_account      : {},
      attachments:       {
        [globalCfg.api.NOTA_FISCAL]       : undefined,
        [globalCfg.api.BOLETO_PAGAMENTO]  : undefined,
      }
};

class ExchangeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profile         : props.profile || this.props.actualAccountProfile,
      alone_component : props.alone_component || false,
      button_text     : props.button_text || 'SUBMIT',
      callback        : props.callback ,
      ...DEFAULT_STATE
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.handleBankAccountChange    = this.handleBankAccountChange.bind(this); 
    this.onInputAmount              = this.onInputAmount.bind(this);
  }

  clearAttachments(){
    this.setState({ attachments:       {
        [globalCfg.api.NOTA_FISCAL]       : undefined,
        [globalCfg.api.BOLETO_PAGAMENTO]  : undefined,
      }});
  }

  getPropsForUploader(name){
    const filelist = this.state.attachments[name] || [];
    console.log(' -- getPropsForUploader => ', JSON.stringify(filelist));
    
    return {
      onRemove: file => {
        this.setState(state => {
          const index         = state.attachments[name].indexOf(file);
          const newFileList   = state.attachments[name].slice();
          newFileList.splice(index, 1);
          return {
            attachments: {[name]: newFileList}
          };
        });
      },
      beforeUpload: file => {
        if(this.state.attachments[name] && this.state.attachments[name].length>0)
        {
          components_helper.notif.infoNotification("Only 1 file allowed");
          return false;
        }

        let attachments = this.state.attachments || {};
        attachments[name]= [file];
        this.setState(state => ({
          ...attachments
        }));
        return false;
      },
      fileList: filelist,
      className: filelist.length>0?'icon_color_green':'icon_color_default'
    };
  }

  componentDidUpdate(prevProps, prevState) 
  {
    let new_state = {};
    if(prevProps.profile !== this.props.profile) {
      new_state = {...new_state, 
          profile         : this.props.profile || this.props.actualAccountProfile,
          alone_component : this.props.alone_component || false,
          button_text     : this.props.button_text || 'SUBMIT',
          callback        : this.props.callback 
        };
    }
    if(Object.keys(new_state).length>0)      
        this.setState(new_state);
  }

  componentDidMount() {
    console.log('if(typeof this.props.onRef===function) ?? ', typeof this.props.onRef)
    if(typeof this.props.onRef==='function')
    {
      console.log('YES')
      this.props.onRef(this)
    }
    else
      console.log('NO')
  }
  componentWillUnmount() {
    if(typeof this.props.onRef==='function')
      this.props.onRef(undefined)
  }

  getBankAccountById(id){
    const {bank_accounts} = this.state.profile;
    return bank_accounts.filter(ba => ba._id==id)[0]
  }

  /*
  * Components' Events.
  */
  handleBankAccountChange = (value) => {

    this.setState({
      bank_account         : value,
      bank_account_object  : this.getBankAccountById(value) 
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {

      if (err) {
        components_helper.notif.errorNotification("Validation errors","Please verifiy errors on screen!");
        console.log(' ERRORS!! >> ', err)
        return;
      }
      const {input_amount, bank_account} = this.state;
      if(isNaN(input_amount.value))
      {
        components_helper.notif.errorNotification("Valid number required","Please type a valid number greater than 0!");
        return;
      }
      if(parseFloat(input_amount.value)>parseFloat(this.props.balance))
      {
        const balance_txt = globalCfg.currency.toCurrencyString(this.props.balance);
        components_helper.notif.errorNotification(`Amount must be equal or less than balance ${balance_txt}!`);
        return;
      }

      if(!bank_account)
      {
        components_helper.notif.errorNotification('You must choose a Bank Account!');
        return;
      }
      
      // const attachments         = this.state.attachments;
      // const my_NOTA_FISCAL      = (attachments[globalCfg.api.NOTA_FISCAL] && attachments[globalCfg.api.NOTA_FISCAL].length>0) ? attachments[globalCfg.api.NOTA_FISCAL][0] : undefined;
      
      // if(!my_NOTA_FISCAL)
      // {
      //   components_helper.notif.errorNotification('Nota Fiscal attachment is required', 'Please attach a Nota Fiscal PDF file.');
      //   return;
      // }

      const attachments         = this.state.attachments;
      const my_NOTA_FISCAL      = (attachments[globalCfg.api.NOTA_FISCAL] && attachments[globalCfg.api.NOTA_FISCAL].length>0) ? attachments[globalCfg.api.NOTA_FISCAL][0] : undefined;
      
      let attachments_array = {};
      if(my_NOTA_FISCAL) 
        attachments_array[globalCfg.api.NOTA_FISCAL] = my_NOTA_FISCAL;

      const exchange_request = {
        amount              : input_amount.value,
        bank_account        : bank_account,
        bank_account_object : this.getBankAccountById(bank_account),
        attachments_array   : attachments_array
        // { [globalCfg.api.NOTA_FISCAL] : my_NOTA_FISCAL}
      }
      const {callback} = this.state;
      if(typeof  callback === 'function') {
          callback(exchange_request)
      }
      
    });
  };

  reset = () => this.resetForm();

  resetForm(){
    console.log('exchangeForm->ResetForm')
    this.setState({...DEFAULT_STATE});
    this.props.form.setFieldsValue({'bank_account':''})
  }

  onInputAmount(event){
    event.preventDefault();
    const the_value = event.target.value;
    const _input_amount = this.state.input_amount;
    this.props.form.setFieldsValue({'input_amount.value':the_value})
    this.setState({input_amount: {..._input_amount, value: the_value}}, 
      () => {
        if(the_value && the_value.toString().length){
          const value = the_value.toString();
          var digitCount = value.length > 0 ? value.replace(/\./g,"").replace(/,/g,"").length : 1
          var symbolCount = value.length > 0 ? value.length - digitCount : 0;
          const isMobile = false;
          var size = isMobile ? 48 : 100

          if(digitCount > 7){
            size = isMobile ? 40 : 48
          } else if(digitCount > 4){
            size = isMobile ? 48 : 70
          }

          const {input_amount} = this.state;
          this.setState({
                  input_amount : {
                    ...input_amount
                    , style :       {fontSize: size, width:(digitCount * (size*0.6))+(symbolCount * (size*0.2)) }
                    , symbol_style: {fontSize:  (size*0.6)}
                  }
                });
        }
      });
  }

  onNewBankAccount =() =>{
    this.props.history.push({
      pathname: `/common/configuration`
      , state: { 
          active_tab: ACTIVE_TAB_PROFILE
          , active_tab_action:  ACTIVE_TAB_PROFILE_BANK_ACCOUNT
        }
    })
  }

  renderBankOptionsItem(){
    const {profile} = this.state;
    if(!profile || !profile.bank_accounts)
      return (null);

    const { getFieldDecorator } = this.props.form;
    return (
      <Form.Item className="money-transfer__row row-complementary money-transfer__select ">          
          {getFieldDecorator( 'bank_account', {
            rules: [{ required: true, message: 'Please select a Bank Account'}]
            , onChange: (e) => this.handleBankAccountChange(e)
          })(
            <Select placeholder={'Choose a Bank Account'}>
            {
              profile.bank_accounts.map( b_account => 
                {
                  const label = [b_account.bank_name, b_account.agency, b_account.cc].join(', ');
                  return (<Select.Option key={'bank_account_option_'+b_account._id} value={b_account._id} label={label}>{ label } </Select.Option> )
                }
              )
            }
            </Select>
          )}
      </Form.Item>
    )
  }
  //
  
  renderContent() {  
    const { input_amount, profile, button_text } = this.state;
    const { getFieldDecorator }                  = this.props.form;
    const bank_options_item                      = this.renderBankOptionsItem();
    const notaUploaderProps                      = this.getPropsForUploader(globalCfg.api.NOTA_FISCAL);
    return (
        <Form onSubmit={this.handleSubmit}>
            <div className="money-transfer">
              
              <div className="money-transfer__row row-complementary" >
                  <div className="badge badge-extra-small badge-circle addresse-avatar">
                      <span className="picture">
                        <FontAwesomeIcon icon="university" size="lg" color="black"/>
                      </span>
                  </div>
                  <div className="money-transfer__input money-transfer__select">
                    <Button type="default" icon="plus" size="small" onClick={() => this.onNewBankAccount()} title="Add new bank account" style={{position:'absolute', right:8, top:8}}/>
                    {bank_options_item}
                  </div>
              </div>

                
              <Form.Item label="Amount" className="money-transfer__row input-price" style={{textAlign: 'center'}}>
                    {getFieldDecorator('input_amount.value', {
                      rules: [{ required: true, message: 'Please input an amount!', whitespace: true, validator: validators.checkPrice }],
                      initialValue: input_amount.value
                    })( 
                      <>  
                        <span className="input-price__currency" id="inputPriceCurrency" style={input_amount.symbol_style}>
                          {globalCfg.currency.fiat.symbol}
                        </span>
                        
                        <Input 
                          type="tel" 
                          step="0.01" 
                          className="money-transfer__input input-amount placeholder-big" 
                          placeholder="0" 
                          onChange={this.onInputAmount}  
                          value={input_amount.value} 
                          style={input_amount.style}  
                        />
                      </>
                    )}
              </Form.Item>
              
              <div className="money-transfer__row file_selector">
                <Form.Item>
                    <Upload.Dragger {...notaUploaderProps} multiple={false}>
                      <p className="ant-upload-drag-icon">
                        <FontAwesomeIcon icon="receipt" size="3x"/>
                      </p>
                      <p className="ant-upload-text">Nota Fiscal</p>
                    </Upload.Dragger>,
                </Form.Item>
              </div>
            </div>
            
            <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="exchangeFormButton" htmlType="submit" type="primary" >{button_text}</Button>
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
)(ExchangeForm) )
);
