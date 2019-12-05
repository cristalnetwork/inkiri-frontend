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

import { notification, Select, Button , Form, Icon, InputNumber, Input, DatePicker } from 'antd';
import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as form_helper from '@app/components/Form/form_helper';

const DEFAULT_STATE = {
    _id:            null,
    account_name:   null,
    alias:          null,
    first_name:     null,
    last_name:      null,
    email:          null,
    legal_id:       null,
    birthday:       null,
    phone:          null,
    address:{
          street:   null,
          city:     null,
          state:    null,
          zip:      null,
          country:  null
        },
    account_type:   null,
    business_name:  null
};

class ProfileForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode            : props.mode || 'full',
      profile         : props.profile || DEFAULT_STATE,
      alone_component : props.alone_component || false,
      button_text     : props.button_text || 'SUBMIT',
      callback        : props.callback ,
    };
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 

  }

  componentDidUpdate(prevProps, prevState) 
  {
      if(prevProps.profile !== this.props.profile) {
          this.setState({
            mode            : this.props.mode || 'full',
            profile         : this.props.profile || DEFAULT_STATE,
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
        this.openNotificationWithIcon("error", "Validation errors","Please verifiy errors on screen!")    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      if(!this.state.profile)
      {
        this.openNotificationWithIcon("error", 'You must choose a Profile!');
        return;
      }
      
      this.fireEvent(null, null, values);
      
    });
  };

  resetForm(){
    
    // this.setState({...DEFAULT_STATE});
  }

  
  
  renderContent() {  
    const { mode, profile, button_text } = this.state;
    const business                       = (globalCfg.bank.isBusinessAccount(profile));
    const { form }                       = this.props;
    if(mode=='full')
      return (
        <Form onSubmit={this.handleSubmit} className="with_labels">
            <div className="money-transfer">

              {form_helper.simple(form_helper.getStringItem(form, profile , 'account_name'  , 'Account name' , 'Please input a valid account name!', true))}

              {!business? 
                (<>
                  {form_helper.simple(form_helper.getStringItem(form, profile , 'last_name'     , 'Last name'    , 'Please input a valid last name!'))}
                  {form_helper.simple(form_helper.getStringItem(form, profile , 'first_name'    , 'First name'   , 'Please input a valid first name!'))}
                 </>)
                :
                (<>
                  {form_helper.simple(form_helper.getStringItem(form, profile , 'business_name'    , 'Business name' , 'Please input a valid business name!') )}
                  {form_helper.simple(form_helper.getStringItem(form, profile , 'alias'    , 'IUGU alias'   , 'Please input a valid alias!'))}
                 </>)

              }
              {form_helper.simple(form_helper.getEmailItem(form,  profile , 'email'         , 'Email'        , 'Please input a valid email!') )}
              {!business 
                  && form_helper.simple(form_helper.getStringItem(form, profile , 'legal_id'      , 'CPF'          , 'Please input a valid CPF!')) }
              {!business 
                  && form_helper.simple(form_helper.getDateItem(form, profile   , 'birthday'      , 'Birthday'     , 'Please input a valid Date!')) }
              
              {form_helper.simple(form_helper.getStringItem(form, profile , 'phone'         , 'Phone number' , 'Please input a valid phone number!')) }
              
              <br/><br/><div className="c-header-detail__head u-clearfix"><div className="c-header-detail__title">Address</div></div>
              
              {form_helper.simple(form_helper.getStringItem(form, profile , 'address.street'  , 'Street'     )) }
              {form_helper.simple(form_helper.getStringItem(form, profile , 'address.city'    , 'City'       )) }
              {form_helper.simple(form_helper.getStringItem(form, profile , 'address.state'   , 'State'      )) }
              {form_helper.simple(form_helper.getStringItem(form, profile , 'address.zip'     , 'ZIP'        )) }
              {form_helper.simple(form_helper.getStringItem(form, profile , 'address.country' , 'Country'    )) }
            </div>
            
            <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="updateProfile" htmlType="submit" type="primary" >{button_text}</Button>
                <Button size="large" key="cancelProfile" type="link" onClick={ () => this.fireEvent(null, true, null)}>CANCEL</Button>
            </div>

        </Form>
    );
    //

    return (<Form onSubmit={this.handleSubmit} className="with_labels">
            <div className="money-transfer">
              {form_helper.simple(form_helper.getStringItem(form, profile , 'account_name'  , 'Account name' , 'Please input a valid account name!', true))}
              {form_helper.simple(form_helper.getStringItem(form, profile , 'business_name'    , 'Business name' , 'Please input a valid business name!'))}
              {form_helper.simple(form_helper.getStringItem(form, profile , 'alias'    , 'IUGU alias'   , 'Please input a valid alias!'))}

            </div>
            <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="updateProfile" htmlType="submit" type="primary" >{button_text}</Button>
                <Button size="large" key="cancelProfile" type="link" onClick={ () => this.fireEvent(null, true, null)}>CANCEL</Button>
            </div>
        </Form>);
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
)(ProfileForm) )
);
