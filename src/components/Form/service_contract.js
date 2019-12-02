import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as accountsRedux from '@app/redux/models/accounts';
import * as loginRedux from '@app/redux/models/login'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as validators from '@app/components/Form/validators';
import * as request_helper from '@app/components/TransactionCard/helper';
import * as form_helper from '@app/components/Form/form_helper';

import ServiceCard from '@app/components/TransactionCard/service_card';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { Select, notification, Empty, Button, Form, message, AutoComplete, Input, Icon } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class ServiceContractForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      services_states: props.services_states,
      service:         props.service,
      provider:        props.provider,
      customer:        props.customer,
      callback:        props.callback,

    };
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.onSelect                   = this.onSelect.bind(this)
  }

  componentDidMount(){
  }

  componentDidUpdate(prevProps, prevState) 
  {
      if(prevProps.job_positions !== this.props.job_positions) {
        this.setState({
            services_states: this.props.services_states,
            service:         this.props.service,
            provider:        this.props.provider,
            callback:        this.props.callback,
            customer:        this.props.customer,
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
    
  fireEvent = (error, cancel, data) => {
    const {callback} = this.state;
    if(typeof  callback === 'function') {
        callback(error, cancel, data)
    }
  }
  
  onSelect = (e) => {
    console.log( ' ++ onSelect -> ',  e)
  }

  handleSubmit = (e) => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        this.openNotificationWithIcon("error", "Validation errors","Please verifiy errors on screen!")    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      const {customer} = this.state;
      if(!customer)
      {
        const exists = this.props.accounts.filter( account => account.key==values.customer);
        if(!exists || exists.length==0)
        {
          this.openNotificationWithIcon("error", 'Please select an account from the list.');
          return;
        }
      }

      let periods = api.pap_helper.getServicePeriods(values);
      if(periods<=0)
      {
        this.openNotificationWithIcon("error", 'Month range error', 'Initial service month should be prior to or equal than ending one.');
        return;
      }

      const {provider, service } = this.state;
      let contract = {
        begins_at   : values.begins_at,
        expires_at  : values.expires_at,
        provider    : provider,
        service     : service,
        customer    : values.customer,
        periods     : periods     
      }
      this.fireEvent(null, null, contract);
      
    });
  };

  resetForm(){
    
    // this.setState({...DEFAULT_STATE});
  }

  renderCustomerSelector(){
    const {customer}              = this.state;
    const { getFieldDecorator } = this.props.form;
    const my_accounts           = this.props.accounts.filter(acc=>acc.key!=this.props.actualAccountName && globalCfg.bank.isPersonalAccount(acc)).map(acc=>acc.key)
    let selector   = null;
    //
    if(customer){
      selector = (<div className="ui-row__col ui-row__col--content">
                    <div className="ui-info-row__content">
                        <div className="ui-info-row__title"><b>{request_helper.getProfileName(customer)}</b></div>
                          <div className="ui-info-row__details">
                              <ul>
                                  <li>@{customer.account_name}</li>
                              </ul>
                          </div>
                    </div>
                </div>); 
    }
    else{
      selector = (<Form.Item>
                        {getFieldDecorator('customer', {
                        rules: [{ required: true, message: 'Please choose a customer!' }]
                      })(
                          <AutoComplete size="large" dataSource={my_accounts} style={{ width: '100%' }} onSelect={this.onSelect} placeholder="Choose a customer by account name" filterOption={true} className="extra-large" />
                        )}
                      </Form.Item>);
    }
  //
    return (<div className="money-transfer__row row-complementary row-complementary-bottom money-transfer__select" >
              <div className="badge badge-extra-small badge-circle addresse-avatar ">
                  <span className="picture">
                    <FontAwesomeIcon icon="user" size="lg" color="gray"/>
                  </span>
              </div>
              <div className="money-transfer__input money-transfer__select">
                {selector}
              </div>
          </div>);
  }
  
  //

  render() {
    const { form, provider }      = this.props;
    const { customer, service }     = this.state;
    const customer_selector         = this.renderCustomerSelector();
    const button_text             = 'SEND REQUEST';
    return (
            
            <>
            <ServiceCard service={service} provider={provider} smallStyle={true} />

            <Form onSubmit={this.handleSubmit}>
              
              <div className="money-transfer no_label">    

                  {customer_selector}
                  {form_helper.withIcon('calendar-alt', form_helper.getMonthItem(form, null , 'begins_at'  , 'Service begins at'  , 'Please input a valid month!'))}
                  {form_helper.withIcon('calendar-alt', form_helper.getMonthItem(form, null , 'expires_at' , 'Service expires at' , 'Please input a valid month!'))}
                  

              </div>
              <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="requestButton" htmlType="submit" type="primary" htmlType="submit" >{button_text}</Button>
                <Button size="large" className="danger_color" type="link" onClick={()=>{this.fireEvent(null, true, null)}}>Cancel</Button>
              </div>
                
              
            </Form>
            </>
        );
  }

  
}
//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:               accountsRedux.accounts(state)
    }),
    (dispatch)=>({
        
    })
)(ServiceContractForm) )
);


