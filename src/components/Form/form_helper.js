import React from 'react'
import { Select, Form, Icon, Input, DatePicker } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-BR');

const {TextArea} = Input;

export const MONTH_FORMAT           = 'YYYY/MM';
export const MONTH_FORMAT_HUMANIZED = 'MMMM YYYY';
export const DATE_FORMAT            = 'YYYY/MM/DD';

export const getSelectItem = (_form, object, field, options, title, placeholder, mode, dropdownRender, required_message, allow_clear) => {
    
    const _mode                    = mode?mode:'multiple';
    const { getFieldDecorator }    = _form;
    const initial_value            = object?object[field]:'';
    
    return (  <Form.Item label={title}>
                {getFieldDecorator(field, {
                  rules: [{ required: (required_message!==undefined?true:false), message: required_message }],
                  initialValue:initial_value
                })(
                    <Select 
                      allowClear={allow_clear||false}
                      placeholder={placeholder}
                      mode={mode}
                      optionLabelProp="label"
                      dropdownRender={dropdownRender}
                      >
                        {options}
                    </Select> 

                )}
              </Form.Item>
    );
};

export const getSearchItem = (_form, object, field, title, placeholder, required_message, callback) => {
    
    const { getFieldDecorator }    = _form;
    const initial_value            = object?object[field]:'';
    
    return (  <Form.Item label={title}>
                {getFieldDecorator(field, {
                  rules: [{ required: (required_message!==undefined?true:false), message: required_message, whitespace: true }],
                  initialValue:initial_value
                })(
                   <Input.Search 
                      className="styles extraContentSearch" 
                      placeholder={placeholder} 
                      /> 
                )}
              </Form.Item>
    );
};
//
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

export const getMoment = (value) => {
  let moment_value = value;
  if(typeof value === 'number' || typeof value === 'string')
    moment_value = moment(value);
  return moment_value;
}

export const getDateItem = (_form, object, field, title, required_message) => {
    const { getFieldDecorator }    = _form;
    const initialValue = object?getMoment(object[field]):moment();
    return (<Form.Item label={title}>
                {getFieldDecorator(field, {
                rules: [{ required: true, message: required_message }],
                initialValue: initialValue
              })( <DatePicker style={{width:'100%'}}/>)}
              </Form.Item>);
  }
//
export const getMonthItem = (_form, object, field, title, required_message, readonly) => {
    const { getFieldDecorator }    = _form;
    const _readonly = readonly===true?true:false;

    const initialValue = object?getMoment(object[field]):moment();
    return (<Form.Item label={title}>
                {getFieldDecorator(field, {
                rules: [{ required: true, message: required_message }],
                initialValue: initialValue
              })( <DatePicker.MonthPicker style={{width:'100%'}} format={MONTH_FORMAT} disabled={_readonly}/>)}
              </Form.Item>);
  }
//
const getRanges = () =>{
  return {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
}
//
export const getDateRangeItem = (_form, object, field, title, required_message, format, show_ranges) => {
    const { getFieldDecorator }    = _form;
    const _value                   = object[field];
    const initialValue             = object
      ?[getMoment(_value[0]), getMoment(_value[1])]
      :undefined;
    const ranges = show_ranges
      ?getRanges()
      :null;
    return (<Form.Item label={title}>
                {getFieldDecorator(field, {
                rules: [{ required: (required_message!==undefined), message: required_message }],
                initialValue: initialValue
              })( <DatePicker.RangePicker 
                      style={{width:'100%'}} 
                      format={format||DATE_FORMAT} 
                      ranges={ranges}
                      />)}
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
