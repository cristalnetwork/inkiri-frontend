import React, {Component} from 'react'
import { Spin, Icon, Autocomplete, Select } from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import debounce from 'lodash/debounce';

const { Option } = Select;

class ProviderSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fetching:         false,
      data:             [],
      value:            undefined,
      selected:         undefined
    };

    this.lastFetchId   = 0;
    this.fetchProvider = debounce(this.fetchProvider, 800);
    
  }

  fetchProvider = value => {
    // const {value} = this.state;
    console.log('fetching provider', value);
    this.lastFetchId += 1;
    
    const fetchId = this.lastFetchId;
    
    this.setState({ data: [], fetching: true });
    
    api.bank.listProviders(value, value)
      .then(providers => {
        if (fetchId !== this.lastFetchId) {
          // for fetch callback order
          return;
        }
        const data = providers.map(provider => ({
          text: `${provider.name} - CNPJ: ${provider.cnpj}`,
          value: provider.id,
        }));
        this.setState({ data:data, fetching: false });
      });
  };

  // handleKeyPress = ev => {
  //   console.log('handleKeyPress', ev);
  // };

  handleChange = value => {
    console.log(' *** handleChange >> ', value)
    this.setState({
      selected:value,
      data: [],
      fetching: false,
    });
  };

    render() {
    const { fetching, data, value } = this.state;
    return (
      <Select
        mode="multiple"
        showSearch
        allowClear={true}
        autoFocus={true}
        maxTagCount={1}
        value={value}
        placeholder="Select provider by name or CNPJ"
        notFoundContent='No data'
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onSearch={ this.fetchProvider }
        onChange={ this.handleChange}
        style={{ width: '100%' }}
        loading={fetching}
      >
        {data.map(d => (
          <Option key={d.value}>{d.text}</Option>
        ))}
      </Select>
    );
  }

}
//
export default (ProviderSearch)
