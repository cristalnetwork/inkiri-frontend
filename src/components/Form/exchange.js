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
      input_amount      :
                          {  
                            style   : {maxWidth: 370, fontSize: 100, width: 60}
                             , value : undefined 
                             , symbol_style : {fontSize: 60}
                           },
      bank_account      : {}
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
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 

  }

  componentDidUpdate(prevProps, prevState) 
  {
      if(prevProps.profile !== this.props.profile) {
          this.setState({
            profile         : this.props.profile || this.props.actualAccountProfile,
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
        this.openNotificationWithIcon("error", "Validation errors","Please verifiy errors on screen!")    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      if(isNaN(this.state.input_amount.value))
      {
        this.openNotificationWithIcon("error", this.state.input_amount.value + " > valid number required","Please type a valid number greater than 0!")    
        return;
      }
      if(parseFloat(this.state.input_amount.value)>parseFloat(this.props.balance))
      {
        const balance_txt = globalCfg.currency.toCurrencyString(this.props.balance);
        this.openNotificationWithIcon("error", `Amount must be equal or less than balance ${balance_txt}!`); //`
        return;
      }

      if(!this.state.bank_account)
      {
        this.openNotificationWithIcon("error", 'You must choose a Bank Account!');
        return;
      }
      
      const {callback} = this.state;
      if(typeof  callback === 'function') {
          callback(values)
      }
      
    });
  };

  resetForm(){
    
    this.setState({...DEFAULT_STATE});
  }

  onInputAmount(event){
    event.preventDefault();
    const the_value = event.target.value;
    const _input_amount = this.state.input_amount;
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
                    , style :         {fontSize: size, width:(digitCount * (size*0.6))+(symbolCount * (size*0.2)) }
                    , symbol_style: {fontSize:  (size*0.6)}
                  }
                });
        }
      });
  }

  bankAccountToString(bank_account){
    delete bank_account._id;
    delete bank_account.id; 
    return Object.values(bank_account).join(', ')
  }

  renderBankOptionsItem(){
    const {profile} = this.state;
    if(!profile || !profile.bank_accounts)
      return (null);

    const { getFieldDecorator } = this.props.form;
    
    return (
      <Form.Item className="money-transfer__row">
          {getFieldDecorator( 'bank_account', {
            rules: [{ required: true, message: 'Please select a Bank Account'}]
            , onChange: (e) => this.handleBankAccountChange(e)
          })(
            <Select placeholder={'Choose a Bank Account'} optionLabelProp="label">
            {profile.bank_accounts.map( b_account => <Select.Option key={b_account.id} value={b_account.id} label={this.bankAccountToString(b_account)}>{ this.bankAccountToString(b_account) } </Select.Option> )}
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
    return (
        <Form onSubmit={this.handleSubmit}>
            <div className="money-transfer">
              
              <div className="money-transfer__row row-complementary" >
                  <div className="badge badge-extra-small badge-circle addresse-avatar">
                      <span className="picture">
                        <FontAwesomeIcon icon="university" size="lg" color="gray"/>
                      </span>
                  </div>
                  <div className="money-transfer__input money-transfer__select">
                    {bank_options_item}
                  </div>
              </div>

                
              <Form.Item label="Amount" className="money-transfer__row input-price" style={{textAlign: 'center'}}>
                    {getFieldDecorator('input_amount.value', {
                      rules: [{ required: true, message: 'Please input an amount!', whitespace: true, validator: validators.checkPrice }],
                      initialValue: input_amount.value,

                    })( 
                      <>  
                        <span className="input-price__currency" id="inputPriceCurrency" style={input_amount.symbol_style}>
                          {globalCfg.currency.fiat.symbol}
                        </span>
                        
                        <Input 
                          type="tel" 
                          step="0.01" 
                          className="money-transfer__input input-amount placeholder-big" 
                          id="amount"
                          placeholder="0" 
                          value={input_amount.value} 
                          onChange={this.onInputAmount}  
                          style={input_amount.style}  
                        />
                      </>
                    )}
              </Form.Item>
                
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
