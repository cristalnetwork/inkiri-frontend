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
import * as components_helper from '@app/components/helper';

import AutocompleteAccount from '@app/components/AutocompleteAccount';

import ServiceCard from '@app/components/TransactionCard/service_card';

import { withRouter } from "react-router-dom";

import { Select, Empty, Button, Form, message, AutoComplete, Input, Icon } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { injectIntl } from "react-intl"; 

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
    const {formatMessage}   = this.props.intl;
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        components_helper.notif.errorNotification( formatMessage({id:'errors.validation_title'}), formatMessage({id:'errors.verify_on_screen'}) )    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      const {customer} = this.state;
      if(!customer)
      {
        const exists = this.props.accounts.filter( account => account.key==values.customer);
        if(!exists || exists.length==0)
        {
          components_helper.notif.errorNotification( formatMessage({id:'errors.select_account_from_list'}), )    
          return;
        }
      }

      let periods = api.pap_helper.getServicePeriods(values);
      if(periods<=0)
      {
        
        components_helper.notif.errorNotification( formatMessage({id:'components.Forms.service_contract.month_range_error'})
            , formatMessage({id:'components.Forms.service_contract.month_range_error_message'}) );     
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

  //
  render() {
    const { form, provider }      = this.props;
    const { customer, service }   = this.state;
    
    const customer_selector       = (<AutocompleteAccount callback={this.onSelect} form={form} name="customer" />)
    
    const {formatMessage}         = this.props.intl;
    const button_text             = formatMessage({id:'components.Forms.service_contract.send_request'});
    const service_begins_at       = formatMessage({id:'components.Forms.service_contract.service_begins_at'});
    const service_begins_at_msg   = formatMessage({id:'components.Forms.service_contract.service_begins_at_msg'});
    const service_expires_at      = formatMessage({id:'components.Forms.service_contract.service_expires_at'});
    const service_expires_at_msg  = service_begins_at_msg;

    return (
            
            <>
            <ServiceCard service={service} provider={provider} smallStyle={true} />

            <Form onSubmit={this.handleSubmit}>
              
              <div className="money-transfer no_label">    

                  {customer_selector}

                  {form_helper.withIcon('calendar-alt', form_helper.getMonthItem(form, null , 'begins_at'  , service_begins_at, service_begins_at_msg))}
                  {form_helper.withIcon('calendar-alt', form_helper.getMonthItem(form, null , 'expires_at' , service_expires_at, service_expires_at_msg))}
                  

              </div>
              <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="requestButton" htmlType="submit" type="primary" htmlType="submit" >{button_text}</Button>
                <Button size="large" className="danger_color" type="link" onClick={()=>{this.fireEvent(null, true, null)}}>
                  { formatMessage({id:'global.cancel'}) }
                </Button>
              </div>
                
              
            </Form>
            </>
        );
  }

  
}
//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:             accountsRedux.accounts(state),
        actualAccountName:    loginRedux.actualAccountName(state),
    }),
    (dispatch)=>({
        
    })
)( injectIntl(ServiceContractForm)) )
);


