import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as accountsRedux from '@app/redux/models/accounts';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as validators from '@app/components/Form/validators';
import * as request_helper from '@app/components/TransactionCard/helper';
import * as form_helper from '@app/components/Form/form_helper';

import { withRouter } from "react-router-dom";

import { Select, notification, Empty, Button, Form, message, Input, Icon, DatePicker } from 'antd';
import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const DEFAULT_STATE = {
      input_amount: {  
        style   :           {maxWidth: 370, fontSize: 100, width: 60}
         , value :          undefined 
         , symbol_style :   {fontSize: 60}
       }
};


class ServiceForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      services_states: props.services_states,
      service:         props.service,
      callback:        props.callback,
      ...DEFAULT_STATE
    };
    this.onInputAmount              = this.onInputAmount.bind(this);
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.onSelect                   = this.onSelect.bind(this)
    this.handleStateChange    = this.handleStateChange.bind(this); 
  }

  componentDidMount(){
    this.setDefaultPrice();
  }

  componentDidUpdate(prevProps, prevState) 
  {
      if(prevProps.services_states !== this.props.services_states) {
        this.setState({
            services_states: this.props.services_states,
            service:        this.props.service,
            // position:      this.props.position,
            // wage:          this.props.wage,
            callback:      this.props.callback
          });
        this.setDefaultPrice();
      }
  }

  setDefaultPrice = () =>{
    const {service} = this.state;
    if(!service)
      return;
    this.onInputAmount(service.amount);

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
  
  handleStateChange = (value) => {
    
    const {services_states} = this.state;
    // const wage = services_states.filter(j=>j.key==value)[0].wage;
    // this.onInputAmount(wage);

  }

  onSelect = (e) => {
  
  }

  handleSubmit = (e) => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        this.openNotificationWithIcon("error", "Validation errors","Please verifiy errors on screen!")    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      const {service} = this.state;
      
      const editing = (service!=null);
      let my_service = (editing)
        ? { ...values, _id:service._id}
        : { ...values };

      this.fireEvent(null, null, my_service);
      
    });
  };

  resetForm(){
    
    // this.setState({...DEFAULT_STATE});
  }

  onInputAmount(param){
    let the_value = param;
    if(typeof param !== 'number' && typeof param !== 'string')
    {
      param.preventDefault();
      the_value = param.target.value;
    }
    
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

  //
  renderServiceState(){
    const {services_states, service} = this.state;
    if(!services_states)
      return (null);
    const _state                = (service)?service.state:undefined;
    const { getFieldDecorator } = this.props.form;
    const selector = (<Form.Item>
          {getFieldDecorator( 'position', {
            rules: [{ required: true, message: 'Please select a status'}]
            , onChange: (e) => this.handleStateChange(e)
            , initialValue: _state
          })(
            <Select placeholder="Choose a status" >
            {
              services_states.map( state => 
                {
                  return (<Select.Option key={'state_'+state.key} value={state.key} label={state.title}>{ state.title } </Select.Option> )
                }
              )
            }
            </Select>
          )}
      </Form.Item>
    );
    //

    return (<div className="money-transfer__row row-complementary money-transfer__select" >
              <div className="badge badge-extra-small badge-circle addresse-avatar ">
                  <span className="picture">
                    <FontAwesomeIcon icon={'traffic-light'} size="lg" color="gray"/>
                  </span>
              </div>
              <div className="money-transfer__input money-transfer__select">
                {selector}
              </div>
          </div>);
  }
  
  render() {
    const { form }                  = this.props;
    const { getFieldDecorator }     = form;
    const { input_amount, service } = this.state;
    
    const state_item                = (null); //this.renderServiceState();
    const button_text               = service?'MODIFY SERVICE':'ADD SERVICE';
    return (
          
            <Form onSubmit={this.handleSubmit}>
              
              <div className="money-transfer">    

                  {form_helper.simple(form_helper.getStringItem(form,   service   , 'title'        , 'Service title' ,       'Please input a valid title!'))}
                  {form_helper.simple(form_helper.getTextareaItem(form, service , 'description'  , 'Service description' , 'Please input a valid description!'))}

                  <Form.Item label="Amount" className="money-transfer__row input-price row-complementary row-complementary-bottom" style={{textAlign: 'center', height:'180px'}}
                    extra={<>Monthly price.</>}
                    >
                      {getFieldDecorator('input_amount.value', {
                        rules: [{ required: true, message: 'Please input an amount!', whitespace: true, validator: validators.checkPrice }],
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
                  {state_item}
              </div>  
              <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="requestButton" htmlType="submit" type="primary" htmlType="submit" >{button_text}</Button>
                <Button size="large" className="danger_color" type="link" onClick={()=>{this.fireEvent(null, true, null)}}>Cancel</Button>
              </div>
                
              
            </Form>
          
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
)(ServiceForm) )
);
