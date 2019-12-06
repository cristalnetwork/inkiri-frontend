import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as accountsRedux from '@app/redux/models/accounts'
import * as loginRedux from '@app/redux/models/login';
import * as balanceRedux from '@app/redux/models/balance';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import * as utils from '@app/utils/utils';

import PropTypes from "prop-types";

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import AutocompleteAccount from '@app/components/AutocompleteAccount';

import { Select, PageHeader, Button, Spin, Modal} from 'antd';
import { notification, Form, Icon, InputNumber, Input } from 'antd';

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
class SendMoney extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      pushingTx:           false,
      
      ...DEFAULT_STATE,
      ...DEFAULT_RESULT,

      receipt:             '',

    };

    this.onSelect                   = this.onSelect.bind(this); 
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                = this.resetResult.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.userResultEvent            = this.userResultEvent.bind(this); 
    this.onInputAmount              = this.onInputAmount.bind(this);
    this.handleChange               = this.handleChange.bind(this);
    this.handleMessageChange        = this.handleMessageChange.bind(this);
  }

  static propTypes = {
    match: PropTypes.object,
    location: PropTypes.object,
    history: PropTypes.object
  };

  onSelect(value) {
    console.log('onSelect', value);
    this.setState({receipt:value})
  }

  handleChange = (value, name) => {
    this.setState({
      transfer_extra : {[name]: value}
    });
  }
  handleMessageChange = (e) => {
    e.preventDefault();
    this.setState({
      transfer_extra : {message: e.target.value}
    });
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

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

  renderTransferReason(){
    const option_type  = globalCfg.api.TRANSFER_REASON;
    const option_types = globalCfg.api.getTransferReasons();
    
    const my_options = option_types[option_type];
    
    if(!my_options)
      return (<></>);
    //
    const { getFieldDecorator } = this.props.form;
    
    return (
      <Form.Item className="money-transfer__row">
          {getFieldDecorator( 'transfer_extra.'+option_type, {
            rules: [{ required: true, message: 'Please select a '+ my_options.title}]
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

  onPay = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
        //
        return;
      }
      this.doPayOrSend(values, true);
    });
  }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        //
        return;
      }
      this.doPayOrSend(values, false);
    });
  };

  doPayOrSend = (values, _pay) => {
    const { input_amount }   = this.state; 
    const { transfer_extra } = values;
    
    if(isNaN(input_amount.value))
    {
      this.openNotificationWithIcon("error", "Valid number required for amount","Please type a validnumber greater than 0!")    
      return;
    }
    if(parseFloat(input_amount.value)>parseFloat(this.props.balance))
    {
      const balance_txt = globalCfg.currency.toCurrencyString(this.props.balance);
      this.openNotificationWithIcon("error", `Amount must be equal or less than balance ${balance_txt}!`); //`
      return;
    }

    if(this.props.isBusiness && !(transfer_extra || transfer_extra[globalCfg.api.TRANSFER_REASON]))
    {
      this.openNotificationWithIcon("error", 'Please choose a transfer reason.');
      return;
    }

    console.log('Received values of form: ', values);

    const privateKey       = this.props.actualPrivateKey;
    const receiver         = values.receipt;
    const sender           = this.props.actualAccountName;
    const amount           = input_amount.value;
    let memo               = '';
    console.log('transfer_extra:', JSON.stringify(transfer_extra))
    console.log('message:',transfer_extra.message, ' | reason:', transfer_extra[globalCfg.api.TRANSFER_REASON])
    
    if(this.props.isBusiness)
    {  
      memo = utils.sliceAndJoinMemo (transfer_extra.message, transfer_extra[globalCfg.api.TRANSFER_REASON])
      console.log(' biz && t.extra => memo:', memo);
    }
    else
      if(transfer_extra)
        memo = utils.cleanMemo(transfer_extra.message);

    console.log('* memo:', memo);
    
    const that         = this;

    Modal.confirm({
      title: _pay?'Confirm payment':'Confirm money transfer',
      content: 'Please confirm transfer for '+this.inputAmountToString() + ' to ' + receiver,
      onOk() {

              that.setState({pushingTx:true});
              
              const promise = _pay?api.sendPayment(sender, privateKey, receiver, amount, memo):api.sendMoney(sender, privateKey, receiver, amount, memo);
              
              promise
              .then((data) => {
                console.log(' SendMoney::send (then#1) >>  ', JSON.stringify(data));
                that.setState({result:'ok', pushingTx:false, result_object:data});
                that.openNotificationWithIcon("success", 'Transfer completed successfully');

                setTimeout(()=> that.props.loadBalance(that.props.actualAccountName) ,1000);

              }, (ex) => {
                console.log(' SendMoney::send (error#1) >>  ', JSON.stringify(ex));
                that.openNotificationWithIcon("error", 'An error occurred!', JSON.stringify(ex));
                that.setState({result:'error', pushingTx:false, error:JSON.stringify(ex)});
              });

      },
      onCancel() {
        console.log('Cancel');
        that.setState({pushingTx:false})
      },
    });
  }

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
      const title       = null;
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      return(<TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />)
    }
    const option = this.props.isBusiness?this.renderTransferReason():(null);

    const { getFieldDecorator }               = this.props.form;
    const { input_amount, pushingTx}           = this.state;
    return (
        <Spin spinning={pushingTx} delay={500} tip="Pushing transaction...">
          <Form onSubmit={this.handleSubmit}>
            <div className="money-transfer">    
               
              <AutocompleteAccount callback={this.onSelect} form={this.props.form} name="receipt" />

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
              

              {option}

              <div className="money-transfer__row row-expandable row-complementary-bottom"  id="divNote">
                <Form.Item label="Memo">
                  {getFieldDecorator('transfer_extra.message', {
                    onChange: (e) => this.handleMessageChange(e)
                  })(
                  <Input.TextArea 
                    maxLength="50"
                    className="money-transfer__input" 
                    placeholder="Message, Memo or Note" autoSize={{ minRows: 3, maxRows: 6 }} 
                    style={{overflow: 'hidden', overflowWrap: 'break-word', height: 31}}
                    />
                  )}
                </Form.Item>
              </div>

            </div>

            <div className="mp-box__actions mp-box__shore">
              <Button size="large" key="sendButton" htmlType="submit" type="primary" loading={pushingTx} ><FontAwesomeIcon icon="paper-plane" size="1x"/>&nbsp; SEND</Button>
              <Button size="large" key="payButton" type="link" onClick={this.onPay} style={{marginLeft:8}}loading={pushingTx} ><FontAwesomeIcon icon="shopping-bag" size="1x"/>&nbsp;PAY</Button>
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
          title="Send money"
          subTitle="Send money instantly for free"
          
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

        accounts:           accountsRedux.accounts(state),

        isBusiness:         loginRedux.isBusiness(state)
    }),
    (dispatch)=>({
        loadBalance: bindActionCreators(balanceRedux.loadBalance, dispatch)
    })
)(SendMoney) ));