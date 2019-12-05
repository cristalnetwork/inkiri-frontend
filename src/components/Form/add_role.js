import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as accountsRedux from '@app/redux/models/accounts';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as validators from '@app/components/Form/validators';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { notification, Empty, Button, Form, message, Input, Icon } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import AutocompleteAccount from '@app/components/AutocompleteAccount';

class AddRoleForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authority: props.authority,
      owner: props.owner,
      callback: props.callback,
    };
    
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
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
  
  }

  handleSubmit = (e) => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        this.openNotificationWithIcon("error", "Validation errors","Please verifiy errors on screen!")    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      // const exists = this.props.accounts.filter( account => account.key==values.permissioned);
      // if(!exists || exists.length==0)
      // {
      //   this.openNotificationWithIcon("error", 'Please select an account from the list.');
      //   return;
      // }
      values['authority'] = this.state.authority;
      this.fireEvent(null, null, values);
      
    });
  };

  resetForm(){
    
    // this.setState({...DEFAULT_STATE});
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
                <Button size="large" key="requestButton" htmlType="submit" type="primary" htmlType="submit" >AUTHORIZE</Button>
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
)(AddRoleForm) )
);
