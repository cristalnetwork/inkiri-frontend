import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as apiRedux from '@app/redux/models/api';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';
import * as utils from '@app/utils/utils';

import { Switch, Select, PageHeader, Button, Spin, Modal, Form, Input } from 'antd';

import TxResult from '@app/components/TxResult';
import { RESET_PAGE, RESET_RESULT, DASHBOARD } from '@app/components/TxResult';

import RequestListWidget, {REQUEST_MODE_INNER_PAGE} from '@app/components/request-list-widget';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

import * as gqlService from '@app/services/inkiriApi/graphql'

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
      intl:                {},
      view_requests:       false,
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

  componentDidMount(){
    const {formatMessage} = this.props.intl;
    const pushing_tx = formatMessage({id:'pages.common.deposit.pushing_tx'});
    const loading = formatMessage({id:'pages.common.deposit.loading'});
    const cant_fetch_next_envelope_id = formatMessage({id:'pages.common.deposit.cant_fetch_next_envelope_id'});
    const internet_connection_error = formatMessage({id:'pages.common.deposit.internet_connection_error'});
    const confirm_deposit_request = formatMessage({id:'pages.common.deposit.confirm_deposit_request'});
    const valid_number_required_description = formatMessage({id:'pages.common.deposit.valid_number_required_description'});
    const info_type_envelope_id = formatMessage({id:'pages.common.deposit.info_type_envelope_id'});
    const currency_validator = formatMessage({id:'pages.common.deposit.currency_validator'});
    const currency_label = formatMessage({id:'pages.common.deposit.currency_label'});
    const amount_input_validator = formatMessage({id:'pages.common.deposit.amount_input_validator'});
    const request_deposit_action = formatMessage({id:'pages.common.deposit.request_deposit_action'});
    const title = formatMessage({id:'pages.common.deposit.title'});
    const subtitle = formatMessage({id:'pages.common.deposit.subtitle'});
    const amount_text = formatMessage({id:'global.amount'})
    const view_requests = formatMessage({id:'global.view_requests'})
    this.setState({intl:{view_requests, amount_text, pushing_tx, loading, cant_fetch_next_envelope_id, internet_connection_error, confirm_deposit_request, valid_number_required_description, info_type_envelope_id, currency_validator, currency_label, amount_input_validator, request_deposit_action, title, subtitle}});

    this.getNextEnvelopeId();
  }

  componentDidUpdate(prevProps, prevState) 
  {
    let new_state = {};
    if(prevProps.isFetching!=this.props.isFetching){
      new_state = {...new_state, isFetching:this.props.isFetching}
    }
    if(!utils.arraysEqual(prevProps.getResults, this.props.getResults) ){
      const lastResult = this.props.getLastResult;
      if(lastResult)
      {
        const that = this;
        setTimeout(()=> that.resetPage() ,100);
      }
    }

    if(Object.keys(new_state).length>0)      
        this.setState(new_state);
  }
  
  getNextEnvelopeId = async () => {

    try{
      const data = await gqlService.maxRequestId({});
      console.log(data)
      const envelope_id = parseInt(data) + 1;
      this.setState ({loading:false, envelope_id: envelope_id});
    }
    catch(e)
    {
      this.setState({loading:false});
      components_helper.notif.exceptionNotification(this.state.intl.cant_fetch_next_envelope_id, e);
    }
    
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
    const {formatMessage} = this.props.intl;
    this.props.form.validateFields((err, values) => {
      if(err){
        components_helper.notif.errorNotification( formatMessage({id:'errors.validation_title'}), formatMessage({id:'errors.verify_on_screen'}) )    
        return;
      }
      
      const {input_amount} = this.state;
      const sender         = that.props.actualAccountName;
      const amount_string  = this.inputAmountToString();
      const confirm_deposit_request_message = formatMessage({id:'pages.common.deposit.confirm_deposit_request_message'}, {amount:amount_string});
      Modal.confirm({
        title:   this.state.intl.confirm_deposit_request,
        content: confirm_deposit_request_message,
        onOk() {
          const {input_amount} = that.state;
          const _function = 'bank.createDeposit';
          that.props.callAPI(_function, [sender, input_amount.value, input_amount.symbol])
          
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
      
      return(<div className="styles standardList" style={{backgroundColor:'#fff', marginTop: 24, padding: 8 }}>
              <TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />
            </div>)
    }
    //

    if(this.state.view_requests==true)
    {
      return   <div className="styles standardList" style={{backgroundColor:'#fff', marginTop: 24, padding: 8 }}>
                  <RequestListWidget
                      hide_stats={true}
                      request_type={globalCfg.api.TYPE_DEPOSIT}
                      the_key={'deposits'}
                      filter_hidden_fields={['requested_type', 'to', 'from']}
                      mode={REQUEST_MODE_INNER_PAGE}
                  />
                </div>;
    }
    //
    const { getFieldDecorator }               = this.props.form;
    const { input_amount, isFetching, loading, envelope_id} = this.state;
    const my_currencies                       = [globalCfg.currency.symbol, globalCfg.currency.fiat.symbol];
    const loading_text = isFetching
      ?this.state.intl.pushing_tx
      :(loading
        ?this.state.intl.loading
        :'');

    return (
      <div style={{ margin: '0 0px', padding: 24}}>
        <div className="ly-main-content content-spacing cards">
          <section className="mp-box mp-box__shadow money-transfer__box">
            <Spin spinning={isFetching||loading} delay={500} tip={loading_text}>
              <Form onSubmit={this.handleSubmit}>
                <div className="money-transfer">    
                  
                  <div className="money-transfer__row row-complementary money-transfer__select row-complementary-bottom flex_row" >
                      <div className="badge badge-extra-small badge-circle addresse-avatar display_block">
                          <span className="picture">
                            <FontAwesomeIcon icon="envelope" size="lg" color="black"/>
                          </span>
                      </div>
                      <div className="money-transfer__input money-transfer__select">
                        <span>{this.state.intl.info_type_envelope_id}<br/>
                          <strong style={{fontWeight:600, fontSize:24}}>{utils.pad(envelope_id)}</strong>
                        </span>
                      </div>
                  </div>
                  
                  <div className="money-transfer__row row-complementary money-transfer__select flex_row" >
                      <div className="badge badge-extra-small badge-circle addresse-avatar display_block">
                          <span className="picture">
                            <FontAwesomeIcon icon="dollar-sign" size="lg" color="black"/>
                          </span>
                      </div>
                      <div className="money-transfer__input money-transfer__select">
                        <Form.Item>
                            {getFieldDecorator( 'input_amount.symbol', {
                              rules: [{ required: true, message: this.state.intl.currency_validator}]
                              , initialValue: input_amount.symbol
                              , onChange: this.symbolChange
                            })(
                              <Select placeholder={this.state.intl.currency_label} optionLabelProp="label" className="select-price__currency">
                              {my_currencies.map( opt => <Select.Option key={opt} value={opt} label={opt}>{ opt } </Select.Option> )}
                              </Select>
                            )}
                        </Form.Item>
                      </div>
                  </div>

                  <Form.Item label={this.state.intl.amount_text} className="money-transfer__row input-price" style={{textAlign: 'center'}}>
                        {getFieldDecorator('input_amount.value', {
                          rules: [{ required: true
                                    , message: this.state.intl.amount_input_validator
                                    , whitespace: true
                                    , validator: this.checkPrice }],
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
                  <Button size="large" key="requestButton" htmlType="submit" type="primary" loading={isFetching||loading} >
                    {this.state.intl.request_deposit_action}
                  </Button>
                </div>

              </Form>  
            </Spin>
          </section>
        </div>
      </div> 
    );
  }
  
  // ** hack for sublime renderer ** //

  render() {
    let content                   = this.renderContent();
    const {intl, loading, routes} = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={this.state.intl.title}
          subTitle={this.state.intl.subtitle}
           extra={[
             <span className="view_requests" key="view_requests_switch"> {intl.view_requests}&nbsp;<Switch key='view_requests' onChange={ (checked) => this.setState({view_requests:checked})} loading={loading} /></span>
          ]}
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
        isLoading:          loginRedux.isLoading(state),
    
        isFetching:         apiRedux.isFetching(state),
        getResults:         apiRedux.getResults(state),
        getLastResult:      apiRedux.getLastResult(state),
    }),
    (dispatch)=>({
        callAPI:     bindActionCreators(apiRedux.callAPI, dispatch),
        clearAll:    bindActionCreators(apiRedux.clearAll, dispatch),
        
    })
)(injectIntl(DepositMoney)) ));