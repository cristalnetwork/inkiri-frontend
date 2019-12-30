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

import { withRouter } from "react-router-dom";

import { Spin, Select, notification, Empty, Button, Form, message, AutoComplete, Input, Icon } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { injectIntl } from "react-intl";
// import IntlMessages from "@app/components/intl-messages";
// props.intl.formatMessage


class AutocompleteAccount extends Component {
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
      form:                props.form,
      exclude_list:        props.exclude_list,
      readOnly:            props.readOnly||false, 
      callback:            props.callback,
      filter:              props.filter||null,
      without_icon:        props.without_icon,
      label:               props.label,
      not_required:        props.not_required
    };

    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.handleSelect               = this.handleSelect.bind(this)
    this.setAccounts                = this.setAccounts.bind(this)
    this.loadAccounts               = this.loadAccounts.bind(this)
    this.reset                      = this.reset.bind(this)
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
      if(prevProps.filter !== this.props.filter 
          || prevProps.form !== this.props.form ) {
        // console.log(' --------- per que?')
        // console.log(this.props.not_required, this.props.size, this.props.without_icon)
        this.setState({
            callback:              this.props.callback,
            filter:                this.props.filter||false,
            form:                  this.props.form,
            readOnly:              this.props.readOnly||false, 
            without_icon:          this.props.without_icon,
            label:                 this.props.label,
            not_required:          this.props.not_required,
            size:                  this.props.size
          });
      }

      if(prevProps.accounts !== this.props.accounts )
      {
        this.setAccounts();
      }

      // if(prevProps.value !== this.props.value )
      // {
      //   this.setState({value:value});
      // }

      if(prevProps.exclude_list !== this.props.exclude_list )
      {  
        this.setState({
            exclude_list: this.props.exclude_list
        }, () => {
            this.setAccounts();
        });
      }
    // this.setState({fetching: false});
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
            callback:              this.props.callback,
            filter:   this.props.filter,
            form:                  this.props.form,
            data:                  my_accounts
          });
  }

  loadAccounts = (e) => {
    if(typeof e === 'object' && typeof e.preventDefault === 'function')
      e.preventDefault();
    this.props.loadAccounts();
  }
  
  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
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
      this.openNotificationWithIcon("error", 'Please select an account from the list.');
      this.triggerChange(null);
      return;
    }

    // const the_value = (value&&value.length>0)?value[0]:undefined;
    // this.triggerChange(the_value);
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
  renderAccount = (item) => {
    //<AutoComplete.Option key={item.key} text={item.key}>
    return (
      <AutoComplete.Option key={item.key} value={item.key}>
        {item.key}
        <span className="certain-search-item-count">@{globalCfg.bank.getAccountType(item.account_type)}</span>
      </AutoComplete.Option>
    );
  };

  render = () => {
    const { formatMessage }  = this.props.intl;
    const { form }           = this.state;
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
                        rules: [{ required: !not_required, message: (!not_required)?'Please choose a customer!':undefined , validator: validation_rule}]
                      })(
                          <AutoComplete 
                            size={size||'large'} 
                            dataSource={data.map(this.renderAccount)} 
                            style={{ width: '100%' }} 
                            onSelect={this.handleSelect} 
                            placeholder={ formatMessage({id:"components.AutocompleteAcount.index.placeholder"}) }
                            filterOption={(inputValue, option) =>
                              {
                                // console.log('>>filterOption >> ',inputValue, option);
                                return option.key.indexOf(inputValue) !== -1;
                              }
                            } 
                            optionLabelProp="value" >
                               <Input suffix={<Button loading={isLoading} type="link" icon="redo" className="redoButton"  title={ formatMessage({id:"components.AutocompleteAcount.index.title"})}  onClick={this.loadAccounts}></Button>} />
                            </AutoComplete>
                        )}
                      </Form.Item>);
    }
  //
    if(without_icon===true)
      return (selector);
    
    return (<div className="money-transfer__row row-complementary row-complementary-bottom money-transfer__select" >
              <div className="badge badge-extra-small badge-circle addresse-avatar ">
                  <span className="picture">
                    <FontAwesomeIcon icon="user" size="lg" color="black"/>
                  </span>
              </div>
              <div className="money-transfer__input money-transfer__select">
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

