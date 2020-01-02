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
import AccountName from '@app/components/TransactionCard/account_name';
import NameValueIcon from '@app/components/TransactionCard/name_value_icon';

import { withRouter } from "react-router-dom";

import { Select, notification, Empty, Button, Form, message, AutoComplete, Input, Icon } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class ServiceContractChargeForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      service:         props.service,
      provider:        props.provider,
      contract:        props.contract,
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
            service:         this.props.service,
            contract:        this.props.contract,
            callback:        this.props.callback
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
      
      const { contract }   = this.state;
      this.fireEvent(null, null, {contract:contract});
      
    });
  };

  resetForm(){
    
    // this.setState({...DEFAULT_STATE});
  }

  //

  render() {
    const { form, provider }      = this.props;
    const { service, contract }   = this.state;
    const charge_info             = api.pap_helper.getChargeInfo(contract);
    const next_month              = charge_info.next.format(form_helper.MONTH_FORMAT_HUMANIZED);

    const button_text             = 'CHARGE';
    return (
            
            <>
            <ServiceCard service={service} provider={provider} smallStyle={true} />

            <AccountName account_name={contract.account} title={"Customer"} not_alone={false} />

            <NameValueIcon name="Next month to charge" value={next_month} icon="calendar-alt" />

            {charge_info.days_to_charge>=0
              ?(<NameValueIcon name="Days remaining to charge" value={charge_info.days_to_charge} icon="calculator" />)
              :(null)}

            <Form onSubmit={this.handleSubmit}>
              
              <div className="money-transfer no_label">    
                  

              </div>
              <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="requestButton" htmlType="submit" type="primary" htmlType="submit" disabled={charge_info.days_to_charge>=0}>{button_text}</Button>
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
)(ServiceContractChargeForm) )
);


