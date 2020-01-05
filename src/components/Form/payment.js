import React, { useState, useEffect } from 'react';
import { Input, Form, Button } from 'antd';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux'
import * as accountsRedux from '@app/redux/models/accounts'
import * as globalCfg from '@app/configs/global';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AutocompleteAccount from '@app/components/AutocompleteAccount';
import * as components_helper from '@app/components/helper';

import { injectIntl } from "react-intl";

const PaymentForm = (props) => {
    
    const [payer, setPayer]                   = useState(props.payer)
    const [password, setPassword]             = useState(props.password||'')
    const [showUserSearch, setShowUserSearch] = useState(props.showUserSearch||false)

    useEffect(() => {
      setShowUserSearch(props.showUserSearch||false);
    }, [props.showUserSearch]);

    useEffect(() => {
        if (payer && password) {
          handleSubmit();
        }
      },
      [payer, password]
    );

    const onCancel = (e) => {
      fireEvent(null, true, null);
    }

    const fireEvent = (error, cancel, data) => {
      if(typeof  props.callback === 'function') {
        props.callback(error, cancel, data);
      }
    };

    var t_id = null;
    const handleSubmit = (e) => {

      if(e)
        e.preventDefault();
      props.form.validateFields((err, values) => {
        if (err) {
          components_helper.notif.errorNotification( props.intl.formatMessage({id:'errors.validation_title'}), props.intl.formatMessage({id:'errors.verify_on_screen'}) )    
          console.log(' ERRORS!! >> ', err)
          return;
        }
        
        console.log(values)
        if(showUserSearch && props.accounts.filter(acc=>acc.key==values.payer).length==0)
        {
          components_helper.notif.errorNotification( props.intl.formatMessage({id:'errors.select_valid_payer_account'}) )    
          return;
        }
         
        clearTimeout(t_id);
        t_id = setTimeout(()=> {
          fireEvent(null, null, values);
        } ,400);
        
      });
    }
    const onSelect =(account) =>{
      setPayer(account);
      // props.form.getFieldValue('password') && handleSubmit();
    }

    const passwordChanged =(value) =>{
      setPassword(value);
      // handleSubmit();
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

              <div className="money-transfer__row row-complementary money-transfer__select flex_row_start" >
                  <div className="badge badge-extra-small badge-circle addresse-avatar display_block">
                      <span className="picture">
                        <FontAwesomeIcon icon="key" size="lg" color="black"/>
                      </span>
                  </div>
                  <div className="money-transfer__input money-transfer__select">
                    <Form.Item>
                        {getFieldDecorator( 'password', {
                          rules: [{ required:     true
                                    , message:    props.intl.formatMessage({id:'components.Forms.payment.password_validation'}) }]
                          , initialValue: password
                          , onChange: passwordChanged
                        })(
                          <Input.Password 
                              placeholder={ props.intl.formatMessage({id:'components.Forms.payment.password_placeholder'}) }
                              autoFocus={!showUserSearch}
                              autoCapitalize="off"
                              size="large" 
                              visibilityToggle={false}
                              />
                        )}
                    </Form.Item>
                  </div>
              </div>
            </div>
          </Form>  
          );

    // return (
    //       <Form onSubmit={handleSubmit}>
    //         <div className="money-transfer">    
              
    //           {userSearch}

    //           <div className="money-transfer__row row-complementary money-transfer__select flex_row_start" >
    //               <div className="badge badge-extra-small badge-circle addresse-avatar display_block">
    //                   <span className="picture">
    //                     <FontAwesomeIcon icon="key" size="lg" color="black"/>
    //                   </span>
    //               </div>
    //               <div className="money-transfer__input money-transfer__select">
    //                 <Form.Item>
    //                     {getFieldDecorator( 'password', {
    //                       rules: [{ required:     true
    //                                 , message:    props.intl.formatMessage({id:'components.Forms.payment.password_validation'}) }]
    //                       , initialValue: password
    //                       , onChange: passwordChanged
    //                     })(
    //                       <Input.Password 
    //                           placeholder={ props.intl.formatMessage({id:'components.Forms.payment.password_placeholder'}) }
    //                           autoFocus
    //                           autoCapitalize="off"
    //                           size="large" 
    //                           visibilityToggle={false}
    //                           />
    //                     )}
    //                 </Form.Item>
    //               </div>
    //           </div>

    //         </div>

    //         <div className="mp-box__actions mp-box__shore">
    //           <Button size="large" key="payButton" type="primary" htmlType="submit" style={{marginLeft:8}} ><FontAwesomeIcon icon="shopping-bag" size="1x"/>
    //             &nbsp;{props.intl.formatMessage({id:'global.pay'})}
    //           </Button>
    //           <Button size="large" key="cancelButton"  type="link" className="danger_color" style={{marginLeft:8}} onClick={()=>onCancel()} >
    //             {props.intl.formatMessage({id:'global.cancel'})}
    //           </Button>
    //         </div>

    //       </Form>  
    //       );
    
}
//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:         accountsRedux.accounts(state),
        
    }),
    (dispatch)=>({
        
    })
)( injectIntl(PaymentForm)) )
);
