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

class AutocompleteAccount extends Component {
  constructor(props) {
    super(props);

    const value = props.value || {};
    this.state = {
      fetching:            false,
      
      data:                [],
      value:               undefined, // <- This shold receive value prop!
      selected:            undefined,
      form:                props.form,
      exclude_list:        props.exclude_list,
      readOnly:            props.readOnly||false, 
      callback:            props.callback,
      filter:              props.filter||null
    };

    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.handleChange               = this.handleChange.bind(this)
    this.setAccounts                = this.setAccounts.bind(this)
    this.loadAccounts              = this.loadAccounts.bind(this)
    // this.lastFetchId   = 0;
    // this.fetchProvider = debounce(this.fetchProvider, 800);
  }

  componentDidMount(){
    // this.props.loadAccounts();
    this.setAccounts();
  }

  componentDidUpdate(prevProps, prevState) 
  {
      if(prevProps.filter !== this.props.filter 
          || prevProps.form !== this.props.form ) {
        this.setState({
            callback:              this.props.callback,
            filter:                this.props.filter||false,
            form:                  this.props.form,
            readOnly:              this.props.readOnly||false, 
          });
      }

      if(prevProps.accounts !== this.props.accounts )
      {
        this.setAccounts();
      }

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
    const my_accounts = this.props.accounts.filter(acc => 
        acc.key!=actualAccountName 
        && (!filter || globalCfg.bank.isAccountOfType(acc, filter)) 
        && !(exclude_list||[]).includes(acc.key)
    );
      //.map(acc=> { return {text: acc.key, value:acc} } )
    
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

  handleChange = (value, option) => {
    console.log(' *** handleChange >> ', value, option)
    this.setState({
      selected:value,
      value:value,
      data: [],
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
    const { form }                          = this.state;
    if(!form)
      return (null);
    //
    const { getFieldDecorator }             = form;
    const {readOnly, value, data, fetching} = this.state;
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
      selector = (<Form.Item>
                        {getFieldDecorator(name, {
                        rules: [{ required: true, message: 'Please choose a customer!' }]
                      })(
                          <AutoComplete size="large" 
                            dataSource={data.map(this.renderAccount)} 
                            style={{ width: '100%' }} 
                            onSelect={this.handleChange} 
                            placeholder="Type account name" 
                            filterOption={(inputValue, option) =>
                              option.key.indexOf(inputValue) !== -1
                            }
                            className="extra-large"
                            optionLabelProp="value" >
                               <Input suffix={<Button loading={isLoading} type="link" icon="redo" title="Can't find account? Click to reload accounts!!!"  onClick={this.loadAccounts}></Button>} />
                            </AutoComplete>
                        )}
                      </Form.Item>);
    }
  //
    return (<div className="money-transfer__row row-complementary row-complementary-bottom money-transfer__select" >
              <div className="badge badge-extra-small badge-circle addresse-avatar ">
                  <span className="picture">
                    <FontAwesomeIcon icon="user" size="lg" color="gray"/>
                  </span>
              </div>
              <div className="money-transfer__input money-transfer__select">
                {selector}
              </div>
          </div>);
  }
  
  
}
//
// export default Form.create() (withRouter(connect(
//     (state)=> ({
//         accounts:       accountsRedux.accounts(state),
//         actualAccountName:    loginRedux.actualAccountName(state),
//     }),
//     (dispatch)=>({
//         loadAccounts:   bindActionCreators(accountsRedux.loadAccounts, dispatch)        
//     })
// )(AutocompleteAccount) )
// );


export default (connect(
    (state)=> ({
        accounts:           accountsRedux.accounts(state),
        isLoading:          accountsRedux.isLoading(state),
        actualAccountName:  loginRedux.actualAccountName(state),
    }),
    (dispatch)=>({
        loadAccounts:       bindActionCreators(accountsRedux.loadAccounts, dispatch)        
    })
)(AutocompleteAccount) )
;

