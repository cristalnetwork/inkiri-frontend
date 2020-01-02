import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as accountsRedux from '@app/redux/models/accounts';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as validators from '@app/components/Form/validators';

import { withRouter } from "react-router-dom";

import * as components_helper from '@app/components/helper';

import { notification, Empty, Button, Form, message, Input, Icon } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import AutocompleteAccount from '@app/components/AutocompleteAccount';

import { injectIntl } from "react-intl";

class AddRoleForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authority: props.authority,
      owner: props.owner,
      callback: props.callback,
    };
    
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.onSelect                   = this.onSelect.bind(this)
  }

  componentDidUpdate(prevProps, prevState) 
  {
      if(prevProps.bank_account !== this.props.bank_account) {
          this.setState({
            authority: this.props.authority,
            owner: this.props.owner,
            callback: this.props.callback,
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
  
  }

  handleSubmit = (e) => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        components_helper.notif.errorNotification( this.props.intl.formatMessage({id:'errors.validation_title'}), this.props.intl.formatMessage({id:'errors.verify_on_screen'}) )    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      values['authority'] = this.state.authority;
      this.fireEvent(null, null, values);
      
    });
  };

  resetForm(){
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { owner }             = this.state;
    return (
          
            <Form onSubmit={this.handleSubmit}>
              
              <AutocompleteAccount 
                autoFocus 
                callback={this.onSelect} 
                form={this.props.form} 
                name="permissioned" 
                exclude_list={[owner]} 
                filter={globalCfg.bank.ACCOUNT_TYPE_PERSONAL}/>

              <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="requestButton" htmlType="submit" type="primary" htmlType="submit" >{this.props.intl.formatMessage({id:'global.authorize'})}</Button>
                <Button size="large" className="danger_color" type="link" onClick={()=>{this.fireEvent(null, true, null)}}>
                  {this.props.intl.formatMessage({id:'global.cancel'})}
                </Button>
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
)( injectIntl(AddRoleForm) ) )
);
