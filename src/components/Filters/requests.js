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
const RequestsFilter = (props) => {
    
    // const [is_admin, setIsAdmin]       = useState(props.isAdmin);
    // const [callback, setCallback]           = useState(props.callback);
    const [buttonType, setButtonType]       = useState('default');
    const [key, setKey]                     = useState(props.the_key);
    const [show_search, setShowSearch]      = useState(props.show_search||false);
    const [is_loading, setIsLoading]        = useState(props.isOperationsLoading||false);
    const [request_type, setRequest_type]   = useState(props.request_type);
    const [hidden_fields, setHiddenFields]  = useState([]);

    const [intl, setIntl]                   = useState({});

    const default_filter               = { 
        operation_type:   undefined     
        , date_range:     [null, null]
        , account_type:   undefined     
        , state:          undefined     
        , search_text:    ''
        , in_out:         undefined

    };

    // const [filter, setFilter]          = useState(props.filter||default_filter);
    const [filter, setFilter]          = useState({...default_filter, ...(props.filter||{})});
    useEffect(() => {
      setFilter({...default_filter, ...(props.filter||{})});
    }, [props.filter]);

    const {formatMessage} = props.intl;

    useEffect(() => {
      const myIntl = {}; 
      myIntl.type_deposit = formatMessage({id:'requests.types.type_deposit'});
      myIntl.type_exchange = formatMessage({id:'requests.types.type_exchange'});
      myIntl.type_payment = formatMessage({id:'requests.types.type_payment'});
      myIntl.type_provider = formatMessage({id:'requests.types.type_provider'});
      myIntl.type_send = formatMessage({id:'requests.types.type_send'});
      myIntl.type_withdraw = formatMessage({id:'requests.types.type_withdraw'});
      myIntl.type_service = formatMessage({id:'requests.types.type_service'});
      myIntl.type_salary = formatMessage({id:'requests.types.type_salary'});
      myIntl.type_pad = formatMessage({id:'requests.types.type_pad'});
      myIntl.type_issue = formatMessage({id:'requests.types.type_issue'});
      myIntl.type_iugu = formatMessage({id:'requests.types.type_iugu'});
      myIntl.type_refund = formatMessage({id:'requests.types.type_refund'});
      myIntl.type_receive = formatMessage({id:'requests.types.type_receive'});
      myIntl.type_unknown = formatMessage({id:'requests.types.type_unknown'});
      myIntl.type_new_account = formatMessage({id:'requests.types.type_new_account'});
      myIntl.type_upsert_cust = formatMessage({id:'requests.types.type_upsert_cust'});
      myIntl.type_erase_cust = formatMessage({id:'requests.types.type_erase_cust'});
      myIntl.type_upsert_pap = formatMessage({id:'requests.types.type_upsert_pap'});
      myIntl.type_erase_pap = formatMessage({id:'requests.types.type_erase_pap'});
      myIntl.type_charge_pap = formatMessage({id:'requests.types.type_charge_pap'});
      setIntl(myIntl);
    }, []);

    useEffect(() => {
      if(!Array.isArray(props.hidden_fields))
        return;
      setHiddenFields(props.hidden_fields || []);
    }, [props.hidden_fields]);

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
        if(date_range && date_range[0] && date_range[1] && !hidden_fields.includes('date_range') )
          filtered = {...filtered, date_from: date_range[0] ,date_to: date_range[1]};
        if(filtered.date_range)
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
    
    const renderSelectTxTypeOptions = () => {
      let allowed_tx_types = globalCfg.api.getTypes(); 
      if(request_type!==DISPLAY_REQUESTS)
      {
        allowed_tx_types = request_type.split(',');
      }
      
      return (
        globalCfg.api.getTypes().map( tx_type => {return allowed_tx_types.includes(tx_type) && (<Option key={'option'+tx_type} value={tx_type} title={intl[tx_type]} label={intl[tx_type]}>{intl[tx_type]} </Option>)})
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

    // console.log('FILTER::REQUESTS:filter:',filter);
    return( 
      <Form 
        layout="inline" 
        className={className}
        onSubmit={applyFilter}
        onChange={formValuesChanged}
        >
        
        { !hidden_fields.includes('from') 
          && <AutocompleteAccount
                validation_rule={validateAccountNames} 
                autoFocus 
                defaultValue={filter.from}
                label={fromText}
                not_required={true}
                form={_form} 
                name="from" 
                without_icon={true}
                size="default"/> 
        }
        { !hidden_fields.includes('to') 
          && <AutocompleteAccount
                defaultValue={filter.to}
                validation_rule={validateAccountNames} 
                label={toText}
                not_required={true}
                form={_form} 
                name="to" 
                without_icon={true}
                size="default"/>
        }

        { show_search 
          && form_helper.getSearchItem(_form
            , filter
            , 'search_text'
            , searchText
            , searchText
            , undefined
            , undefined)
        }

        { !hidden_fields.includes('requested_type') 
          && form_helper.getSelectItem(_form
            , filter
            , 'requested_type'
            , renderSelectTxTypeOptions()
            , operationText
            , operationText
            , 'multiple'
            , dropdownRender
            , undefined
            , true) 
        }

        { false 
          && form_helper.getSelectItem(_form
            , filter
            , 'in_out'
            , renderSelectInOutOptions()
            , externalText
            , externalText
            , 'multiple'
            , dropdownRender
            , undefined
            , true) }

        { false 
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

        { !hidden_fields.includes('state') && 
          form_helper.getSelectItem(_form
            , filter
            , 'state'
            , renderRequestStates()
            , stateText
            , stateText
            , 'default'
            , dropdownRender
            , undefined
            , true) 
        }

        { !hidden_fields.includes('date_range') 
          && form_helper.getDateRangeItem (_form
            , filter
            , 'date_range'
            , dateRangeText
            , undefined
            , undefined
            , props.intl) }
        
        
          <div style={{alignSelf:'flex-end', justifyContent:'flex-end', alignItems:'flex-end', flex:1, display: 'flex'}}>
            <Button disabled={is_loading} onClick={(event) => resetFilter(event)} style={{alignSelf:'flex-end', marginRight:8}}>
              { formatMessage({id:'components.filters.requests.reset'}) }
            </Button>
            <Button htmlType="submit" disabled={is_loading} type={buttonType} style={{alignSelf:'flex-end'}}>
              { formatMessage({id:'components.filters.requests.filter'}) }
            </Button>
            <Button className="hidden" size="small" key="requests_refresh" icon="redo" disabled={is_loading} onClick={()=>reload()} ></Button>,
          </div>
        
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
