import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as accountsRedux from '@app/redux/models/accounts'
import * as loginRedux from '@app/redux/models/login';
import * as balanceRedux from '@app/redux/models/balance';
import * as apiRedux from '@app/redux/models/api';
import * as graphqlRedux from '@app/redux/models/graphql'
import * as menuRedux from '@app/redux/models/menu';

import * as globalCfg from '@app/configs/global';

import * as utils from '@app/utils/utils';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import AutocompleteAccount from '@app/components/AutocompleteAccount';

import { Switch, Select, PageHeader, Button, Spin, Modal, Form, Input } from 'antd';

import RequestListWidget, {REQUEST_MODE_INNER_PAGE} from '@app/components/request-list-widget';
import TxResult from '@app/components/TxResult';
import { RESET_PAGE, RESET_RESULT, DASHBOARD } from '@app/components/TxResult';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { injectIntl } from "react-intl";

const DEFAULT_RESULT = {
  result:             undefined,
  result_object:      undefined,
  error:              {},
}

// const DEFAULT_RESULT = {
//   result:             'ok',
//   result_object:      {transaction_id:'1125d'},
//   error:              {},
// }


const DEFAULT_STATE = {
  input_amount    : {  
                       style        : {maxWidth: 370, fontSize: 48, width: 50}
                      , symbol_style : {fontSize: 20}
                      , value               : undefined 
                      
                     }
}

class SendMoney extends Component {
  constructor(props) {
    super(props);
    const input_style = DEFAULT_STATE;
    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      isFetching:          props.isFetching,
      transferReasons:     props.transferReasons,
      ...input_style,
      ...DEFAULT_RESULT,

      receipt:             '',
      view_requests:       false,
      intl:                {}
    };

