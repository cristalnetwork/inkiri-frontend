import React, { useState, useEffect } from 'react';
import { Form, Select, Button } from 'antd';

import { connect } from 'react-redux'

import * as operationsRedux from '@app/redux/models/operations'
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import * as form_helper from '@app/components/Form/form_helper';

import AutocompleteAccount from '@app/components/AutocompleteAccount';

import { injectIntl } from "react-intl";

import _ from 'lodash';

const { Option } = Select;
var __formValuesChanged = null;
const RequestsFilter = (props) => {
    
    // const [is_admin, setIsAdmin]       = useState(props.isAdmin);
    const [callback, setCallback]      = useState(props.callback);
    const [buttonType, setButtonType]  = useState('default');
    const [key, setKey]                = useState(props.the_key);
    const [show_search, setShowSearch] = useState(props.show_search||false);
    const [is_loading, setIsLoading]   = useState(props.isOperationsLoading||false);

    const default_filter               = { 
        operation_type:   undefined     
        , date_range:     [null, null]
        , account_type:   undefined     
        , state:          undefined     
        , search_text:    ''
        , in_out:         undefined

    };

    const [filter, setFilter]          = useState(props.filter||default_filter);

    const {formatMessage} = props.intl;

    useEffect(() => {
      setCallback(props.callback);
    }, [props.callback]);

    const resetFilter = (e) => {
      e.preventDefault();
      props.form.resetFields();
      fireEvent(null, null, {})      
    }
    
    const formValuesChanged = () => {
      setButtonType('primary')
    }
    __formValuesChanged = formValuesChanged
    
    const applyFilter = (e) => {
      e.preventDefault();
      
      props.form.validateFields((err, values) => {
        
        if (err) {
          fireEvent(err, null, null);
          console.log(' ERRORS!! >> ', err)
          return;
        }

        let filtered = {...values, 'requested_type' : values['requested_type'] && values['requested_type'].join(',')}
        const date_range = values['date_range']
        if(date_range && date_range[0] && date_range[1])
          filtered = {...filtered, date_from: date_range[0] ,date_to: date_range[1]};
        delete filtered.date_range;
        // limpiamos las keys que estan vacias
        const filtered_nn  = _.reduce(filtered, function(result, value, key) {
          if(value)
            result[key] = value;
          return result;
        }, {});

        fireEvent(null, null, filtered_nn)
      });
    }


    const fireEvent = (error, cancel, data) => {
      setButtonType('default')
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
    const renderRequestStates = () => {
      return (
        globalCfg.api.getStates().map( tx_state => {return(<Option key={'option'+tx_state} value={tx_state} label={globalCfg.api.stateToText(tx_state)}>{ utils.capitalize(globalCfg.api.stateToText(tx_state)) } </Option>)})
          )
    }
    //
    const validateAccountNames = (rule, value, callback) => {
      const { form } = props;
      if(!props.isAdmin && form.getFieldValue('to') && form.getFieldValue('from')){
        const message = formatMessage({id:'components.filters.requests.error_sender_receiver'})
        callback(message);
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
    const className = `filter_form ${buttonType}`; 
    const _form     = props.form;
    
    if(!filter)
      return (null);
    
    const fromText        = formatMessage({id:'components.filters.requests.from'})
    const toText          = formatMessage({id:'components.filters.requests.to'})
    const searchText      = formatMessage({id:'components.filters.requests.search'})
    const operationText   = formatMessage({id:'components.filters.requests.operation'})
    const accountTypeText = formatMessage({id:'components.filters.requests.account_type'})
    const stateText       = formatMessage({id:'components.filters.requests.state'})
    const dateRangeText   = formatMessage({id:'components.filters.requests.date_range'})    
    const externalText    = formatMessage({id:'components.filters.requests.external'})    

    return( 
      <Form 
        layout="inline" 
        className={className}
        onSubmit={applyFilter}
        onChange={formValuesChanged}
        >
        
        <AutocompleteAccount
                validation_rule={validateAccountNames} 
                autoFocus 
                label={fromText}
                not_required={true}
                form={_form} 
                name="from" 
                without_icon={true}
                size="default"/>
        <AutocompleteAccount
                validation_rule={validateAccountNames} 
                label={toText}
                not_required={true}
                form={_form} 
                name="to" 
                without_icon={true}
                size="default"/>

        { show_search && form_helper.getSearchItem(_form
            , filter
            , 'search_text'
            , searchText
            , searchText
            , undefined
            , undefined)
        }

        { form_helper.getSelectItem(_form
            , filter
            , 'requested_type'
            , renderSelectTxTypeOptions()
            , operationText
            , operationText
            , 'multiple'
            , dropdownRender
            , undefined
            , true) }

        { false && form_helper.getSelectItem(_form
            , filter
            , 'in_out'
            , renderSelectInOutOptions()
            , externalText
            , externalText
            , 'multiple'
            , dropdownRender
            , undefined
            , true) }

        { false && form_helper.getSelectItem(_form
            , filter
            , 'account_type'
            , renderSelectAccountTypeOptions()
            , accountTypeText
            , accountTypeText
            , 'multiple'
            , dropdownRender
            , undefined
            , true) }

        { form_helper.getSelectItem(_form
            , filter
            , 'state'
            , renderRequestStates()
            , stateText
            , stateText
            , 'default'
            , dropdownRender
            , undefined
            , true) }

        { form_helper.getDateRangeItem (_form
            , filter
            , 'date_range'
            , dateRangeText
            , undefined
            , undefined
            , props.intl) }
        
        
        <Form.Item style={{alignSelf:'flex-end', alignItems:'flex-end', flex:1}}>
          <Button htmlType="submit" disabled={is_loading} type={buttonType}>
            { formatMessage({id:'components.filters.requests.filter'}) }
          </Button>
          <Button type="link" disabled={is_loading} onClick={(event) => resetFilter(event)}>
            { formatMessage({id:'components.filters.requests.reset'}) }
          </Button>
        </Form.Item>
      </Form>
      
    );

}
//
export default Form.create({
  onValuesChange: (props, changeValues, allValues) => {
    if(typeof __formValuesChanged === 'function')
    {
      __formValuesChanged();
    }  
  }})
   (connect((state)=> ({
      isAdmin:               loginRedux.isAdmin(state),
      filterKeyValues:       operationsRedux.filterKeyValues(state),
      isOperationsLoading:   operationsRedux.isOperationsLoading(state),

    }),
    (dispatch)=>({
      
    })
)( injectIntl(RequestsFilter) ) );
