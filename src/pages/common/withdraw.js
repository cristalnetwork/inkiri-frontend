import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'
import * as apiRedux from '@app/redux/models/api';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import PropTypes from "prop-types";

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';


import { Select, Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin, Modal} from 'antd';
import { notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import TxResult from '@app/components/TxResult';
import { RESET_PAGE, RESET_RESULT, DASHBOARD } from '@app/components/TxResult';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const DEFAULT_RESULT = {
  result:             undefined,
  result_object:      undefined,
  error:              {},
}

const DEFAULT_STATE = {
  input_amount    : {  
                      style   : {maxWidth: 370, fontSize: 100, width: 60}
                       , value : undefined 
                       , symbol_style : {fontSize: 60}
                     },

}
class WithdrawMoney extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      isFetching:          false,
      ...DEFAULT_STATE,
      ...DEFAULT_RESULT,

    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                = this.resetResult.bind(this); 
    this.userResultEvent            = this.userResultEvent.bind(this); 
    this.onInputAmount              = this.onInputAmount.bind(this);
  }

  static propTypes = {
    // match: PropTypes.object.isRequired,
    // location: PropTypes.object.isRequired,
    // history: PropTypes.object.isRequired
    match: PropTypes.object,
    location: PropTypes.object,
    history: PropTypes.object
  };

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
      if(lastResult)
        components_helper.notif.successNotification('Operation completed successfully')
    }


    if(Object.keys(new_state).length>0)      
        this.setState(new_state);
  }

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


  onInputAmount(event){
    event.preventDefault();
    const the_value = event.target.value;
    const _input_amount = this.state.input_amount;
    this.props.form.setFieldsValue({'input_amount.value':the_value})
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

  inputAmountToString(){
    const {input_amount} = this.state;
    return globalCfg.currency.symbol + parseFloat(input_amount.value||0).toFixed(2);
  }

  handleSubmit = e => {
    e.preventDefault();
    const that = this;
    
    this.props.form.validateFields((err, values) => {
      if(err){
        components_helper.notif.errorNotification('Form error', 'Please verify on screen errors.');
        return;
      }

      const {input_amount} = this.state;
      if(isNaN(input_amount.value) || parseFloat(input_amount.value)<=0)
      {
        components_helper.notif.errorNotification("Input a valid number","Please type a valid number greater than 0.00 !")    
        return;
      }
      
      if(parseFloat(input_amount.value)>parseFloat(this.props.balance))
      {
        const balance_txt = globalCfg.currency.toCurrencyString(this.props.balance);
        components_helper.notif.errorNotification(`Amount must be equal or less than your balance ${balance_txt}!`); 
        return;
      }

      
      const sender         = this.props.actualAccountName;
      const privateKey     = this.props.actualPrivateKey;
      const amount       = input_amount.value;
      
      Modal.confirm({
        title: 'Confirm withdraw request',
        content: 'Please confirm withdraw for '+this.inputAmountToString(),
        onOk() {
          
          const withdraw_account = globalCfg.bank.withdraw_account; 
          const steps= [
            {
              _function:           'bank.createWithdraw'
              , _params:           [sender, amount]
            }, 
            {
              _function:           'requestWithdraw'
              , _params:           [sender, privateKey, withdraw_account, amount] 
              , last_result_param: [{field_name:'id', result_idx_diff:-1}]
              , on_failure:        {
                                      _function:           'bank.failedWithdraw'
                                      , _params:           [sender] 
                                      , last_result_param: [{field_name:'id', result_idx_diff:-1}]
                                    }
            },
            {
              _function:           'bank.updateWithdraw'
              , _params:           [sender] 
              , last_result_param: [{field_name:'id', result_idx_diff:-2}, {field_name:'transaction_id', result_idx_diff:-1}]
            },
          ]

          that.props.callAPIEx(steps);
          // api.bank.createWithdraw(sender, amount)
          //   .then((data)=>{
          //     console.log(' >> doWithdraw >> ', JSON.stringify(data));
          //     // that.setState({pushingTx:false, result:'ok'})
          //     // that.openNotificationWithIcon("success", 'Withdraw requested successfully');

          //     if(!data || !data.id)
          //     {
          //       that.setState({result:'error',  pushingTx:false, error:'Cant create request.'});
          //       return;
          //     }

          //     const request_id       = data.id;
          //     const withdraw_account = globalCfg.bank.withdraw_account; 

          //     api.requestWithdraw(sender, privateKey, withdraw_account, amount, request_id)
          //       .then((data1) => {

          //         const send_tx             = data1;
          //         console.log(' withdrawMoney::send (then#2) >>  ', JSON.stringify(send_tx));
                  
          //         api.bank.updateWithdraw(sender, request_id, send_tx.data.transaction_id)
          //           .then((data2) => {

          //               that.setState({ result:'ok', pushingTx:false, result_object:{transaction_id : send_tx.data.transaction_id, request_id:request_id} });
          //               that.openNotificationWithIcon("success", 'Withdraw requested successfully');

          //             }, (ex2) => {

          //               console.log(' withdrawMoney::send (error#3) >>  ', JSON.stringify(ex2));
          //               that.setState({result:'error',  pushingTx:false, error:JSON.stringify(ex2)});
          //           });

          //           setTimeout(()=> that.props.loadBalance(that.props.actualAccountName) ,1000);
          //       }, (ex1) => {
                  
          //         console.log(' withdrawMoney::send (error#2) >>  ', JSON.stringify(ex1));
          //         that.setState({result:'error',  pushingTx:false, error:JSON.stringify(ex1)});

          //       });

          //   }, (err)=>{
          //     that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(err));
          //     that.setState({result:'error', error:err});
          //   })
          
        },
        onCancel() {
          console.log('Cancel');
          // that.setState({pushingTx:false})
        },
      });
    });
  };

  checkPrice = (rule, value, callback) => {
    if (value > 0) {
      callback();
      return;
    }
    callback('Amount must greater than zero!');
  };

  renderContent() {
  
    if(this.state.result)
    {
      const result_type = this.state.result;
      // const title       = 'Request completed succesfully.';
      const message     = result_type=='ok'?'Please pick up the paper money at the closest PDA.':null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      return(<TxResult result_type={result_type} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />)
    }

    const { getFieldDecorator }               = this.props.form;
    const { input_amount, isFetching}         = this.state;
    return (
        <Spin spinning={isFetching} delay={500} tip="Pushing transaction...">
          <Form onSubmit={this.handleSubmit}>
            <div className="money-transfer">    
              
              <Form.Item label="Amount" className="money-transfer__row row-complementary input-price" style={{textAlign: 'center'}}>
                    {getFieldDecorator('input_amount.value', {
                      rules: [{ required: true, message: 'Please input an amount!', whitespace: true, validator: this.checkPrice }],
                      initialValue: input_amount.value
                    })( 
                      <>  
                        <span className="input-price__currency" id="inputPriceCurrency" style={input_amount.symbol_style}>
                          {globalCfg.currency.symbol}
                        </span>
                        
                        <Input 
                          type="tel" 
                          step="0.01" 
                          className="money-transfer__input input-amount placeholder-big" 
                          placeholder="0" 
                          value={input_amount.value} 
                          onChange={this.onInputAmount}  
                          style={input_amount.style}  
                        />
                      </>
                    )}
              </Form.Item>
              <div><br/><br/></div>
            </div>

            <div className="mp-box__actions mp-box__shore">
              <Button size="large" key="requestButton" htmlType="submit" type="primary" loading={isFetching} >REQUEST WITHDRAW</Button>
            </div>

          </Form>  
          
        </Spin>
    );
  }
  
  // ** hack for sublime renderer ** //

  render() {
    let content = this.renderContent();
    const {routes} = this.state;
    
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title="Withdraw money"
          subTitle="Withdraw paper money at the nearest PDA"
          
        >
          
        </PageHeader>
          <div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
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
        actualAccountName:  loginRedux.actualAccountName(state),
        actualRole:         loginRedux.actualRole(state),
        actualPrivateKey:   loginRedux.actualPrivateKey(state),
        isLoading:          loginRedux.isLoading(state),
        personalAccount:    loginRedux.personalAccount(state),
        balance:            balanceRedux.userBalance(state),
    
        isFetching:         apiRedux.isFetching(state),
        getErrors:          apiRedux.getErrors(state),
        getLastError:       apiRedux.getLastError(state),
        getResults:         apiRedux.getResults(state),
        getLastResult:      apiRedux.getLastResult(state),
    }),
    (dispatch)=>({
        callAPIEx:          bindActionCreators(apiRedux.callAPIEx, dispatch),
        clearAll:    bindActionCreators(apiRedux.clearAll, dispatch),
        
        loadBalance:        bindActionCreators(balanceRedux.loadBalance, dispatch)
    })
)(WithdrawMoney) ));