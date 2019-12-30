import React, { useState, useEffect } from 'react';
import { notification, Input, Form, Button } from 'antd';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux'
import * as accountsRedux from '@app/redux/models/accounts'
import * as globalCfg from '@app/configs/global';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AutocompleteAccount from '@app/components/AutocompleteAccount';
import * as components_helper from '@app/components/helper';

const PaymentForm = (props) => {
    
    const [payer, setPayer]                   = useState(props.payer)
    const [password, setPassword]             = useState(props.password||'')
    const [showUserSearch, setShowUserSearch] = useState(props.showUserSearch||false)

    useEffect(() => {
      setShowUserSearch(props.showUserSearch||false);
    }, [props.showUserSearch]);

    const onCancel = (e) => {
      fireEvent(null, true, null);
    }

    const fireEvent = (error, cancel, data) => {
      if(typeof  props.callback === 'function') {
        props.callback(error, cancel, data);
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      props.form.validateFields((err, values) => {
        if (err) {
          components_helper.notif.errorNotification("Validation errors","Please verifiy errors on screen!")    
          console.log(' ERRORS!! >> ', err)
          return;
        }
        
        console.log(values)
        if(showUserSearch && props.accounts.filter(acc=>acc.key==values.payer).length==0)
        {
          components_helper.notif.errorNotification("Validation errors", "Please select a valid payer account")    
          return;
        }
         
        // console.log('why#2?')
        fireEvent(null, null, values)
      });
    }
    const onSelect =(account) =>{
      setPayer(account);
    }

    const passwordChanged =(value) =>{
      setPassword(value);
    }

    const { getFieldDecorator }  = props.form;
    const userSearch             = (showUserSearch)
              ?(<AutocompleteAccount 
                    autoFocus 
                    callback={onSelect} 
                    form={props.form} 
                    name="payer" 
                    filter={globalCfg.bank.ACCOUNT_TYPE_PERSONAL}/>)
              :(null);
    
    return (
          <Form onSubmit={handleSubmit}>
            <div className="money-transfer">    
              
              {userSearch}

              <div className="money-transfer__row row-complementary money-transfer__select flex_row" >
                  <div className="badge badge-extra-small badge-circle addresse-avatar display_block">
                      <span className="picture">
                        <FontAwesomeIcon icon="key" size="lg" color="gray"/>
                      </span>
                  </div>
                  <div className="money-transfer__input money-transfer__select">
                    <Form.Item>
                        {getFieldDecorator( 'password', {
                          rules: [{ required: true, message: 'Input a valid password'}]
                          , initialValue: password
                          , onChange: passwordChanged
                        })(
                          <Input.Password 
                              placeholder="Password or private key"
                              autoFocus
                              autoCapitalize="off"
                              size="large" 
                              visibilityToggle={true} />
                        )}
                    </Form.Item>
                  </div>
              </div>

            </div>

            <div className="mp-box__actions mp-box__shore">
              <Button size="large" key="payButton"     htmlType="submit" style={{marginLeft:8}} ><FontAwesomeIcon icon="shopping-bag" size="1x"/>&nbsp;PAY</Button>
              <Button size="large" key="cancelButton"  type="link" className="danger_color" style={{marginLeft:8}} onClick={()=>onCancel()} >CANCEL</Button>
            </div>

          </Form>  
          );
    
}
//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:         accountsRedux.accounts(state),
        // actualAccountName:loginRedux.actualAccountName(state),
        // actualRole:       loginRedux.actualRole(state),
        // actualPrivateKey: loginRedux.actualPrivateKey(state),
        // isLoading:        loginRedux.isLoading(state),
        // personalAccount:  loginRedux.personalAccount(state),
        // balance:          balanceRedux.userBalance(state),
        
        
    }),
    (dispatch)=>({
        
    })
)(PaymentForm) )
);
