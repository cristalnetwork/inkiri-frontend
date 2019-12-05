import React from 'react'
import { Form, Icon, Input, DatePicker } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-BR');

const {TextArea} = Input;

export const MONTH_FORMAT           = 'YYYY/MM';
export const MONTH_FORMAT_HUMANIZED = 'MMMM YYYY';

export const getInputItem = (_form, object, field, title, required_message, _type, readonly, textarea) => {
    
    const { getFieldDecorator }    = _form;
    const initial_value            = object?object[field]:'';
    const _readonly                = (readonly===true);
    if(!_type) _type = 'string';
    
    
    const input = (textarea===true) 
      ? (<TextArea className="money-transfer__input" placeholder={title} readOnly={_readonly} autoSize={{ minRows: 3, maxRows: 6 }} />) 
      : (<Input className="money-transfer__input" placeholder={title} readOnly={_readonly}/> );
    // const input = <Input className="money-transfer__input" placeholder={title} readOnly={_readonly}/>;
    return (  <Form.Item label={title}>
                {getFieldDecorator(field, {
                  rules: [{ type:_type, required: (required_message!==undefined?true:false), message: required_message, whitespace: true }],
                  initialValue:initial_value
                })(
                   input 

                )}
              </Form.Item>
    );
};
//
export const   getStringItem = (_form, object, field, title, required_message, readonly) => {
    return getInputItem(_form, object, field, title, required_message, 'string', readonly);
};
  
export const   getEmailItem = (_form, object, field, title, required_message) => {
    return getInputItem(_form, object, field, title, required_message, 'email');
}

const getMoment = (value) => {
  let moment_value = value;
  if(typeof value === 'number' || typeof value === 'string')
    moment_value = moment(value);
  return moment_value;
}

export const   getDateItem = (_form, object, field, title, required_message) => {
    const { getFieldDecorator }    = _form;
    const initialValue = object?getMoment(object[field]):moment();
    return (<Form.Item label={title}>
                {getFieldDecorator(field, {
                rules: [{ required: true, message: required_message }],
                initialValue: initialValue
              })( <DatePicker/>)}
              </Form.Item>);
  }
//
export const   getMonthItem = (_form, object, field, title, required_message, readonly) => {
    const { getFieldDecorator }    = _form;
    const _readonly = readonly===true?true:false;

    const initialValue = object?getMoment(object[field]):moment();
    return (<Form.Item label={title}>
                {getFieldDecorator(field, {
                rules: [{ required: true, message: required_message }],
                initialValue: initialValue
              })( <DatePicker.MonthPicker format={MONTH_FORMAT} disabled={_readonly}/>)}
              </Form.Item>);
  }
//
export const getTextareaItem = (_form, object, field, title, required_message, readonly) => {
    return getInputItem(_form, object, field, title, required_message, 'string', readonly, true);
  }
//
export const simple = (item) => {
  return (<div className="money-transfer__row row-expandable row-complementary row-complementary-bottom" >
          {item}
          </div>)
}
//
export const withIcon = (icon, item, select) => {
  const classname = select?'money-transfer__select':'';
  return (<div className={`money-transfer__row row-complementary row-complementary-bottom ${classname}`} >
              <div className="badge badge-extra-small badge-circle addresse-avatar ">
                  <span className="picture">
                    <FontAwesomeIcon icon={icon} size="lg" color="gray"/>
                  </span>
              </div>
              <div className={`money-transfer__input money-transfer__select`}>
                {item}
              </div>
          </div>);
}
