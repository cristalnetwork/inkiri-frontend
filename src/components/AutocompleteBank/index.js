import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as graphqlRedux from '@app/redux/models/graphql'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as validators from '@app/components/Form/validators';
import * as request_helper from '@app/components/TransactionCard/helper';
import * as form_helper from '@app/components/Form/form_helper';
import * as utils from '@app/utils/utils';

import * as components_helper from '@app/components/helper';

import { withRouter } from "react-router-dom";

import { Spin, Select, notification, Empty, Button, Form, message, AutoComplete, Input, Icon } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { injectIntl } from "react-intl";


class AutocompleteBank extends Component {
  constructor(props) {
    super(props);

    const value = props.value || {};
    this.state = {
      fetching:            false,
      size:                props.size,
      value:               props.value,
      data:                [],
      validation_rule:     props.validation_rule,
      selected:            undefined,
      filter:              props.filter||null,
      without_icon:        props.without_icon,
      label:               props.label,
      not_required:        props.not_required,
    };

    this.handleSelect      = this.handleSelect.bind(this)
    this.setBanks          = this.setBanks.bind(this)
    this.loadBanks         = this.loadBanks.bind(this)
    this.reset             = this.reset.bind(this)
  }

  componentDidMount(){
    this.setBanks();
    
    if(typeof this.props.onRef==='function')
    {
      this.props.onRef(this)
    }

    if(utils.objectNullOrEmpty(this.props.banks))
    {
      this.props.loadConfig();
    }
  }
  
  componentWillUnmount() {
    if(typeof this.props.onRef==='function')
      this.props.onRef(undefined)
  }

  componentDidUpdate(prevProps, prevState) 
  {
      if(!utils.arraysEqual(prevProps.banks, this.props.banks) )
      {
        setTimeout(()=> {
          this.setBanks();
        } ,100);
      }
  }

  setBanks = () => {
    const {banks} = this.props;
    if(utils.arrayNullOrEmpty(banks))
      this.props.loadBanks();
    else
      this.setState({data: banks});
  }

  loadBanks = (e) => {
    if(typeof e === 'object' && typeof e.preventDefault === 'function')
      e.preventDefault();
    this.props.loadBanks();
  }
  
  handleChange = (value) => {
    console.log(' ::handleChange', value)
  }
  handleSearch = (value) => {
    console.log(' ::handleSearch', value)
  }
  handleSelect = (value, option) => {
    // console.log(' *** handleSelect >> ', value, option)
    this.setState({
      selected:value,
      value:value,
      fetching: false,
    });

    // const exists = this.props.banks.filter( bank => bank.value==value);
    // if(!exists || exists.length==0)
    // {
    //   components_helper.notif.errorNotification(this.props.intl.formatMessage({id:'components.AutocompleteBank.index.choose_bank_message'}))
    //   this.triggerChange(null);
    //   return;
    // }
    this.triggerChange(value);

  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const { callback } = this.props;
    if(typeof callback === 'function')
      callback(changedValue);
  };

  reset = () => {
    this.props.form.setFieldsValue({[this.props.name]:''})
  }

  onChange = (o) => {

  }

  renderBank = (item) => {
    //<AutoComplete.Option key={item.key} text={item.key}>
    const {formatMessage} = this.props.intl;
    return (
      <AutoComplete.Option title={item.value} key={item.key} value={item.value}>
        {item.value}
        <span className="certain-search-item-count">@{item.key}</span>
      </AutoComplete.Option>
    );
  };

  render = () => {
    const { formatMessage }  = this.props.intl;
    const { form }           = this.props;
    if(!form)
      return (null);
    //
    const { getFieldDecorator }             = form;
    const {without_icon, value, size,
        data, fetching, label, not_required,
        validation_rule}                    = this.state;
    const {isLoading, name}                 = this.props;
    
    const  selector = (<Form.Item label={label}>
                        {getFieldDecorator(name, {
                        rules: [{ required: !not_required
                                    , message: (!not_required)?formatMessage({id:'components.AutocompleteBank.index.choose_bank_message'}):undefined 
                                    , validator: validation_rule}]
                        , initialValue: value
                      })(
                          <AutoComplete 
                            size={size||'large'} 
                            dataSource={data.map(this.renderBank)} 
                            style={{ width: '100%' }} 
                            onSelect={this.handleSelect} 
                            placeholder={ formatMessage({id:"components.AutocompleteBank.index.placeholder"}) }
                            filterOption={(inputValue, option) =>
                              {
                               return option.props.value.toLowerCase().indexOf((inputValue||'').toLowerCase()) !== -1;
                              }
                            } 
                            optionLabelProp="value" >
                               <Input suffix={<Button loading={isLoading||fetching} type="link" icon="redo" className="redoButton"  title={ formatMessage({id:"components.AutocompleteBank.index.title"})}  onClick={this.loadBanks}></Button>} />
                            </AutoComplete>
                        )}
                      </Form.Item>);
    //
    if(without_icon===true)
      return (selector);
    
    return (<div className="col_icon_widget money-transfer__row row-complementary money-transfer__select" >
              <div className="col_icon badge badge-extra-small badge-circle addresse-avatar ">
                  <span className="picture">
                    <FontAwesomeIcon icon="university" size="lg" color="black"/>
                  </span>
              </div>
              <div className="col_widget money-transfer__input money-transfer__select">
                {selector}
              </div>
          </div>);
  }
  
  
}

export default (connect(
    (state)=> ({
        banks:              graphqlRedux.banks(state),
        isLoading:          graphqlRedux.isLoading(state),
    }),
    (dispatch)=>({
        loadBanks:         bindActionCreators(graphqlRedux.loadConfig, dispatch),
    })
) (injectIntl(AutocompleteBank)) )
;