    this.onSelect                   = this.onSelect.bind(this); 
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                = this.resetResult.bind(this); 
    this.userResultEvent            = this.userResultEvent.bind(this); 
    this.onInputAmount              = this.onInputAmount.bind(this);
    this.handleChange               = this.handleChange.bind(this);
    this.handleMessageChange        = this.handleMessageChange.bind(this);
    this.onRequestClick             = this.onRequestClick.bind(this);
  }
  
  onRequestClick(request){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: '/mobile/request-details'
      , state: { 
          request: request 
          , referrer: this.props.location.pathname
        }
    })
  }

  componentDidMount(){
    const {formatMessage} = this.props.intl;
    
    const select_transfer_reason_text = formatMessage({id:'pages.common.send.business.select_transfer_reason_text'});
    const select_transfer_reason_placeholder = formatMessage({id:'pages.common.send.business.select_transfer_reason_placeholder'});
    const error_cant_form_validation = formatMessage({id:'pages.common.send.error_cant_form_validation'});
    const valid_amount_required = formatMessage({id:'pages.common.send.valid_amount_required'});
    const valid_amount_required_description = formatMessage({id:'pages.common.send.valid_amount_required_description'});
    const select_transfer_reason_validation = formatMessage({id:'pages.common.send.business.select_transfer_reason_validation'});
    const confirm_payment  = formatMessage({id:'pages.common.send.confirm_payment'});
    const confirm_transfer = formatMessage({id:'pages.common.send.confirm_transfer'});
    const valid_number_required_description = formatMessage({id:'pages.common.send.valid_number_required_description'})
    const amount_text = formatMessage({id:'global.amount'})
    const amount_validation = formatMessage({id:'pages.common.send.amount_validation'});
    const memo = formatMessage({id:'global.memo'});
    const memo_message = formatMessage({id:'global.memo_message'});
    const action_send = formatMessage({id:'pages.common.send.action_send'});
    const title = formatMessage({id:'pages.common.send.title'});
    const subtitle = formatMessage({id:'pages.common.send.subtitle'});
    const view_requests = formatMessage({id:'global.view_requests'})
    this.setState({intl:{view_requests, title, subtitle, action_send, memo, memo_message, amount_validation, amount_text, select_transfer_reason_text, select_transfer_reason_placeholder, error_cant_form_validation, select_transfer_reason_validation, valid_amount_required, valid_amount_required_description, confirm_payment, confirm_transfer, valid_number_required_description}});

  }
  componentDidUpdate(prevProps, prevState) 
  {
    let new_state = {};
    if(prevProps.isFetching!=this.props.isFetching){
      new_state = {...new_state, isFetching:this.props.isFetching}
    }
    if(!utils.arraysEqual(prevProps.getErrors, this.props.getErrors)){
    }
    if(!utils.arraysEqual(prevProps.getResults, this.props.getResults) ){
      const that = this;
      setTimeout(()=> that.resetPage() ,100);
    }
    if(!utils.objectsEqual(prevProps.transferReasons, this.props.transferReasons) ){  
      new_state = {...new_state, transferReasons:this.props.transferReasons}
    }
    if(Object.keys(new_state).length>0)      
        this.setState(new_state);
  }

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

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/common/extrato`
    })
  }

  resetResult(){
    this.setState({...DEFAULT_RESULT});
  }

  resetPage(){
    const input_style = DEFAULT_STATE;
    this.setState({...DEFAULT_RESULT, ...input_style});
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

  renderTransferReason(){
    const {transferReasons} = this.state;
    if(!transferReasons)
      return null;
    const option_type  = globalCfg.api.TRANSFER_REASON;
    const my_options   = transferReasons.sort(function(a,b){ 
      if(a.key.endsWith('another')) return 1;
      if(b.key.endsWith('another')) return -1;
      return a.value>b.value?1:-1;
    });
    if(!my_options)
      return (<></>);
    //
    const { getFieldDecorator } = this.props.form;
    
    return (
      <Form.Item className="money-transfer__row">
          {getFieldDecorator( 'transfer_extra.'+option_type, {
            rules: [{ required: true, message: this.state.intl.select_transfer_reason_text}]
            , onChange: (e) => this.handleChange(e, option_type)
          })(
            <Select placeholder={this.state.intl.select_transfer_reason_placeholder} optionLabelProp="label">
            {my_options.map( opt => <Select.Option key={opt.key} value={opt.key} label={opt.value}>{ opt.value } </Select.Option> )}
            </Select>
          )}
      </Form.Item>
    )
  }
  
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
          const isMobile = this.props.isMobile;
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

  // onPay = () => {
    
  //   this.props.form.validateFields((err, values) => {
  //     if (err) {
  //       //
  //       return;
  //     }
  //     this.doPayOrSend(values, true);
  //   });
  // }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        components_helper.notif.errorNotification( this.state.intl.error_cant_form_validation ) ;
        
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
      components_helper.notif.errorNotification(this.state.intl.valid_amount_required, this.state.intl.valid_amount_required_description);
      return;
    }
    console.log('====this.props.balance: ', this.props.balance)
    if(parseFloat(input_amount.value)>parseFloat(this.props.balance))
    {
      const balance_txt = globalCfg.currency.toCurrencyString(this.props.balance);
      const amount_le_balance_message = this.props.intl.formatMessage( { id:'pages.common.send.amount_le_balance_message'}, {balance:balance_txt});
      components_helper.notif.errorNotification(amount_le_balance_message);
      return;
    }

    if(this.props.isBusiness && !(transfer_extra || transfer_extra[globalCfg.api.TRANSFER_REASON]))
    {
      components_helper.notif.errorNotification(this.state.intl.select_transfer_reason_validation);
      return;
    }

    const privateKey       = this.props.actualPrivateKey;
    const receiver         = values.receipt;
    const sender           = this.props.actualAccountName;
    const amount           = input_amount.value;
    let memo               = '';
    
    if(this.props.isBusiness)
    {  
      memo = utils.sliceAndJoinMemo (transfer_extra.message, transfer_extra[globalCfg.api.TRANSFER_REASON])
      console.log(' biz && t.extra => memo:', memo);
    }
    else
      if(transfer_extra)
        memo = utils.cleanMemo(transfer_extra.message);

    const that                   = this;
    const amount_string          = this.inputAmountToString();
    const confirm_pay_tx_message = this.props.intl.formatMessage({id:'pages.common.send.confirm_pay_tx_message'}, {amount: amount_string, receiver:receiver});

    Modal.confirm({
      title:   _pay ? this.state.intl.confirm_payment:this.state.intl.confirm_transfer,
      content: confirm_pay_tx_message,
      onOk() {

              const _function = _pay?'sendPayment':'sendMoney';
              that.props.callAPI(_function, [sender, privateKey, receiver, amount, memo])
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
    callback(this.state.intl.valid_number_required_description);
  };

  renderContent() {
  
    if(this.state.result)
    {
      const result_type = this.state.result;
      const title       = null;
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      return(
          <div className="styles standardList" style={{backgroundColor:'#fff', marginTop: 24, padding: 8 }}>
            <TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />
          </div>)
    }

    //
    if(this.state.view_requests==true)
    {
      return   <div className="styles standardList" style={{backgroundColor:'#fff', marginTop: 24, padding: 8 }}>
                  <RequestListWidget
                      callback={this.onRequestClick}
                      hide_stats={true}
                      request_type={globalCfg.api.TYPE_SEND}
                      the_key={'sent'}
                      filter_hidden_fields={['requested_type']}
                      mode={REQUEST_MODE_INNER_PAGE}
                  />
                </div>;
    }  
    //
    const option = this.props.isBusiness?this.renderTransferReason():(null);

    const { getFieldDecorator }               = this.props.form;
    const { input_amount, isFetching}           = this.state;

    return (
        <div className="cards">
          <section className="__mp-box mp-box__shadow XXXmp-boxXXX  XXXmoney-transfer__boxXXX">
              
            <Spin spinning={isFetching} delay={500} tip={this.state.intl.pushing_transaction}>
              
              <Form onSubmit={this.handleSubmit}>
                
                <div className="money-transfer">    
                   
                  <AutocompleteAccount onRef={ref => (this.autocompleteWidget = ref)} callback={this.onSelect} form={this.props.form} name="receipt"  />

                  <Form.Item label={this.state.intl.amount_text} className="money-transfer__row row-complementary input-price" style={{textAlign: 'center'}}>
                        {getFieldDecorator('input_amount.value', {
                          rules: [{ required: true, message: this.state.intl.amount_validation, whitespace: true, validator: this.checkPrice }],
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
                    <Form.Item label={this.state.intl.memo}>
                      {getFieldDecorator('transfer_extra.message', {
                        onChange: (e) => this.handleMessageChange(e)
                      })(
                      <Input.TextArea 
                        maxLength="50"
                        className="money-transfer__input" 
                        placeholder={this.state.intl.memo_message} autoSize={{ minRows: 3, maxRows: 6 }} 
                        style={{overflow: 'hidden', overflowWrap: 'break-word', height: 31}}
                        />
                      )}
                    </Form.Item>
                  </div>

                </div>

                <div className="mp-box__actions mp-box__shore">
                  <Button size="large" key="sendButton" htmlType="submit" type="primary" loading={isFetching} ><FontAwesomeIcon icon="paper-plane" size="1x"/>&nbsp;{this.state.intl.action_send}</Button>
                </div>

              </Form>  
              
            </Spin>
          </section>
        </div>      
      
    );
  }
  
  // ** hack for sublime renderer ** //

  render() {
    let content = this.renderContent();
    const {routes} = this.state;

    return (
      <>
        <PageHeader
          title={this.state.intl.title}
        />
          {content}
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
        getLastResult:      apiRedux.getLastResult(state),

        transferReasons:    graphqlRedux.transferReasons(state),
        getConfig:          graphqlRedux.getConfig(state),

        isMobile :         menuRedux.isMobile(state),
    }),
    (dispatch)=>({
        callAPI:     bindActionCreators(apiRedux.callAPI, dispatch),
        clearAll:    bindActionCreators(apiRedux.clearAll, dispatch),
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch),
        loadBalance: bindActionCreators(balanceRedux.loadBalance, dispatch),
        
    })
)(injectIntl(SendMoney)) ));