import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
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
      routes :             routesService.breadcrumbForPaths(props.location.pathname),

      loading:             true,
      
      ...DEFAULT_STATE,
      ...DEFAULT_RESULT,

    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                = this.resetResult.bind(this); 
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

  componentDidUpdate(prevProps, prevState) 
  {
    let new_state = {};
    if(prevProps.isFetching!=this.props.isFetching){
      new_state = {...new_state, isFetching:this.props.isFetching}
    }
    if(prevProps.getErrors!=this.props.getErrors){
      const ex = this.props.getLastError;
      new_state = {...new_state, getErrors:this.props.getErrors, result:'error', error:JSON.stringify(ex)}
      components_helper.notif.exceptionNotification("An error occurred!", ex);
    }
    if(prevProps.getResults!=this.props.getResults){
      // new_state = {...new_state, getResults:this.props.getResults}
      new_state = {...new_state, getResults:this.props.getResults, result:'ok', result_object:this.props.getLastResult};
      components_helper.notif.successNotification('Operation completed successfully')
    }

    if(Object.keys(new_state).length>0)      
        this.setState(new_state);
  }
  
  getNextEnvelopeId(){
    api.bank.nextEnvelopeId (this.props.actualAccountName).then(  
      (res)=>{
        this.setState ({loading:false, envelope_id: res});
      },
      (err)=>{
        this.setState ({loading:false});
        components_helper.notif.errorNotification("Cant fetch next envelope ID", "Please check internet connection, and your login status at bank service. " + JSON.stringify(err));
      },
    )
  }
  symbolChange = (e) =>{
    let input_amount = this.state.input_amount;
    input_amount.symbol = e;
    this.setState({input_amount:input_amount})
  }

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
    return input_amount.symbol + parseFloat(input_amount.value||0).toFixed(2);
  }
  handleSubmit = e => {
    e.preventDefault();
    const that = this;
    this.props.form.validateFields((err, values) => {
      if(err){
        components_helper.notif.errorNotification('Form error ', 'Please verify on screen errors.');
        return;
      }
      
      const {input_amount} = this.state;
      const sender         = that.props.actualAccountName;
      Modal.confirm({
        title: 'Confirm deposit request',
        content: 'Please confirm deposit for '+this.inputAmountToString(),
        onOk() {
          const {input_amount} = that.state;
          const _function = 'bank.createDeposit';
          that.props.callAPI(_function, [sender, input_amount.value, input_amount.symbol])
          
          // api.bank.createDeposit(sender, input_amount.value, input_amount.symbol)
          //   .then((res)=>{
          //     console.log(' >> doDeposit >> ', JSON.stringify(res));
          //     that.setState({pushingTx:false, result:'ok'})
          //     components_helper.notif.successNotification('Deposit requested successfully');

          //   }, (err)=>{
          //     components_helper.notif.exceptionNotification('An error occurred ', err);
          //     that.setState({result:'error', error:err, pushingTx:false});
          //   })
          
        },
        onCancel() {
          console.log('Cancel');
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
      const title       = null;
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      return(<TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />)
    }

    const { getFieldDecorator }               = this.props.form;
    const { input_amount, isFetching, loading, envelope_id} = this.state;
    const my_currencies                       = [globalCfg.currency.symbol, globalCfg.currency.fiat.symbol];
    const loading_text                        = isFetching?'Pushing transaction...':(loading?'Loading...':'');
    return (
        <Spin spinning={isFetching||loading} delay={500} tip={loading_text}>
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
                          <Select placeholder={'Choose a currency'} optionLabelProp="label" className="NO_input-price__currency_NO select-price__currency">
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
              <Button size="large" key="requestButton" htmlType="submit" type="primary" loading={isFetching||loading} >REQUEST DEPOSIT</Button>
            </div>

          </Form>  
          
        </Spin>
    );
  }
  
  // ** hack for sublime renderer ** //

  render() {
    let content    = this.renderContent();
    const {routes} = this.state;

    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
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
        isLoading:          loginRedux.isLoading(state),
    
        isFetching:         apiRedux.isFetching(state),
        getErrors:          apiRedux.getErrors(state),
        getLastError:       apiRedux.getLastError(state),
        getResults:         apiRedux.getResults(state),
        getLastResult:      apiRedux.getLastResult(state),
    }),
    (dispatch)=>({
        callAPI:     bindActionCreators(apiRedux.callAPI, dispatch),
        
    })
)(DepositMoney) ));