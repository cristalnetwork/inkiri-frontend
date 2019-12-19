import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'
import * as apiRedux from '@app/redux/models/api';
import * as menuRedux from '@app/redux/models/menu';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import PropTypes from "prop-types";

import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';
import { withRouter } from "react-router-dom";

import { Select, Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { Upload, notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import ProviderSearch from '@app/components/ProviderSearch';
import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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
    if(prevProps.getErrors!=this.props.getErrors){
      const ex = this.props.getLastError;
      new_state = {...new_state, 
          getErrors:     this.props.getErrors, 
          result:        ex?'error':undefined, 
          error:         ex?JSON.stringify(ex):null}
      if(ex)
        components_helper.notif.exceptionNotification("An error occurred!", ex);
    }
    if(prevProps.getResults!=this.props.getResults){
      const lastResult = this.props.getLastResult;
      new_state = {...new_state, 
        getResults:      this.props.getResults, 
        result:          lastResult?'ok':undefined, 
        result_object:   lastResult};
      
      console.log('lastResult:', lastResult)
      
      if(lastResult)
        components_helper.notif.successNotification('Operation completed successfully')
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
    console.log(' #evt() handleProviderChange: ', provider);
    this.setState({provider: provider })
  }

  validateProvider = (rule, value, callback) => {
    console.log(' #fn() validateProvider >> provider:', this.state.provider)
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

  paymentModeRequiresBoleto(){
    return this.state.provider_extra.payment_mode==globalCfg.api.PAYMENT_MODE_BOLETO;
  }

  handleSubmit = e => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        components_helper.notif.errorNotification("Validation errors","Please verifiy errors on screen!");
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      if(isNaN(this.state.input_amount.value))
      {
        components_helper.notif.errorNotification("Valid number required","Please type a valid number greater than 0!");
        return;
      }
      if(parseFloat(this.state.input_amount.value)>parseFloat(this.props.balance))
      {
        const balance_txt = globalCfg.currency.toCurrencyString(this.props.balance);
        components_helper.notif.errorNotification(`Amount must be equal or less than balance ${balance_txt}!`); //`
        return;
      }

      if(!this.state.provider || !this.state.provider.key)
      {
        components_helper.notif.errorNotification('Please choose a provider!');
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
        components_helper.notif.errorNotification('BOLETO PAGAMENTO Payment MODE', 'Please attach Boleto Pagamento file.');
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
    
      // console.log('values:', values)
      // console.log('values:', JSON.stringify(values));
      // return;


      // api.bank.createProviderPaymentEx(sender, amount, provider_id, values, attachments_array)
      // api.requestProviderPayment(sender, privateKey, provider_account, amount, request_id)
      // api.bank.updateProviderPayment(sender, request_id, undefined, send_tx.data.transaction_id)
      
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
      
      // api.bank.createProviderPaymentEx(sender, amount, provider_id, values, attachments_array)
      //   .then((data) => {
      //     console.log(' createProviderPayment::send (then#1) >>  ', JSON.stringify(data));
           
      //      if(!data || !data.id)
      //      {
      //         that.setState({result:'error', uploading: false, pushingTx:false, error:'Cant create request nor upload files.'});
      //         return;
      //      }

      //      const request_id       = data.id;
      //      const provider_account = globalCfg.bank.provider_account; 
           
      //      api.requestProviderPayment(sender, privateKey, provider_account, amount, request_id)
      //       .then((data1) => {

      //         const send_tx             = data1;
      //         console.log(' requestProviderPayment::send (then#2) >>  ', JSON.stringify(send_tx));
              
      //         api.bank.updateProviderPayment(sender, request_id, send_tx.data.transaction_id)
      //           .then((data2) => {

      //               that.clearAttachments();
      //               that.setState({uploading: false, result:'ok', pushingTx:false, result_object:{transaction_id : send_tx.data.transaction_id, request_id:request_id} });
      //               that.openNotificationWithIcon("success", 'Provider Payment requested successfully');

      //             }, (ex2) => {
      //               console.log(' createProviderPayment::send (error#3) >>  ', JSON.stringify(ex2));
      //               that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex2)});
      //           });

      //         setTimeout(()=> that.props.loadBalance(that.props.actualAccountName) ,1000);

      //       }, (ex1) => {
              
      //         console.log(' requestProviderPayment::send (error#2) >>  ', JSON.stringify(ex1));
      //         that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex1)});

      //       });

      //   }, (ex) => {
      //     console.log(' createProviderPayment::send (error#1) >>  ', JSON.stringify(ex));
      //     that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex)});
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
    this.props.clearAll();
  }

  resetPage(){
    this.setState({...DEFAULT_RESULT, ...DEFAULT_STATE});
    // reset Errors and results
    this.props.clearAll();
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
    const option_types = globalCfg.api.getPaymentOptions();
    
    const my_options = option_types[option_type];
    
    if(!my_options)
      return (<></>);
    //
    const { getFieldDecorator } = this.props.form;
    
    return (
      <Form.Item className="money-transfer__row">
          {getFieldDecorator( 'provider_extra.'+option_type, {
            rules: [{ required: true, message: 'Please select a/an '+ my_options.title}]
            , onChange: (e) => this.handleChange(e, option_type)
          })(
            <Select placeholder={'Choose ' + my_options.title} optionLabelProp="label">
            {my_options.options.map( opt => <Select.Option key={opt.key} value={opt.key} label={opt.label}>{ opt.label } </Select.Option> )}
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
          components_helper.notif.infoNotification("Only 1 file allowed");
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

    //this.props.setLastRootMenuFullpath(this.props.location.pathname);
    this.props.setReferrer(  'Back to request provider payment!'
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

    return (
      <Spin spinning={isFetching} delay={500} tip="Pushing transaction...">
        <Form onSubmit={this.handleSubmit}>
            <div className="money-transfer">
              
              <div className="money-transfer__row row-complementary" >
                  <div className="badge badge-extra-small badge-circle addresse-avatar">
                      <span className="picture">
                        <FontAwesomeIcon icon="truck-moving" size="lg" color="gray"/>
                      </span>
                  </div>
                  <div className="money-transfer__input money-transfer__select">
                    <Button type="default" icon="plus" size="small" onClick={() => this.onNewProvider()} title="Add new provider" style={{position:'absolute', right:8, top:8}}/>
                    <Form.Item>
                      {getFieldDecorator('provider', {
                        rules: [{ validator: this.validateProvider }],
                      })(
                        <ProviderSearch onProviderSelected={this.handleProviderChange} style={{ width: '100%' }} autoFocus />
                      )}
                    </Form.Item>
                  </div>
              </div>

                
              <Form.Item label="Amount" className="money-transfer__row input-price" style={{textAlign: 'center'}}>
                    {getFieldDecorator('input_amount.value', {
                      rules: [{ required: true, message: 'Please input an amount!', whitespace: true, validator: this.checkPrice }],
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
                      <p className="ant-upload-text">Nota Fiscal</p>
                    </Upload.Dragger>,
                </Form.Item>
              </div>

              {this.renderPaymentOption(globalCfg.api.PAYMENT_VEHICLE)}
              {this.renderPaymentOption(globalCfg.api.PAYMENT_CATEGORY)}
              {this.renderPaymentOption(globalCfg.api.PAYMENT_TYPE)}
              
              {this.renderPaymentOption(globalCfg.api.PAYMENT_MODE)}
              
              <div className="money-transfer__row file_selector">
                <Form.Item>
                  <Upload.Dragger multiple={false} disabled={this.state.provider_extra[globalCfg.api.PAYMENT_MODE]!=globalCfg.api.PAYMENT_MODE_BOLETO} {...boletoUploaderProps}>
                    <p className="ant-upload-drag-icon">
                      <FontAwesomeIcon icon="file-invoice-dollar" size="3x" color={(this.state.provider_extra[globalCfg.api.PAYMENT_MODE]!=globalCfg.api.PAYMENT_MODE_BOLETO)?"gray":"inherit"}/>
                    </p>
                    <p className="ant-upload-text">Boleto Pagamento</p>
                  </Upload.Dragger>,
                </Form.Item>
              </div>

              <div className="money-transfer__row row-expandable row-complementary-bottom"  id="divNote">
                <Form.Item label="Memo">
                  {getFieldDecorator('description', {})(
                  <TextArea 
                    className="money-transfer__input" 
                    placeholder="Description, Memo or Note" autoSize={{ minRows: 3, maxRows: 6 }} 
                    style={{overflow: 'hidden', overflowWrap: 'break-word', height: 31}}
                    />
                  )}
                </Form.Item>
                  
              </div>
            </div>
            <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="requestButton" htmlType="submit" type="primary" loading={this.state.uploading} title="" >REQUEST PAYMENT</Button>
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
          title="Request a payment to a provider">
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
    }),
    (dispatch)=>({
        callAPIEx:        bindActionCreators(apiRedux.callAPIEx, dispatch),
        clearAll:         bindActionCreators(apiRedux.clearAll, dispatch),
        setResult:        bindActionCreators(apiRedux.setResult, dispatch),
        loadBalance:      bindActionCreators(balanceRedux.loadBalance, dispatch),

        setReferrer:      bindActionCreators(menuRedux.setReferrer, dispatch),
    })
)(RequestPayment) )
);
