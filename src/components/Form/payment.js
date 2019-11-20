import React, { useState, useEffect } from 'react';
import { notification, Input, Form, AutoComplete, Button, Icon, message } from 'antd';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux'
import * as accountsRedux from '@app/redux/models/accounts'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const PaymentForm = (props) => {
    
    const [business, setBusiness]             = useState(props.business)
    const [amount, setAmount]                 = useState(props.amount)
    const [payer, setPayer]                   = useState(props.payer)
    const [callback, setCallback]             = useState(props.callback)
    const [password, setPassword]             = useState(props.password||'')
    const [showUserSearch, setShowUserSearch] = useState(props.showUserSearch||false)

    useEffect(() => {
      setBusiness(props.business);
      setAmount(props.amount);
      setPayer(props.payer);
      setCallback(props.callback);
      setShowUserSearch(props.showUserSearch||false);
    });

    const onCancel = (e) => {
      // console.log('why#1?')
       // e.preventDefault();
      fireEvent(null, true, null);

    }

    const fireEvent = (error, cancel, data) => {
      // console.log('why#88?', typeof  callback)
      if(typeof  callback === 'function') {
        callback(error, cancel, data);
      }
        
    };

    const openNotificationWithIcon = (type, title, message) => {
      notification[type]({
        message: title,
        description:message,
      });
    }

    const handleSubmit = (e) => {
      e.preventDefault();
      // openNotificationWithIcon("info", "onpay event")    
      props.form.validateFields((err, values) => {
        if (err) {
          openNotificationWithIcon("error", "Validation errors","Please verifiy errors on screen!")    
          console.log(' ERRORS!! >> ', err)
          return;
        }
        
        console.log(values)
        if(showUserSearch && props.accounts.filter(acc=>acc.key==values.payer).length==0)
        {
          openNotificationWithIcon("error", "Please select a valid payer account")    
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
              ?(<div className="money-transfer__row row-complementary row-complementary-bottom money-transfer__select flex_row" >
                  <div className="badge badge-extra-small badge-circle addresse-avatar display_block">
                      <span className="picture">
                        <FontAwesomeIcon icon="user" size="lg" color="gray"/>
                      </span>
                  </div>
                  <div className="money-transfer__input money-transfer__select">
                    <Form.Item>
                      {getFieldDecorator('payer', {
                        rules: [{ required: true, message: 'Please select receipt account name!' }]
                      })(
                        <AutoComplete
                          size="large"
                          dataSource={props.accounts.filter(acc=>acc.key!=business).map(acc=>acc.key)}
                          style={{ width: '100%' }}
                          onSelect={onSelect}
                          placeholder=""
                          filterOption={true}
                          className="extra-large"
                        />
                         
                      )}
                    </Form.Item>
                  </div>
              </div>
            ):(null);
    //
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
