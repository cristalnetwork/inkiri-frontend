import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import PropTypes from "prop-types";

import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';
import { withRouter } from "react-router-dom";

import { Drawer, BackTop, Table, Select, Result, Card, PageHeader, Tag, Button, Spin } from 'antd';
import { message, notification, Form, Icon, InputNumber, Input } from 'antd';
import * as columns_helper from '@app/components/TransactionTable/columns';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';
import PaymentForm from '@app/components/Form/payment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Dfuse WebSocket
import { InboundMessageType, createDfuseClient } from '@dfuse/client';

const { TextArea } = Input;

const DEFAULT_STATE = {
      input_amount     :
                          {  
                            style   : {maxWidth: 370, fontSize: 100, width: 60}
                             , value : undefined 
                             , symbol_style : {fontSize: 60}
                           },
      description:        '',
      show_payment:       false,
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
      loading:            true,
      txs:                [],
      
      cursor:             '',
      pagination:         { pageSize: 0 , total: 0 },
      referrer:           (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                  = this.resetResult.bind(this); 

    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.onInputAmount              = this.onInputAmount.bind(this);
    this.handleChange               = this.handleChange.bind(this);
    
    this.userResultEvent            = this.userResultEvent.bind(this); 
    this.onCloseModal               = this.onCloseModal.bind(this);
    this.launchConnection           = this.launchConnection.bind(this);
    this.stop                       = this.stop.bind(this);
    this.loadTransactionsForAccount = this.loadTransactionsForAccount.bind(this);

    this.onPaymentModalCallback     = this.onPaymentModalCallback.bind(this);

    // Dfuse WebSocket
    this.stream = undefined
    this.client = undefined
    this.client = createDfuseClient({
      apiKey:globalCfg.dfuse.api_key,
      network:globalCfg.dfuse.network,
      streamClientOptions: {
        socketOptions: {
          onClose: this.onClose,
          onError: this.onError,
        }
      }
    })
  }

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

  handleSubmit = e => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        this.openNotificationWithIcon("error", "Validation errors","Please verifiy errors on screen!")    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      
      if(isNaN(this.state.input_amount.value))
      {
        this.openNotificationWithIcon("error", this.state.input_amount.value + " > valid number required","Please type a valid number greater than 0!")    
        return;
      }
     
    });
  };

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/extrato`
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

    return (
      <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
        <Form onSubmit={this.handleSubmit}>
            <div className="money-transfer">
              
              <Form.Item label="Amount" className="money-transfer__row input-price row-complementary" style={{textAlign: 'center'}}>
                    {getFieldDecorator('input_amount.value', {
                      rules: [{ required: true, message: 'Please input an amount!', whitespace: true, validator: this.checkPrice }],
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
                <Button onClick={this.showPaymentModal} size="large" key="charge_keyboard_button" loading={loading}><FontAwesomeIcon icon="keyboard" size="1x"/>&nbsp;COLETAR VENDA</Button>
                <Button disabled onClick={this.showQRModal}      size="large" key="charge_qr_button"       loading={loading} style={{marginLeft:8}} icon="qrcode">QRCODE</Button>
                <Button disabled onClick={this.sharePayment}     size="large" key="charge_share_button"    loading={loading} style={{marginLeft:8}} ><FontAwesomeIcon icon={['fab', 'whatsapp-square']} />&nbsp;REQUEST  </Button>
            </div>
        </Form>
      </Spin>
    );

  }
  //

  /* Payment methods */
  showPaymentModal = () => {
    const {input_amount} = this.state;
    if(isNaN(input_amount.value) || parseFloat(input_amount.value)<=0)
    {
      this.openNotificationWithIcon("error", "Valid amount required","Please type a valid number greater than 0!")    
      return;
    }

    this.setState({show_payment:true});  
  }
  showQRModal = () => {}
  sharePayment = () => {}


  componentDidMount(){
    this.loadTransactionsForAccount(true);  
    this.launchConnection();
  } 

  reloadTxs = async () =>{
    this.setState({
        page:   -1, 
        txs:    [],
      }, async () => {
        try{
          console.log(' reloadTxs -> stop')
          const ret = await this.stop();
          console.log(' reloadTxs -> stop OK')
        }
        catch(e){
          console.log(' reloadTxs -> stop ERROR')
        }
        try{
          console.log(' reloadTxs -> launchConnection')
          const ret = await this.launchConnection();
          console.log(' reloadTxs -> launchConnection OK')
        }
        catch(e){
          console.log(' reloadTxs -> launchConnection ERROR')
        }
        console.log(' reloadTxs -> loadTransactionsForAccount')
        this.loadTransactionsForAccount(true);
      });  
  }

  loadTransactionsForAccount(is_first){

    let account_name = this.props.actualAccountName;
    
    let that = this;
    this.setState({loading:true});
    // console.log(' <><><><><><><><><> this.state.cursor:', this.state.cursor)
    api.dfuse.incomingTransactions(account_name, (is_first===true?undefined:this.state.cursor))
    .then( (res) => {
        that.onNewData(res.data);
      } ,(ex) => {
        // console.log(' -- extrato.js::listTransactions ERROR --');
        // console.log('---- ERROR:', JSON.stringify(ex));
        that.setState({loading:false});  
      } 
    );
    
  }
  //
  onNewData(data, prepend){
    
    const _txs           = prepend==true?[...data.txs, ...this.state.txs]:[...this.state.txs, ...data.txs];

    const pagination     = {...this.state.pagination};
    pagination.pageSize  = _txs.length;
    pagination.total     = _txs.length;

    this.setState({pagination:pagination, txs:_txs, cursor:data.cursor, loading:false})
    // if(prepend)
    // {
    //   const ids = data.txs.map(obj=>obj.id);
    //   console.log(ids)
    //   this.setState({selectedRowKeys:ids})
    //   const that = this;
    //   setTimeout(
    //       function() {
    //           that.setState({selectedRowKeys: []});
    //       },
    //       10000
    //   );
    // }

    if(!data.txs || data.txs.length==0)
    {
      this.openNotificationWithIcon("info", "End of transactions","You have reached the end of transaction list!")
    }
  }
  ///
  renderFooter(){
    return (<><Button key="load-more-data" disabled={!this.state.cursor} onClick={()=>this.loadTransactionsForAccount(false)}>More!!</Button> </>)
  }
  //
  onPaymentModalCallback = async (error, cancel, values) => {
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

    this.setState({pushingTx:true})
    
    const {payer, password} = values;

    let public_key          = null;
    let private_key         = null;
    if(!api.eosHelper.isValidPrivate(password))
    {
      let seed  = null;
      try{
        seed  = globalCfg.eos.generateSeed(payer, password);
      }catch(e){
        this.openNotificationWithIcon('error', 'An error occurred', JSON.stringify(e))
        return;
      }
      const keys  = api.eosHelper.seedPrivate(seed);
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
        this.openNotificationWithIcon("error", "Wrong password.", "Please verify password and try again. Message: "+ JSON.stringify(e));
        this.setState({pushingTx:false});
        return;
      }
     
    if(!accounts || accounts.length<=0){
      that.openNotificationWithIcon("error", 'No accounts for given password.');
      return;
    }

    const {input_amount}    = this.state;
    const that = this;
    api.sendPayment(accounts[0], private_key, this.props.actualAccountName, input_amount.value, 'Payed at store.')
      .then((data) => {
        console.log(' pdv::pay (then#1) >>  ', JSON.stringify(data));
        // that.setState({result:'ok', pushingTx:false, result_object:data});
        that.setState({pushingTx:false, show_payment:false});
        that.resetState();
        that.openNotificationWithIcon("success", 'Payment completed successfully');
      }, (ex) => {
        console.log(' pdv::pay (error#1) >>  ', JSON.stringify(ex));
        that.openNotificationWithIcon("error", 'An error occurred!', JSON.stringify(ex));
        // that.setState({result:'error', pushingTx:false, error:JSON.stringify(ex)});
        that.setState({pushingTx:false});
      });


  }
  //
  renderPaymentModal = () => {
    const {show_payment, pushingTx, input_amount} = this.state;
    if(!show_payment)
      return (null);
    const amount_string = globalCfg.currency.toCurrencyString(input_amount.value);
    return(
      <Drawer
          title="PAYMENT"
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
            <span className="ant-page-header-heading-title">Please, type your account password to proceed to pay {amount_string} to @{this.props.actualAccountName}.</span> 
            
            <div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
              <div className="ly-main-content content-spacing cards">
                <section className="mp-box mp-box__shadow__full money-transfer__box">
                  <Spin spinning={pushingTx} delay={500} tip="Pushing transaction...">
                    <div className="c-detail">
                      <PaymentForm
                        business={this.actualAccountName} 
                        amount={this.state.input_amount.value} 
                        showUserSearch={true}
                        callback={ () => this.onPaymentModalCallback } />
                    </div>
                  </Spin>
                </section>
              </div>        
            </div>

          </div>  
          
        </Drawer>);
  }
  onCloseModal = () => {
    this.setState({
      show_payment: false,
    });
  };
  //
  render() {
    const {loading, selectedRowKeys, connected} = this.state;
    const content         = this.renderContent();
    const routes          = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    const conn_title      = connected?'You are connected and receiving transaction!':'Something went wrong. You are not connected neither receiving transactions.'; 
    const connection_icon = connected?(<Icon title={conn_title} key={Math.random()} type="check-circle" theme="twoTone" style={{fontSize:20}} twoToneColor="#52c41a"/>):(<Icon title={conn_title} key={Math.random()} type="api" theme="twoTone" twoToneColor="#eb2f96" style={{fontSize:20}} />)
    
    const payModal = this.renderPaymentModal()
    
    return (
      <>
        
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title="PDV - COLETAR VENDA"
          extra={[
            <Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadTxs()} ></Button>,
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

        <BackTop />

        <Card 
          title="ÚLTIMAS COBRANÇAS EFETUADAS" 
          extra={ <Spin spinning={this.state.loading} />}>
          <Table
            showHeader={false}
            key="pdv"
            rowKey={record => record.id} 
            loading={this.state.loading} 
            columns={ columns_helper.getColumnsForPDV(this.onTransactionClick)} 
            dataSource={this.state.txs} 
            footer={() => this.renderFooter()}
            pagination={this.state.pagination}
            scroll={{ x: 700 }}
          />
        </Card>
          

      </>
    );
  }

  launchConnection = async() => {
    console.log(' -- launchConnection:: connecting to dfuse socket -->', this.props.actualAccountName)
     try { 
      this.stream = await this.client.streamActionTraces({
                account: globalCfg.currency.token 
                , receivers: this.props.actualAccountName
                , action_name: "transfer"}
              , this.onTransaction
              , {
                irreversible_only: false
              });

      this.setState({ connected: true });
      console.log(' -- launchConnection::  LAUNCH OK')
    } catch (error) {
      console.log(' -- launchConnection::  LAUNCH error', JSON.stringify(error))
      // this.setState({ errorMessages: ["Unable to connect to socket.", JSON.stringify(error)] })
    }
  }

  onTransaction = async (message) => {
    console.log(' ON TRANSACTION ', JSON.stringify(message))
    if (message.type !== InboundMessageType.ACTION_TRACE) {
      return
    }

    const txs = api.dfuse.transformTransactions(message, this.props.actualAccountName);
    this.onNewData({txs:txs, cursor:null}, true);
    // message.success('New payment received!', 5);
    this.openNotificationWithIcon("success", "New payment received!")    
  }

  stop = async () => {
    if (this.stream === undefined) {
      return;
    }

    try {
      await this.stream.close()
      this.stream = undefined;
    } catch (error) {
      console.log(' STOP - Cant close connection. ', JSON.stringify(error))
      this.setState({ errorMessages: ["Unable to disconnect socket correctly.", JSON.stringify(error)]})
    }
  }

  onClose = () => {
    console.log(' onClose socket event ')
    this.setState({ connected: false })
  }

  onError = (error) => {
    console.log(' onError - An error occurred with the socket. ', JSON.stringify(error))
    // this.setState({ errorMessages: ["An error occurred with the socket.", JSON.stringify(error)]})
  }

  componentWillUnmount() {
    if (this.stream !== undefined) {
      this.stream.close()
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
        
    })
)(PDV) )
);
