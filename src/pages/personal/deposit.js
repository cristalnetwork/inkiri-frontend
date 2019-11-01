import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'

import AmountInput from '@app/components/AmountInput';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { Select, Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin, Modal} from 'antd';
import { notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import * as routesService from '@app/services/routes';

// import './deposit.css'; 

import TxResult from '@app/components/TxResult';
import { RESET_PAGE, RESET_RESULT, DASHBOARD } from '@app/components/TxResult';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const routes = routesService.breadcrumbForFile('deposit');

const DEFAULT_RESULT = {
  result:             undefined,
  result_object:      undefined,
  error:              {},
}

const DEFAULT_STATE = {
  envelope_id     : '--loading--',
  input_amount    : {  
                      style   : {maxWidth: 370, fontSize: 100, width: 60}
                       , value : undefined 
                       , symbol_style : {fontSize: 60}
                       , symbol: globalCfg.currency.symbol
                     },

}
class DepositMoney extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:      true,
      pushingTx:    false,
      
      ...DEFAULT_STATE,
      ...DEFAULT_RESULT,

    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                = this.resetResult.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.getNextEnvelopeId          = this.getNextEnvelopeId.bind(this);
    this.userResultEvent            = this.userResultEvent.bind(this); 
    this.symbolChange               = this.symbolChange.bind(this);
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

  componentDidMount(){
    
    this.getNextEnvelopeId();
  }
  
  getNextEnvelopeId(){
    api.bank.nextEnvelopeId (this.props.actualAccountName).then(  
      (res)=>{
        this.setState ({loading:false, envelope_id: res});
      },
      (err)=>{
        // console.log(' ERROR FETCHING ENV ID ->', err);
        this.setState ({loading:false});
        this.openNotificationWithIcon("error", "Cant fetch next envelope ID", "Please check if you are logged in bank service. " + JSON.stringify(err))      
      },
    )
  }
  symbolChange = (e) =>{
    let input_amount = this.state.input_amount;
    input_amount.symbol = e;
    this.setState({input_amount:input_amount})
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
    this.getNextEnvelopeId();
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
    return input_amount.symbol + parseFloat(input_amount.value||0).toFixed(2);
  }
  handleSubmit = e => {
    e.preventDefault();
    const that = this;
    this.props.form.validateFields((err, values) => {
      if(err){
        that.openNotificationWithIcon("error", 'Form error ', 'Please verify on screen errors.');
        that.setState({pushingTx:false});
        return;
      }

      const {input_amount} = this.state;
      const sender         = that.props.actualAccountName;
      Modal.confirm({
        title: 'Confirm deposit request',
        content: 'Please confirm deposit for '+this.inputAmountToString(),
        onOk() {
          const {input_amount} = that.state;

          api.bank.createDeposit(sender, input_amount.value, input_amount.symbol)
            .then((res)=>{
              console.log(' >> doDeposit >> ', JSON.stringify(res));
              that.setState({pushingTx:false, result:'ok'})
              that.openNotificationWithIcon("success", 'Deposit requested successfully');

            }, (err)=>{
              that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(err));
              that.setState({result:'error', error:err});
            })
          
        },
        onCancel() {
          console.log('Cancel');
          that.setState({pushingTx:false})
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

  doDeposit(){
    // // guarda
    // api.bank.createDeposit(this.props.actualAccountName, this.state.value.amount, this.state.value.currency)
    // .then((res)=>{
    //   console.log(' >> doDeposit >> ', JSON.stringify(res));
    //   this.setState({result:'ok'});
    // }, (err)=>{
    //   this.setState({result:'error', error:err});
    // })
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

    const { getFieldDecorator }               = this.props.form;
    const { input_amount, pushingTx, loading, envelope_id} = this.state;
    const my_currencies                       = [globalCfg.currency.symbol, globalCfg.currency.fiat.symbol];
    const loading_text                        = pushingTx?'Pushing transaction...':(loading?'Loading...':'');
    return (
        <Spin spinning={pushingTx||loading} delay={500} tip={loading_text}>
          <Form onSubmit={this.handleSubmit}>
            <div className="money-transfer">    
              
              <div className="money-transfer__row row-complementary money-transfer__select row-complementary-bottom flex_row" >
                  <div className="badge badge-extra-small badge-circle addresse-avatar display_block">
                      <span className="picture">
                        <FontAwesomeIcon icon="envelope" size="lg" color="gray"/>
                      </span>
                  </div>
                  <div className="money-transfer__input money-transfer__select">
                    <span>Type this ID onto the envelope:<br/>
                      <strong style={{fontWeight:600, fontSize:24}}>{envelope_id}</strong>
                    </span>
                  </div>
              </div>
              
              <div className="money-transfer__row row-complementary money-transfer__select flex_row" >
                  <div className="badge badge-extra-small badge-circle addresse-avatar display_block">
                      <span className="picture">
                        <FontAwesomeIcon icon="dollar-sign" size="lg" color="gray"/>
                      </span>
                  </div>
                  <div className="money-transfer__input money-transfer__select">
                    <Form.Item>
                        {getFieldDecorator( 'input_amount.symbol', {
                          rules: [{ required: true, message: 'Please select currency'}]
                          , initialValue: input_amount.symbol
                          , onChange: this.symbolChange
                        })(
                          <Select placeholder={'Choose a currency'} optionLabelProp="label" className="input-price__currency select-price__currency">
                          {my_currencies.map( opt => <Select.Option key={opt} value={opt} label={opt}>{ opt } </Select.Option> )}
                          </Select>
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
                          {input_amount.symbol}
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
              <div><br/><br/></div>
            </div>

            <div className="mp-box__actions mp-box__shore">
              <Button size="large" key="requestButton" htmlType="submit" type="primary" loading={pushingTx||loading} >REQUEST DEPOSIT</Button>
            </div>

          </Form>  
          
        </Spin>
    );
  }
  
  // ** hack for sublime renderer ** //

  render() {
    let content = this.renderContent();
    
    return (
      <>
        <PageHeader
          breadcrumb={{ routes }}
          title="Deposit money"
          subTitle="Deposit paper money and receive Inkiri on your account"
          
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
        isLoading:          loginRedux.isLoading(state)
    }),
    (dispatch)=>({
        
    })
)(DepositMoney) ));