import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import { Route, Redirect, withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Form, Select, Icon, Input, Card, PageHeader, Tag, Tabs, Button, Row, Col } from 'antd';
import TableStats, { buildItemUp, buildItemDown, buildItemCompute, buildItemSimple} from '@app/components/TransactionTable/stats';

import { notification, Table, Divider, Spin } from 'antd';

import * as request_helper from '@app/components/TransactionCard/helper';
import TransactionTable from '@app/components/TransactionTable';
import { columns,  DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_EXCHANGES, DISPLAY_PAYMENTS, DISPLAY_REQUESTS, DISPLAY_WITHDRAWS, DISPLAY_PROVIDER, DISPLAY_SEND, DISPLAY_SERVICE} from '@app/components/TransactionTable';

import * as utils from '@app/utils/utils';
import * as columns_helper from '@app/components/TransactionTable/columns';
import { DatePicker } from 'antd';
import moment from 'moment';

const { MonthPicker, RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search, TextArea } = Input;

const tabs = {
  [DISPLAY_ALL_TXS] : 'Movements',
  [DISPLAY_DEPOSIT] : 'Deposits',
  [DISPLAY_WITHDRAWS] : 'Withdraws',
  [DISPLAY_EXCHANGES] : 'Exchanges',
  [DISPLAY_SERVICE] : 'Services',
  [DISPLAY_PAYMENTS] : 'Payments',
  // [DISPLAY_REQUESTS] : 'Requests',
}

