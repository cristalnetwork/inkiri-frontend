import React, { useState, useEffect } from 'react';
import { Form, Select, Button} from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as operationsRedux from '@app/redux/models/operations'
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import * as form_helper from '@app/components/Form/form_helper';

import AutocompleteAccount from '@app/components/AutocompleteAccount';

import _ from 'lodash';

import { injectIntl } from "react-intl";

const { Option } = Select;

const OperationsFilter = (props) => {
    
    const [is_admin, setIsAdmin]       = useState(props.isAdmin);
    // const [callback, setCallback]      = useState(props.callback);
    const [show_search, setShowSearch] = useState(props.show_search||false);
    const [is_loading, setIsLoading]   = useState(props.isOperationsLoading||false);

    const default_filter               = { 
        operation_type:   undefined     
        , date_range:     [null, null]
        , account_type:   undefined     
        , search_text:    ''
        , in_out:         undefined

    };

    const [filter, setFilter]          = useState(props.filter||default_filter);
    
    const {formatMessage} = props.intl;

    useEffect(() => {
      setIsLoading(props.isOperationsLoading)
    }, [props.isOperationsLoading]);
    
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
          fireEvent(err, null, null);
          console.log(' ERRORS!! >> ', err)
          return;
        }

        console.log(values)
       
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
    const _form = props.form;
    if(!filter)
      return (null);
    

    const senderText      = formatMessage({id:'components.filters.operations.sender'})
    const receiverText    = formatMessage({id:'components.filters.operations.receiver'})
    const searchText      = formatMessage({id:'components.filters.requests.search'})
    const operationText   = formatMessage({id:'components.filters.requests.operation'})
    const accountTypeText = formatMessage({id:'components.filters.requests.account_type'})
    const stateText       = formatMessage({id:'components.filters.requests.state'})
    const dateRangeText   = formatMessage({id:'components.filters.requests.date_range'})    
    const externalText    = formatMessage({id:'components.filters.requests.external'})    



    return( 
      <Form layout="inline" className="filter_form" onSubmit={applyFilter}>
        
        <AutocompleteAccount 
                validation_rule={validateAccountNames} 
                autoFocus 
                label={senderText}
                not_required={true}
                form={_form} 
                name="from" 
                without_icon={true}
                size="default"/>

        <AutocompleteAccount 
                validation_rule={validateAccountNames} 
                label={receiverText}
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

        { form_helper.getDateRangeItem (_form
            , filter
            , 'date_range'
            , dateRangeText
            , undefined
            , undefined
            , true) }

        
        
        <Form.Item style={{alignSelf:'flex-end', alignItems:'flex-end', flex:1}}>
          <Button htmlType="submit" disabled={is_loading} loading={is_loading}>
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
)( injectIntl(OperationsFilter) ) );
