import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as routesService from '@app/services/routes';
import * as globalCfg from '@app/configs/global';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { Select, Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { Upload, notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import ProviderSearch from '@app/components/ProviderSearch';

import './requestPayment.css'; 


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const { Paragraph, Text } = Typography;
const { TextArea } = Input;
const routes = routesService.breadcrumbForFile('providers-payments');


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
      loading:            false,
      dataSource:         [],
      
      amount:             0,
      description:        '',
      invoice_file:       undefined,
      payment_slip_file:  undefined,

      provider_extra      : {     
        [globalCfg.api.PAYMENT_VEHICLE]   : '',
        [globalCfg.api.PAYMENT_CATEGORY]  : '',
        [globalCfg.api.PAYMENT_TYPE]      : '',
        [globalCfg.api.PAYMENT_MODE]      : ''
      },
      attachments:       {
        [globalCfg.api.NOTA_FISCAL]       : undefined,
        [globalCfg.api.BOLETO_PAGAMENTO]  : undefined,
      },

      fileList:           [],
      uploading:          false,

      pushingTx:          false,
      
      result:             undefined,
      result_object:      undefined,
      error:              {},


      input_amount     :
                          {  
                            style   : {maxWidth: 370, fontSize: 100, width: 60}
                             , value : undefined 
                             , symbol_style : {fontSize: 60}
                           }
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.onChange                   = this.onChange.bind(this); 
    this.resetPage                  = this.resetPage.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.handleProviderChange       = this.handleProviderChange.bind(this);
    this.onInputAmount              = this.onInputAmount.bind(this);
    this.renderPaymentOption        = this.renderPaymentOption.bind(this);
    this.handleChange               = this.handleChange.bind(this);
    this.getPropsForUploader        = this.getPropsForUploader.bind(this);
    
  }

  clearAttachments(){
    this.setState({ attachments:       {
        [globalCfg.api.NOTA_FISCAL]       : undefined,
        [globalCfg.api.BOLETO_PAGAMENTO]  : undefined,
      }});
  }

  handleUpload = () => {
    // const { fileList } = this.state;
    // const formData = new FormData();
    
    // formData.append('file', fileList[0]);
    // formData.append('account', this.props.actualAccountName);

    // this.setState({
    //   uploading: true,
    // });


    // const bearer_token = api.jwt.getBearerTokenByKey();
    // fetch(globalCfg.api.endpoint + '/files', { // Your POST endpoint
    //     method: 'POST',
    //     headers: {
    //       Authorization: bearer_token
    //     },
    //     body: formData // This is your file object
    //   }).then(
    //     response => response.json() // if the response is a JSON object
    //   ).then(
    //     (success) => {
    //       this.setState({
    //         fileList: [],
    //         uploading: false,
    //       });
    //       console.log(success) // Handle the success response object
    //     }
    //   ).catch(
    //     (error) => {
    //       this.setState({
    //         uploading: false,
    //       });
    //       console.log(error) // Handle the error response object
    //     }
    //   );
  };
  
  onChange(e) {
    e.preventDefault();
    // console.log('changed', e);
    this.setState({amount:e.target.value})
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

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  paymentModeRequiresBoleto(){
    return this.state.provider_extra.payment_mode==globalCfg.api.PAYMENT_MODE_BOLETO;
  }

  handleSubmit = e => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        this.openNotificationWithIcon("error", "Validation errors","Please verifiy errors on screen!")    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      if(isNaN(this.state.amount))
      {
        this.openNotificationWithIcon("error", this.state.amount + " > valid number required","Please type a valid number greater than 0!")    
        return;
      }
      if(parseFloat(this.state.amount)>parseFloat(this.props.balance))
      {
        const balance_txt = globalCfg.currency.toCurrencyString(this.props.balance);
        this.openNotificationWithIcon("error", `Amount must be equal or less than balance ${balance_txt}!`); //`
        return;
      }

      if(!this.state.provider || !this.state.provider.key)
      {
        this.openNotificationWithIcon("error", 'You must choose a provider!');
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
        this.openNotificationWithIcon("error", 'BOLETO PAGAMENTO Payment MODE', 'Please attach Boleto Pagamento file.');
        return;
      }  

      if(this.paymentModeRequiresBoleto() && has_boleto)
        attachments_array[globalCfg.api.BOLETO_PAGAMENTO] = my_BOLETO_PAGAMENTO;

      this.setState({
        uploading: true,
      });

      // const privateKey = api.dummyPrivateKeys[this.props.actualAccountName] 
      const privateKey   = this.props.actualPrivateKey;
      // HACK! >> La tenemos que traer de localStorage? <<
      const provider_id  = this.state.provider.key;
      const sender       = this.props.actualAccountName;
      const signer       = this.props.personalAccount.permissioner.account_name;
      const amount       = values.amount;
      let that           = this;
      
      that.setState({pushingTx:true});
      /*
      * ToDo: improve this steps!
      * 1.- create request.
      *   ** missing -> post files
      * 2.- get Id and send $IK to payment_account
      * 3.- update request
      */
      // api.bank.createProviderPayment(sender, amount, provider_id)
      // console.log(sender, amount, provider_id, values, attachments_array);
      api.bank.createProviderPaymentEx(sender, amount, provider_id, values, attachments_array)
        .then((data) => {
          console.log(' createProviderPayment::send (then#1) >>  ', JSON.stringify(data));
           
           if(!data || !data.id)
           {
              that.setState({result:'error', uploading: false, pushingTx:false, error:'Cant create request nor upload files.'});
              return;
           }

           const request_id       = data.id;
           const provider_account = globalCfg.bank.provider_account; 
           const memo             = 'prv|' + request_id;

           api.sendMoney(sender, privateKey, provider_account, amount, memo, signer)
            .then((data1) => {

              const send_tx             = data1;
              console.log(' SendMoney::send (then#2) >>  ', JSON.stringify(send_tx));
              
              api.bank.updateProviderPayment(request_id, undefined, send_tx.data.transaction_id)
                .then((data2) => {

                    this.clearAttachments();
                    that.setState({uploading: false, result:'ok', pushingTx:false, result_object:{blockchain_id : send_tx.data.transaction_id, request_id:request_id} });
                    this.openNotificationWithIcon("success", 'Provider Payment requested successfully');

                  }, (ex2) => {
                    console.log(' createProviderPayment::send (error#3) >>  ', JSON.stringify(ex2));
                    that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex2)});
                });

            }, (ex1) => {
              
              console.log(' SendMoney::send (error#2) >>  ', JSON.stringify(ex1));
              that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex1)});

            });

        }, (ex) => {
          console.log(' createProviderPayment::send (error#1) >>  ', JSON.stringify(ex));
          that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex)});
        });
      
    });
  };

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/extrato`
    })
  }

  resetPage(){
    this.setState({result: undefined, result_object: undefined, error: {}});
  }

  // normalizeFile = e => {
  //   console.log('Upload event:', e);
  //   if (Array.isArray(e)) {
  //     return e;
  //   }
  //   return e && e.fileList;
  // };

  handleChange = (value, name) => {
    this.setState({
      provider_extra : {[name]: value}
    });
  }

  onInputAmount(event){
    event.preventDefault();
    const the_value = event.target.value;
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
          // $("#amount").css({'font-size': size+'px'})
          // $(".input-price__currency").css({'font-size':  (size*0.6)+'px'});
          // $("#amount").width((digitCount * (size*0.6))+(symbolCount * (size*0.2)) +"px")
        }
      });
  }


  renderPaymentOption(option_type){

    const option_types = {
      [globalCfg.api.PAYMENT_VEHICLE] : { 
        title : 'Pagamento via'
        , options: [
          {
            key: globalCfg.api.PAYMENT_VEHICLE_INKIRI,
            label:'Inkiri'
          }, 
          {
            key: globalCfg.api.PAYMENT_VEHICLE_INSTITUTO,
            label:'Instituto'
          }
        ]
      }
      , [globalCfg.api.PAYMENT_CATEGORY] : { 
        title : 'Category'
        , options: [
          {
            key: globalCfg.api.PAYMENT_CATEGORY_ALUGEL,
            label:'Alugel'
          }, 
          {
            key: globalCfg.api.PAYMENT_CATEGORY_INVESTIMENTO,
            label:'Investimento'
          }, 
          {
            key: globalCfg.api.PAYMENT_CATEGORY_INSUMOS,
            label:'Insumos'
          }, 
          {
            key: globalCfg.api.PAYMENT_CATEGORY_ANOTHER,
            label:'Another...'
          }
        ]
      }
      , [globalCfg.api.PAYMENT_TYPE] : { 
        title : 'Tipo saida'
        , options: [
          {
            key: globalCfg.api.PAYMENT_TYPE_DESPESA,
            label:'Despesa'
          }, 
          {
            key: globalCfg.api.PAYMENT_TYPE_INVESTIMENTO,
            label:'Investimento'
          }
        ]
      }
      , [globalCfg.api.PAYMENT_MODE] : { 
        title : 'Modo de Pagamento'
        , options: [
          {
            key: globalCfg.api.PAYMENT_MODE_TRANSFER,
            label:'Bank transfer'
          }, 
          {
            key: globalCfg.api.PAYMENT_MODE_BOLETO,
            label:'Boleto Pagamento'
          }
        ]
      }
    }
    const my_options = option_types[option_type];
    if(!my_options)
      return (<></>);
    //
    const { getFieldDecorator } = this.props.form;
    
    return (
      <Form.Item className="money-transfer__row">
          {getFieldDecorator( 'provider_extra.'+option_type, {
            rules: [{ required: true, message: 'Please select a/an'+ my_options.title}]
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
          this.openNotificationWithIcon("info", "Only 1 file allowed")    
          return false;
        }

        this.setState(state => ({
          attachments : {[name]: [file]}
        }));
        return false;
      },
      fileList: filelist,
    };
  }

  renderContent() {
    
    const { input_amount, provider, invoice_file, payment_slip_file} = this.state;
    const { uploading, fileList } = this.state;
    const notaUploaderProps   = this.getPropsForUploader(globalCfg.api.NOTA_FISCAL);
    const boletoUploaderProps = this.getPropsForUploader(globalCfg.api.BOLETO_PAGAMENTO);
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="ly-main-content content-spacing cards">
        <section className="mp-box mp-box__shadow money-transfer__box">
          <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
            <Form onSubmit={this.handleSubmit}>
                <div className="money-transfer">
                  
                  <div className="money-transfer__row row-complementary" >
                      <div className="badge badge-extra-small badge-circle addresse-avatar">
                          <span className="picture">
                            <FontAwesomeIcon icon="truck-moving" size="lg" color="gray"/>
                          </span>
                      </div>
                      <div className="money-transfer__input money-transfer__select">
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
                        {getFieldDecorator('amount', {
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
                              name="amount" 
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
                              <FontAwesomeIcon icon="receipt" size="3x" color="#3db389"/>
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
                            <FontAwesomeIcon icon="file-invoice-dollar" size="3x" color={(this.state.provider_extra[globalCfg.api.PAYMENT_MODE]!=globalCfg.api.PAYMENT_MODE_BOLETO)?"gray":"#3db389"}/>
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
                          placeholder="Memo or Note" autosize={{ minRows: 3, maxRows: 6 }} 
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
        </section>
    </div>      
    );

  }
  

  // 
  renderContentOLD() {
  
    const { getFieldDecorator } = this.props.form;
    
    if(this.state.result=='ok')
    {
      const request_id  = this.state.result_object?this.state.result_object.request_id:'';
      const tx_id       = this.state.result_object?this.state.result_object.blockchain_id:'';
      const _href       = api.dfuse.getBlockExplorerTxLink(tx_id);
      
      return (<Result
        status="success"
        title="Transaction completed successfully!"
        subTitle={`Request id ${request_id}. Transaction id ${tx_id}. Cloud server takes up to 30 seconds, please wait.`}
        extra={[
          <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
            Go to dashboard
          </Button>,
          <Button type="link" href={_href} target="_blank" key="view-on-blockchain" icon="cloud" title="View on Blockchain">B-Chain</Button>,
          <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetPage()} />
        ]}
      />)
    }
    //`
    if(this.state.result=='error')
    {

      // <Button key="re-send">Try sending again</Button>,
      return (<Result
                status="error"
                title="Transaction Failed"
                subTitle="Please check and modify the following information before resubmitting."
                extra={[
                  <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>Go to dashboard</Button>,
                  <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetPage()} />
                ]}
              >
                <div className="desc">
                  <Paragraph>
                    <Text
                      strong
                      style={{ fontSize: 16, }}
                    >
                      The content you submitted has the following error:
                    </Text>
                  </Paragraph>
                  <Paragraph>
                    <Icon style={{ color: 'red' }} type="close-circle" /> {this.state.error}
                  </Paragraph>
                </div>
              </Result>)
    }
    
    // ** hack for sublime renderer ** //
    const { amount, provider, invoice_file, payment_slip_file} = this.state;
    const { uploading, fileList } = this.state;
    const props = {
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        if(this.state.fileList && this.state.fileList.length>0)
          return false;
        this.setState(state => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };

    return (
        <div className="ly-main-content content-spacing cards">
        <section className="mp-box mp-box__shadow money-transfer__box">

          <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
            <Form onSubmit={this.handleSubmit}>
              
              <div className="money-transfer">

              <Form.Item style={{minHeight:60, marginBottom:12}}>
                {getFieldDecorator('provider', {
                  rules: [{ validator: this.validateProvider }],
                })(
                  <ProviderSearch onProviderSelected={this.handleProviderChange} style={{ width: '100%' }} />
                    
                )}
              </Form.Item>

              
              <Form.Item style={{minHeight:60, marginBottom:12}}>
                {getFieldDecorator('amount', {
                  rules: [{ required: true, message: 'Please input an amount!' }],
                  initialValue: 0
                })(
                  <Input
                    size="large"
                    style={{ width: '100%' }}
                    onChange={this.onChange}
                    className="input-money extra-large"
                    allowClear
                    prefix={<Icon type="dollar-circle" theme="filled" style={{fontSize:34}} className="certain-category-icon" />} 
                    
                  />
                  
                )}
              </Form.Item>

              <Form.Item style={{marginTop:'20px'}}>
                  <Upload.Dragger name="invoice_file_dragger" {...props} multiple={false}>
                    <p className="ant-upload-drag-icon">
                      <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text">Nota Fiscal</p>
                    <p className="ant-upload-hint">Click or drag file to this area to upload</p>
                  </Upload.Dragger>,
                
              </Form.Item>

              <Form.Item style={{marginTop:'20px'}}>
                {getFieldDecorator('payment_slip_file', {
                  valuePropName: 'fileList'
                })(
                  <Upload.Dragger name="payment_slip_file_dragger" multiple={false} >
                    <p className="ant-upload-drag-icon">
                      <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text">Boleto Pagamento</p>
                    <p className="ant-upload-hint">Click or drag file to this area to upload</p>
                  </Upload.Dragger>,
                )}
              </Form.Item>


              <Form.Item>
                <Button
                  type="primary"
                  onClick={this.handleUpload}
                  disabled={fileList.length === 0}
                  loading={uploading}
                  style={{ marginTop: 16 }}
                >
                  {uploading ? 'Uploading' : 'Start Upload'}
                </Button>
              </Form.Item>
              
              </div>

              <div className="mp-box__actions mp-box__shore">
                  <Button size="large" type="primary" htmlType="submit">
                  REQUEST PAYMENT
                </Button>
              </div>

              
            </Form>
          </Spin>
        
        </section>
        </div>
    );
  }
  
  /*
  
  */
  
  // ** hack for sublime renderer ** //

  renderExtraContent ()
  {
    return (<></>);
  
  }
  
  // ** hack for sublime renderer ** //

  render() {
    let content     = this.renderContent();
    // let contentOLD  = this.renderContentOLD();
    return (
      <>
        <PageHeader
          breadcrumb={{ routes }}
          title="Request a payment to a provider"
          subTitle=""
          
        >
          <div className="wrap">
            <div className="extraContent">{this.renderExtraContent()}</div>
          </div>
        </PageHeader>

        <div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          {content}
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
        
        
    }),
    (dispatch)=>({
        
    })
)(RequestPayment) )
);
