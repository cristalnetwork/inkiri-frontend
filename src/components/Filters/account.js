import React, { useState, useEffect } from 'react';
import { Form, Select, Button } from 'antd';

import { connect } from 'react-redux'

import * as operationsRedux from '@app/redux/models/operations'
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import * as form_helper from '@app/components/Form/form_helper';

import {DISPLAY_REQUESTS} from '@app/components/TransactionTable';
import AutocompleteAccount from '@app/components/AutocompleteAccount';

import { injectIntl } from "react-intl";

import _ from 'lodash';

const { Option } = Select;

var __formValuesChanged = null;

const AccountFilter = (props) => {
    
    // const [is_admin, setIsAdmin]       = useState(props.isAdmin);
    // const [callback, setCallback]           = useState(props.callback);
    const [buttonType, setButtonType]       = useState('default');
    const [key, setKey]                     = useState(props.the_key);
    const [is_loading, setIsLoading]        = useState(props.isOperationsLoading||false);
    const [hidden_fields, setHiddenFields]  = useState([]);

    const [intl, setIntl]                   = useState({});

    useEffect(() => {
      if(!Array.isArray(props.hidden_fields))
        return;
      setHiddenFields(props.hidden_fields || []);
    }, [props.hidden_fields]);


    const [filter, setFilter]          = useState(props.filter);

    const {formatMessage} = props.intl;

    useEffect(() => {
      const myIntl = {}; 
      myIntl.iugu_account = formatMessage({id:'pages.bankadmin.iugu.iugu_account'});

      myIntl.state_not_processed = formatMessage({id:'components.filters.iugu.state_not_processed'});
      myIntl.state_processing = formatMessage({id:'components.filters.iugu.state_processing'});
      myIntl.state_issued = formatMessage({id:'components.filters.iugu.state_issued'});
      myIntl.state_error = formatMessage({id:'components.filters.iugu.state_error'});
      myIntl.state_issue_error = formatMessage({id:'components.filters.iugu.state_issue_error'});

      setIntl(myIntl);
    }, []);

    
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

        let filtered = {...values}
        const filtered_nn  = _.reduce(filtered, function(result, value, key) {
          if(value)
            result[key] = value;
          return result;
        }, {});

        fireEvent(null, null, filtered_nn, null)
      });
    }

    const fireEvent = (error, cancel, data, refresh) => {
      setButtonType('default')
      if(typeof props.callback === 'function') {
          props.callback(error, cancel, data, refresh)
      }
    }
    
    const reload = () =>{
      fireEvent(null, null, null, true)
    }    
    
    const renderSelectAccountTypeOptions = () => {
      return (
        globalCfg.bank.listAccountTypes().map( tx_state => {return(<Option key={'option'+tx_state} value={tx_state} label={utils.firsts(tx_state)}>{ utils.capitalize(tx_state) } </Option>)})
          )
    }
    //
    const renderBalanceStatusOptions = () => {
      const balance_status = [
        {   title : balance_status_positive, value: '1'}
        , { title : balance_status_negative, value: '-1'}
        , { title : balance_status_any, value: '0'}
      ]
      return (
        balance_status.map( status => {return(<Option key={'option'+status.title} value={status.value} label={status.title}>{ status.title } </Option>)})
          )
    }
    //
    const dropdownRender = (menu) => 
          (<div style={{minWidth:250}}>
            {menu}
          </div>);
    //
    const className = `filter_form ${buttonType}`; 
    const _form     = props.form;
    
    // if(!filter)
    //   return (null);
    
    const fromText        = formatMessage({id:'components.filters.requests.from'})
    const toText          = formatMessage({id:'components.filters.requests.to'})
    const searchText      = formatMessage({id:'components.filters.requests.search'})
    const operationText   = formatMessage({id:'components.filters.requests.operation'})
    const accountTypeText = formatMessage({id:'components.filters.requests.account_type'})
    const stateText       = formatMessage({id:'components.filters.requests.state'})
    const dateRangeText   = formatMessage({id:'components.filters.requests.date_range'})    
    const externalText    = formatMessage({id:'components.filters.requests.external'})    
    const balance_status  = formatMessage({id:'components.filters.accounts.balance_status'});
    const balance_status_positive = formatMessage({id:'components.filters.accounts.balance_status_positive'});
    const balance_status_negative = formatMessage({id:'components.filters.accounts.balance_status_negative'});
    const balance_status_any      = formatMessage({id:'components.filters.accounts.balance_status_any'});

    return( 
      <Form 
        layout="inline" 
        className={className}
        onSubmit={applyFilter}
        onChange={formValuesChanged}
        >
        
        { form_helper.getSearchItem(_form
            , filter
            , 'search_text'
            , searchText
            , searchText
            , undefined
            , undefined)
        }
        
        { !hidden_fields.includes('account_type')
          && form_helper.getSelectItem(_form
            , filter
            , 'account_type'
            , renderSelectAccountTypeOptions()
            , accountTypeText
            , accountTypeText
            , 'multiple'
            , dropdownRender
            , undefined
            , true) }

        { !hidden_fields.includes('balance_status')
          && form_helper.getSelectItem(_form
            , filter
            , 'balance_status'
            , renderBalanceStatusOptions()
            , balance_status
            , balance_status
            , 'multiple'
            , dropdownRender
            , undefined
            , true) }

        <Form.Item style={{alignSelf:'flex-end', alignItems:'flex-end', flex:1}}>
          <Button htmlType="submit" disabled={is_loading} type={buttonType}>
            { formatMessage({id:'components.filters.requests.filter'}) }
          </Button>
          <Button type="link" disabled={is_loading} onClick={(event) => resetFilter(event)}>
            { formatMessage({id:'components.filters.requests.reset'}) }
          </Button>
          <Button size="small" key="requests_refresh" icon="redo" disabled={is_loading} onClick={()=>reload()} ></Button>,
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

    })
)( injectIntl(AccountFilter) ) );
