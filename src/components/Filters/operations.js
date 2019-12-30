import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Input, DatePicker } from 'antd';
import moment from 'moment';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as operationsRedux from '@app/redux/models/operations'
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import * as form_helper from '@app/components/Form/form_helper';

import AutocompleteAccount from '@app/components/AutocompleteAccount';


import lodash from 'lodash';
import deepdash from 'deepdash';
const _ = deepdash(lodash);

// import _ from 'lodash';
// import deepdash from 'deepdash/deepdash';

const { MonthPicker, RangePicker } = DatePicker;
const { Option } = Select;

const OperationsFilter = (props) => {
    
    const [is_admin, setIsAdmin]       = useState(props.isAdmin);
    // const [callback, setCallback]      = useState(props.callback);
    const [key, setKey]                = useState(props.the_key);
    const [show_search, setShowSearch] = useState(props.show_search||false);
    const [is_loading, setIsLoading]   = useState(props.isOperationsLoading||false);

    const default_filter               = { 
        operation_type:   undefined     // ['ALL']
        , date_range:     [null, null]
        , account_type:   undefined     // ['ALL']
        , search_text:    ''
        , in_out:         undefined

    };

    const [filter, setFilter]          = useState(props.filter||default_filter);

    useEffect(() => {
      // if(is_admin!=props.is_admin)
      //   setIsAdmin(props.isAdmin);
      // if(callback!=props.callback)
      //   setCallback(props.callback);
      // if(is_loading!=props.isOperationsLoading)
      //   setIsLoading(props.isOperationsLoading);
      // if(key!=props.the_key)
      //   setKey(props.the_key);
      // if(filter!=props.filterKeyValues[key] && filter!=default_filter)
      // {
      //   // console.log(' filter form useEffect::')
      //   // console.log(props.filterKeyValues)
      //   // console.log(default_filter)
      //   // setFilter(props.filterKeyValues[key]||default_filter)
      // }
      // if(show_search!=props.show_search)
      //   setShowSearch(props.show_search);
    });

    const resetFilter = (e) => {
      e.preventDefault();
      props.form.resetFields();
      fireEvent(null, null, {})      
    }
    
    const applyFilter = (e) => {
      e.preventDefault();
      
      props.form.validateFields((err, values) => {
        
        if (err) {
          // openNotificationWithIcon("error", "Validation errors","Please verifiy errors on screen!")    
          console.log(' ERRORS!! >> ', err)
          return;
        }

        console.log(values)
        // const obj = _.index( values, {
        //   pathFormat: 'string',
        //   leavesOnly: true,
        //   includeRoot: !_.isArray(values)}) 
        
        const filtered = _.reduce(values, function(result, value, key) {
          if(_.isArray(value))
          {  
            if(!utils.arrayNullOrEmpty(value, true))
              result[key] = value;
          }
          else 
            if(typeof value !== 'undefined' && value!= null)
              result[key] = value;
          return result;
        }, {});

        fireEvent(null, null, filtered);
        
      });
    }


    const fireEvent = (error, cancel, data) => {
      if(typeof props.callback === 'function') {
          props.callback(error, cancel, data)
      }
    }
    
    
    const renderSelectTxTypeOptions = () => {
      return (
        globalCfg.api.getTypes().map( tx_type => {return(<Option key={'option'+tx_type} value={tx_type} label={utils.firsts(tx_type.split('_')[1])}>{ utils.capitalize(tx_type.split('_')[1]) } </Option>)})
          )
    }
    // 
    const renderSelectInOutOptions = () => {
      return (
        ['all', 'in', 'out'].map( tx_state => {return(<Option key={'option'+tx_state} value={tx_state} label={utils.firsts(tx_state)}>{ utils.capitalize(tx_state) } </Option>)})
          )
    }
    // 
    const renderSelectAccountTypeOptions = () => {
      return (
        globalCfg.bank.listAccountTypes().map( tx_state => {return(<Option key={'option'+tx_state} value={tx_state} label={utils.firsts(tx_state)}>{ utils.capitalize(tx_state) } </Option>)})
          )
    }
    //
    const validateAccountNames = (rule, value, callback) => {
      const { form } = props;
      if(!props.is_admin && props.form.getFieldValue('to') && props.form.getFieldValue('from')){
        callback('Cant search by both sender/from and receiver/to account!');
        return;
      }
      callback();
    };
    //
    const dropdownRender = (menu) => 
          (<div style={{minWidth:250}}>
            {menu}
          </div>);
    //
    const _form = props.form;
    if(!filter)
      return (null);
    return( 
      <Form layout="inline" className="filter_form" onSubmit={applyFilter}>
        
        <AutocompleteAccount 
                validation_rule={validateAccountNames} 
                autoFocus 
                label={'Sender'}
                not_required={true}
                form={_form} 
                name="from" 
                without_icon={true}
                size="default"/>

        <AutocompleteAccount 
                validation_rule={validateAccountNames} 
                label={'Receiver/recipient'}
                not_required={true}
                form={_form} 
                name="to" 
                without_icon={true}
                size="default"/>

        { show_search && form_helper.getSearchItem(_form
            , filter
            , 'search_text'
            , 'Search'
            , 'Search'
            , undefined
            , undefined)
        }

        { form_helper.getSelectItem(_form
            , filter
            , 'requested_type'
            , renderSelectTxTypeOptions()
            , 'Operation'
            , 'Operation'
            , 'multiple'
            , dropdownRender
            , undefined
            , true) }

        { false && form_helper.getSelectItem(_form
            , filter
            , 'in_out'
            , renderSelectInOutOptions()
            , 'IN / OUT'
            , 'IN / OUT'
            , 'multiple'
            , dropdownRender
            , undefined
            , true) }

        { false && form_helper.getSelectItem(_form
            , filter
            , 'account_type'
            , renderSelectAccountTypeOptions()
            , 'Account type'
            , 'Account type'
            , 'multiple'
            , dropdownRender
            , undefined
            , true) }

        { form_helper.getDateRangeItem (_form
            , filter
            , 'date_range'
            , 'Date Range'
            , undefined
            , undefined
            , true) }

        
        
        <Form.Item style={{alignSelf:'flex-end', alignItems:'flex-end', flex:1}}>
          <Button htmlType="submit" disabled={is_loading}>
            Filter
          </Button>
          <Button type="link" disabled={is_loading} onClick={(event) => resetFilter(event)}>
            Reset
          </Button>
        </Form.Item>
      </Form>
      
    );

}
//
export default Form.create() (connect(
    (state)=> ({
      isAdmin:               loginRedux.isAdmin(state),
      filterKeyValues:       operationsRedux.filterKeyValues(state),
      isOperationsLoading:   operationsRedux.isOperationsLoading(state),

    }),
    (dispatch)=>({
      trySetFilterKeyValue:  bindActionCreators(operationsRedux.trySetFilterKeyValue, dispatch),
      // setFilterKeyValue:     bindActionCreators(operationsRedux.setFilterKeyValue, dispatch),
      deleteFilterKeyValue:  bindActionCreators(operationsRedux.deleteFilterKeyValue, dispatch),
    
    })
)(OperationsFilter) );
