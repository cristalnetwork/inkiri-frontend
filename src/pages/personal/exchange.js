import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as apiRedux from '@app/redux/models/api';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import PropTypes from "prop-types";

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Select, Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { Upload, notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import ExchangeForm from '@app/components/Form/exchange';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';
// import './requestPayment.css'; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const { TextArea } = Input;

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
class Exchange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
      routes :             routesService.breadcrumbForPaths(props.location.pathname),

      ...DEFAULT_RESULT,
      
      uploading:          false,
      isFetching:         false
      
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                = this.resetResult.bind(this); 

    this.userResultEvent            = this.userResultEvent.bind(this); 
  }

  componentDidUpdate(prevProps, prevState) 
  {
    let new_state = {};
    if(prevProps.isFetching!=this.props.isFetching){
      new_state = {...new_state, isFetching:this.props.isFetching}
    }
    if(prevProps.getErrors!=this.props.getErrors){
      // const ex = this.props.getLastError;
      // new_state = {...new_state, 
      //     getErrors:     this.props.getErrors, 
      //     result:        ex?'error':undefined, 
      //     error:         ex?JSON.stringify(ex):null}
      // if(ex)
      //   components_helper.notif.exceptionNotification("An error occurred!", ex);
    }
    if(prevProps.getResults!=this.props.getResults){
      const lastResult = this.props.getLastResult;
      if(lastResult)
      {  
        const that = this;
        setTimeout(()=> that.resetPage() ,100);
        // components_helper.notif.successNotification('Operation completed successfully')
      }
    }


    if(Object.keys(new_state).length>0)      
        this.setState(new_state);
  }

  

  handleSubmit = e => {
    // console.log(' Exchange for submitted ', JSON.stringify(e))

    const {amount, bank_account, bank_account_object, attachments_array} = e;
    const privateKey       = this.props.actualPrivateKey;
    const sender           = this.props.actualAccountName;
    const exchange_account = globalCfg.bank.exchange_account; 
    let that               = this;
    
    const steps= [
      {
        _function:           'bank.createExchangeRequest'
        , _params:           [sender, amount, bank_account_object, attachments_array]
      }, 
      {
        _function:           'requestExchange'
        , _params:           [sender, privateKey, exchange_account, amount, bank_account] 
        , last_result_param: [{field_name:'id', result_idx_diff:-1}]
        , on_failure:        {
                                _function:           'bank.failedWithdraw'
                                , _params:           [sender] 
                                , last_result_param: [{field_name:'id', result_idx_diff:-1}]
                              }
      },
      {
        _function:           'bank.updateExchangeRequest'
        , _params:           [sender] 
        , last_result_param: [{field_name:'id', result_idx_diff:-2}, {field_name:'transaction_id', result_idx_diff:-1}]
      },
    ]

    that.props.callAPIEx(steps);
    
  };

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/common/extrato`
    })
  }

  resetResult(){
    this.setState({...DEFAULT_RESULT});
    console.log(' resetResult >> resetChildForm ')
    if(this.childForm)
    {
      const that = this;
      setTimeout(()=> that.childForm.resetForm() ,50);
    }
    
  }

  resetPage(){
    
    this.setState({...DEFAULT_RESULT});
    console.log(' resetPage >> resetChildForm ')
    if(this.childForm)
    {

      const that = this;
      setTimeout(()=> that.childForm.resetForm() ,50);
    }
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

  renderContent() {
    const {isFetching} = this.state;
    if(this.state.result)
    {
      const result_type = this.state.result;
      const title       = null;
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      return(<TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />)
    }

    
    
    return (
      <Spin spinning={isFetching} delay={500} tip="Pushing transaction...">
        <ExchangeForm onRef={ref => (this.childForm = ref)}  key="exchange_form" alone_component={false} button_text="REQUEST EXCHANGE" callback={this.handleSubmit} />    
      </Spin>
    );

  }
  //

  render() {
    let content     = this.renderContent();
    const {routes}  = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title="Request an exchange">
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
        accounts:         accountsRedux.accounts(state),
        actualAccountName:loginRedux.actualAccountName(state),
        actualRole:       loginRedux.actualRole(state),
        actualPrivateKey: loginRedux.actualPrivateKey(state),
        isLoading:        loginRedux.isLoading(state),
        personalAccount:  loginRedux.personalAccount(state),
        
        isFetching:       apiRedux.isFetching(state),
        getErrors:        apiRedux.getErrors(state),
        getLastError:     apiRedux.getLastError(state),
        getResults:       apiRedux.getResults(state),
        getLastResult:    apiRedux.getLastResult(state),
    }),
    (dispatch)=>({
        callAPIEx:        bindActionCreators(apiRedux.callAPIEx, dispatch),
        clearAll:         bindActionCreators(apiRedux.clearAll, dispatch),

    })
)(Exchange) )
);
