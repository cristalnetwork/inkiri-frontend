import React, {Component} from 'react'
import { Select } from 'antd';

import { connect } from 'react-redux'
import * as api from '@app/services/inkiriApi';

import debounce from 'lodash/debounce';
import { injectIntl } from "react-intl";

const { Option } = Select;

/*
* ToDo: We should re read https://github.com/ant-design/ant-design/blob/master/components/form/demo/customized-form-controls.md
* up to provide decorator's validation.
*/
class ProviderSearch extends Component {
  constructor(props) {
    super(props);
    const value = props.value || {};
    this.state = {
      fetching:               false,
      data:                   [],
      value:                  undefined, // <- This shold receive value prop!
      selected:               undefined,
      selector_placeholder:  'Select provider by name or CNPJ',
      no_data_text:          'No data'
    };

    this.lastFetchId   = 0;
    this.fetchProvider = debounce(this.fetchProvider, 800);
    
  }

  componentDidMount(){
    const {formatMessage} = this.props.intl;
    const selector_placeholder = formatMessage({id:'components.ProviderSearch.index.selector_placeholder'})
    const no_data_text         = formatMessage({id:'global.no_data'})

    this.setState({  selector_placeholder: selector_placeholder
                     , no_data_text:       no_data_text});
  }
  fetchProvider = value => {
    // const {value} = this.state;
    // console.log('fetching provider', value);
    this.lastFetchId += 1;
    
    const fetchId = this.lastFetchId;
    
    this.setState({ data: [], fetching: true });
    
    const {formatMessage} = this.props.intl;
    const cnpj = formatMessage({id:'components.ProviderSearch.index.cnpj'})

    api.bank.listProviders(value, value)
      .then(providers => {
        if (fetchId !== this.lastFetchId) {
          // for fetch callback order
          return;
        }
        const data = providers.map(provider => ({
          text: formatMessage() `${provider.name} - ${cnpj}: ${provider.cnpj}`,
          value: provider.id,
        }));
        this.setState({ data:data, fetching: false });
      });
  };

  // handleKeyPress = ev => {
  //   console.log('handleKeyPress', ev);
  // };

  handleChange = value => {
    // console.log(' *** handleChange >> ', value)
    this.setState({
      selected:value,
      value:value,
      fetching: false,
    });

    const the_value = (value&&value.length>0)?value[0]:undefined;
    this.triggerChange(the_value);

  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const { onProviderSelected } = this.props;
    if (onProviderSelected) {
      onProviderSelected(
        changedValue
      );
    }
  };


  render() {
    //  
    const { fetching, data, value, selector_placeholder, no_data_text } = this.state;
    return (
      <Select
        mode="multiple"
        showSearch
        labelInValue
        allowClear={true}
        autoFocus={true}
        maxTagCount={1}
        value={value}  
        placeholder={selector_placeholder}
        notFoundContent={no_data_text}
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
export default ( injectIntl(ProviderSearch))
