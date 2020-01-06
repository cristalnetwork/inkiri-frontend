import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as accountsRedux from '@app/redux/models/accounts'
import * as loginRedux from '@app/redux/models/login';
import * as balanceRedux from '@app/redux/models/balance';
import * as apiRedux from '@app/redux/models/api';

import * as globalCfg from '@app/configs/global';

import * as utils from '@app/utils/utils';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import AutocompleteAccount from '@app/components/AutocompleteAccount';

import { PageHeader, Button, Spin, Modal} from 'antd';
import { Form, Input } from 'antd';

import { injectIntl } from "react-intl";

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
class RequestMoney extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      isFetching:          props.isFetching,
      
      ...DEFAULT_STATE,
      ...DEFAULT_RESULT,

      requested:             '',

    };

    this.onSelect                   = this.onSelect.bind(this); 
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                = this.resetResult.bind(this); 
    this.userResultEvent            = this.userResultEvent.bind(this); 
    this.onInputAmount              = this.onInputAmount.bind(this);
    this.handleChange               = this.handleChange.bind(this);
    this.handleMessageChange        = this.handleMessageChange.bind(this);
  }

  componentDidUpdate(prevProps, prevState) 
  {
    let new_state = {};
    if(prevProps.isFetching!=this.props.isFetching){
      new_state = {...new_state, isFetching:this.props.isFetching}
    }
    if(prevProps.getErrors!=this.props.getErrors){
    
    }

    if(!utils.arraysEqual(prevProps.getResults, this.props.getResults) ){
      const that = this;
      setTimeout(()=> that.resetPage() ,100);
    }


    if(Object.keys(new_state).length>0)      
        this.setState(new_state);
  }

  onSelect(value) {
    console.log('onSelect', value);
    this.setState({requested:value})
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
    if(this.autocompleteWidget)
    {
      const that = this;
      setTimeout(()=> that.autocompleteWidget.reset() ,100);
    }
    this.props.form.setFieldsValue({'transfer_extra.message':''})
    
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

  // renderTransferReason(){
  //   const option_type  = globalCfg.api.TRANSFER_REASON;
  //   const option_types = globalCfg.api.getTransferReasons();
    
  //   const my_options = option_types[option_type];
    
  //   if(!my_options)
  //     return (<></>);
  //   //
  //   const { getFieldDecorator } = this.props.form;
    
  //   return (
  //     <Form.Item className="money-transfer__row">
  //         {getFieldDecorator( 'transfer_extra.'+option_type, {
  //           rules: [{ required: true, message: 'Please select a '+ my_options.title}]
  //           , onChange: (e) => this.handleChange(e, option_type)
  //         })(
  //           <Select placeholder={'Choose ' + my_options.title} optionLabelProp="label">
  //           {my_options.options.map( opt => <Select.Option key={opt.key} value={opt.key} label={opt.label}>{ opt.label } </Select.Option> )}
  //           </Select>
  //         )}
  //     </Form.Item>
  //   )
  // }
  
  //

  onInputAmount(param){
    let the_value = param;
    if(typeof param !== 'number' && typeof param !== 'string')
    {
      param.preventDefault();
      the_value = param.target.value;
    }
    
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
                    , style :       {fontSize: size, width:(digitCount * (size*0.6))+(symbolCount * (size*0.2)) }
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
    this.props.form.validateFields((err, values) => {
      if (err) {
        components_helper.notif.errorNotification( this.props.intl.formatMessage({id:'errors.validation_title'}), this.props.intl.formatMessage({id:'errors.verify_on_screen'}) );
        return;
      }
      this.doRequestMoney(values);
    });
  };

  doRequestMoney = (values) => {
    const { input_amount }   = this.state; 
    const { transfer_extra } = values;
    const { formatMessage }  = this.props.intl; 

    if(isNaN(input_amount.value))
    {
      components_helper.notif.errorNotification(formatMessage({id:'pages.common.request-money.valid_number_required_description'}));
      return;
    }

    // if(parseFloat(input_amount.value)>parseFloat(this.props.balance))
    // {
    //   const balance_txt = globalCfg.currency.toCurrencyString(this.props.balance);
    //   components_helper.notif.errorNotification(`Amount must be equal or less than balance ${balance_txt}!`); //`
    //   return;
    // }

    // if(this.props.isBusiness && !(transfer_extra || transfer_extra[globalCfg.api.TRANSFER_REASON]))
    // {
    //   components_helper.notif.errorNotification('Please choose a transfer reason.');
    //   return;
    // }

    const privateKey       = this.props.actualPrivateKey;
    const requested        = values.requested;
    const sender           = this.props.actualAccountName;
    const amount           = input_amount.value;
    let memo               = '';
    
    // console.log('transfer_extra:', JSON.stringify(transfer_extra))
    // console.log('message:',transfer_extra.message, ' | reason:', transfer_extra[globalCfg.api.TRANSFER_REASON])
    
    // if(this.props.isBusiness)
    // {  
    //   memo = utils.sliceAndJoinMemo (transfer_extra.message, transfer_extra[globalCfg.api.TRANSFER_REASON])
    //   console.log(' biz && t.extra => memo:', memo);
    // }
    // else
    if(transfer_extra)
      memo = utils.cleanMemo(transfer_extra.message);

    console.log('* memo:', memo);
    
    const that         = this;
    const confirm_payment_request        = formatMessage({id:'pages.common.request-money.confirm_payment_request'});
    const confirm_transfer_request       = formatMessage({id:'pages.common.request-money.confirm_transfer_request'});
    const confirm_pay_tx_request_message = formatMessage({id:'pages.common.request-money.confirm_pay_tx_request_message'}, {amount:this.inputAmountToString(), requested:requested});
    Modal.confirm({
      title: this.props.isBusiness?confirm_payment_request:confirm_transfer_request,
      content: confirm_pay_tx_request_message,
      onOk() {

              const _function     = 'bank.createMoneyRequest';
              // const request_type  = that.props.isBusiness?globalCfg.api.TYPE_PAYMENT:globalCfg.api.TYPE_SEND;
              const request_type  = globalCfg.api.TYPE_PAYMENT;
              that.props.callAPI(_function, [sender, request_type, requested, amount, memo])

      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  checkPrice = (rule, value, callback) => {
    if (value > 0) {
      callback();
      return;
    }
    callback(this.props.intl.formatMessage({id:'pages.common.request-money.valid_number_required_description'}));
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
    
    const { getFieldDecorator }       = this.props.form;
    const { input_amount, isFetching} = this.state;
    const {formatMessage}             = this.props.intl;

    // <Button size="large" key="payButton" type="link" onClick={this.onPay} style={{marginLeft:8}}loading={isFetching} ><FontAwesomeIcon icon="shopping-bag" size="1x"/>&nbsp;PAY</Button>

    const memo                     = formatMessage({id:'global.memo'});
    const memo_message             = formatMessage({id:'global.memo_message'});
    const request_money_action     = formatMessage({id:'pages.common.request-money.request_action_text'});
    const pushing_transaction      = formatMessage({id:'pages.common.request-money.pushing_transaction'});
    const valid_number_required_description = formatMessage({id:'pages.common.request-money.valid_number_required_description'});
    const amount_text              = formatMessage({id:'global.amount'})

    return (
        <Spin spinning={isFetching} delay={500} tip={pushing_transaction}>
          
          <Form onSubmit={this.handleSubmit}>
            
            <div className="money-transfer">    
               
              <AutocompleteAccount onRef={ref => (this.autocompleteWidget = ref)} callback={this.onSelect} form={this.props.form} name="requested"  />

              <Form.Item label={amount_text} className="money-transfer__row row-complementary input-price" style={{textAlign: 'center'}}>
                    {getFieldDecorator('input_amount.value', {
                      rules: [{ required: true
                                , message: valid_number_required_description
                                , whitespace: true
                                , validator: this.checkPrice }],
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
              

              <div className="money-transfer__row row-expandable row-complementary-bottom"  id="divNote">
                <Form.Item label={memo}>
                  {getFieldDecorator('transfer_extra.message', {
                    onChange: (e) => this.handleMessageChange(e)
                  })(
                  <Input.TextArea 
                    maxLength="50"
                    className="money-transfer__input" 
                    placeholder={memo_message} autoSize={{ minRows: 3, maxRows: 6 }} 
                    style={{overflow: 'hidden', overflowWrap: 'break-word', height: 31}}
                    />
                  )}
                </Form.Item>
              </div>

            </div>

            <div className="mp-box__actions mp-box__shore">
              <Button size="large" key="sendButton" htmlType="submit" type="primary" loading={isFetching} ><FontAwesomeIcon flip="both" icon="paper-plane" size="1x"/>&nbsp;{request_money_action}</Button>
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
          title={this.props.intl.formatMessage({id:'pages.common.request-money.title'})}
        >
          
        </PageHeader>
          <div style={{ margin: '0 0px', padding: 24}}>
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

        isBusiness:         loginRedux.isBusiness(state),

        isFetching:         apiRedux.isFetching(state),
        getErrors:          apiRedux.getErrors(state),
        getLastError:       apiRedux.getLastError(state),
        getResults:         apiRedux.getResults(state),
        getLastResult:      apiRedux.getLastResult(state)
    }),
    (dispatch)=>({
        callAPI:     bindActionCreators(apiRedux.callAPI, dispatch),
        clearAll:    bindActionCreators(apiRedux.clearAll, dispatch),

        loadBalance: bindActionCreators(balanceRedux.loadBalance, dispatch),
        
    })
)(injectIntl(RequestMoney)) ));