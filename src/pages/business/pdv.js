import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';
import { withRouter } from "react-router-dom";

import { Drawer, Steps, Card, PageHeader, Button, Spin, Form, Icon, Input } from 'antd';
import * as columns_helper from '@app/components/TransactionTable/columns';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';
import PaymentForm from '@app/components/Form/payment';
import PaymentItemsForm from '@app/components/Form/payment_items';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import RequestListWidget, {REQUEST_MODE_PDV} from '@app/components/request-list-widget';

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

import * as gqlRequestI18nService from '@app/services/inkiriApi/requests-i18n-graphql-helper'

// Dfuse WebSocket
// import { InboundMessageType, createDfuseClient } from '@dfuse/client';

const { Step } = Steps;
const steps = [
  {
    title: 'pages.business.pdv.step.item_list',
    content: 'First-content',
  },
  {
    title: 'pages.business.pdv.step.payment',
    content: 'Last-content',
  },
];


const DEFAULT_STATE = {
      input_amount     :
                          {  
                            style   : {maxWidth: 370, fontSize: 100, width: 60}
                             , value : undefined 
                             , symbol_style : {fontSize: 60}
                           },
      description:        '',
      show_payment:       false,
      current_step:       0,
      items:              '',
      payer:              '',
      password:           '',
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
class PDV extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connected :         false,
      ...DEFAULT_STATE,
      ...DEFAULT_RESULT,
      
      pushingTx:          false,
      loading:            false,
      txs:                [],
      
      cursor:             '',
      pagination:         { pageSize: 0 , total: 0 },
      referrer:           (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                  = this.resetResult.bind(this); 

    this.onInputAmount              = this.onInputAmount.bind(this);
    this.handleChange               = this.handleChange.bind(this);
    
    this.userResultEvent            = this.userResultEvent.bind(this); 
    this.onCloseModal               = this.onCloseModal.bind(this);
    this.launchConnection           = this.launchConnection.bind(this);
    this.stop                       = this.stop.bind(this);
   
    this.onPaymentModalCallback     = this.onPaymentModalCallback.bind(this);
    this.onPaymentItemsCallback     = this.onPaymentItemsCallback.bind(this);

    this.onRequestClick             = this.onRequestClick.bind(this);

    this.socket = null;
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
  checkPrice = (rule, value, callback) => {
    if (value > 0) {
      callback();
      return;
    }
    callback( this.props.intl.formatMessage({id: 'pages.business.pdv.validators.valid_number_required_description'}) );
  };

  handleSubmit = e => {
    e.preventDefault();
    const { formatMessage }    = this.props.intl;
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        components_helper.notif.errorNotification( formatMessage({id:'errors.validation_title'}), formatMessage({id:'errors.verify_on_screen'}) )    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      if(isNaN(this.state.input_amount.value))
      {
        const title = formatMessage({id: 'pages.business.pdv.validators.valid_number_required'})
        const desc  = formatMessage({id: 'pages.business.pdv.validators.valid_number_required_description'})
        components_helper.notif.errorNotification( title, desc);    
        return;
      }
     
    });
  };

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/common/extrato`
    })
  }

  resetResult(){
    this.setState({...DEFAULT_RESULT});
  }

  resetPage(){
    
    this.setState({...DEFAULT_RESULT, ...DEFAULT_STATE});
  }

  resetState(){
    
    this.setState({...DEFAULT_STATE});
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
  

  renderContent() {
    
    if(this.state.result)
    {
      const result_type = this.state.result;
      const title       = null;
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      return(<TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />)
    }

    const { loading, input_amount } = this.state;
    const { getFieldDecorator } = this.props.form;

    const { formatMessage }    = this.props.intl;
    const amount_title         = formatMessage( {id: 'global.amount' } );
    const amount_message       = formatMessage( {id: 'components.forms.validators.forgot_amount' } );
    const pushing_transaction  = formatMessage( {id: 'pages.business.pdv.pushing_transaction' } );
    const customer_signature   = formatMessage( {id: 'pages.business.pdv.buttins.customer_signature'});
    const qrcode               = formatMessage( {id: 'pages.business.pdv.buttins.qrcode'});
    const send_request         = formatMessage( {id: 'pages.business.pdv.buttins.send_request'});
    return (
      <Spin spinning={this.state.pushingTx} delay={500} tip={pushing_transaction}>
        <Form onSubmit={this.handleSubmit}>
            <div className="money-transfer">
              
              <Form.Item label={amount_title} className="money-transfer__row input-price row-complementary" style={{textAlign: 'center'}}>
                    {getFieldDecorator('input_amount.value', {
                      rules: [{ required: true, message: amount_message, whitespace: true, validator: this.checkPrice }],
                      initialValue: input_amount.value,

                    })( 
                      <>  
                        <span className="input-price__currency" id="inputPriceCurrency" style={input_amount.symbol_style}>
                          {globalCfg.currency.symbol}
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
                
              
              
            </div>
            <div className="mp-box__actions mp-box__shore">
                <Button onClick={this.showPaymentModal} size="large" key="charge_keyboard_button" loading={loading}>
                  <FontAwesomeIcon icon="keyboard" size="1x"/>&nbsp;{customer_signature}
                </Button>
                <Button disabled onClick={this.showQRModal} size="large" key="charge_qr_button" loading={loading} style={{marginLeft:8}} icon="qrcode">
                  {qrcode}
                </Button>
                <Button disabled onClick={this.sharePayment} size="large" key="charge_share_button" loading={loading} style={{marginLeft:8}} ><FontAwesomeIcon icon={['fab', 'whatsapp-square']} />
                  &nbsp;{send_request}
                </Button>
            </div>
        </Form>
      </Spin>
    );

  }
  //

  /* Payment methods */
  showPaymentModal = () => {
    const {input_amount}     = this.state;
    const { formatMessage }  = this.props.intl;
    if(isNaN(input_amount.value) || parseFloat(input_amount.value)<=0)
    {
      const title = formatMessage({id: 'pages.business.pdv.validators.valid_number_required'})
      const desc  = formatMessage({id: 'pages.business.pdv.validators.valid_number_required_description'})
      components_helper.notif.errorNotification(title, desc);    
      return;
    }

    this.setState({show_payment:true});  
  }
  showQRModal = () => {}
  sharePayment = () => {}


  componentDidMount(){
    this.launchConnection();
  } 

  reloadTxs = async () =>{
    const {formatMessage} = this.props.intl;
    try{
      const ret = await this.stop();
    }
    catch(e){
      console.log(' reloadTxs -> stop ERROR')
    }
    try{
      const ret = await this.launchConnection();
    }
    catch(e){
      const title = formatMessage({id:'pages.business.pdv.error.cant_listen_to_transactions'})          
      components_helper.notif.exceptionNotification( title, e);    
    }
      
  }

  ///
  onPaymentItemsCallback = async (error, cancel, values) => {
    // if(cancel)
    // {
    //   this.setState({  
    //       show_payment:   false
    //   });
    //   return;
    // }
    if(error)
    {
      return;
    }

    // console.log('values.items:', values.items)
    
    this.setState({
        items: values.items
    }, () => {
      // this.next();
    });
  }
  //
  onPaymentModalCallback = (error, cancel, values) => {
    if(cancel)
    {
      this.setState({  
          show_payment:   false
      });
      return;
    }
    if(error)
    {
      return;
    }
    // console.log('values:', values);
    const {payer, password} = values;
    this.setState({payer: payer, password:password})
    
  }

  doPay = async () => {

    this.setState({pushingTx:true})
    
    const {payer, password, items} = this.state;
    const {formatMessage}          = this.props.intl;

    console.log(payer, password, items);
    let public_key          = null;
    let private_key         = null;
    if(!api.eosHelper.isValidPrivate(password))
    {
      const keys  = api.keyHelper.getDerivedKey(payer, password)
      // const keys  = api.eosHelper.seedPrivate(seed);
      private_key = keys.wif;
      public_key  = keys.pub_key;
    }
    else
    {
      private_key = password;
      public_key  = api.eosHelper.privateToPublic(password);
    }
    
    let accounts = payer?[payer]:null;
    
    if(!accounts)
      try {
        accounts = await api.getKeyAccounts(public_key);
        console.log('accounts=>', accounts)
      } catch (e) {
        components_helper.notif.errorNotification( 
          formatMessage({id:'pages.business.pdv.error.wrong_password'})
          , formatMessage({id:'pages.business.pdv.error.wrong_password_message'}));
        this.setState({pushingTx:false});
        return;
      }
     
    if(!accounts || accounts.length<=0){
      components_helper.notif.errorNotification( formatMessage({id:'pages.business.pdv.error.no_accounts'}));
      this.setState({pushingTx:false});
      return;
    }

    const {input_amount}    = this.state;
    const that = this;
    const items_text = (items||'').replace(/|/g, '').slice(0,50);
    const stamp_text = formatMessage({id:'pages.business.pdv.message.payed_at_store'});
    const memo = `${items_text} ${stamp_text}`;
    api.sendPayment(accounts[0], private_key, this.props.actualAccountName, input_amount.value, memo)
      .then((data) => {
        console.log(' pdv::pay (then#1) >>  ', JSON.stringify(data));
        that.setState({pushingTx:false, show_payment:false});
        that.resetState();
        components_helper.notif.successNotification( formatMessage({id:'pages.business.pdv.success.payment_completed'}) );
      }, (ex) => {
        console.log(' pdv::pay (error#1) >>  ', JSON.stringify(ex));
        components_helper.notif.exceptionNotification( formatMessage({id:'pages.business.pdv.error.payment_not_completed'}) , ex);
        that.setState({pushingTx:false});
      });
  }

  //
  next = async () => {
    const {current_step} = this.state;
    this.setState({ current_step:current_step + 1 });
  }
  prev() {
    const current_step = this.state.current_step - 1;
    this.setState({ current_step });
  }
  //
  renderPaymentModal = () => {
    const {show_payment, pushingTx, input_amount, current_step} = this.state;
    if(!show_payment)
      return (null);
    const amount_string     = globalCfg.currency.toCurrencyString(input_amount.value);
    const {formatMessage}   = this.props.intl;
    
    //const title = formatMessage({id:'pages.business.pdv.customer_form.payment_message'}, {amount_string:amount_string, business:this.props.actualAccountName});
    //<span className="ant-page-header-heading-title">{title}</span> <></>
    const title = current_step==0
      ?formatMessage({id:steps[current_step].title})
      :formatMessage({id:'pages.business.pdv.customer_form.payment_message'}, {amount_string:amount_string, business:this.props.actualAccountName});
    return(
      <Drawer
          title={<div style={{ margin: '0 auto', width:700}}>
              <Steps current={current_step}>
                {steps.map(item => (
                  <Step key={item.title} title={<InjectMessage id={item.title} />} />
                ))}
              </Steps>
            </div>}
          placement="top"
          closable={true}
          visible={this.state.show_payment}
          getContainer={false}
          style={{ position: 'absolute' }}
          keyboard={true}
          height="600px"
          onClose={this.onCloseModal}
        >
          <div style={{width:'100%'}} className="flex_column">
            <Card 
              title={(<span><strong>{title}</strong> </span> )}
              key="payment"
              loading={this.state.pushingTx}
              style={{width:700}}
              >
                {current_step==0 && 
                  <PaymentItemsForm items={this.state.items} callback={this.onPaymentItemsCallback } />                  
                }
                {current_step==1 && 
                  <Spin spinning={pushingTx} delay={500} tip={formatMessage({id:'pages.business.pdv.customer_form.paying'})}>
                       <PaymentForm
                        business={this.actualAccountName} 
                        amount={this.state.input_amount.value} 
                        showUserSearch={true}
                        callback={this.onPaymentModalCallback } />
                    
                  </Spin>
                      
                }
            </Card>
            <div style={{ margin: '0 0px', padding: 24, background: '#fff', marginTop: 24}}>
              <div className="steps-action">
                {current_step > 0 && (
                  <Button style={{ marginRight: 8 }} onClick={() => this.prev()}>
                    { formatMessage({id:'pages.bankadmin.create_account.nav.previous'})}
                  </Button>
                )}
                {current_step < steps.length - 1 && (
                  <Button type="primary" onClick={() => this.next()}>
                    { formatMessage({id:'pages.bankadmin.create_account.nav.next'})}
                  </Button>
                )}
                {current_step === steps.length - 1 && (
                  <Button type="primary" onClick={() => this.doPay()} disabled={this.state.pushingTx} disabled={this.state.adding_new_perm}>
                    <FontAwesomeIcon icon="shopping-bag" size="1x"/>&nbsp;{formatMessage({id:'global.pay'})}
                  </Button>
                )}
              </div>
            </div>
          </div>  
          
        </Drawer>);
  }
  //
  onCloseModal = () => {
    this.setState({
      show_payment: false,
    });
  };
  //
  render() {
    const {loading, selectedRowKeys, connected} = this.state;
    const content           = this.renderContent();
    const routes            = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    const {formatMessage}   = this.props.intl;

    const conn_title        = connected
      ?formatMessage({id:'pages.business.pdv.connection.ok_status'})
      :formatMessage({id:'pages.business.pdv.connection.error_status'});
    const connection_icon = connected
      ?(<Icon title={conn_title} key={Math.random()} type="check-circle" theme="twoTone" style={{fontSize:20}} twoToneColor="#52c41a"/>)
      :(<Icon title={conn_title} key={Math.random()} type="api" theme="twoTone" twoToneColor="#eb2f96" style={{fontSize:20}} />);
    
    const redo_button_title = formatMessage({id:'pages.business.pdv.connection.reconnect_button_text'});
    // const reconnect_button  = <Button size="small" key="refresh" icon="redo" title={redo_button_title} disabled={loading} onClick={()=>this.reloadTxs()} ></Button>;
    const reconnect_button  = null;
    const payModal          = this.renderPaymentModal()
    const _types            = `${globalCfg.api.TYPE_PAYMENT},${globalCfg.api.TYPE_SEND}`;

    return (
      <>
        
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={formatMessage({id:'pages.business.pdv.title'})}
          extra={[
            reconnect_button,
            connection_icon]}
          >
        </PageHeader>
        
        <div style={{ margin: '24px 0px', padding: 24}}>
          {payModal}
          <div className="ly-main-content content-spacing cards">
            <section className="mp-box mp-box__shadow money-transfer__box_HACK_NO">
              {content}
            </section>
          </div>      
        </div>

        

        <Card 
          title={formatMessage({id:'pages.business.pdv.transactions.title'})}
          extra={ <Spin spinning={this.state.loading} />}>
          <RequestListWidget
                hide_filter={true}
                hide_export_button={true}
                callback={this.onRequestClick}
                hide_stats={true}
                request_type={_types}
                the_key={'_received'}
                filter={{'to':this.props.actualAccountName}}
                mode={REQUEST_MODE_PDV}
                scroll={{ x: 700 }}
            />
        </Card>
      </>
    );
  }

  launchConnection = async() => {
    
    this.socket = new WebSocket("wss://telos.spectrumeos.io/streaming");

    var actionsList = ["transfer"]; 
    var messageBody = {
       "apikey":"test-api-key",
       "event":"subscribe",
       "type":"get_actions",
       "data": {"account":this.props.actualAccountName}
    };

    this.socket.onmessage = this.onTransaction;
    this.socket.onclose = this.onClose;
    this.socket.onerror = this.onError;

    this.socket.onopen = () => {
      console.log("[open] Connection established");
      console.log("Sending to server: "+JSON.stringify(messageBody));
      try{
        const ret = this.socket.send(JSON.stringify(messageBody));
        console.log(ret);
        this.setState({ connected: true });
      }catch(ex){
        components_helper.notif.exceptionNotification(  );
        console.log(' -- launchConnection::  LAUNCH error', JSON.stringify(ex))
      }
      
    }


    // var chain = "telos";
    // var apikey = "test-api-key";
    // var onOpenHandler = function(e) { 
    //   console.log("[open] Connection established"); 
    // };
    // var onMessageHandler = function(event) {
    //   console.log(event.data);
    //   };
    // var onCloseHandler = function(event) {
    //   console.log("[close] Connection closed");
    //   };
    // var onErrorHandler = function(error) {
    //   console.log("[error] ${error.message}");
    //   };
    // var socket = open_connection(chain, apikey, onOpenHandler, onMessageHandler, onCloseHandler, onErrorHandler);

    // get_actions(socket, "eosio", ["transfer","buyram"]);



    //  try { 
    //   this.stream = await this.client.streamActionTraces({
    //             account: globalCfg.currency.token 
    //             , receivers: this.props.actualAccountName
    //             , action_name: "transfer"}
    //           , this.onTransaction
    //           , {
    //             irreversible_only: false
    //           });

    //   this.setState({ connected: true });
    //   console.log(' -- launchConnection::  LAUNCH OK')
    // } catch (error) {
    //   console.log(' -- launchConnection::  LAUNCH error', JSON.stringify(error))
    //   // this.setState({ errorMessages: ["Unable to connect to socket.", JSON.stringify(error)] })
    // }
  }

  onTransaction = async (message) => {
    
    console.log(' *****************************NEW TRANSACTION ', JSON.stringify(message));
    console.log('message', message);
    console.log('message.data', message.data);

    // message.data {"requestType":"get_actions","action":{"context_free":false,"elapsed":5,"console":"","act":{"authorization":[{"actor":"atomakinnaka","permission":"active"}],"name":"transfer","account":"cristaltoken","data":"{\"from\":\"atomakinnaka\",\"to\":\"inkirilabink\",\"quantity\":\"0.7500 INK\",\"memo\":\"pay|undefined|this is a test [Payed at store]\"}"},"creator_action_ordinal":1,"receiver":"inkirilabink","action_ordinal":3,"receipt":{"receiver":"inkirilabink","code_sequence":1,"abi_sequence":1,"recv_sequence":5,"auth_sequence":[{"sequence":13,"account":"atomakinnaka"}],"act_digest":"ece105f767a07614b355cae13d77aa1f96c10ce60d7449221a9c4c2b64896e7d","global_sequence":2541384181},"except":"","account_ram_deltas":[],"block_num":77082390,"block_timestamp":"2020-03-05T01:41:09.500","trxid":"2aee23f262c46c2dec81c72a94052697cd1e654127daccbcb341d130cf3296ef"}}

    // if (message.type !== InboundMessageType.ACTION_TRACE) {
    //   return
    // }

    // const txs = api.dfuse.transformTransactions(message, this.props.actualAccountName);
    // this.onNewData({txs:txs, cursor:null}, true);
    // console.log(' ON TRANSACTION ', JSON.stringify(txs))
    // components_helper.notif.successNotification( this.props.intl.formatMessage({id:'pages.business.pdv.message.new_payment_received'}) );

    // const that = this;
    // setTimeout(()=> that.props.loadBalance(that.props.actualAccountName) ,1000);
     
    components_helper.notif.successNotification( this.props.intl.formatMessage({id:'pages.business.pdv.message.new_payment_received'}) );
    const that = this;
    setTimeout(()=> that.props.loadBalance(that.props.actualAccountName) ,1000);
  }

  stop = async () => {
    if (this.stream === null) {
      return;
    }

    try {
      await this.socket.close()
      this.socket = null;
    } catch (error) {
      console.log(' STOP - Cant close connection. ', JSON.stringify(error))
    }
  }

  onClose = () => {
    console.log(' onClose socket event ')
    this.setState({ connected: false })
  }

  onError = (error) => {
    console.log(' onError - An error occurred with the socket. ', JSON.stringify(error))
  }

  componentWillUnmount() {
    if (this.socket !== null) {
      this.socket.close()
    }
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
        loadBalance: bindActionCreators(balanceRedux.loadBalance, dispatch)
    })
)( injectIntl(PDV)) )
);
