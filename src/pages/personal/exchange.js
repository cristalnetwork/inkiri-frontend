import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

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
      pushingTx:          false
      
    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                  = this.resetResult.bind(this); 

    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.userResultEvent            = this.userResultEvent.bind(this); 
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  handleSubmit = e => {
    // console.log(' Exchange for submitted ', JSON.stringify(e))

    const {amount, bank_account, bank_account_object, attachments_array} = e;
    const privateKey   = this.props.actualPrivateKey;
    const sender       = this.props.actualAccountName;
    let that           = this;
    
    that.setState({pushingTx:true});
      
    api.bank.createExchangeRequest(sender, amount, bank_account_object, attachments_array)
      .then((data) => {
        console.log(' createExchangeRequest::send (then#1) >>  ', JSON.stringify(data));
         
         if(!data || !data.id)
         {
            that.setState({result:'error', uploading: false, pushingTx:false, error:'Cant create request nor upload files.'});
            return;
         }

         const request_id       = data.id;
         const exchange_account = globalCfg.bank.exchange_account; 

         api.requestExchange(sender, privateKey, exchange_account, amount, request_id, bank_account)
          .then((data1) => {

            const send_tx             = data1;
            console.log(' createExchangeRequest::send (then#2) >>  ', JSON.stringify(send_tx));
            
            api.bank.updateExchangeRequest(sender, request_id, undefined, send_tx.data.transaction_id)
              .then((data2) => {

                  that.setState({uploading: false, result:'ok', pushingTx:false, result_object:{transaction_id : send_tx.data.transaction_id, request_id:request_id} });
                  this.openNotificationWithIcon("success", 'Exchange requested successfully');

                }, (ex2) => {
                  console.log(' createExchangeRequest::send (error#3) >>  ', JSON.stringify(ex2));
                  that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex2)});
              });

          }, (ex1) => {
            
            console.log(' SendMoney::send (error#2) >>  ', JSON.stringify(ex1));
            that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex1)});

          });

      }, (ex) => {
        console.log(' createProviderPayment::send (error#1) >>  ', JSON.stringify(ex));
        that.setState({result:'error', uploading: false, pushingTx:false, error:JSON.stringify(ex)});
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
    
    this.setState({...DEFAULT_RESULT});
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
      <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
        <ExchangeForm key="exchange_form" alone_component={false} button_text="REQUEST EXCHANGE" callback={this.handleSubmit} />    
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
          title="Request a payment to a provider">
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
)(Exchange) )
);
