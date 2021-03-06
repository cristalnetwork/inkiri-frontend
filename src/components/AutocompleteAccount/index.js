import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as accountsRedux from '@app/redux/models/accounts';
import * as loginRedux from '@app/redux/models/login'

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
// import IntlMessages from "@app/components/intl-messages";
// props.intl.formatMessage


class AutocompleteAccount extends Component {
  constructor(props) {
    super(props);

    const value = props.defaultValue;
    this.state = {
      fetching:            false,
      size:                props.size,
      value:               value,
      data:                [],
      validation_rule:     props.validation_rule,
      selected:            undefined,
      exclude_list:        props.exclude_list,
      readOnly:            props.readOnly||false, 
      filter:              props.filter||null,
      without_icon:        props.without_icon,
      label:               props.label,
      not_required:        props.not_required
    };

    this.handleSelect               = this.handleSelect.bind(this)
    this.setAccounts                = this.setAccounts.bind(this)
    this.loadAccounts               = this.loadAccounts.bind(this)
    this.reset                      = this.reset.bind(this)
    this.onAutocompleteBlur         = this.onAutocompleteBlur.bind(this)
  }

  componentDidMount(){
    // this.props.loadAccounts();
    this.setAccounts();
    
    if(typeof this.props.onRef==='function')
    {
      this.props.onRef(this)
    }
  }
  
  componentWillUnmount() {
    if(typeof this.props.onRef==='function')
      this.props.onRef(undefined)
  }

  componentDidUpdate(prevProps, prevState) 
  {
    let call_setAccounts = false;
    let new_state = {};
    if(!utils.objectsEqual(this.state.filter , this.props.filter )) 
    {
      new_state = {...new_state, 
          filter:                this.props.filter||false,
          readOnly:              this.props.readOnly||false, 
          without_icon:          this.props.without_icon,
          label:                 this.props.label,
          not_required:          this.props.not_required,
          size:                  this.props.size
        };
    }

    if(!utils.arraysEqual(this.state.accounts, this.props.accounts ))
    {
      call_setAccounts=true;
    }

    if(this.state.value !== this.props.defaultValue && this.props.defaultValue)
    {
      new_state = {...new_state, value:this.props.defaultValue};
    }

    if(!utils.arraysEqual(this.state.exclude_list, this.props.exclude_list) )
    { 
      call_setAccounts=true; 
      new_state = {...new_state, exclude_list:this.props.exclude_list};
      // this.setState({
      //     exclude_list: this.props.exclude_list
      // }, () => {
      //     this.setAccounts();
      // });
    }

    if(Object.keys(new_state).length>0)      
      this.setState(new_state, () => {
          call_setAccounts && this.setAccounts();
      });
  }

  setAccounts = () => {
    const {accounts, actualAccountName, filter, exclude_list} = this.props;
    
    const _filter_arr = filter?(!Array.isArray(filter)?[filter]:filter):null; 
    const filter_arr  = _filter_arr?_filter_arr.map(item => globalCfg.bank.getAccountType(item)):null;
    // globalCfg.bank.isAccountOfType(acc, filter)) 
    const my_accounts = this.props.accounts.filter(acc => 
        acc.key!=actualAccountName 
        && (!filter_arr || filter_arr.includes(globalCfg.bank.getAccountType(acc.account_type))) 
        && !(exclude_list||[]).includes(acc.key)
    );
    
    this.setState({
            filter:   this.props.filter,
            data:     my_accounts
          });
  }

  loadAccounts = (e) => {
    if(typeof e === 'object' && typeof e.preventDefault === 'function')
      e.preventDefault();
    this.props.loadAccounts();
    this.reset();
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

    const exists = this.props.accounts.filter( account => account.key==value);
    if(!exists || exists.length==0)
    {
      components_helper.notif.errorNotification(this.props.intl.formatMessage({id:'errors.select_account_from_list'}))
      this.triggerChange(null);
      return;
    }
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
    console.log(o)
  }
  renderAccount = (item) => {
    //<AutoComplete.Option key={item.key} text={item.key}>
    const {formatMessage} = this.props.intl;
    return (
      <AutoComplete.Option key={item.key} value={item.key}>
        {item.key}
        <span className="certain-search-item-count">@{ formatMessage({id:`pages.bankadmin.accounts.${globalCfg.bank.getAccountType(item.account_type)}`}) }</span>
      </AutoComplete.Option>
    );
  };

  onAutocompleteBlur = () => {
    // console.log('onAutocompleteBlur:', this.state.selected, this.props.form.getFieldValue(this.props.name));
    if(!this.state.selected)
      this.reset();
  }
  render = () => {
    const { formatMessage }  = this.props.intl;
    const { form }           = this.props;
    if(!form)
      return (null);
    //
    const { getFieldDecorator }             = form;
    const {without_icon, readOnly, value, size,
        data, fetching, label, not_required,
        validation_rule}                    = this.state;
    const {isLoading, name}                 = this.props;
    let selector                            = null;
    //
    if(readOnly){
      selector = (<div className="ui-row__col ui-row__col--content">
                    <div className="ui-info-row__content">
                        <div className="ui-info-row__title"><b>value</b></div>
                          <div className="ui-info-row__details">
                              <ul>
                                  <li>@{value}</li>
                              </ul>
                          </div>
                    </div>
                </div>); 
    //
    }
    else{
      /*
        onChange={this.handleChange} 
        onSearch={this.handleSearch} 
      */
      selector = (<Form.Item label={label}>
                        {getFieldDecorator(name, {
                        rules: [{ required: !not_required, message: (!not_required)?formatMessage({id:'components.AutocompleteAccount.index.choose_account_message'}):undefined , validator: validation_rule}]
                        , initialValue: value
                      })(
                          <AutoComplete
                            onBlur={this.onAutocompleteBlur} 
                            backfill={true}
                            size={size||'large'} 
                            dataSource={data.map(this.renderAccount)} 
                            style={{ width: '100%' }} 
                            onSelect={this.handleSelect} 
                            placeholder={ formatMessage({id:"components.AutocompleteAccount.index.placeholder"}) }
                            filterOption={(inputValue, option) =>
                              {
                                // console.log('>>filterOption >> ',inputValue, option);
                                return option.key.indexOf(inputValue) !== -1;
                              }
                            } 
                            optionLabelProp="value" >
                               <Input suffix={<Button loading={isLoading} type="link" icon="redo" className="redoButton"  title={ formatMessage({id:"components.AutocompleteAccount.index.title"})}  onClick={this.loadAccounts}></Button>} />
                            </AutoComplete>
                        )}
                      </Form.Item>);
    }
  //
    if(without_icon===true)
      return (selector);
    
    return (<div className="col_icon_widget money-transfer__row row-complementary row-complementary-bottom money-transfer__select" >
              <div className="col_icon badge badge-extra-small badge-circle addresse-avatar ">
                  <span className="picture">
                    <FontAwesomeIcon icon="user" size="lg" color="black"/>
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
        accounts:           accountsRedux.accounts(state),
        isLoading:          accountsRedux.isLoading(state),
        actualAccountName:  loginRedux.actualAccountName(state),
    }),
    (dispatch)=>({
        loadAccounts:       bindActionCreators(accountsRedux.loadAccounts, dispatch)        
    })
) (injectIntl(AutocompleteAccount)) )
;

