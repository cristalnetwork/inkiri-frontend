import React, { useState, useEffect } from 'react';
import { Input, Form, Button } from 'antd';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux'
import * as components_helper from '@app/components/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { injectIntl } from "react-intl";

const PaymentItemsForm = (props) => {
    
    const [items, setItems]     = useState(props.items)
    
    useEffect(() => {
      setItems(props.items);
      // console.log('props.items:', props.items)
    }, [props.items]);

    // useEffect(() => {
    //   handleSubmit();
    // },[items]);

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
      // if(e)
      //   e.preventDefault();
      // props.form.validateFields((err, values) => {
      //   clearTimeout(t_id);
      //   t_id = setTimeout(()=> {
      //     fireEvent(null, null, values);
      //   } ,400);
      // });
    }
    
    const { getFieldDecorator }  = props.form;
    
    const itemsChanged = (e) =>{
      e.preventDefault();
      const last_value = e.target.value;
      clearTimeout(t_id);
      t_id = setTimeout(()=> {
        setItems(last_value);
        fireEvent(null, null, {items:last_value});
      } ,400);
    }

    return (
          <Form onSubmit={handleSubmit}>
            <div className="money-transfer">    
              <div className="money-transfer__row row-complementary  flex_row_start" >
                  <Form.Item>
                      {getFieldDecorator( 'items', {
                        initialValue: items
                        , onChange: itemsChanged
                      })(
                        <Input.TextArea 
                            placeholder={ props.intl.formatMessage({id:'components.Forms.payment_items.items_placeholder'}) }
                            autoFocus
                            size="large"
                            maxLength={50}
                            style={{width:'600px'}}
                            />
                      )}
                  </Form.Item>
              </div>

            </div>

            <div className="hidden mp-box__actions mp-box__shore">
              <Button size="large" key="payButton" type="primary" htmlType="submit" style={{marginLeft:8}} icon="ordered-list">
                {props.intl.formatMessage({id:'components.Forms.payment_items.next_button'})}
              </Button>
              <Button size="large" key="cancelButton"  type="link" className="danger_color" style={{marginLeft:8}} onClick={()=>onCancel()} >
                {props.intl.formatMessage({id:'global.cancel'})}
              </Button>
            </div>

          </Form>  
          );
    
}
//
export default Form.create() (withRouter(connect(
    (state)=> ({
        
        
    }),
    (dispatch)=>({
        
    })
)( injectIntl(PaymentItemsForm)) )
);
