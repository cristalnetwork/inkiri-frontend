import React, {Component} from 'react'

import { connect } from 'react-redux'

import * as loginRedux from '@app/redux/models/login'

import * as api from '@app/services/inkiriApi';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Card, PageHeader, Button, Spin, Form, Icon, Input } from 'antd';

import {formItemLayout,tailFormItemLayout } from '@app/utils/utils';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

const DEFAULT_PROVIDER = {
  name:        '',
  cnpj:        '',
  email:            '',
  phone:            '',
  address:          { 
                      street:  '', 
                      city:    '', 
                      state:   '', 
                      zip:     '', 
                      country: ''
                    },
  category:    '',
  products_services:    '',
  bank_account:     {  
                      bank_name:    '',
                      agency:    '',
                      cc:    ''
                    }
};
const DEFAULT_RESULT = {
  result:             undefined,
  result_object:      undefined,
  error:              {},
}
class CreateProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      referrer:        (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,
      loading:      true,
      pushingTx:    false,
      
      ...DEFAULT_RESULT,
      provider:{
        ...DEFAULT_PROVIDER
      }
    };
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                = this.resetResult.bind(this); 
    this.resetForm                  = this.resetForm.bind(this); 
    // this.renderConfirmCreate        = this.renderConfirmCreate.bind(this);
    this.doCreateProvider           = this.doCreateProvider.bind(this);
    this.userResultEvent            = this.userResultEvent.bind(this); 
  }

  resetResult(){
    this.setState({...DEFAULT_RESULT});
  }

  
  resetForm(){
    this.setState({
      provider: {
        ...DEFAULT_PROVIDER
      }
    });    
  }

  resetPage(active_tab){
    this.resetResult();
    this.resetForm();
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
  
  componentDidUpdate(prevProps, prevState) 
  {
    if(prevProps.referrer !== this.props.referrer) {
      this.setState({
        referrer         : this.props.referrer
      });
    }
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

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        components_helper.notif.errorNotification( this.props.intl.formatMessage({id:'pages.common.create-provider.invalid_form'}) );
        return;
      }
      // this.setState({provider:values, result:'should-confirm'});
      this.setState({provider:values});
      this.doCreateProvider();
    });
  };

  resetResult(){
    this.setState({result: undefined, result_object: undefined, error: {}});
    
  }

  doCreateProvider(){
    const {name, cnpj, email, phone, address, category, products_services, bank_account} = this.state.provider;
    const account_name = this.props.actualAccountName;
    api.bank.createOrUpdateProvider(undefined, name, cnpj, email, phone, address, category, products_services, [bank_account], account_name)
    .then((res)=>{
      console.log('doCreateProvider() OK:',res)
      this.setState({result:'ok'});
    }, (err)=>{
      // this.setState({result:'error', error:err});
      components_helper.notif.exceptionNotification(  this.props.intl.formatMessage({id:'pages.common.create-provider.error.check_fields'}), err)
      console.log('doCreateProvider() Err:', err)
    })
    

  }

  renderContent() {
  
    const { getFieldDecorator } = this.props.form;
    
    // if(this.state.result=='should-confirm'){
    //   const confirm = this.renderConfirmCreate();
    //   return(
    //     <div style={{ margin: '0 0px', padding: 24, background: '#fff', marginTop: 24  }}>
    //       {confirm}
    //     </div>);
    // }
       
    if(this.state.result)
    {
      const result_type = this.state.result;
      const title       = null;
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      return(<div style={{ margin: '0 0px', padding: 24, marginTop: 24, backgroundColor:'#ffffff'}}>
        <div className="ly-main-content content-spacing cards">          
          <TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />
        </div>
      </div>);
    }

    
    // ** hack for sublime renderer ** //
    const {name, cnpj, email, phone, address, category, products_services, bank_account} = this.state.provider;
    const {formatMessage} = this.props.intl;
    const {pushingTx, loading} = this.state;
    const loading_text = pushingTx
      ?formatMessage({id:'pages.common.create-provider.pushing'})
      :(loading
        ?formatMessage({id:'pages.common.create-provider.loading'})
        :'');
    const label_name                         = formatMessage({id:'pages.common.create-provider.form.name'});
    const label_name_validator               = formatMessage({id:'pages.common.create-provider.form.name_validator'});
    const label_legal_id                     = formatMessage({id:'pages.common.create-provider.form.legal_id'});
    const label_legal_id_validator           = formatMessage({id:'pages.common.create-provider.form.legal_id_validator'});
    const label_category                     = formatMessage({id:'pages.common.create-provider.form.category'});
    const label_category_validator           = formatMessage({id:'pages.common.create-provider.form.category_validator'});
    const label_products_services            = formatMessage({id:'pages.common.create-provider.form.products_services'});
    const label_products_services_validator  = formatMessage({id:'pages.common.create-provider.form.products_services_validator'});
    const label_email                        = formatMessage({id:'pages.common.create-provider.form.email'});
    const label_email_format_validator       = formatMessage({id:'pages.common.create-provider.form.email_format_validator'});
    const label_email_validator              = formatMessage({id:'pages.common.create-provider.form.email_validator'});
    const label_phone                        = formatMessage({id:'pages.common.create-provider.form.phone'});
    const label_phone_validator              = formatMessage({id:'pages.common.create-provider.form.phone_validator'});
    const label_address                      = formatMessage({id:'pages.common.create-provider.form.address'});
    const label_street                       = formatMessage({id:'pages.common.create-provider.form.street'});
    const label_street_hint                  = formatMessage({id:'pages.common.create-provider.form.street_hint'});
    const label_city                         = formatMessage({id:'pages.common.create-provider.form.city'});
    const label_state                        = formatMessage({id:'pages.common.create-provider.form.state'});
    const label_zip                          = formatMessage({id:'pages.common.create-provider.form.zip'});
    const label_country                      = formatMessage({id:'pages.common.create-provider.form.country'});
    const label_bank_account                 = formatMessage({id:'pages.common.create-provider.form.bank_account'});
    const label_bank_name                    = formatMessage({id:'pages.common.create-provider.form.bank_name'});
    const label_bank_name_validator          = formatMessage({id:'pages.common.create-provider.form.bank_name_validator'});
    const label_bank_agency                  = formatMessage({id:'pages.common.create-provider.form.bank_agency'});
    const label_bank_agency_validator        = formatMessage({id:'pages.common.create-provider.form.bank_agency_validator'});
    const label_bank_cc                      = formatMessage({id:'pages.common.create-provider.form.bank_cc'});
    const label_bank_cc_validator            = formatMessage({id:'pages.common.create-provider.form.bank_cc_validator'});
    const label_create_provider_submit_text  = formatMessage({id:'pages.common.create-provider.form.create_provider_submit_text'});
    return (
        <div style={{ margin: '0 0px', maxWidth: '600px', background: '#fff'}}>
          <Spin spinning={this.state.pushingTx} delay={500} tip={loading_text}>
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
              
              <Form.Item label={label_name} >
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: label_name_validator, whitespace: true }],
                    initialValue: name
                  })(<Input />)}
                </Form.Item>

                <Form.Item label={label_legal_id}>
                  {getFieldDecorator('cnpj', {
                    rules: [{ required: true, message: label_legal_id_validator, whitespace: true }],
                    initialValue: cnpj
                  })(<Input />)}
                </Form.Item>

                <Form.Item label="Category">
                  {getFieldDecorator(label_category, {
                    rules: [{ required: true, message: label_category_validator }],
                    initialValue: category
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <Form.Item label={label_products_services}>
                  {getFieldDecorator('products_services', {
                    rules: [{ required: true, message: label_products_services_validator }],
                    initialValue: products_services
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <Form.Item label={label_email}>
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        type: 'email',
                        message: label_email_format_validator,
                      },
                      {
                        required: true,
                        message: label_email_validator,
                      },
                    ],
                    initialValue: email
                  })(<Input />)}
                </Form.Item>

                <Form.Item label={label_phone}>
                  {getFieldDecorator('phone', {
                    rules: [{ required: true, message: label_phone_validator }],
                    initialValue: phone
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                
                <h3 className="fileds_header">{label_address}</h3>
                <Form.Item label={label_street} extra={label_street_hint}>
                  {getFieldDecorator('address.street', {
                    initialValue: address.street
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label={label_city}>
                  {getFieldDecorator('address.city', {
                    initialValue: address.city
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label={label_state}>
                  {getFieldDecorator('address.state', {
                    initialValue: address.state
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label={label_address}>
                  {getFieldDecorator('address.zip', {
                    initialValue: address.zip
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label={label_country}>
                  {getFieldDecorator('address.country', {
                    initialValue: address.country
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <h3 className="fileds_header">{label_bank_account}</h3>
                <Form.Item label={label_bank_name}>
                  {getFieldDecorator('bank_account.bank_name', {
                    rules: [{ required: true, message: label_bank_name_validator }],
                    initialValue: bank_account.bank_name
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label={label_bank_agency}>
                  {getFieldDecorator('bank_account.agency', {
                    rules: [{ required: true, message: label_bank_agency_validator }],
                    initialValue: bank_account.agency
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label={label_bank_cc}>
                  {getFieldDecorator('bank_account.cc', {
                    rules: [{ required: true, message: label_bank_cc_validator }],
                    initialValue: bank_account.cc
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                      {label_create_provider_submit_text}
                    </Button>
                    
                  </Form.Item>
            </Form>  
          </Spin>
        </div>
    );
  }
  
  // ** hack for sublime renderer ** //

  render() {
    let content = this.renderContent();
    const {formatMessage} = this.props.intl;
    const title           = formatMessage({id:'pages.common.create-provider.title'});
    const label_provider_data_title = formatMessage({id:'pages.common.create-provider.form.provider_data_title'});
    const routes          = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={title}
          />
        <Card 
            title={(<span>{label_provider_data_title}</span> )}
            key={'create_provider'}
            style = { { marginBottom: 24, marginTop: 24 } } 
            loading={this.state.pushingTx}
            >
          
          {content}
        </Card>

      </>
    );
  }
  //
  // renderConfirmCreate(){
  //   const {name, cnpj, email, phone, category, products_services, bank_account}      = this.state.provider;
  //   const {formatMessage}         = this.props.intl;
  //   const label_name              = formatMessage({id:'pages.common.create-provider.form.name'});
  //   const label_legal_id          = formatMessage({id:'pages.common.create-provider.form.legal_id'});
  //   const label_category          = formatMessage({id:'pages.common.create-provider.form.category'});
  //   const label_products_services = formatMessage({id:'pages.common.create-provider.form.products_services'});
  //   const label_email             = formatMessage({id:'pages.common.create-provider.form.email'});
  //   const label_phone             = formatMessage({id:'pages.common.create-provider.form.phone'});
  //   const label_address           = formatMessage({id:'pages.common.create-provider.form.address'});
  //   const label_street            = formatMessage({id:'pages.common.create-provider.form.street'});
  //   const label_city              = formatMessage({id:'pages.common.create-provider.form.city'});
  //   const label_state             = formatMessage({id:'pages.common.create-provider.form.state'});
  //   const label_zip               = formatMessage({id:'pages.common.create-provider.form.zip'});
  //   const label_country           = formatMessage({id:'pages.common.create-provider.form.country'});
  //   const label_bank_account      = formatMessage({id:'pages.common.create-provider.form.bank_account'});
  //   const label_bank_name         = formatMessage({id:'pages.common.create-provider.form.bank_name'});
  //   const label_bank_agency       = formatMessage({id:'pages.common.create-provider.form.bank_agency'});
  //   const label_bank_cc           = formatMessage({id:'pages.common.create-provider.form.bank_cc'});
  //   const creation_title          = formatMessage({id:'pages.common.create-provider.confirm.creation_title'});
  //   const creation_button         = formatMessage({id:'pages.common.create-provider.confirm.creation_button'});
  //   const cancel_text             = formatMessage({id:'global.cancel'});

  //   return (<Result
  //     icon={<Icon type="question-circle" theme="twoTone" />}
  //     title={creation_title} 
  //     subTitle={(<span> {label_name}: {name}<br/> 
  //                 {label_legal_id}: {cnpj}<br/>
  //                 {label_email}: {email}<br/>
  //                 {label_phone}: {phone}<br/> 
  //                 {label_category}: {category}<br/>
  //                 {label_products_services}: {products_services}<br/>
  //                 {label_bank_account}: {bank_account.bank_name}, {bank_account.agency}, {bank_account.cc} </span>)}
  //     extra={[<Button key="do_cerate_provider" type="primary" onClick={() => {this.doCreateProvider()} }>{creation_button}</Button>,
  //             <Button key="cancel" onClick={() => {this.resetResult()} }>Cancel</Button>]}/>)
  // }
}

//
export default Form.create() (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRole:           loginRedux.actualRole(state),
        isAdmin:              loginRedux.isAdmin(state),
        isLoading:            loginRedux.isLoading(state)
    }),
    (dispatch)=>({
        
    })
)(injectIntl(CreateProvider)) ));