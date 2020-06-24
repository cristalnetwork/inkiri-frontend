import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'
import * as menuRedux from '@app/redux/models/menu';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Card, PageHeader, Button, Spin, Descriptions, Form, Icon, Input } from 'antd';

import * as columns_helper from '@app/components/TransactionTable/columns';

import {DISPLAY_PROVIDER } from '@app/components/TransactionTable';
import RequestListWidget from '@app/components/request-list-widget';

import AutocompleteBank from '@app/components/AutocompleteBank';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

import {formItemLayout,tailFormItemLayout } from '@app/utils/utils';

import { injectIntl } from "react-intl";
import * as gqlService from '@app/services/inkiriApi/graphql'


const DEFAULT_RESULT = {
  result:             undefined,
  result_object:      undefined,
  error:              {},
}
class Provider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      referrer:        (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,

      updating:        false,
      pushingTx:       false,
      
      intl:            {},

      loading:         false,
      txs:             [],
      page:            -1, 
      limit:           globalCfg.api.default_page_size,
      can_get_more:    true,
      
      ...DEFAULT_RESULT,
      
      provider:        (props && props.location && props.location.state && props.location.state.provider)? props.location.state.provider : undefined,
      
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetPage                  = this.resetPage.bind(this); 
    this.renderProviderInfo         = this.renderProviderInfo.bind(this);
    this.onUpdateProvider           = this.onUpdateProvider.bind(this);
    this.userResultEvent            = this.userResultEvent.bind(this); 
    this.reloadProvider             = this.reloadProvider.bind(this); 
    this.onRequestClick             = this.onRequestClick.bind(this);
  }

  componentDidUpdate(prevProps, prevState) 
  {
    if(prevProps.referrer !== this.props.referrer) {
      this.setState({
        referrer         : this.props.referrer,
        provider         : this.props.provider
      });
    }
  }

  componentDidMount(){
    const { match, location, history } = this.props;
    if(location && location.state && location.state.provider)
    {  
      this.setState({provider : this.props.location.state.provider});
    }

    const {formatMessage} = this.props.intl;
    const modify_provider_action = formatMessage({id:'pages.common.provider-profile.modify_provider_action'});
    const form_cancel_text = formatMessage({id:'global.cancel'});
    const end_of_requests = formatMessage({id:'pages.common.provider-profile.end_of_requests'});
    const end_of_requests_message = formatMessage({id:'pages.common.provider-profile.end_of_requests_message'});
    const check_fields = formatMessage({id:'pages.common.provider-profile.error.check_fields'});
    const invalid_form = formatMessage({id:'pages.common.provider-profile.invalid_form'});
    const loading = formatMessage({id:'pages.common.provider-profile.loading'});
    const pushing = formatMessage({id:'pages.common.provider-profile.pushing'});
    const form_name = formatMessage({id:'pages.common.provider-profile.form.name'});
    const form_name_validator = formatMessage({id:'pages.common.provider-profile.form.name_validator'});
    const form_legal_id = formatMessage({id:'pages.common.provider-profile.form.legal_id'});
    const form_legal_id_validator = formatMessage({id:'pages.common.provider-profile.form.legal_id_validator'});
    const form_category = formatMessage({id:'pages.common.provider-profile.form.category'});
    const form_category_validator = formatMessage({id:'pages.common.provider-profile.form.category_validator'});
    const form_products_services = formatMessage({id:'pages.common.provider-profile.form.products_services'});
    const form_products_services_validator = formatMessage({id:'pages.common.provider-profile.form.products_services_validator'});
    const form_email = formatMessage({id:'pages.common.provider-profile.form.email'});
    const form_email_format_validator = formatMessage({id:'pages.common.provider-profile.form.email_format_validator'});
    const form_email_validator = formatMessage({id:'pages.common.provider-profile.form.email_validator'});
    const form_phone = formatMessage({id:'pages.common.provider-profile.form.phone'});
    const form_phone_validator = formatMessage({id:'pages.common.provider-profile.form.phone_validator'});
    const form_address = formatMessage({id:'pages.common.provider-profile.form.address'});
    const form_street = formatMessage({id:'pages.common.provider-profile.form.street'});
    const form_street_hint = formatMessage({id:'pages.common.provider-profile.form.street_hint'});
    const form_city = formatMessage({id:'pages.common.provider-profile.form.city'});
    const form_state = formatMessage({id:'pages.common.provider-profile.form.state'});
    const form_zip = formatMessage({id:'pages.common.provider-profile.form.zip'});
    const form_country = formatMessage({id:'pages.common.provider-profile.form.country'});
    const form_bank_account = formatMessage({id:'pages.common.provider-profile.form.bank_account'});
    const form_bank_name = formatMessage({id:'pages.common.provider-profile.form.bank_name'});
    const form_bank_name_validator = formatMessage({id:'pages.common.provider-profile.form.bank_name_validator'});
    const form_bank_agency = formatMessage({id:'pages.common.provider-profile.form.bank_agency'});
    const form_bank_agency_validator = formatMessage({id:'pages.common.provider-profile.form.bank_agency_validator'});
    const form_bank_cc = formatMessage({id:'pages.common.provider-profile.form.bank_cc'});
    const form_bank_cc_validator = formatMessage({id:'pages.common.provider-profile.form.bank_cc_validator'});
    const form_create_provider_submit_text = formatMessage({id:'pages.common.provider-profile.form.create_provider_submit_text'});
    const form_provider_data_title = formatMessage({id:'pages.common.provider-profile.form.provider_data_title'});
    const confirm_update_title = formatMessage({id:'pages.common.provider-profile.confirm.update_title'});
    const confirm_update_button = formatMessage({id:'pages.common.provider-profile.confirm.update_button'});
    const requests_load_more = formatMessage({id:'pages.common.provider-profile.requests.load_more'});
    const form_contact_info = formatMessage({id:'pages.common.provider-profile.form.contact_info'});
    const title = formatMessage({id:'pages.common.provider-profile.title'});
    const subtitle = formatMessage({id:'pages.common.provider-profile.subtitle'});
    const zip_code = formatMessage({id:'pages.common.provider-profile.zip_code'});
    const bank_keycode_text = formatMessage({id:'components.Forms.bank_account.bank_keycode'})
    this.setState({intl: {bank_keycode_text, zip_code, modify_provider_action, form_cancel_text, end_of_requests, end_of_requests_message, check_fields, invalid_form, loading, pushing, form_name, form_name_validator, form_legal_id, form_legal_id_validator, form_category, form_category_validator, form_products_services, form_products_services_validator, form_email, form_email_format_validator, form_email_validator, form_phone, form_phone_validator, form_address, form_street, form_street_hint, form_city, form_state, form_zip, form_country, form_bank_account, form_bank_name, form_bank_name_validator, form_bank_agency, form_bank_agency_validator, form_bank_cc, form_bank_cc_validator, form_create_provider_submit_text, form_provider_data_title, title, confirm_update_title, confirm_update_button, requests_load_more, form_contact_info, title, subtitle} });
    
  }

  onRequestClick(request){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: '/common/request-details'
      , state: { 
          request: request 
          , referrer: this.props.location.pathname
        }
    })
  }
  
  reloadProvider = async () => { 
    this.setState({loading:true});
    console.log('reloadProvider: ',this.state.provider._id, this.state.provider.id)
    try{
      const data = await gqlService.loadProvider(this.state.provider._id);
      console.log(data)
      this.setState({provider:data})
    }
    catch(e)
    {
      this.setState({loading:false});
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'pages.common.provider-profile.error_reloading_profile'}), e);
    }

    this.setState({loading:false});
  }
  
  onUpdateProvider(){
    this.reloadProvider();
    const {updating, provider}=this.state;
    // this.setState({updating:!updating});
    const provider_update = Object.assign({}, provider);
    this.setState({updating:true, provider_update:provider_update});
  }

  cancelUpdating(){
    this.setState({updating:false});
  }

  handleBankChange = (value) => {
    this.setState({'bank_account_bank' : value},
      () => {
        if(value)
          this.props.form.setFieldsValue({'bank_accounts[0].bank_keycode':value.bank_keycode})
      })
  }
  //
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        components_helper.notif.warningNotification(this.state.intl.invalid_form);
        return;
      }
      const {bank_account_bank} = this.state;
      if(!bank_account_bank){
        components_helper.notif.errorNotification( this.props.intl.formatMessage({id:'components.AutocompleteBank.index.choose_bank_message'}) );
        return; 
      }
      // if(!bank_account_bank.bank_keycode)
      // {
      //   const bank_keycode_message  = this.props.intl.formatMessage({id: 'components.Forms.bank_account.choose_bank_account_with_keycode'})
      //   components_helper.notif.errorNotification(bank_keycode_message);
      //   return;
      // }
      const bank_accounts = [{...values.bank_accounts[0], ...bank_account_bank}]
      values.bank_accounts = bank_accounts;
      console.log('-------------------------------------------', values)
      const _provider = {...values};
      this.setState( {provider_update:_provider}
                    , () => { this.doUpdateProvider(); });
      
    });
  };
  
  doUpdateProvider(){
    const {provider}         = this.state;
    const account_name = this.props.actualAccountName;
    const {name, cnpj, email, phone, address, category, products_services, bank_accounts} = this.state.provider_update;
    // guarda

    api.bank.createOrUpdateProvider(provider.id||provider._id, name, cnpj, email, phone, address, category, products_services, bank_accounts, account_name)
    .then((res)=>{
      console.log(' >> doUpdateProvider >> ', JSON.stringify(res));
      this.setState({result:'ok'});
      setTimeout( () => {this.reloadProvider() }, 150);
    }, (err)=>{
      // this.setState({result:'error', error:err});
      components_helper.notif.exceptionNotification(  this.state.intl.check_fields, err)
    })
    

  }

  backToDashboard = async () => {
    if(this.props.isAdmin)
      this.props.history.push({
        pathname: `/bankadmin/dashboard`
      })
    else
      this.props.history.push({
        pathname: `common/extrato`
      })
  }

  backToProviders = async () => {
    this.props.history.push({
      pathname: `/common/providers`
    })
  }

  resetPage(){
    this.setState({...DEFAULT_RESULT, updating:false});
  }

  resetResult(){
    this.setState({...DEFAULT_RESULT, updating:false});
  }

  userResultEvent = (evt_type) => {
    console.log(' ** userResultEvent -> EVT: ', evt_type)
    if(evt_type==DASHBOARD)
      this.backToDashboard();
    if(evt_type==RESET_RESULT)
      this.resetResult();
    if(evt_type==RESET_PAGE)
      this.resetPage();
  }
  
  /* ****************
   * Render Functions
  */
 
  renderContent() {
    const { updating, result, result_object } = this.state;
    
    if(this.state.result)
    {
      const result_type = this.state.result;
      const title       = null;
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      return(<div style={{ margin: '0 0px', padding: 24, marginTop: 24, backgroundColor:'#ffffff'}}>
        <div className="">          
          <TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />
        </div>
      </div>);
    }
    
    if(updating)
      return this.renderForm();

    const request_filter = { 
        account_name:     this.props.isAdmin?undefined:this.props.actualAccountName
        , from:           this.props.isAdmin?undefined:this.props.actualAccountName
        , provider_id:    this.state.provider._id
      }
    return (<RequestListWidget 
        the_key="providers_payments_widget_key"
        callback={this.onRequestClick} 
        onRef={ref => (this.table_widget = ref)}
        filter_hidden_fields={['from', 'to', 'requested_type']}
        filter={request_filter}
        request_type={DISPLAY_PROVIDER} 
        />);
  }
  
  // ** hack for sublime renderer ** //
  renderProviderInfo() 
  {
    if(!this.state.provider)
      return (<></>);
    //
    const {name, cnpj, email, phone, address, category, products_services, bank_accounts} = this.state.provider;
    
    return (
      <Descriptions className="headerList" size="small" column={2}>
        <Descriptions.Item  label={this.state.intl.form_name} > <b>{name}</b> </Descriptions.Item>
        <Descriptions.Item  label={this.state.intl.form_legal_id} > <b>{cnpj}</b> </Descriptions.Item>
        <Descriptions.Item  label={this.state.intl.form_contact_info} >
          <span>
           <Icon type="mail" />&nbsp;<b>{email}</b>
          </span><br/>
          <span> 
            <Icon type="phone" />&nbsp;<b>{phone}</b>
          </span>
        </Descriptions.Item>
        <Descriptions.Item  label={this.state.intl.form_address} >
          <Icon type="environment" /> <b>{address.street}, {address.city}, {this.state.intl.zip_code} {address.zip}, {address.state}, {address.country}</b>
        </Descriptions.Item>
        <Descriptions.Item  label={this.state.intl.form_category} ><b>{category}</b></Descriptions.Item>
        <Descriptions.Item  label={this.state.intl.form_products_services} ><b>{products_services}</b></Descriptions.Item>
        <Descriptions.Item  label={this.state.intl.form_bank_account} >
          <Icon type="bank" /> <b>{bank_accounts.map(bank_account => <span key={'bank_accounts'+bank_account._id}>{bank_account.bank_name}, {bank_account.agency}, {bank_account.cc}</span>)}</b> 
        </Descriptions.Item>
        <Descriptions.Item  label="" >
        </Descriptions.Item>
      </Descriptions>);

  }  
  //
  renderForm(){
    
    const {provider_update} = this.state;
    if(!provider_update)
      return (<></>);
    //
    const { getFieldDecorator } = this.props.form;
    const {name, cnpj, email, phone, address, category, products_services, bank_accounts} = provider_update;
    const {pushingTx} = this.state;
    return (
        <div style={{ margin: '0 0px', maxWidth: '600px', background: '#fff'}}>
          <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
              
              <Form.Item label={this.state.intl.form_name}>
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: this.state.intl.form_name_validator, whitespace: true }],
                    initialValue: name
                  })(<Input />)}
                </Form.Item>

                <Form.Item label={this.state.intl.form_legal_id}>
                  {getFieldDecorator('cnpj', {
                    rules: [{ required: true, message: this.state.intl.form_legal_id_validator, whitespace: true }],
                    initialValue: cnpj
                  })(<Input />)}
                </Form.Item>
                
                <Form.Item label={this.state.intl.form_category}>
                  {getFieldDecorator('category', {
                    rules: [{ required: true, message: this.state.intl.form_category_validator }],
                    initialValue: category
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <Form.Item label={this.state.intl.form_products_services}>
                  {getFieldDecorator('products_services', {
                    rules: [{ required: true, message: this.state.intl.form_products_services_validator }],
                    initialValue: products_services
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <Form.Item label={this.state.intl.form_email}>
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        type: 'email',
                        message: this.state.intl.form_email_format_validator,
                      },
                      {
                        required: true,
                        message: this.state.intl.form_email_validator,
                      },
                    ],
                    initialValue: email
                  })(<Input />)}
                </Form.Item>

                <Form.Item label={this.state.intl.form_phone}>
                  {getFieldDecorator('phone', {
                    rules: [{ required: true, message: this.state.intl.form_phone_validator }],
                    initialValue: phone
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                
                <h3 className="fileds_header">{this.state.intl.form_address}</h3>
                <Form.Item label={this.state.intl.form_street} extra={this.state.intl.form_street_hint}>
                  {getFieldDecorator('address.street', {
                    initialValue: address.street
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label={this.state.intl.form_city}>
                  {getFieldDecorator('address.city', {
                    initialValue: address.city
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label={this.state.intl.form_state}>
                  {getFieldDecorator('address.state', {
                    initialValue: address.state
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label={this.state.intl.form_zip}>
                  {getFieldDecorator('address.zip', {
                    initialValue: address.zip
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label={this.state.intl.form_country}>
                  {getFieldDecorator('address.country', {
                    initialValue: address.country
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <h3 className="fileds_header">{this.state.intl.form_bank_account}</h3>
                
                <AutocompleteBank 
                  callback={this.handleBankChange} 
                  form={this.props.form} 
                  name="bank_accounts[0].bank_name" 
                  value={bank_accounts[0].bank_name||''} 
                  without_icon={true}
                  the_label={this.state.intl.form_bank_name}
                  size='default'
                  />
                
                <Form.Item label={this.state.intl.bank_keycode_text}>
                  {getFieldDecorator('bank_accounts[0].bank_keycode', {
                    rules: [{ required:   true, 
                              message:    this.state.intl.bank_keycode_text , 
                              whitespace: true }],
                    initialValue:bank_accounts[0].bank_keycode||''
                  })(
                    <Input className="money-transfer__input"  placeholder={this.state.intl.bank_keycode_text} />
                  )}
                </Form.Item>

                <Form.Item label={this.state.intl.form_bank_agency}>
                  {getFieldDecorator('bank_accounts[0].agency', {
                    rules: [{ required: true, message: this.state.intl.form_bank_agency_validator }],
                    initialValue: bank_accounts[0].agency
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label={this.state.intl.form_bank_cc}>
                  {getFieldDecorator('bank_accounts[0].cc', {
                    rules: [{ required: true, message: this.state.intl.form_bank_cc_validator }],
                    initialValue: bank_accounts[0].cc
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">
                      {this.state.intl.form_create_provider_submit_text}
                    </Button>
                     <Button style={{ marginLeft: 8 }} onClick={() => this.cancelUpdating() }>
                      {this.state.intl.form_cancel_text}
                    </Button>
                  </Form.Item>
            </Form>  
          </Spin>
        </div>
    );
  }

  //
  render() {
    const {provider} = this.state;

    const content      = this.renderContent();

    let title        = this.state.intl.title;
    let subTitle     = this.state.intl.subtitle;
    if(provider)
    {
      title = provider.name;
      subTitle = ""
    }

    const routes    = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          style={{marginBottom:'24px'}}
          title={title}
          subTitle={subTitle}
          
          extra={[
            <Button size="small" type="primary" key="_update_provider" icon="edit" onClick={()=>{this.onUpdateProvider()}}> 
              {this.state.intl.modify_provider_action}
            </Button>,
          ]}
        >
         
         <div className="wrap">
            <div className="content padding">{this.renderProviderInfo()}</div>
          </div>

        </PageHeader>
        
        <Card key={'_provider'}
            style = { { marginBottom: 24, marginTop: 24 } } 
            loading={this.state.pushingTx}
            >
          {content}
        </Card>
        
      </>
    );
  }
  
  
}

//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:           accountsRedux.accounts(state),
        actualAccountName:  loginRedux.actualAccountName(state),
        actualRole:         loginRedux.actualRole(state),
        actualPrivateKey:   loginRedux.actualPrivateKey(state),
        isLoading:          loginRedux.isLoading(state),
        isAdmin:            loginRedux.isAdmin(state),
        balance:            balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)        
    })
)(injectIntl(Provider)) )
);
