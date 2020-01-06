import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'
import * as apiRedux from '@app/redux/models/api';
import * as menuRedux from '@app/redux/models/menu';
import * as graphqlRedux from '@app/redux/models/graphql'

import * as globalCfg from '@app/configs/global';

import * as utils from '@app/utils/utils';

import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';
import { withRouter } from "react-router-dom";

import { Select, PageHeader, Tag, Button, Spin } from 'antd';
import { Upload, Form, InputNumber, Input } from 'antd';

import ProviderSearch from '@app/components/ProviderSearch';
import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { injectIntl } from "react-intl";

const { TextArea } = Input;

const DEFAULT_STATE = {
      input_amount     :
                          {  
                            style   : {maxWidth: 370, fontSize: 100, width: 60}
                             , value : undefined 
                             , symbol_style : {fontSize: 60}
                           },
      description:        '',
      provider_extra      : {     
        [globalCfg.api.PAYMENT_VEHICLE]   : '',
        [globalCfg.api.PAYMENT_CATEGORY]  : '',
        [globalCfg.api.PAYMENT_TYPE]      : '',
        [globalCfg.api.PAYMENT_MODE]      : ''
      },
      attachments:       {
        [globalCfg.api.NOTA_FISCAL]       : undefined,
        [globalCfg.api.BOLETO_PAGAMENTO]  : undefined,
      }
};

