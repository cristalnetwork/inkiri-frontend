import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as validators from '@app/components/Form/validators';

import { withRouter } from "react-router-dom";

import * as components_helper from '@app/components/helper';

import { Select, Button , Form, Icon, InputNumber, Input } from 'antd';
import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as form_helper from '@app/components/Form/form_helper';

import { injectIntl } from "react-intl";

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
    const default_text = this.props.intl.formatMessage({id:'global.submit'});
    this.state = {
      mode            : props.mode || 'full',
      profile         : props.profile || DEFAULT_STATE,
      alone_component : props.alone_component || false,
      button_text     : props.button_text || default_text,
      callback        : props.callback ,
    };
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
  }

  componentDidUpdate(prevProps, prevState) 
  {
      if(prevProps.profile !== this.props.profile) {
          this.setState({
            mode            : this.props.mode || 'full',
            profile         : this.props.profile || DEFAULT_STATE,
            alone_component : this.props.alone_component || false,
            button_text     : this.props.button_text,
            callback        : this.props.callback 
          });
      }
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
        components_helper.notif.errorNotification( this.props.intl.formatMessage({id:'errors.validation_title'}), this.props.intl.formatMessage({id:'errors.verify_on_screen'}) )    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      if(!this.state.profile)
      {
        components_helper.notif.errorNotification( this.props.intl.formatMessage({id:'components.forms.validators.forgot_profile'}))
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

    const { formatMessage }              = this.props.intl;

    const account_name_desc              = formatMessage({id:'components.Forms.profile.account_name_desc'})
    const account_name_message           = formatMessage({id:'components.Forms.profile.account_name_message'})
    const last_name_desc                 = formatMessage({id:'components.Forms.profile.last_name_desc'})
    const last_name_message              = formatMessage({id:'components.Forms.profile.last_name_message'})
    const first_name_desc                = formatMessage({id:'components.Forms.profile.first_name_desc'})
    const first_name_message             = formatMessage({id:'components.Forms.profile.first_name_message'})
    const biz_name_desc                  = formatMessage({id:'components.Forms.profile.biz_name_desc'})
    const biz_name_message               = formatMessage({id:'components.Forms.profile.biz_name_message'})
    const alias_name_desc                = formatMessage({id:'components.Forms.profile.alias_name_desc'})
    const alias_name_message             = formatMessage({id:'components.Forms.profile.alias_name_message'})
    const email_desc                     = formatMessage({id:'components.Forms.profile.email_desc'})
    const email_message                  = formatMessage({id:'components.Forms.profile.email_message'})
    const cpf_desc                       = formatMessage({id:'components.Forms.profile.cpf_desc'})
    const cpf_message                    = formatMessage({id:'components.Forms.profile.cpf_message'})
    const birthday_desc                  = formatMessage({id:'components.Forms.profile.birthday_desc'})
    const birthday_message               = formatMessage({id:'components.Forms.profile.birthday_message'})
    const phone_desc                     = formatMessage({id:'components.Forms.profile.phone_desc'})
    const phone_message                  = formatMessage({id:'components.Forms.profile.phone_message'})
    const street_desc                    = formatMessage({id:'components.Forms.profile.street_desc'})
    const city_desc                      = formatMessage({id:'components.Forms.profile.city_desc'})
    const state_desc                     = formatMessage({id:'components.Forms.profile.state_desc'})
    const zip_desc                       = formatMessage({id:'components.Forms.profile.zip_desc'})
    const country_desc                   = formatMessage({id:'components.Forms.profile.country_desc'})

    const readonly                       = !this.props.isAdmin;
    if(mode=='full')
      return (
        <Form onSubmit={this.handleSubmit} className="with_labels">
            <div className="money-transfer">

              {form_helper.simple(form_helper.getStringItem(form, profile , 'account_name'  , account_name_desc , account_name_message, true))}

              {!business? 
                (<>
                  {form_helper.simple(form_helper.getStringItem(form, profile , 'last_name'     , last_name_desc    , first_name_desc , readonly))}
                  {form_helper.simple(form_helper.getStringItem(form, profile , 'first_name'    , first_name_desc   , first_name_message, readonly ))}
                 </>)
                :
                (<>
                  {form_helper.simple(form_helper.getStringItem(form, profile , 'business_name'    , biz_name_desc, biz_name_message) )}
                  {form_helper.simple(form_helper.getStringItem(form, profile , 'alias'            , alias_name_desc, alias_name_message))}
                 </>)

              }
              {form_helper.simple(form_helper.getEmailItem(form,  profile , 'email'                 , email_desc        , email_message) )}
              {!business && form_helper.simple(form_helper.getStringItem(form, profile , 'legal_id' , cpf_desc          , cpf_message, readonly)) }
              {!business && form_helper.simple(form_helper.getDateItem(form, profile   , 'birthday' , birthday_desc     , birthday_message )) }
              {form_helper.simple(form_helper.getStringItem(form, profile , 'phone'                 , phone_desc        , phone_message)) }
              
              <br/><br/><div className="c-header-detail__head u-clearfix"><div className="c-header-detail__title">Address</div></div>
              
              {form_helper.simple(form_helper.getStringItem(form, profile , 'address.street'  , street_desc     )) }
              {form_helper.simple(form_helper.getStringItem(form, profile , 'address.city'    , city_desc       )) }
              {form_helper.simple(form_helper.getStringItem(form, profile , 'address.state'   , state_desc      )) }
              {form_helper.simple(form_helper.getStringItem(form, profile , 'address.zip'     , zip_desc        )) }
              {form_helper.simple(form_helper.getStringItem(form, profile , 'address.country' , country_desc    )) }
            </div>
            
            <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="updateProfile" htmlType="submit" type="primary" >{button_text}</Button>
                <Button size="large" key="cancelProfile" type="link" onClick={ () => this.fireEvent(null, true, null)}>
                  { formatMessage({id:'global.cancel'}) }
                </Button>
            </div>

        </Form>
    );
    //

    //MODE==alias
    return (<Form onSubmit={this.handleSubmit} className="with_labels">
            <div className="money-transfer">
              {form_helper.simple(form_helper.getStringItem(form, profile , 'account_name'       , account_name_desc  , account_name_message, true))}
              {form_helper.simple(form_helper.getStringItem(form, profile , 'business_name'      , biz_name_desc  , biz_name_message))}
              {business && form_helper.simple(form_helper.getStringItem(form, profile , 'alias'  , alias_name_desc  , alias_name_message))}

            </div>
            <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="updateProfile" htmlType="submit" type="primary" >{button_text}</Button>
                <Button size="large" key="cancelProfile" type="link" onClick={ () => this.fireEvent(null, true, null)}>
                  { formatMessage({id:'global.cancel'}) }
                </Button>
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
        isAdmin:              loginRedux.isAdmin(state),
    }),
    (dispatch)=>({
        
    })
)(injectIntl(ProfileForm)) )
);
