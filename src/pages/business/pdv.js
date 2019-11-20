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

import { BackTop, Table, Select, Result, Card, PageHeader, Tag, Button, Spin } from 'antd';
import { message, notification, Form, Icon, InputNumber, Input } from 'antd';
import * as columns_helper from '@app/components/TransactionTable/columns';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Dfuse WebSocket
import { InboundMessageType, createDfuseClient } from '@dfuse/client';

const { TextArea } = Input;
const routes = routesService.breadcrumbForFile('providers-payments');

const DEFAULT_STATE = {
      input_amount     :
                          {  
                            style   : {maxWidth: 370, fontSize: 100, width: 60}
                             , value : undefined 
                             , symbol_style : {fontSize: 60}
                           },
      description:        '',
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
      transfers:          [],

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
                <Button size="large" key="charge_keyboard_button" htmlType="submit" loading={loading}><FontAwesomeIcon icon="keyboard" size="1x"/>&nbsp;COLETAR VENDA</Button>
                <Button style={{marginLeft:8}} size="large" key="charge_qr_button" htmlType="submit" loading={loading} icon="qrcode">QRCODE</Button>
                <Button style={{marginLeft:8}} size="large" key="charge_share_button" htmlType="submit" loading={loading} ><FontAwesomeIcon icon={['fab', 'whatsapp-square']} />&nbsp;SHARE</Button>
            </div>
        </Form>
      </Spin>
    );

  }
  //


  componentDidMount(){
    this.loadTransactionsForAccount(true);  
    this.launchConnection();
  } 

  
  loadTransactionsForAccount(is_first){

    let account_name = this.props.actualAccountName;
    
    let that = this;
    this.setState({loading:true});
    // console.log(' <><><><><><><><><> this.state.cursor:', this.state.cursor)
    api.listTransactions(account_name, (is_first===true?undefined:this.state.cursor), true )
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
  onNewData(data){
    
    const _txs           = [...this.state.txs, ...data.txs];
    const pagination     = {...this.state.pagination};
    pagination.pageSize  = _txs.length;
    pagination.total     = _txs.length;

    this.setState({pagination:pagination, txs:_txs, cursor:data.cursor, loading:false})


    if(!data.txs || data.txs.length==0)
    {
      this.openNotificationWithIcon("info", "End of transactions","You have reached the end of transaction list!")
    }
  }
  ///
  renderFooter(){
    return (<><Button key="load-more-data" disabled={this.state.cursor==''} onClick={()=>this.loadTransactionsForAccount(false)}>More!!</Button> </>)
  }
  //
  render() {
    let   content     = this.renderContent();
    const routes      = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    const {connected} = this.state;
    const conn_title  = connected?'You are connected and receiving transaction!':'Something went wrong. You are not connected neither receiving transactions.'; 
    const connection_icon = connected?(<Icon title={conn_title} key={Math.random()} type="check-circle" theme="twoTone" style={{fontSize:20}} twoToneColor="#52c41a"/>):(<Icon title={conn_title} key={Math.random()} type="api" theme="twoTone" twoToneColor="#eb2f96" style={{fontSize:20}} />)
    const infinite_container = (null);
    // const infinite_container = (<div className="App-infinite-container">
    //       { this.state.transfers.length <= 0
    //           ? this.renderTransfer("Nothing yet, start by hitting Launch!")
    //           : this.state.transfers.reverse().map(this.renderTransfer)
    //       }
    //     </div>);

    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title="PDV - COLETAR VENDA"
          extra={[connection_icon]}
          >
        </PageHeader>

        <div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          <div className="ly-main-content content-spacing cards">
            <section className="mp-box mp-box__shadow money-transfer__box_HACK_NO">
              {content}
            </section>
          </div>      
        </div>

        <BackTop />

        {infinite_container}

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
    console.log('connecting to dfuse socket -->', this.props.actualAccountName)
     try { 
      this.stream = await this.client.streamActionTraces({
        account: globalCfg.currency.token 
        , receivers: this.props.actualAccountName
        , action_name: "transfer"
      }, this.onTransaction
      , {
        irreversible_only: false
      })

      this.setState({ connected: true })
    } catch (error) {
      console.log(' LAUNCH error')
      console.log(JSON.stringify(error))
      this.setState({ errorMessages: ["Unable to connect to socket.", JSON.stringify(error)] })
    }
  }

  onTransaction = async (message) => {
    console.log(' ON TRANSACTION ', JSON.stringify(message))
    if (message.type !== InboundMessageType.ACTION_TRACE) {
      return
    }

    const { from, to, quantity, memo } = message.data.trace.act.data
    const transfer = `Transfer [${from} -> ${to}, ${quantity}] (${memo})`
    this.setState((prevState) => ({
      transfers: [ ...prevState.transfers.slice(-100), transfer ],
    }))

    const txs = api.dfuse.transformTransactions(message, this.props.actualAccountName, false);
    this.onNewData({txs:txs, cursor:null});
    // message.success('New payment received!', 5);
    this.openNotificationWithIcon("success", "New payment received!")    
  }

  stop = async () => {
    if (this.stream === undefined) {
      return
    }

    try {
      await this.stream.close()
      this.stream = undefined
    } catch (error) {
      this.setState({ errorMessages: ["Unable to disconnect socket correctly.", JSON.stringify(error)]})
    }
  }

  onClose = () => {
    this.setState({ connected: false })
  }

  onError = (error) => {
    this.setState({ errorMessages: ["An error occurred with the socket.", JSON.stringify(error)]})
  }

  componentWillUnmount() {
    if (this.stream !== undefined) {
      this.stream.close()
    }
  }

  renderTransfer = (transfer, index) => {
    return <code key={index} className="App-transfer">{transfer}</code>
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
