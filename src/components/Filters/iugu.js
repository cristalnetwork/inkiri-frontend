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
const IuguFilter = (props) => {
    
    // const [is_admin, setIsAdmin]       = useState(props.isAdmin);
    // const [callback, setCallback]           = useState(props.callback);
    const [buttonType, setButtonType]       = useState('default');
    const [key, setKey]                     = useState(props.the_key);
    const [is_loading, setIsLoading]        = useState(props.isOperationsLoading||false);
    
    const [intl, setIntl]                   = useState({});

    const default_filter               = { 
        operation_type:   undefined     
        , date_range:     [null, null]
        , account_type:   undefined     
        , state:          undefined     
        , search_text:    ''
    };

    const [filter, setFilter]          = useState(props.filter||default_filter);

    const {formatMessage} = props.intl;

    // useEffect(() => {
    //   setCallback(props.callback);
    // }, [props.callback]);

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

        let filtered = {...values, 'requested_type' : values['requested_type'] && values['requested_type'].join(',')}
        const date_range = values['date_range']
        if(date_range && date_range[0] && date_range[1])
          filtered = {...filtered, paid_at_from: date_range[0], paid_at_to: date_range[1]};
        delete filtered.date_range;
        // limpiamos las keys que estan vacias
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
    
    const iuguStatesOptions = () => {
      return (
        globalCfg.api.getIuguStates().map( iugu_st => {return (<Option key={'option'+iugu_st} value={iugu_st} title={intl[iugu_st]} label={intl[iugu_st]}>{intl[iugu_st]} </Option>)})
      )
    }
    //
    const iuguAccountsOptions = () => {
      return (
        globalCfg.api.getIuguAccounts().map( iugu_st => {return (<Option key={'option'+iugu_st} value={iugu_st} title={iugu_st} label={iugu_st}>{iugu_st} </Option>)})
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
        
        { <AutocompleteAccount
                        validation_rule={validateAccountNames} 
                        label={toText}
                        not_required={true}
                        form={_form} 
                        name="account_name" 
                        without_icon={true}
                        size="default"
                        filter={globalCfg.bank.ACCOUNT_TYPE_BUSINESS} />
        }

        { form_helper.getSelectItem(_form
            , filter
            , 'state'
            , iuguStatesOptions()
            , stateText
            , stateText
            , 'default'
            , dropdownRender
            , undefined
            , true) 
        }

        { form_helper.getSelectItem(_form
            , filter
            , 'iugu_account'
            , iuguAccountsOptions()
            , intl.iugu_account
            , intl.iugu_account
            , 'default'
            , dropdownRender
            , undefined
            , true) 
        }

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
          <Button size="small" key="requests_refresh" icon="redo" disabled={is_loading} onClick={()=>reload()} ></Button>,
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
)( injectIntl(IuguFilter) ) );
