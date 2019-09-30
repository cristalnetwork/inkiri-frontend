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

import { Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { Upload, notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import ProviderSearch from '@app/components/ProviderSearch';

import './requestPayment.css'; 

const { Paragraph, Text } = Typography;

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
      
      provider:           undefined,
      amount:             0,
      memo:               '',
      invoice_file:       undefined,
      payment_slip_file:  undefined,

      pushingTx:    false,
      
      result:       undefined,
      result_object:undefined,
      error:        {}
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.onChange                   = this.onChange.bind(this); 
    this.resetPage                  = this.resetPage.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.handleProviderChange       = this.handleProviderChange.bind(this);
  }

  
  onChange(e) {
    e.preventDefault();
    // console.log('changed', e);
    this.setState({amount:e.target.value})
  }

  handleProviderChange(provider){
    console.log(' ** handleProviderChange: ', provider);
    this.setState({provider:provider})
  }

  validateProvider = (rule, value, callback) => {
    console.log(' >> validateProvider >> provider:', this.state.provider)
    console.log(' >> validateProvider >> value: ', value)
    if (this.state.provider && this.state.provider.key) {
      callback();
      return;
    }
    // if (value && value.key) {
    //   callback();
    //   return;
    // }
    callback('Please select a provider!');
  };

  // onSearch={this.handleSearch}
  handleSearch(value){
    // this.setState({
    //   dataSource: !value ? [] : [value, value + value, value + value + value],
    // });
  };

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }


  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        this.openNotificationWithIcon("error", "Validation errors","Please verifiy errors on screen0!")    
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
      
      // const privateKey = api.dummyPrivateKeys[this.props.actualAccountName] 
      const privateKey = this.props.actualPrivateKey;
      // HACK! >> La tenemos que traer de localStorage? <<
      const provider_id = this.state.provider.key;
      const sender     = this.props.actualAccountName;
      const signer     = this.props.personalAccount.permissioner.account_name;
      
       
      const amount     = values.amount;
      let that         = this;
      
      // console.log('**createProviderPayment >> account_name:', sender, ' | amount:', amount, ' | provider_id:', provider_id)
      that.setState({pushingTx:true});
      /*
      * ToDo: improve this steps!
      * 1.- create request.
      *   ** missing -> post files
      * 2.- get Id and send $IK to payment_account
      * 3.- update request
      */
      api.bank.createProviderPayment(sender, amount, provider_id)
        .then((data) => {
          console.log(' createProviderPayment::send (then#1) >>  ', JSON.stringify(data));
           
           const request_id       = data.id;
           const provider_account = globalCfg.bank.provider_account; 
           const memo             = 'prv|' + request_id
           api.sendMoney(sender, privateKey, provider_account, amount, memo, signer)
            .then((data1) => {

              const send_tx             = data1;
              console.log(' SendMoney::send (then#2) >>  ', JSON.stringify(send_tx));
              
              api.bank.updateProviderPayment(request_id, undefined, send_tx.data.transaction_id)
                .then((data2) => {

                    that.setState({result:'ok', pushingTx:false, result_object:{blockchain_id : send_tx.data.transaction_id, request_id:request_id} });

                  }, (ex2) => {
                    console.log(' createProviderPayment::send (error#3) >>  ', JSON.stringify(ex2));
                    that.setState({result:'error', pushingTx:false, error:JSON.stringify(ex2)});
                });

            }, (ex1) => {
              
              console.log(' SendMoney::send (error#2) >>  ', JSON.stringify(ex1));
              that.setState({result:'error', pushingTx:false, error:JSON.stringify(ex1)});

            });


          // that.setState({result:'ok', pushingTx:false, result_object:data});
        }, (ex) => {
          console.log(' createProviderPayment::send (error#1) >>  ', JSON.stringify(ex));
          that.setState({result:'error', pushingTx:false, error:JSON.stringify(ex)});
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

   normalizeFile = e => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  renderContent() {
  
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
          <Button type="link" href={_href} target="_blank" key="view-on-blockchain" icon="cloud" >View on Blockchain</Button>,
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
    const{ amount, provider, invoice_file, payment_slip_file} = this.state;
    return (
        <div style={{ margin: '0 auto', width:500, padding: 24, background: '#fff'}}>
          <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
            <Form onSubmit={this.handleSubmit}>
                
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
                {getFieldDecorator('invoice_file', {
                  valuePropName: 'fileList',
                  getValueFromEvent: this.normalizeFile,
                })(
                  <Upload.Dragger name="invoice_file_dragger" action="#" multiple={false}>
                    <p className="ant-upload-drag-icon">
                      <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text">Nota Fiscal</p>
                    <p className="ant-upload-hint">Click or drag file to this area to upload</p>
                  </Upload.Dragger>,
                )}
              </Form.Item>

              <Form.Item style={{marginTop:'20px'}}>
                {getFieldDecorator('payment_slip_file', {
                  valuePropName: 'fileList',
                  getValueFromEvent: this.normalizeFile,
                })(
                  <Upload.Dragger name="payment_slip_file_dragger" action="/google_drive" multiple={false} >
                    <p className="ant-upload-drag-icon">
                      <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text">Boleto Pagamento</p>
                    <p className="ant-upload-hint">Click or drag file to this area to upload</p>
                  </Upload.Dragger>,
                )}
              </Form.Item>


              <Form.Item>
                <Button style={{marginTop:'20px'}} type="primary" htmlType="submit" className="login-form-button">
                  Request Payment
                </Button>
                
              </Form.Item>
            </Form>
          </Spin>
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
    let content = this.renderContent();
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

        <div style={{ margin: '0 0px', padding: 24, background: '#fff', marginTop: 24}}>
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
