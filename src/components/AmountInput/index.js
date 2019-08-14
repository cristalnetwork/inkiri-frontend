import React, {useState, Component} from 'react'
import { Form, Input, Select, Button } from 'antd';
import * as globalCfg from '@app/configs/global';
import './amountInput.css';

const { Option } = Select;

class AmountInput extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {}),
      };
    }
    return null;
  }

  constructor(props) {
    super(props);

    const value = props.value || {};
    this.state = {
      amount:   value.amount || 0,
      currency: value.currency,
    };
  }

  handleAmountChange = e => {
    const amount = parseInt(e.target.value || 0, 10);
    if (Number.isNaN(amount)) {
      return;
    }
    if (!('value' in this.props)) {
      this.setState({ amount });
    }
    this.triggerChange({ amount });
  };

  handleCurrencyChange = currency => {
    if (!('value' in this.props)) {
      this.setState({ currency });
    }
    this.triggerChange({ currency });
  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  //

  render() {
    const { size } = this.props;
    const { state } = this;
    return (
      <span className="amountInput">
        <Input
          className="extra-large"
          type="text"
          size={size}
          value={state.amount}
          onChange={this.handleAmountChange}
          style={{ width: '65%', marginRight: '3%' }}
        />
        <Select
          value={state.currency}
          size={size}
          style={{ width: '32%' }}
          onChange={this.handleCurrencyChange}
          className="extra-large"
        >
          <Option value="INK">{globalCfg.currency.symbol}</Option>
          <Option value="BRL">BRL</Option>
        </Select>
      </span>
    );
  }
}


export default (AmountInput);