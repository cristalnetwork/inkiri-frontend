import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as accountsRedux from '@app/redux/models/accounts';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as validators from '@app/components/Form/validators';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { Select, notification, Empty, Button, Form, message, AutoComplete, Input, Icon } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const DEFAULT_STATE = {
      input_amount: {  
        style   :           {maxWidth: 370, fontSize: 100, width: 60}
         , value :          undefined 
         , symbol_style :   {fontSize: 60}
       },
      position:             null,
      wage:                 0
};


class AddMemberForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      job_positions: props.job_positions,
      member:        props.member,
      callback:      props.callback,
      // position:      props.position,
      // wage:          props.wage
      ...DEFAULT_STATE
    };
    
    this.onInputAmount              = this.onInputAmount.bind(this);
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.onSelect                   = this.onSelect.bind(this)
    this.handleJobPositionChange    = this.handleJobPositionChange.bind(this); 
  }

  componentDidUpdate(prevProps, prevState) 
  {
      if(prevProps.job_positions !== this.props.job_positions) {
          this.setState({
            job_positions: this.props.job_positions,
            member:        this.props.member,
            position:      this.props.position,
            wage:          this.props.wage,
            callback:      this.props.callback
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
  
  handleJobPositionChange = (value) => {
    
    const {job_positions} = this.state;
    const wage = job_positions.filter(j=>j.key==value)[0].wage;
    // this.props.form.setFieldsValue({'input_amount.value': wage})
    this.onInputAmount(wage)

    // console.log('handleJobPositionChange:', value, wage)
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
      
      const exists = this.props.accounts.filter( account => account.key==values.member);
      if(!exists || exists.length==0)
      {
        this.openNotificationWithIcon("error", 'Please select an account from the list.');
        return;
      }
      this.fireEvent(null, null, values);
      
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

  renderJobPosition(){
    const {job_positions} = this.state;
    if(!job_positions)
      return (null);

    const { getFieldDecorator } = this.props.form;
    return (
      <Form.Item className="money-transfer__row row-complementary money-transfer__select ">
          {getFieldDecorator( 'position', {
            rules: [{ required: true, message: 'Please select a job position'}]
            , onChange: (e) => this.handleJobPositionChange(e)
            
          })(
            <Select placeholder={'Choose a job position'}>
            {
              job_positions.map( position => 
                {
                  return (<Select.Option key={'position_'+position.key} value={position.key} label={position.title}>{ position.title } </Select.Option> )
                }
              )
            }
            </Select>
          )}
      </Form.Item>
    )
  }
  
  //

  render() {
    const { getFieldDecorator } = this.props.form;
    const { input_amount }      = this.state;
    const job_options_item      = this.renderJobPosition();
    return (
          
            <Form onSubmit={this.handleSubmit}>
              
              <div className="money-transfer">    

                  <div className="money-transfer__row row-complementary row-complementary-bottom money-transfer__select" >
                      <div className="badge badge-extra-small badge-circle addresse-avatar ">
                          <span className="picture">
                            <FontAwesomeIcon icon="user" size="lg" color="gray"/>
                          </span>
                      </div>
                      <div className="money-transfer__input money-transfer__select">
                        <Form.Item>
                          {getFieldDecorator('member', {
                          rules: [{ required: true, message: 'Please input receipt account name!' }]
                        })(
                            <AutoComplete
                                size="large"
                                dataSource={this.props.accounts.filter(acc=>acc.key!=this.props.actualAccountName).map(acc=>acc.key)}
                                style={{ width: '100%' }}
                                onSelect={this.onSelect}
                                placeholder=""
                                filterOption={true}
                                className="extra-large"
                              />
                          )}
                        </Form.Item>
                      </div>
                  </div>

                  {job_options_item}

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
              </div>
              <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="requestButton" htmlType="submit" type="primary" htmlType="submit" >ADD MEMBER</Button>
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
)(AddMemberForm) )
);