class Extrato extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      isMobile:            props.isMobile,
      loading:             false,
      txs:                 [],
      // deposits:         [],
      // withdraws:        [],

      stats:               {},
      
      need_refresh:        {},  

      cursor:              '',
      balance:             {},
      pagination:          { pageSize: 0 , total: 0 },
      active_tab:          DISPLAY_ALL_TXS
    };

    this.loadTransactionsForAccount = this.loadTransactionsForAccount.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.onTabChange                = this.onTabChange.bind(this);
    this.onTableChange              = this.onTableChange.bind(this);
    this.onTransactionClick         = this.onTransactionClick.bind(this);
    this.onRequestClick             = this.onRequestClick.bind(this);
    this.refreshCurrentTable        = this.refreshCurrentTable.bind(this);
    this.renderFilterContent        = this.renderFilterContent.bind(this);
  }
  
  onTransactionClick(transaction){
    // console.log( ' EXTRATO::onTransactionClick >> transaction', JSON.stringify(transaction) )
    console.log( ' EXTRATO::onTransactionClick >> referrer: ', this.props.location.pathname)
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: '/common/transaction-details'
      , state: { 
          transaction: transaction
          , referrer: this.props.location.pathname
        }
    })
  }

  onRequestClick(request){
    // console.log( ' EXTRATO::onRequestClick >> ', JSON.stringify(request) )

    console.log( ' EXTRATO::onRequestClick >> ')
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: '/common/request-details'
      , state: { 
          request: request 
          , referrer: this.props.location.pathname
        }
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.props.isMobile!=prevProps.isMobile)
      this.setState({isMobile:this.props.isMobile})
  }

  componentDidMount(){
    this.loadTransactionsForAccount(true);  
  } 

  
  loadTransactionsForAccount(is_first){

    let account_name = this.props.actualAccountName;
    
    let that = this;
    this.setState({loading:true});
    
    that.onNewData({"txs":[{"id":"40fae13fe8684c0c8be2d963f50cbeb06241ab83d678c09b462a55e9f83f2b02","block_time":"2019-12-03T18:38:58","block_time_number":20191203183858,"transaction_id":"40fae13fe8684c0c8be2d963f50cbeb06241ab83d678c09b462a55e9f83f2b02","block_num":63307461,"account":"cristaltoken","name":"chargepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"from":"tutinopablo1","memo":"pap|pay|3","quantity":"9.0000 INK","service_id":3,"to":"organicvegan"},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a503000000905f01000000000004494e4b00000000097061707c7061797c33","operations":[{"sub_header":"Charge Pre Authorized Payment - Period 3 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin":"Charge Pre Authorized Payment - Period 3 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 3 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":9}],"sub_header":"Charge Pre Authorized Payment - Period 3 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin":"Charge Pre Authorized Payment - Period 3 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 3 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":9},{"id":"cab40aacd5b2f43ef205ea52b8d02e6df88d507276f44197b4f42d321a9bcd95","block_time":"2019-12-03T18:32:48","block_time_number":20191203183248,"transaction_id":"cab40aacd5b2f43ef205ea52b8d02e6df88d507276f44197b4f42d321a9bcd95","block_num":63306727,"account":"cristaltoken","name":"chargepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"from":"tutinopablo1","memo":"pap|pay|2","quantity":"9.0000 INK","service_id":3,"to":"organicvegan"},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a503000000905f01000000000004494e4b00000000097061707c7061797c32","operations":[{"sub_header":"Charge Pre Authorized Payment - Period 2 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin":"Charge Pre Authorized Payment - Period 2 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 2 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":9}],"sub_header":"Charge Pre Authorized Payment - Period 2 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin":"Charge Pre Authorized Payment - Period 2 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 2 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":9},{"id":"c709ffed61f2fb7da505aaf4196d48fe2667ae0f28d343165e923b2db29c9586","block_time":"2019-12-03T15:08:05","block_time_number":20191203150805,"transaction_id":"c709ffed61f2fb7da505aaf4196d48fe2667ae0f28d343165e923b2db29c9586","block_num":63282383,"account":"cristaltoken","name":"chargepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"from":"tutinopablo1","memo":"pap|pay|1","service_id":3,"to":"organicvegan"},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a503000000097061707c7061797c31","operations":[{"sub_header":"Charge Pre Authorized Payment - Period 1 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin":"Charge Pre Authorized Payment - Period 1 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 1 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"sub_header":"Charge Pre Authorized Payment - Period 1 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin":"Charge Pre Authorized Payment - Period 1 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 1 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"99b25d6b16da4445c082251edb2cd6d9d102dc560b81fdb1d080bf77d075206e","block_time":"2019-12-03T15:07:51","block_time_number":20191203150751,"transaction_id":"99b25d6b16da4445c082251edb2cd6d9d102dc560b81fdb1d080bf77d075206e","block_num":63282354,"account":"cristaltoken","name":"transfer","authorization":[{"actor":"aranadalmiro","permission":"active"}],"data":{"from":"aranadalmiro","memo":"snd|","quantity":"50.0000 INK","to":"tutinopablo1"},"hex_data":"40af93d12433cd3510683ca6d2e9b2ce20a107000000000004494e4b0000000004736e647c","operations":[{"sub_header":"@aranadalmiro te ha enviado dinero","sub_header_admin":"Envío de dinero","sub_header_admin_ex":"@aranadalmiro le ha enviado dinero a @tutinopablo1.","from":"aranadalmiro","to":"tutinopablo1","tx_type":"transfer_snd","request":{"requested_type":"type_send","request_id":null,"request_counter":null},"i_sent":false,"amount":50}],"sub_header":"@aranadalmiro te ha enviado dinero","sub_header_admin":"Envío de dinero","sub_header_admin_ex":"@aranadalmiro le ha enviado dinero a @tutinopablo1.","from":"aranadalmiro","to":"tutinopablo1","tx_type":"transfer_snd","request":{"requested_type":"type_send","request_id":null,"request_counter":null},"i_sent":false,"amount":50},{"id":"8952f686cd048d34a743e500222164a34ac31b1773311efae19c955f7314421e","block_time":"2019-12-03T11:47:34","block_time_number":20191203114734,"transaction_id":"8952f686cd048d34a743e500222164a34ac31b1773311efae19c955f7314421e","block_num":63258514,"account":"cristaltoken","name":"upsertpap","authorization":[{"actor":"tutinopablo1","permission":"active"}],"data":{"begins_at":1561950000,"enabled":1,"from":"tutinopablo1","last_charged":0,"memo":"pap|undefined","periods":6,"price":"9.0000 INK","service_id":3,"to":"organicvegan"},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a503000000905f01000000000004494e4b000000003077195d0600000000000000010000000d7061707c756e646566696e6564","operations":[{"sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"62d4020514cf4b063838b51bcff14fafe449d0f76df1b0f9dddfabd71dcdd9a8","block_time":"2019-12-03T02:34:57","block_time_number":20191203023457,"transaction_id":"62d4020514cf4b063838b51bcff14fafe449d0f76df1b0f9dddfabd71dcdd9a8","block_num":63192817,"account":"cristaltoken","name":"erasepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"account":"tutinopablo1","memo":"","provider":"organicvegan","service_id":2},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a50200000000","operations":[{"sub_header":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"sub_header":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"f1adc76ff9a06f1922ab1eb065a9d99b1d826f4cf79672a6d9174f22f6308127","block_time":"2019-12-03T01:29:24","block_time_number":20191203012924,"transaction_id":"f1adc76ff9a06f1922ab1eb065a9d99b1d826f4cf79672a6d9174f22f6308127","block_num":63185016,"account":"cristaltoken","name":"upsertpap","authorization":[{"actor":"tutinopablo1","permission":"active"}],"data":{"account":"tutinopablo1","begins_at":1575169200,"enabled":1,"last_charged":0,"memo":"pap|undefined","periods":1,"price":"13.0000 INK","provider":"organicvegan","service_id":2},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a502000000d0fb01000000000004494e4b00000000b02ce35d0100000000000000010000000d7061707c756e646566696e6564","operations":[{"sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"e5e64562cf5b75b1eb90f2f3eb2c0dd0cfc6c01b2b2d042e2374f5ae18489313","block_time":"2019-12-02T22:18:28","block_time_number":20191202221828,"transaction_id":"e5e64562cf5b75b1eb90f2f3eb2c0dd0cfc6c01b2b2d042e2374f5ae18489313","block_num":63162314,"account":"cristaltoken","name":"erasepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"account":"tutinopablo1","memo":"","provider":"organicvegan","service_id":2},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a50200000000","operations":[{"sub_header":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"sub_header":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"ddfc958b16e980fd671b8bcb49d6e3dbab1a7f152ee95ee3768599ab6364b599","block_time":"2019-12-02T14:32:31","block_time_number":20191202143231,"transaction_id":"ddfc958b16e980fd671b8bcb49d6e3dbab1a7f152ee95ee3768599ab6364b599","block_num":63106895,"account":"cristaltoken","name":"upsertpap","authorization":[{"actor":"tutinopablo1","permission":"active"}],"data":{"account":"tutinopablo1","begins_at":1575169200,"enabled":1,"last_charged":0,"memo":"pap|undefined","periods":1,"price":"13.0000 INK","provider":"organicvegan","service_id":2},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a502000000d0fb01000000000004494e4b00000000b02ce35d0100000000000000010000000d7061707c756e646566696e6564","operations":[{"sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"676ab9bf40511d164b6d597b6d27eed60da631d66c9a616d59da46cc7be3a7ba","block_time":"2019-12-02T14:19:21","block_time_number":20191202141921,"transaction_id":"676ab9bf40511d164b6d597b6d27eed60da631d66c9a616d59da46cc7be3a7ba","block_num":63105331,"account":"cristaltoken","name":"erasepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"account":"tutinopablo1","memo":"","provider":"organicvegan","service_id":1},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a50100000000","operations":[{"sub_header":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#1","sub_header_admin":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#1","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#1","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"sub_header":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#1","sub_header_admin":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#1","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#1","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"4d64bc6e7719fe828f731c2949f8acfdb5c018456867b356867085710f5d95e4","block_time":"2019-12-02T12:39:54","block_time_number":20191202123954,"transaction_id":"4d64bc6e7719fe828f731c2949f8acfdb5c018456867b356867085710f5d95e4","block_num":63093504,"account":"cristaltoken","name":"upsertpap","authorization":[{"actor":"tutinopablo1","permission":"active"}],"data":{"account":"tutinopablo1","begins_at":1572577200,"enabled":1,"last_charged":0,"memo":"pap|undefined","periods":2,"price":"50.0000 INK","provider":"organicvegan","service_id":1},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a50100000020a107000000000004494e4b00000000b09fbb5d0200000000000000010000000d7061707c756e646566696e6564","operations":[{"sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"c1d3d50a3e4192fe6af57132d7caa9b8572f2399303c87a6839b7c9d49713cdb","block_time":"2019-11-28T20:24:37","block_time_number":20191128202437,"transaction_id":"c1d3d50a3e4192fe6af57132d7caa9b8572f2399303c87a6839b7c9d49713cdb","block_num":62467125,"account":"eosio","name":"newaccount","authorization":[{"actor":"cristaltoken","permission":"active"}],"data":{"active":{"accounts":[],"keys":[{"key":"EOS7YUugC9BZV4QMXM7b1vsM4FXXKLBc3TBaueZSLYSCXWhpjhpSk","weight":1}],"threshold":1,"waits":[]},"creator":"cristaltoken","name":"tutinopablo1","owner":{"accounts":[{"permission":{"actor":"cristaltoken","permission":"active"},"weight":1}],"keys":[{"key":"EOS7YUugC9BZV4QMXM7b1vsM4FXXKLBc3TBaueZSLYSCXWhpjhpSk","weight":1}],"threshold":1,"waits":[]}},"hex_data":"3015a4399a8cdd4510683ca6d2e9b2ce010000000100035da88f10142d136501a0d87f70d5c089a8342f085bb6d2e6f51e70b85ce772d40100013015a4399a8cdd4500000000a8ed3232010000010000000100035da88f10142d136501a0d87f70d5c089a8342f085bb6d2e6f51e70b85ce772d401000000","operations":[{"sub_header":"Account creation: @tutinopablo1","sub_header_admin":"Account creation: @tutinopablo1","sub_header_admin_ex":"Account creation: @tutinopablo1","tx_type":"newaccount_","request":{"requested_type":"type_new_account","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"sub_header":"buyrambytes - tx_type=[buyrambytes_] | [{\"bytes\":4096,\"payer\":\"cristaltoken\",\"receiver\":\"tutinopablo1\"}]","sub_header_admin":"buyrambytes - tx_type=[buyrambytes_] | [{\"bytes\":4096,\"payer\":\"cristaltoken\",\"receiver\":\"tutinopablo1\"}]","sub_header_admin_ex":"buyrambytes - tx_type=[buyrambytes_] | [{\"bytes\":4096,\"payer\":\"cristaltoken\",\"receiver\":\"tutinopablo1\"}]","tx_type":"buyrambytes_","request":{"requested_type":"type_unknown","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"sub_header":"delegatebw - tx_type=[delegatebw_] | [{\"from\":\"cristaltoken\",\"receiver\":\"tutinopablo1\",\"stake_cpu_quantity\":\"0.2500 EOS\",\"stake_net_quantity\":\"0.2500 EOS\",\"transfer\":0}]","sub_header_admin":"delegatebw - tx_type=[delegatebw_] | [{\"from\":\"cristaltoken\",\"receiver\":\"tutinopablo1\",\"stake_cpu_quantity\":\"0.2500 EOS\",\"stake_net_quantity\":\"0.2500 EOS\",\"transfer\":0}]","sub_header_admin_ex":"delegatebw - tx_type=[delegatebw_] | [{\"from\":\"cristaltoken\",\"receiver\":\"tutinopablo1\",\"stake_cpu_quantity\":\"0.2500 EOS\",\"stake_net_quantity\":\"0.2500 EOS\",\"transfer\":0}]","tx_type":"delegatebw_","request":{"requested_type":"type_unknown","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"sub_header":"Customer creation: @tutinopablo1. Type: personal","sub_header_admin":"Customer creation: @tutinopablo1. Type: personal","sub_header_admin_ex":"Customer creation: @tutinopablo1. Type: personal","tx_type":"upsertcust_","request":{"requested_type":"type_upsert_cust","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"sub_header":"Account creation: @tutinopablo1","sub_header_admin":"Account creation: @tutinopablo1","sub_header_admin_ex":"Account creation: @tutinopablo1","tx_type":"newaccount_","request":{"requested_type":"type_new_account","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"cursor":""});
    
    // api.listTransactions(account_name, (is_first===true?undefined:this.state.cursor) )
    // .then( (res) => {
    //     that.onNewData(res.data);
    //     // console.log(JSON.stringify(res.data));
    //   } ,(ex) => {
    //     // console.log(' -- extrato.js::listTransactions ERROR --');
    //     // console.log('---- ERROR:', JSON.stringify(ex));
    //     this.openNotificationWithIcon('error', 'An error occurred when loading transactions.', JSON.stringify(ex))
    //     that.setState({loading:false});  
    //   } 
    // );
    
  }

  onNewData(data){
    
    const _txs           = [...this.state.txs, ...data.txs];
    const pagination     = {...this.state.pagination};
    pagination.pageSize  = _txs.length;
    pagination.total     = _txs.length;

    // console.log(' >>>>>>>>>>> this.state.cursor:', this.state.cursor)
    // console.log(' >>>>>>>>>>> data.cursor:', data.cursor)
    // console.log(' >> PERSONAL EXTRATO >> data:', JSON.stringify(data.txs));
    
    this.setState({pagination:pagination, txs:_txs, cursor:data.cursor, loading:false})


    if(!data.txs || data.txs.length==0)
    {
      this.openNotificationWithIcon("info", "End of transactions","You have reached the end of transaction list!")
    }
    else{
      this.computeStats(_txs);
    }
  }

  computeStats(txs){
    let stats = this.currentStats();
    
    if(txs===undefined)
      txs = this.state.txs;
    
    const money_in  = txs.filter( tx => !request_helper.blockchain.isNegativeTransaction(tx) 
                                        && request_helper.blockchain.isValidTransaction(tx))
                    .map(tx =>tx.amount)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const money_out = txs.filter( tx => request_helper.blockchain.isNegativeTransaction(tx)
                                        && request_helper.blockchain.isValidTransaction(tx))
                    .map(tx =>tx.amount)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    
    stats[this.state.active_tab] = {money_out:money_out, money_in:money_in, count:txs.length}
    this.setState({stats:stats})
  }

  currentStats(){
    const x = this.state.stats[this.state.active_tab];
    const _default = {money_in:  0,money_out: 0, count:0};
    return x?x:_default;
  }

  refreshCurrentTable(){
    const that = this;
    
    if(this.state.active_tab==DISPLAY_ALL_TXS)
    {
      this.setState(
        {txs:[]}
        , ()=>{
          that.loadTransactionsForAccount(true);
        })
      return;
    }

    let need_refresh = this.state.need_refresh;
    need_refresh[this.state.active_tab]=true;
    this.setState(
        {need_refresh:need_refresh}
        , ()=>{
          need_refresh[this.state.active_tab]=false;
          that.setState({need_refresh:need_refresh})
        })
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  // Component Events

  onTabChange(key) {
    // console.log(key);
    this.setState({active_tab:key})
  }
  
  onTableChange(key, txs) {
    // console.log(key);
    // this.setState({active_tab:key})
    if(key==this.state.active_tab )
      this.computeStats(txs);
  }

  /* *********************************
   * Begin RENDER section
  */
  
  //
  renderSelectTxTypeOptions(){
    return (
      globalCfg.api.getTypes().map( tx_type => {return(<Option key={'option'+tx_type} value={tx_type} label={utils.firsts(tx_type.split('_')[1])}>{ utils.capitalize(tx_type.split('_')[1]) } </Option>)})
        )
  }
  // 
  renderSelectInOutOptions(){
    return (
      ['all', 'in', 'out'].map( tx_state => {return(<Option key={'option'+tx_state} value={tx_state} label={utils.firsts(tx_state)}>{ utils.capitalize(tx_state) } </Option>)})
        )
  }
  // 
  renderSelectAccountTypeOptions(){
    return (
      globalCfg.bank.listAccountTypes().map( tx_state => {return(<Option key={'option'+tx_state} value={tx_state} label={utils.firsts(tx_state)}>{ utils.capitalize(tx_state) } </Option>)})
        )
  }
  //
  renderFilterContent() {
    if(this.state.isMobile)
      return (null);
    const dateFormat = 'YYYY/MM/DD';
    return (
      <div className="filter_wrap">
        <Row>
          <Col span={24}>
            <Form layout="inline" className="filter_form" onSubmit={this.handleSubmit}>
              <Form.Item label="Operation">
                  <Select placeholder="Operation"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">
                      {this.renderSelectTxTypeOptions()}
                  </Select>
              </Form.Item>
              <Form.Item label="Date Range">
                  <RangePicker
                    defaultValue={[moment('2015/01/01', dateFormat), moment('2015/01/01', dateFormat)]}
                    format={dateFormat}
                  />
              </Form.Item>
              <Form.Item label="In-Out">
                <Select placeholder="In-Out"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">
                      {this.renderSelectInOutOptions()}
                  </Select>
              </Form.Item>
              <Form.Item label="Account type">
                <Select placeholder="Account type"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">
                      {this.renderSelectAccountTypeOptions()}
                  </Select>
              </Form.Item>
              <Form.Item label="Search">
                  <Search className="styles extraContentSearch" placeholder="Search" onSearch={() => ({})} />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" disabled>
                  Filter
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
  //
  renderTableViewStats() 
  {
    if(this.state.isMobile)
      return (null);

    const {money_in, money_out, count} = this.currentStats();
    const items = [
        buildItemUp('Entradas', money_in)
        , buildItemDown('Saidas', money_out)
        , buildItemCompute('Variacao de caja', (money_in-money_out))
        , buildItemSimple('Transações', (count||0))
      ]
    return (<TableStats stats_array={items}/>)

  }

  renderFooter(){
    return (<><Button key="load-more-data" disabled={!this.state.cursor} onClick={()=>this.loadTransactionsForAccount(false)}>More!!</Button> </>)
  }

  renderContent(){
    let content = null;
    if(this.state.active_tab==DISPLAY_DEPOSIT){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_DEPOSIT} 
          need_refresh={this.state.need_refresh[DISPLAY_DEPOSIT]}
          request_type={DISPLAY_DEPOSIT} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          />
      );
    }
    //
    if(this.state.active_tab==DISPLAY_WITHDRAWS){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_WITHDRAWS} 
          need_refresh={this.state.need_refresh[DISPLAY_WITHDRAWS]}
          request_type={DISPLAY_WITHDRAWS} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          />
      );
    }
    //
    if(this.state.active_tab==DISPLAY_EXCHANGES){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_EXCHANGES} 
          need_refresh={this.state.need_refresh[DISPLAY_EXCHANGES]}
          request_type={DISPLAY_EXCHANGES} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          />
      );
    }
    //
    if(this.state.active_tab==DISPLAY_SERVICE){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_SERVICE} 
          need_refresh={this.state.need_refresh[DISPLAY_SERVICE]}
          request_type={DISPLAY_SERVICE} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          />
      );
    }
    //

    if(this.state.active_tab==DISPLAY_ALL_TXS){
      content = (
        <Table
          key={"table_"+DISPLAY_ALL_TXS} 
          rowKey={record => record.id} 
          loading={this.state.loading} 
          columns={ columns_helper.getColumnsBlockchainTXs(this.onTransactionClick, this.props.actualRoleId)} 
          dataSource={this.state.txs} 
          footer={() => this.renderFooter()}
          pagination={this.state.pagination}
          scroll={{ x: 700 }}
          />
      );
    }

    return (<div style={{ margin: '0 0px', background: '#fff', minHeight: 360, marginTop: 24  }}>
      {content}</div>)
  }
  //
  render() {
    const {routes, active_tab} = this.state;
    const content              = this.renderContent();
    const stats                = this.renderTableViewStats();
    const filters              = this.renderFilterContent();
    return (
      <>
        <PageHeader
          extra={[
            <Button size="small" key="refresh" icon="redo" disabled={this.state.loading} onClick={()=>this.refreshCurrentTable()} ></Button>,
            
          ]}
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title="Extrato"
          subTitle="List of transactions"
        >
        </PageHeader>

        <div className="styles standardList" style={{ marginTop: 24 }}>
          <Card key={'card_master'}  
            tabList={ Object.keys(tabs).map(key_tab => { return {key: key_tab, tab: tabs[key_tab]} } ) }
            activeTabKey={active_tab}
            onTabChange={ (key) => this.onTabChange(key)}
            >

              {filters}

              {stats}
              
              {content}

          </Card>
        </div>
      </>
    );
  }
  
}

export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:        loginRedux.actualAccountName(state),
        actualRole:               loginRedux.actualRole(state),
        actualRoleId:             loginRedux.actualRoleId(state),
        balance:                  balanceRedux.userBalanceFormatted(state),
        isMobile :                menuRedux.isMobile(state)
    }),
    (dispatch)=>({
        setLastRootMenuFullpath:  bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(Extrato)));