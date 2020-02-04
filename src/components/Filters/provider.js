import React, { useState, useEffect } from 'react';
import { Form, Select, Button } from 'antd';

import { connect } from 'react-redux'

import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import * as form_helper from '@app/components/Form/form_helper';

import { injectIntl } from "react-intl";

import _ from 'lodash';

const { Option } = Select;

var __formValuesChanged = null;

const ProviderFilter = (props) => {
    
    // const [is_admin, setIsAdmin]       = useState(props.isAdmin);
    // const [callback, setCallback]           = useState(props.callback);
    const [buttonType, setButtonType]       = useState('default');
    const [key, setKey]                     = useState(props.the_key);
    
    const [filter, setFilter]          = useState(props.filter);

    const {formatMessage} = props.intl;
    
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
    //
    const className = `filter_form ${buttonType}`; 
    const _form     = props.form;
    
    const searchText      = formatMessage({id:'components.filters.requests.search'})
    
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
        

        <Form.Item style={{alignSelf:'flex-end', alignItems:'flex-end', flex:1}}>
          <Button htmlType="submit" type={buttonType}>
            { formatMessage({id:'components.filters.requests.filter'}) }
          </Button>
          <Button type="link" onClick={(event) => resetFilter(event)}>
            { formatMessage({id:'components.filters.requests.reset'}) }
          </Button>
          <Button size="small" key="requests_refresh" icon="redo" onClick={()=>reload()} ></Button>,
        </Form.Item>
      </Form>
      
    );

}
//
export default Form.create() (connect(
    (state)=> ({
      
    })
)( injectIntl(ProviderFilter) ) );
