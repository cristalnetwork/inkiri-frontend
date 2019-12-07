import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Input, DatePicker } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import * as form_helper from '@app/components/Form/form_helper';

const { MonthPicker, RangePicker } = DatePicker;
const { Option } = Select;

const OperationsFilter = (props) => {
    
    const [is_admin, setIsAdmin]       = useState(props.isAdmin);
    const [callback, setCallback]      = useState(props.callback);

    useEffect(() => {
        setIsAdmin(props.isAdmin);
        setCallback(props.callback);
    });

    const fireEvent = (object) => {
      if(typeof callback === 'function') {
          callback(object)
      }
    }
    
    const handleSubmit = () => {

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
    /*
      <Form.Item label="In-Out">
        <Select placeholder="In-Out"
            mode="multiple"
            style={{ minWidth: '250px' }}
            defaultValue={['ALL']}
            optionLabelProp="label">
              {renderSelectInOutOptions()}
          </Select>
      </Form.Item>
    */
    //
    const dropdownRender = (menu) => 
          (<div style={{minWidth:250}}>
            {menu}
          </div>);
    //
    return( 
      <Form layout="inline" className="filter_form" onSubmit={handleSubmit}>
        <Form.Item label="Search">
            <Input.Search className="styles extraContentSearch" placeholder="Search" onSearch={() => ({})} />
        </Form.Item>
              
        <Form.Item label="Operation">
            <Select placeholder="Operation"
              mode="multiple"
              defaultValue={['ALL']}
              optionLabelProp="label"
              dropdownRender={dropdownRender}>
                {renderSelectTxTypeOptions()}
            </Select>
        </Form.Item>
        <Form.Item label="Date Range">
            <RangePicker
              defaultValue={[moment('2015/01/01', form_helper.DATE_FORMAT), moment('2015/01/01', form_helper.DATE_FORMAT)]}
              format={form_helper.DATE_FORMAT}
            />
        </Form.Item>
        <Form.Item label="Account type">
          <Select placeholder="Account type"
              mode="multiple"
              defaultValue={['ALL']}
              optionLabelProp="label"
              dropdownRender={dropdownRender}>
                {renderSelectAccountTypeOptions()}
            </Select>
        </Form.Item>
        <Form.Item style={{alignSelf:'flex-end', alignItems:'flex-end', flex:1}}>
          <Button htmlType="submit" disabled>
            Filter
          </Button>
        </Form.Item>
      </Form>
      
    );

}
//
export default connect(
    (state)=> ({
      isAdmin:           loginRedux.isAdmin(state),
    })
)(OperationsFilter)