const DEFAULT_RESULT = {
  result:             undefined,
  result_object:      undefined,
  error:              {},
}
/*
* Invoice Management via:
* 
* https://developers.google.com/drive/api/v3/quickstart/nodejs
* https://medium.com/@munsifmusthafa03/building-a-file-upload-service-to-your-google-drive-using-oauth-2-0-d883d6d67fe8
*/
class RequestPayment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
      flatConfig:         props.flatConfig,
      ...DEFAULT_STATE,
      ...DEFAULT_RESULT,
      
      uploading:          false,
      isFetching:         false,
      
      referrer:           (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                = this.resetResult.bind(this); 

    this.handleProviderChange       = this.handleProviderChange.bind(this);
    this.onInputAmount              = this.onInputAmount.bind(this);
    this.renderPaymentOption        = this.renderPaymentOption.bind(this);
    this.handleChange               = this.handleChange.bind(this);
    this.getPropsForUploader        = this.getPropsForUploader.bind(this);
    
    this.userResultEvent            = this.userResultEvent.bind(this); 
  }

  componentDidUpdate(prevProps, prevState) 
  {
    let new_state = {};
    if(prevProps.isFetching!=this.props.isFetching){
      new_state = {...new_state, isFetching:this.props.isFetching}
    }
    if(!utils.arraysEqual(prevProps.getErrors, this.props.getErrors)){
      // const ex = this.props.getLastError;
      // new_state = {...new_state, 
      //     getErrors:     this.props.getErrors, 
      //     result:        ex?'error':undefined, 
      //     error:         ex?JSON.stringify(ex):null}
      // if(ex)
      //   components_helper.notif.exceptionNotification("An error occurred!", ex);
    }
    if(!utils.arraysEqual(prevProps.getResults, this.props.getResults) ){
      // const lastResult = this.props.getLastResult;
      // new_state = {...new_state, 
      //   getResults:      this.props.getResults, 
      //   result:          lastResult?'ok':undefined, 
      //   result_object:   lastResult};
      
      // console.log('lastResult:', lastResult)
      
      // if(lastResult)
      //   components_helper.notif.successNotification('Operation completed successfully')
      this.resetPage()
    }
    if(prevProps.flatConfig!=this.props.flatConfig){
      new_state = {...new_state, flatConfig:this.props.flatConfig}
    }

    if(Object.keys(new_state).length>0)      
        this.setState(new_state);
  }

  clearAttachments(){
    this.setState({ attachments:       {
        [globalCfg.api.NOTA_FISCAL]       : undefined,
        [globalCfg.api.BOLETO_PAGAMENTO]  : undefined,
      }});
  }

  handleProviderChange(provider){
    // console.log(' #evt() handleProviderChange: ', provider);
    this.setState({provider: provider })
  }

  validateProvider = (rule, value, callback) => {
    // console.log(' #fn() validateProvider >> provider:', this.state.provider)
    // console.log(' >> validateProvider >> value: ', value)
    if (this.state.provider && this.state.provider.key) {
      callback();
      return;
    }
    callback('Please select a provider!');
  };

  checkPrice = (rule, value, callback) => {
    if (value > 0) {
      callback();
      return;
    }
    callback('Amount must greater than zero!');
  };

  handleSubmit = e => {
    e.preventDefault();
    const {formatMessage} = this.props.intl;
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        components_helper.notif.errorNotification( formatMessage({id:'errors.validation_title'}), formatMessage({id:'errors.verify_on_screen'}) )    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      if(isNaN(this.state.input_amount.value))
      {
        const title = formatMessage({id: 'components.forms.validators.valid_number_required'})
        const desc  = formatMessage({id: 'components.forms.validators.valid_number_required_description'})
        components_helper.notif.errorNotification( title, desc);    
        return;
      }
      if(parseFloat(this.state.input_amount.value)>parseFloat(this.props.balance))
      {
        const balance_txt = globalCfg.currency.toCurrencyString(this.props.balance);
        const amount_message  = this.props.intl.formatMessage({id: 'components.forms.validators.minimum_amount_required'}, {balance:balance_txt})
        return;
      }

      if(!this.state.provider || !this.state.provider.key)
      {
        const title = formatMessage({id: 'pages.business.providers-payments-request.valid_provider'})
        components_helper.notif.errorNotification(title);    
        return;
      }
      
      const attachments         = this.state.attachments;
      const my_NOTA_FISCAL      = (attachments[globalCfg.api.NOTA_FISCAL] && attachments[globalCfg.api.NOTA_FISCAL].length>0) ? attachments[globalCfg.api.NOTA_FISCAL][0] : undefined;
      const my_BOLETO_PAGAMENTO = (attachments[globalCfg.api.BOLETO_PAGAMENTO] && attachments[globalCfg.api.BOLETO_PAGAMENTO].length>0) ? attachments[globalCfg.api.BOLETO_PAGAMENTO][0] : undefined;
      
      let attachments_array = {};
      if(my_NOTA_FISCAL) 
        attachments_array[globalCfg.api.NOTA_FISCAL] = my_NOTA_FISCAL;
      const has_boleto = (my_BOLETO_PAGAMENTO);
      if(this.paymentModeRequiresBoleto() && !has_boleto)
      {
        const title = formatMessage({id: 'pages.business.providers-payments-request.payment_slip_mode'})
        const desc  = formatMessage({id: 'pages.business.providers-payments-request.payment_slip_mode.message'})
        components_helper.notif.errorNotification( title, desc);    
        return;
      }  

      if(this.paymentModeRequiresBoleto() && has_boleto)
        attachments_array[globalCfg.api.BOLETO_PAGAMENTO] = my_BOLETO_PAGAMENTO;

      const privateKey      = this.props.actualPrivateKey;
      const provider_id     = this.state.provider.key;
      const sender          = this.props.actualAccountName;
      const signer          = this.props.personalAccount.permissioner.account_name;
      const amount          = this.state.input_amount.value;
      const that            = this;
      
      const provider_account = globalCfg.bank.provider_account; 
    
      const steps= [
        {
          _function:           'bank.createProviderPaymentEx'
          , _params:           [sender, amount, provider_id, values.provider_extra, attachments_array]
        }, 
        {
          _function:           'requestProviderPayment'
          , _params:           [sender, privateKey, provider_account, amount] 
          , last_result_param: [{field_name:'id', result_idx_diff:-1}]
          , on_failure:        {
                                  _function:           'bank.failedProviderPay'
                                  , _params:           [sender] 
                                  , last_result_param: [{field_name:'id', result_idx_diff:-1}]
                                }
        },
        {
          _function:           'bank.updateProviderPayment'
          , _params:           [sender] 
          , last_result_param: [{field_name:'id', result_idx_diff:-2}, {field_name:'transaction_id', result_idx_diff:-1}]
        },
      ]

      that.props.callAPIEx(steps);
      
      //   });
      
    });
  };

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/common/extrato`
    })
  }

  resetResult(){
    this.setState({...DEFAULT_RESULT});
    // reset Errors and results
    // this.props.clearAll();
  }

  resetPage(){
    this.setState({...DEFAULT_RESULT, ...DEFAULT_STATE});
    this.props.form.resetFields();
    // this.props.form.setFieldsValue({'provider':''})
    // components_helper.notif.infoNotification('Me llamaron a resetear!')
    // reset Errors and results
    // this.props.clearAll();
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

  handleChange = (value, name) => {
    this.setState({
      provider_extra : {[name]: value}
    });
  }

  onInputAmount(event){
    event.preventDefault();
    const the_value = event.target.value;
    this.props.form.setFieldsValue({'input_amount.value':the_value})
    const _input_amount = this.state.input_amount;
    this.setState({input_amount: {..._input_amount, value: the_value}}, 
      () => {
        if(the_value && the_value.toString().length){
          const value = the_value.toString();
          var digitCount = value.length > 0 ? value.replace(/\./g,"").replace(/,/g,"").length : 1
          var symbolCount = value.length > 0 ? value.length - digitCount : 0;
          const isMobile = false;
          var size = isMobile ? 48 : 100

          if(digitCount > 7){
            size = isMobile ? 40 : 48
          } else if(digitCount > 4){
            size = isMobile ? 48 : 70
          }

          const {input_amount} = this.state;
          this.setState({
                  input_amount : {
                    ...input_amount
                    , style :         {fontSize: size, width:(digitCount * (size*0.6))+(symbolCount * (size*0.2)) }
                    , symbol_style: {fontSize:  (size*0.6)}
                  }
                });
        }
      });
  }

  renderPaymentOption(option_type){
    
    const {flatConfig} = this.state;
    // console.log('flatConfig', flatConfig)
    if(!flatConfig)
      return null;
    const options = flatConfig.filter(opt=>opt.father==option_type).sort(function(a,b){ 
      if(a.key.endsWith('another')) return 1;
      if(b.key.endsWith('another')) return -1;
      return a.value>b.value?1:-1;
    })

    // const title   = globalCfg.api.getPaymentTitles()[option_type];
    if(!options)
      return (<></>);
    //
    const {formatMessage}       = this.props.intl;
    const title                 = formatMessage({id:`pages.business.providers-payments-request.${option_type}`}) 
    const title_validation      = formatMessage({id:'pages.business.providers-payments-request.choose_option_validation'}, {option:title}) ;
    const title_message         = formatMessage({id:'pages.business.providers-payments-request.choose_option_message'}, {option:title}) ;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form.Item className="money-transfer__row">
          {getFieldDecorator( 'provider_extra.'+option_type, {
            rules: [{ required: true, message: title_validation}]
            , onChange: (e) => this.handleChange(e, option_type)
          })(
            <Select placeholder={title_message} optionLabelProp="label">
            {options.map( opt => <Select.Option key={opt.key} value={opt.key} label={opt.value}>{ opt.value } </Select.Option> )}
            </Select>
          )}
      </Form.Item>
    )
  }
  //

  getPropsForUploader(name){
    const filelist = this.state.attachments[name] || [];
    // console.log(' FILELIST OF '+name, JSON.stringify(filelist) )
    return {
      onRemove: file => {
        this.setState(state => {
          const index         = state.attachments[name].indexOf(file);
          const newFileList   = state.attachments[name].slice();
          newFileList.splice(index, 1);
          return {
            attachments: {[name]: newFileList}
          };
        });
      },
      beforeUpload: file => {
        if(this.state.attachments[name] && this.state.attachments[name].length>0)
        {
          const info_msg = this.props.intl.formatMessage({id:'pages.business.providers-payments-request.only_one_file'}) 
          components_helper.notif.infoNotification(info_msg);
          return false;
        }

        let attachments = this.state.attachments || {};
        attachments[name]= [file];
        this.setState(state => ({
          ...attachments
        }));
        return false;
      },
      fileList: filelist,
      className: filelist.length>0?'icon_color_green':'icon_color_default'
    };
  }

  onNewProvider =() =>{

    const info_msg = this.props.intl.formatMessage({id:'pages.business.providers-payments-request.message_after_add_provider'}) 
    this.props.setReferrer(  info_msg
                             , this.props.location.pathname
                             , this.state.referrer
                             , 'truck-moving')
    
    this.props.history.push({
      pathname: `/common/create-provider`
      , state: { 
          referrer: this.props.location.pathname
        }
    })
  }

  paymentModeRequiresBoleto = () =>{
    const selected_mode = this.state.provider_extra[globalCfg.api.PAYMENT_MODE];
    if(!selected_mode) return false;
    return selected_mode.endsWith('boleto');
  }
  renderContent() {
    
    const {result, result_object, error} = this.state;

    if(result)
    {
      const result_type = result;
      const title       = null;
      const message     = null;
      const tx_id       = result_object?result_object.transaction_id:null;
      
      return(<TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />)
    }

    const { input_amount, provider, isFetching, fileList } = this.state;
    const notaUploaderProps                                = this.getPropsForUploader(globalCfg.api.NOTA_FISCAL);
    const boletoUploaderProps                              = this.getPropsForUploader(globalCfg.api.BOLETO_PAGAMENTO);
    const { getFieldDecorator }                            = this.props.form;
    const require_boleto                                   = this.paymentModeRequiresBoleto();
    
    const {formatMessage}          = this.props.intl;
    const pushing_transaction_intl = formatMessage({id:'pages.business.providers-payments-request.pushing_transaction'});
    const validate_amount_text     = formatMessage({id:'pages.business.providers-payments-request.validate_amount'});
    const add_new_provider         = formatMessage({id:'pages.business.providers-payments-request.add_new_provider'});
    const invoice_text             = formatMessage({id:'global.invoice'});
    const payment_slip_text        = formatMessage({id:'global.payment_slip'});
    const memo                     = formatMessage({id:'global.memo'});
    const memo_message             = formatMessage({id:'global.memo_message'});
    const request_payment_text     = formatMessage({id:'pages.business.providers-payments-request.request_payment'});
    const amount_text              = formatMessage({id:'global.amount'})
    return (
      <Spin spinning={isFetching} delay={500} tip={pushing_transaction_intl} >
        <Form onSubmit={this.handleSubmit}>
            <div className="money-transfer">
              
              <div className="money-transfer__row row-complementary" >
                  <div className="badge badge-extra-small badge-circle addresse-avatar">
                      <span className="picture">
                        <FontAwesomeIcon icon="truck-moving" size="lg" color="black"/>
                      </span>
                  </div>
                  <div className="money-transfer__input money-transfer__select">
                    <Button type="default" icon="plus" size="small" onClick={() => this.onNewProvider()} title={add_new_provider} style={{position:'absolute', right:8, top:8}}/>
                    <Form.Item>
                      {getFieldDecorator('provider', {
                        rules: [{ validator: this.validateProvider }],
                      })(
                        <ProviderSearch onProviderSelected={this.handleProviderChange} style={{ width: '100%' }} autoFocus />
                      )}
                    </Form.Item>
                  </div>
              </div>

                
              <Form.Item label={amount_text} className="money-transfer__row input-price" style={{textAlign: 'center'}}>
                    {getFieldDecorator('input_amount.value', {
                      rules: [{ required: true
                                , message: validate_amount_text
                                , whitespace: true
                                , validator: this.checkPrice }],
                      initialValue: input_amount.value,
                    })( 
                      <>  
                        <span className="input-price__currency" id="inputPriceCurrency" style={input_amount.symbol_style}>
                          {globalCfg.currency.fiat.symbol}
                        </span>
                        
                        <Input 
                          type="tel" 
                          step="0.01" 
                          className="money-transfer__input input-amount placeholder-big" 
                          id="amount"
                          placeholder="0" 
                          value={input_amount.value} 
                          onChange={this.onInputAmount}  
                          style={input_amount.style}  
                        />
                      </>
                    )}
              </Form.Item>
                
              <div className="money-transfer__row file_selector">
                <Form.Item>
                    <Upload.Dragger {...notaUploaderProps} multiple={false}>
                      <p className="ant-upload-drag-icon">
                        <FontAwesomeIcon icon="receipt" size="3x" />
                      </p>
                      <p className="ant-upload-text">{invoice_text}</p>
                    </Upload.Dragger>,
                </Form.Item>
              </div>

              {this.renderPaymentOption(globalCfg.api.PAYMENT_VEHICLE)}
              {this.renderPaymentOption(globalCfg.api.PAYMENT_CATEGORY)}
              {this.renderPaymentOption(globalCfg.api.PAYMENT_TYPE)}
              {this.renderPaymentOption(globalCfg.api.PAYMENT_MODE)}
              
              <div className="money-transfer__row file_selector">
                <Form.Item>
                  <Upload.Dragger multiple={false} disabled={!require_boleto} {...boletoUploaderProps}>
                    <p className="ant-upload-drag-icon">
                      <FontAwesomeIcon icon="file-invoice-dollar" size="3x" color={(!require_boleto)?"gray":"inherit"}/>
                    </p>
                    <p className="ant-upload-text">{payment_slip_text}</p>
                  </Upload.Dragger>,
                </Form.Item>
              </div>

              <div className="money-transfer__row row-expandable row-complementary-bottom"  id="divNote">
                <Form.Item label={memo}>
                  {getFieldDecorator('description', {})(
                  <TextArea 
                    className="money-transfer__input" 
                    placeholder={memo_message} autoSize={{ minRows: 3, maxRows: 6 }} 
                    style={{overflow: 'hidden', overflowWrap: 'break-word', height: 31}}
                    />
                  )}
                </Form.Item>
                  
              </div>
            </div>
            <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="requestButton" htmlType="submit" type="primary" loading={this.state.uploading} title="" >
                  {request_payment_text}
                </Button>
            </div>
        </Form>
      </Spin>
    );

  }
  

  render() {
    let content     = this.renderContent();
    const routes    = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={this.props.intl.formatMessage({id:'pages.business.providers-payments-request.title'})}>
        </PageHeader>

        <div style={{ margin: '0 0px', marginTop: 12}}>
          <div className="ly-main-content content-spacing cards">
            <section className="mp-box mp-box__shadow money-transfer__box">
              {content}
            </section>
          </div>      
        </div>
      </>
    );
  }

  
}
//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:         accountsRedux.accounts(state),
        actualAccountName:loginRedux.actualAccountName(state),
        actualRole:       loginRedux.actualRole(state),
        actualPrivateKey: loginRedux.actualPrivateKey(state),
        isLoading:        loginRedux.isLoading(state),
        personalAccount:  loginRedux.personalAccount(state),
        balance:          balanceRedux.userBalance(state),

        isFetching:       apiRedux.isFetching(state),
        getErrors:        apiRedux.getErrors(state),
        getLastError:     apiRedux.getLastError(state),
        getResults:       apiRedux.getResults(state),
        getLastResult:    apiRedux.getLastResult(state),

        flatConfig:       graphqlRedux.flatConfig(state),
    }),
    (dispatch)=>({
        callAPIEx:        bindActionCreators(apiRedux.callAPIEx, dispatch),
        clearAll:         bindActionCreators(apiRedux.clearAll, dispatch),
        setResult:        bindActionCreators(apiRedux.setResult, dispatch),
        loadBalance:      bindActionCreators(balanceRedux.loadBalance, dispatch),

        setReferrer:      bindActionCreators(menuRedux.setReferrer, dispatch),
    })
)( injectIntl(RequestPayment)) )
);
