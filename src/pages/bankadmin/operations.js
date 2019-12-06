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

import { Form, Select, Icon, Input, Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';

import { notification, Table, Divider, Spin } from 'antd';

import TransactionTable from '@app/components/TransactionTable';
import TableStats, { buildItemUp, buildItemDown, buildItemCompute, buildItemSimple} from '@app/components/TransactionTable/stats';
import { DISPLAY_PDA, DISPLAY_EXTERNAL, DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_EXCHANGES, DISPLAY_PAYMENTS, DISPLAY_REQUESTS, DISPLAY_WITHDRAWS, DISPLAY_PROVIDER, DISPLAY_SEND, DISPLAY_SERVICE} from '@app/components/TransactionTable';
import * as request_helper from '@app/components/TransactionCard/helper';
import * as columns_helper from '@app/components/TransactionTable/columns';

import * as utils from '@app/utils/utils';

import { DatePicker } from 'antd';
import moment from 'moment';

const { MonthPicker, RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search, TextArea } = Input;

const tabs = {
  [DISPLAY_ALL_TXS] :   'Blockchain transactions',       
  [DISPLAY_PDA] :       'Deposits & Withdraws requests', 
  [DISPLAY_EXTERNAL] :  'External transfers requests',   
}

class Operations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      loading:             false,
      txs:                 [],
      deposits:            [],

      stats:               {},
      
      need_refresh:        {},  

      cursor:              '',
      balance:             {},
      pagination:          { pageSize: 0 , total: 0 },
      active_tab:          DISPLAY_ALL_TXS
    };

    this.loadAllTransactions        = this.loadAllTransactions.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.onTabChange                = this.onTabChange.bind(this);
    this.onTableChange              = this.onTableChange.bind(this);
    
    this.refreshCurrentTable        = this.refreshCurrentTable.bind(this);
    this.renderFilterContent        = this.renderFilterContent.bind(this);

    this.onTransactionClick         = this.onTransactionClick.bind(this);
    this.onRequestClick             = this.onRequestClick.bind(this);
  }
  
  onTransactionClick(transaction){
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
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: `/${this.props.actualRole}/external-transfers-process-request`
      , state: { 
          request: request 
          , referrer: this.props.location.pathname
        }
    })

    // this.props.history.push({
    //   pathname: '/common/request-details'
    //   , state: { 
    //       request: request 
    //       , referrer: this.props.location.pathname
    //     }
    // })
  }

  componentDidMount(){
    this.loadAllTransactions(true);  
  } 

  loadAllTransactions(is_first){

    // const x = {"txs":[{"id":"ef6c0ab04c0cc2cf3e6f2a24f9a542538ac74c5aa361688e65e45f6eb76b4f58","block_time":"2019-12-05T22:33:01","block_time_number":20191205223301,"transaction_id":"ef6c0ab04c0cc2cf3e6f2a24f9a542538ac74c5aa361688e65e45f6eb76b4f58","block_num":63677334,"account":"eosio","name":"newaccount","authorization":[{"actor":"cristaltoken","permission":"active"}],"data":{"active":{"accounts":[],"keys":[{"key":"EOS76r2WAM2XtuQ9AcChRhZc7ZeUQbEYyL2DVpNpkH46z8FKVVRas","weight":1}],"threshold":1,"waits":[]},"creator":"cristaltoken","name":"biz212345abc","owner":{"accounts":[{"permission":{"actor":"cristaltoken","permission":"active"},"weight":1},{"permission":{"actor":"tutinopablo1","permission":"active"},"weight":1}],"keys":[{"key":"EOS76r2WAM2XtuQ9AcChRhZc7ZeUQbEYyL2DVpNpkH46z8FKVVRas","weight":1}],"threshold":1,"waits":[]}},"hex_data":"3015a4399a8cdd45808e29648820be3b010000000100032372f080d3ff24375b513d3317fdc2c732c540f3f140ea5b74e413c97b949a500100023015a4399a8cdd4500000000a8ed3232010010683ca6d2e9b2ce00000000a8ed3232010000010000000100032372f080d3ff24375b513d3317fdc2c732c540f3f140ea5b74e413c97b949a5001000000","operations":[{"header":"Account creation/edition","sub_header":"Account creation/edition: @biz212345abc","sub_header_admin":"Account creation/edition: @biz212345abc","sub_header_admin_ex":"Account creation/edition: @biz212345abc","tx_type":"newaccount_","request":{"requested_type":"type_new_account","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"buyrambytes - buyrambytes_","sub_header":"buyrambytes - buyrambytes_","sub_header_admin":"buyrambytes - buyrambytes_","sub_header_admin_ex":"buyrambytes - buyrambytes_","tx_type":"buyrambytes_","request":{"requested_type":"type_unknown","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"delegatebw - delegatebw_","sub_header":"delegatebw - delegatebw_","sub_header_admin":"delegatebw - delegatebw_","sub_header_admin_ex":"delegatebw - delegatebw_","tx_type":"delegatebw_","request":{"requested_type":"type_unknown","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"Customer creation/edition","sub_header":"Customer creation/edition: @biz212345abc. Type: business","sub_header_admin":"Customer creation/edition: @biz212345abc. Type: business","sub_header_admin_ex":"Customer creation/edition: @biz212345abc. Type: business","tx_type":"upsertcust_","request":{"requested_type":"type_upsert_cust","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Account creation/edition","sub_header":"Account creation/edition: @biz212345abc","sub_header_admin":"Account creation/edition: @biz212345abc","sub_header_admin_ex":"Account creation/edition: @biz212345abc","tx_type":"newaccount_","request":{"requested_type":"type_new_account","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"3799b737201d2ee4a1b84899794d6ef62d443ac948ff90d9a52c204795bb8b47","block_time":"2019-12-05T22:14:18","block_time_number":20191205221418,"transaction_id":"3799b737201d2ee4a1b84899794d6ef62d443ac948ff90d9a52c204795bb8b47","block_num":63675125,"account":"cristaltoken","name":"transfer","authorization":[{"actor":"tutinopablo1","permission":"active"}],"data":{"from":"tutinopablo1","memo":"pay|Payed at store.","quantity":"8.0000 INK","to":"biz112345abc"},"hex_data":"10683ca6d2e9b2ce808e29648810be3b803801000000000004494e4b00000000137061797c50617965642061742073746f72652e","operations":[{"header":"Payment","sub_header":"You paid @biz112345abc","sub_header_admin":"Payment","sub_header_admin_ex":"@tutinopablo1 sent a payment to @biz112345abc","from":"tutinopablo1","to":"biz112345abc","tx_type":"transfer_pay","request":{"requested_type":"type_payment","request_id":null,"request_counter":null},"i_sent":true,"amount":8}],"header":"Payment","sub_header":"You paid @biz112345abc","sub_header_admin":"Payment","sub_header_admin_ex":"@tutinopablo1 sent a payment to @biz112345abc","from":"tutinopablo1","to":"biz112345abc","tx_type":"transfer_pay","request":{"requested_type":"type_payment","request_id":null,"request_counter":null},"i_sent":true,"amount":8},{"id":"b8e1346074f369cb0bc0423d774938dadc85634ed3babc8db5c3e0b300c7ec64","block_time":"2019-12-05T21:44:46","block_time_number":20191205214446,"transaction_id":"b8e1346074f369cb0bc0423d774938dadc85634ed3babc8db5c3e0b300c7ec64","block_num":63671743,"account":"cristaltoken","name":"upsertpap","authorization":[{"actor":"biz112345abc","permission":"active"}],"data":{"begins_at":1569898800,"enabled":1,"from":"biz112345abc","last_charged":0,"memo":"pap|undefined","periods":6,"price":"8.3000 INK","service_id":4,"to":"organicvegan"},"hex_data":"808e29648810be3b300d531bb969d8a504000000384401000000000004494e4b0000000030c1925d0600000000000000010000000d7061707c756e646566696e6564","operations":[{"header":"Pre Authorized Payment Agreement","sub_header":"Pre Authorized Payment. Customer @biz112345abc <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @biz112345abc <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @biz112345abc <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Pre Authorized Payment Agreement","sub_header":"Pre Authorized Payment. Customer @biz112345abc <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @biz112345abc <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @biz112345abc <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"e95524b0b9120f93d9bec02af69b0203fdab7f7d23b0c1c904d74ca4a957f316","block_time":"2019-12-05T20:43:45","block_time_number":20191205204345,"transaction_id":"e95524b0b9120f93d9bec02af69b0203fdab7f7d23b0c1c904d74ca4a957f316","block_num":63664482,"account":"cristaltoken","name":"transfer","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"from":"organicvegan","memo":"snd|testing account selector widget|tx_r_adjustment","quantity":"50.0000 INK","to":"biz112345abc"},"hex_data":"300d531bb969d8a5808e29648810be3b20a107000000000004494e4b0000000033736e647c74657374696e67206163636f756e742073656c6563746f72207769646765747c74785f725f61646a7573746d656e74","operations":[{"header":"Money transfer","sub_header":"You sent money to @biz112345abc","sub_header_admin":"Money transfer","sub_header_admin_ex":"@organicvegan sent money to @biz112345abc.","from":"organicvegan","to":"biz112345abc","tx_type":"transfer_snd","request":{"requested_type":"type_send","request_id":null,"request_counter":null},"i_sent":true,"amount":50}],"header":"Money transfer","sub_header":"You sent money to @biz112345abc","sub_header_admin":"Money transfer","sub_header_admin_ex":"@organicvegan sent money to @biz112345abc.","from":"organicvegan","to":"biz112345abc","tx_type":"transfer_snd","request":{"requested_type":"type_send","request_id":null,"request_counter":null},"i_sent":true,"amount":50},{"id":"73cc8fad97a8f0ae4aab7ab03ea50d6b7e6399feb4904f1556469124ebe133e1","block_time":"2019-12-05T14:35:37","block_time_number":20191205143537,"transaction_id":"73cc8fad97a8f0ae4aab7ab03ea50d6b7e6399feb4904f1556469124ebe133e1","block_num":63620767,"account":"eosio","name":"newaccount","authorization":[{"actor":"cristaltoken","permission":"active"}],"data":{"active":{"accounts":[],"keys":[{"key":"EOS5ba1b26WiXYVtygYBGgPrpBaudnwbjdbgoa4cDc2oEDM3VyhHG","weight":1}],"threshold":1,"waits":[]},"creator":"cristaltoken","name":"biz112345abc","owner":{"accounts":[{"permission":{"actor":"cristaltoken","permission":"active"},"weight":1},{"permission":{"actor":"tutinopablo1","permission":"active"},"weight":1}],"keys":[{"key":"EOS5ba1b26WiXYVtygYBGgPrpBaudnwbjdbgoa4cDc2oEDM3VyhHG","weight":1}],"threshold":1,"waits":[]}},"hex_data":"3015a4399a8cdd45808e29648810be3b010000000100025d4720ac301b5ad4d2942cceceb661b161a95fed964f31ffeb29dcf1400878b80100023015a4399a8cdd4500000000a8ed3232010010683ca6d2e9b2ce00000000a8ed3232010000010000000100025d4720ac301b5ad4d2942cceceb661b161a95fed964f31ffeb29dcf1400878b801000000","operations":[{"header":"Account creation/edition","sub_header":"Account creation/edition: @biz112345abc","sub_header_admin":"Account creation/edition: @biz112345abc","sub_header_admin_ex":"Account creation/edition: @biz112345abc","tx_type":"newaccount_","request":{"requested_type":"type_new_account","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"buyrambytes - buyrambytes_","sub_header":"buyrambytes - buyrambytes_","sub_header_admin":"buyrambytes - buyrambytes_","sub_header_admin_ex":"buyrambytes - buyrambytes_","tx_type":"buyrambytes_","request":{"requested_type":"type_unknown","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"delegatebw - delegatebw_","sub_header":"delegatebw - delegatebw_","sub_header_admin":"delegatebw - delegatebw_","sub_header_admin_ex":"delegatebw - delegatebw_","tx_type":"delegatebw_","request":{"requested_type":"type_unknown","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"Customer creation/edition","sub_header":"Customer creation/edition: @biz112345abc. Type: business","sub_header_admin":"Customer creation/edition: @biz112345abc. Type: business","sub_header_admin_ex":"Customer creation/edition: @biz112345abc. Type: business","tx_type":"upsertcust_","request":{"requested_type":"type_upsert_cust","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Account creation/edition","sub_header":"Account creation/edition: @biz112345abc","sub_header_admin":"Account creation/edition: @biz112345abc","sub_header_admin_ex":"Account creation/edition: @biz112345abc","tx_type":"newaccount_","request":{"requested_type":"type_new_account","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"5b6ab8932771ce122a52141944d428fba60a36acf1ca93978525885390ada688","block_time":"2019-12-05T12:38:49","block_time_number":20191205123849,"transaction_id":"5b6ab8932771ce122a52141944d428fba60a36acf1ca93978525885390ada688","block_num":63606865,"account":"cristaltoken","name":"transfer","authorization":[{"actor":"tutinopablo1","permission":"active"}],"data":{"from":"tutinopablo1","memo":"pay|Payed at store.","quantity":"3.0000 INK","to":"organicvegan"},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a5307500000000000004494e4b00000000137061797c50617965642061742073746f72652e","operations":[{"header":"Payment","sub_header":"You paid @organicvegan","sub_header_admin":"Payment","sub_header_admin_ex":"@tutinopablo1 sent a payment to @organicvegan","from":"tutinopablo1","to":"organicvegan","tx_type":"transfer_pay","request":{"requested_type":"type_payment","request_id":null,"request_counter":null},"i_sent":true,"amount":3}],"header":"Payment","sub_header":"You paid @organicvegan","sub_header_admin":"Payment","sub_header_admin_ex":"@tutinopablo1 sent a payment to @organicvegan","from":"tutinopablo1","to":"organicvegan","tx_type":"transfer_pay","request":{"requested_type":"type_payment","request_id":null,"request_counter":null},"i_sent":true,"amount":3},{"id":"40fae13fe8684c0c8be2d963f50cbeb06241ab83d678c09b462a55e9f83f2b02","block_time":"2019-12-03T18:38:58","block_time_number":20191203183858,"transaction_id":"40fae13fe8684c0c8be2d963f50cbeb06241ab83d678c09b462a55e9f83f2b02","block_num":63307461,"account":"cristaltoken","name":"chargepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"from":"tutinopablo1","memo":"pap|pay|3","quantity":"9.0000 INK","service_id":3,"to":"organicvegan"},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a503000000905f01000000000004494e4b00000000097061707c7061797c33","operations":[{"header":"Charge Pre Authorized Payment$","sub_header":"Charge Pre Authorized Payment - Period 3 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin":"Charge Pre Authorized Payment - Period 3 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 3 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":9}],"header":"Charge Pre Authorized Payment$","sub_header":"Charge Pre Authorized Payment - Period 3 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin":"Charge Pre Authorized Payment - Period 3 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 3 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":9},{"id":"cab40aacd5b2f43ef205ea52b8d02e6df88d507276f44197b4f42d321a9bcd95","block_time":"2019-12-03T18:32:48","block_time_number":20191203183248,"transaction_id":"cab40aacd5b2f43ef205ea52b8d02e6df88d507276f44197b4f42d321a9bcd95","block_num":63306727,"account":"cristaltoken","name":"chargepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"from":"tutinopablo1","memo":"pap|pay|2","quantity":"9.0000 INK","service_id":3,"to":"organicvegan"},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a503000000905f01000000000004494e4b00000000097061707c7061797c32","operations":[{"header":"Charge Pre Authorized Payment$","sub_header":"Charge Pre Authorized Payment - Period 2 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin":"Charge Pre Authorized Payment - Period 2 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 2 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":9}],"header":"Charge Pre Authorized Payment$","sub_header":"Charge Pre Authorized Payment - Period 2 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin":"Charge Pre Authorized Payment - Period 2 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 2 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":9},{"id":"c709ffed61f2fb7da505aaf4196d48fe2667ae0f28d343165e923b2db29c9586","block_time":"2019-12-03T15:08:05","block_time_number":20191203150805,"transaction_id":"c709ffed61f2fb7da505aaf4196d48fe2667ae0f28d343165e923b2db29c9586","block_num":63282383,"account":"cristaltoken","name":"chargepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"from":"tutinopablo1","memo":"pap|pay|1","service_id":3,"to":"organicvegan"},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a503000000097061707c7061797c31","operations":[{"header":"Charge Pre Authorized Payment$","sub_header":"Charge Pre Authorized Payment - Period 1 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin":"Charge Pre Authorized Payment - Period 1 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 1 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Charge Pre Authorized Payment$","sub_header":"Charge Pre Authorized Payment - Period 1 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin":"Charge Pre Authorized Payment - Period 1 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 1 paid. Customer @tutinopablo1 <-> Provider @organicvegan#3","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"99b25d6b16da4445c082251edb2cd6d9d102dc560b81fdb1d080bf77d075206e","block_time":"2019-12-03T15:07:51","block_time_number":20191203150751,"transaction_id":"99b25d6b16da4445c082251edb2cd6d9d102dc560b81fdb1d080bf77d075206e","block_num":63282354,"account":"cristaltoken","name":"transfer","authorization":[{"actor":"aranadalmiro","permission":"active"}],"data":{"from":"aranadalmiro","memo":"snd|","quantity":"50.0000 INK","to":"tutinopablo1"},"hex_data":"40af93d12433cd3510683ca6d2e9b2ce20a107000000000004494e4b0000000004736e647c","operations":[{"header":"Money transfer","sub_header":"You sent money to @tutinopablo1","sub_header_admin":"Money transfer","sub_header_admin_ex":"@aranadalmiro sent money to @tutinopablo1.","from":"aranadalmiro","to":"tutinopablo1","tx_type":"transfer_snd","request":{"requested_type":"type_send","request_id":null,"request_counter":null},"i_sent":true,"amount":50}],"header":"Money transfer","sub_header":"You sent money to @tutinopablo1","sub_header_admin":"Money transfer","sub_header_admin_ex":"@aranadalmiro sent money to @tutinopablo1.","from":"aranadalmiro","to":"tutinopablo1","tx_type":"transfer_snd","request":{"requested_type":"type_send","request_id":null,"request_counter":null},"i_sent":true,"amount":50},{"id":"8952f686cd048d34a743e500222164a34ac31b1773311efae19c955f7314421e","block_time":"2019-12-03T11:47:34","block_time_number":20191203114734,"transaction_id":"8952f686cd048d34a743e500222164a34ac31b1773311efae19c955f7314421e","block_num":63258514,"account":"cristaltoken","name":"upsertpap","authorization":[{"actor":"tutinopablo1","permission":"active"}],"data":{"begins_at":1561950000,"enabled":1,"from":"tutinopablo1","last_charged":0,"memo":"pap|undefined","periods":6,"price":"9.0000 INK","service_id":3,"to":"organicvegan"},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a503000000905f01000000000004494e4b000000003077195d0600000000000000010000000d7061707c756e646566696e6564","operations":[{"header":"Pre Authorized Payment Agreement","sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Pre Authorized Payment Agreement","sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"47f804d4a01d2ca9271a1c8fa5bf7151cca6844d4840b380c3433aa55f3a4291","block_time":"2019-12-03T02:35:00","block_time_number":20191203023500,"transaction_id":"47f804d4a01d2ca9271a1c8fa5bf7151cca6844d4840b380c3433aa55f3a4291","block_num":63192822,"account":"cristaltoken","name":"erasepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"account":"aranadalmiro","memo":"","provider":"organicvegan","service_id":2},"hex_data":"40af93d12433cd35300d531bb969d8a50200000000","operations":[{"header":"Erase Pre Authorized Payment","sub_header":"Erase Pre Authorized Payment. Customer @aranadalmiro <-> Provider @organicvegan#2","sub_header_admin":"Erase Pre Authorized Payment. Customer @aranadalmiro <-> Provider @organicvegan#2","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @aranadalmiro <-> Provider @organicvegan#2","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Erase Pre Authorized Payment","sub_header":"Erase Pre Authorized Payment. Customer @aranadalmiro <-> Provider @organicvegan#2","sub_header_admin":"Erase Pre Authorized Payment. Customer @aranadalmiro <-> Provider @organicvegan#2","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @aranadalmiro <-> Provider @organicvegan#2","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"62d4020514cf4b063838b51bcff14fafe449d0f76df1b0f9dddfabd71dcdd9a8","block_time":"2019-12-03T02:34:57","block_time_number":20191203023457,"transaction_id":"62d4020514cf4b063838b51bcff14fafe449d0f76df1b0f9dddfabd71dcdd9a8","block_num":63192817,"account":"cristaltoken","name":"erasepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"account":"tutinopablo1","memo":"","provider":"organicvegan","service_id":2},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a50200000000","operations":[{"header":"Erase Pre Authorized Payment","sub_header":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Erase Pre Authorized Payment","sub_header":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"f1adc76ff9a06f1922ab1eb065a9d99b1d826f4cf79672a6d9174f22f6308127","block_time":"2019-12-03T01:29:24","block_time_number":20191203012924,"transaction_id":"f1adc76ff9a06f1922ab1eb065a9d99b1d826f4cf79672a6d9174f22f6308127","block_num":63185016,"account":"cristaltoken","name":"upsertpap","authorization":[{"actor":"tutinopablo1","permission":"active"}],"data":{"account":"tutinopablo1","begins_at":1575169200,"enabled":1,"last_charged":0,"memo":"pap|undefined","periods":1,"price":"13.0000 INK","provider":"organicvegan","service_id":2},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a502000000d0fb01000000000004494e4b00000000b02ce35d0100000000000000010000000d7061707c756e646566696e6564","operations":[{"header":"Pre Authorized Payment Agreement","sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Pre Authorized Payment Agreement","sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"ae39e1b5149f30b55c167f146288c19d84732adfd94f392cbe19b3eaef2db574","block_time":"2019-12-03T01:24:12","block_time_number":20191203012412,"transaction_id":"ae39e1b5149f30b55c167f146288c19d84732adfd94f392cbe19b3eaef2db574","block_num":63184400,"account":"cristaltoken","name":"chargepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"account":"aranadalmiro","memo":"pap|pay|2","provider":"organicvegan","service_id":2},"hex_data":"40af93d12433cd35300d531bb969d8a502000000097061707c7061797c32","operations":[{"header":"Charge Pre Authorized Payment$","sub_header":"Charge Pre Authorized Payment - Period 2 paid. Customer @aranadalmiro <-> Provider @organicvegan#2","sub_header_admin":"Charge Pre Authorized Payment - Period 2 paid. Customer @aranadalmiro <-> Provider @organicvegan#2","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 2 paid. Customer @aranadalmiro <-> Provider @organicvegan#2","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Charge Pre Authorized Payment$","sub_header":"Charge Pre Authorized Payment - Period 2 paid. Customer @aranadalmiro <-> Provider @organicvegan#2","sub_header_admin":"Charge Pre Authorized Payment - Period 2 paid. Customer @aranadalmiro <-> Provider @organicvegan#2","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 2 paid. Customer @aranadalmiro <-> Provider @organicvegan#2","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"3970c94ba2320da613c5990278b2d0f1b299b571ffbad423084b679ce46096ba","block_time":"2019-12-03T00:34:13","block_time_number":20191203003413,"transaction_id":"3970c94ba2320da613c5990278b2d0f1b299b571ffbad423084b679ce46096ba","block_num":63178452,"account":"cristaltoken","name":"chargepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"account":"aranadalmiro","memo":"pap|pay|1","provider":"organicvegan","service_id":2},"hex_data":"40af93d12433cd35300d531bb969d8a502000000097061707c7061797c31","operations":[{"header":"Charge Pre Authorized Payment$","sub_header":"Charge Pre Authorized Payment - Period 1 paid. Customer @aranadalmiro <-> Provider @organicvegan#2","sub_header_admin":"Charge Pre Authorized Payment - Period 1 paid. Customer @aranadalmiro <-> Provider @organicvegan#2","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 1 paid. Customer @aranadalmiro <-> Provider @organicvegan#2","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Charge Pre Authorized Payment$","sub_header":"Charge Pre Authorized Payment - Period 1 paid. Customer @aranadalmiro <-> Provider @organicvegan#2","sub_header_admin":"Charge Pre Authorized Payment - Period 1 paid. Customer @aranadalmiro <-> Provider @organicvegan#2","sub_header_admin_ex":"Charge Pre Authorized Payment - Period 1 paid. Customer @aranadalmiro <-> Provider @organicvegan#2","tx_type":"chargepap_pap","request":{"requested_type":"type_charge_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"a72432a00de2721af92e50a328a497dbaae1ff5d640590765d16eef22b0540c6","block_time":"2019-12-02T22:52:27","block_time_number":20191202225227,"transaction_id":"a72432a00de2721af92e50a328a497dbaae1ff5d640590765d16eef22b0540c6","block_num":63166348,"account":"cristaltoken","name":"upsertpap","authorization":[{"actor":"aranadalmiro","permission":"active"}],"data":{"account":"aranadalmiro","begins_at":1569898800,"enabled":1,"last_charged":0,"memo":"pap|undefined","periods":8,"price":"13.0000 INK","provider":"organicvegan","service_id":2},"hex_data":"40af93d12433cd35300d531bb969d8a502000000d0fb01000000000004494e4b0000000030c1925d0800000000000000010000000d7061707c756e646566696e6564","operations":[{"header":"Pre Authorized Payment Agreement","sub_header":"Pre Authorized Payment. Customer @aranadalmiro <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @aranadalmiro <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @aranadalmiro <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Pre Authorized Payment Agreement","sub_header":"Pre Authorized Payment. Customer @aranadalmiro <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @aranadalmiro <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @aranadalmiro <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"e5e64562cf5b75b1eb90f2f3eb2c0dd0cfc6c01b2b2d042e2374f5ae18489313","block_time":"2019-12-02T22:18:28","block_time_number":20191202221828,"transaction_id":"e5e64562cf5b75b1eb90f2f3eb2c0dd0cfc6c01b2b2d042e2374f5ae18489313","block_num":63162314,"account":"cristaltoken","name":"erasepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"account":"tutinopablo1","memo":"","provider":"organicvegan","service_id":2},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a50200000000","operations":[{"header":"Erase Pre Authorized Payment","sub_header":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Erase Pre Authorized Payment","sub_header":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#2","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"06036b9bc470c21fbc99fd25c6ae25ec7e846d92b2789a14bb29ac3b535321b6","block_time":"2019-12-02T21:47:51","block_time_number":20191202214751,"transaction_id":"06036b9bc470c21fbc99fd25c6ae25ec7e846d92b2789a14bb29ac3b535321b6","block_num":63158677,"account":"eosio","name":"newaccount","authorization":[{"actor":"cristaltoken","permission":"active"}],"data":{"active":{"accounts":[],"keys":[{"key":"EOS789g4bMwbGnoonuzEwJmjZ58ZvP1BMtnb3qz8sZwuLiFbwsJbB","weight":1}],"threshold":1,"waits":[]},"creator":"cristaltoken","name":"aranadalmiro","owner":{"accounts":[{"permission":{"actor":"cristaltoken","permission":"active"},"weight":1}],"keys":[{"key":"EOS789g4bMwbGnoonuzEwJmjZ58ZvP1BMtnb3qz8sZwuLiFbwsJbB","weight":1}],"threshold":1,"waits":[]}},"hex_data":"3015a4399a8cdd4540af93d12433cd3501000000010003266915710cc43616e81c9d538b40478d5fb3bdfcb0b0e935c3509d4fea48b2740100013015a4399a8cdd4500000000a8ed323201000001000000010003266915710cc43616e81c9d538b40478d5fb3bdfcb0b0e935c3509d4fea48b27401000000","operations":[{"header":"Account creation/edition","sub_header":"Account creation/edition: @aranadalmiro","sub_header_admin":"Account creation/edition: @aranadalmiro","sub_header_admin_ex":"Account creation/edition: @aranadalmiro","tx_type":"newaccount_","request":{"requested_type":"type_new_account","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"buyrambytes - buyrambytes_","sub_header":"buyrambytes - buyrambytes_","sub_header_admin":"buyrambytes - buyrambytes_","sub_header_admin_ex":"buyrambytes - buyrambytes_","tx_type":"buyrambytes_","request":{"requested_type":"type_unknown","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"delegatebw - delegatebw_","sub_header":"delegatebw - delegatebw_","sub_header_admin":"delegatebw - delegatebw_","sub_header_admin_ex":"delegatebw - delegatebw_","tx_type":"delegatebw_","request":{"requested_type":"type_unknown","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"Customer creation/edition","sub_header":"Customer creation/edition: @aranadalmiro. Type: personal","sub_header_admin":"Customer creation/edition: @aranadalmiro. Type: personal","sub_header_admin_ex":"Customer creation/edition: @aranadalmiro. Type: personal","tx_type":"upsertcust_","request":{"requested_type":"type_upsert_cust","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Account creation/edition","sub_header":"Account creation/edition: @aranadalmiro","sub_header_admin":"Account creation/edition: @aranadalmiro","sub_header_admin_ex":"Account creation/edition: @aranadalmiro","tx_type":"newaccount_","request":{"requested_type":"type_new_account","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"ddfc958b16e980fd671b8bcb49d6e3dbab1a7f152ee95ee3768599ab6364b599","block_time":"2019-12-02T14:32:31","block_time_number":20191202143231,"transaction_id":"ddfc958b16e980fd671b8bcb49d6e3dbab1a7f152ee95ee3768599ab6364b599","block_num":63106895,"account":"cristaltoken","name":"upsertpap","authorization":[{"actor":"tutinopablo1","permission":"active"}],"data":{"account":"tutinopablo1","begins_at":1575169200,"enabled":1,"last_charged":0,"memo":"pap|undefined","periods":1,"price":"13.0000 INK","provider":"organicvegan","service_id":2},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a502000000d0fb01000000000004494e4b00000000b02ce35d0100000000000000010000000d7061707c756e646566696e6564","operations":[{"header":"Pre Authorized Payment Agreement","sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Pre Authorized Payment Agreement","sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"676ab9bf40511d164b6d597b6d27eed60da631d66c9a616d59da46cc7be3a7ba","block_time":"2019-12-02T14:19:21","block_time_number":20191202141921,"transaction_id":"676ab9bf40511d164b6d597b6d27eed60da631d66c9a616d59da46cc7be3a7ba","block_num":63105331,"account":"cristaltoken","name":"erasepap","authorization":[{"actor":"organicvegan","permission":"active"}],"data":{"account":"tutinopablo1","memo":"","provider":"organicvegan","service_id":1},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a50100000000","operations":[{"header":"Erase Pre Authorized Payment","sub_header":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#1","sub_header_admin":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#1","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#1","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Erase Pre Authorized Payment","sub_header":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#1","sub_header_admin":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#1","sub_header_admin_ex":"Erase Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan#1","tx_type":"erasepap_","request":{"requested_type":"type_erase_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"4d64bc6e7719fe828f731c2949f8acfdb5c018456867b356867085710f5d95e4","block_time":"2019-12-02T12:39:54","block_time_number":20191202123954,"transaction_id":"4d64bc6e7719fe828f731c2949f8acfdb5c018456867b356867085710f5d95e4","block_num":63093504,"account":"cristaltoken","name":"upsertpap","authorization":[{"actor":"tutinopablo1","permission":"active"}],"data":{"account":"tutinopablo1","begins_at":1572577200,"enabled":1,"last_charged":0,"memo":"pap|undefined","periods":2,"price":"50.0000 INK","provider":"organicvegan","service_id":1},"hex_data":"10683ca6d2e9b2ce300d531bb969d8a50100000020a107000000000004494e4b00000000b09fbb5d0200000000000000010000000d7061707c756e646566696e6564","operations":[{"header":"Pre Authorized Payment Agreement","sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Pre Authorized Payment Agreement","sub_header":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","sub_header_admin_ex":"Pre Authorized Payment. Customer @tutinopablo1 <-> Provider @organicvegan","tx_type":"upsertpap_pap","request":{"requested_type":"type_upsert_pap","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"a3f877b1de7cba1bd2e3a4d1c75e2754259cc758b1870fc76e5e78ba3d272ed6","block_time":"2019-11-28T20:26:16","block_time_number":20191128202616,"transaction_id":"a3f877b1de7cba1bd2e3a4d1c75e2754259cc758b1870fc76e5e78ba3d272ed6","block_num":62467323,"account":"eosio","name":"newaccount","authorization":[{"actor":"cristaltoken","permission":"active"}],"data":{"active":{"accounts":[],"keys":[{"key":"EOS6D1h6gcE5MfJ2rgeXXPERiaSRM9unM7pn6g2nCJKKAQnVBvEKv","weight":1}],"threshold":1,"waits":[]},"creator":"cristaltoken","name":"organicvegan","owner":{"accounts":[{"permission":{"actor":"cristaltoken","permission":"active"},"weight":1},{"permission":{"actor":"tutinopablo1","permission":"active"},"weight":1}],"keys":[{"key":"EOS6D1h6gcE5MfJ2rgeXXPERiaSRM9unM7pn6g2nCJKKAQnVBvEKv","weight":1}],"threshold":1,"waits":[]}},"hex_data":"3015a4399a8cdd45300d531bb969d8a501000000010002adc14852505a463d3cd176865fda86d4dc75f0fe22cc080e02c72f72c3ce29850100023015a4399a8cdd4500000000a8ed3232010010683ca6d2e9b2ce00000000a8ed323201000001000000010002adc14852505a463d3cd176865fda86d4dc75f0fe22cc080e02c72f72c3ce298501000000","operations":[{"header":"Account creation/edition","sub_header":"Account creation/edition: @organicvegan","sub_header_admin":"Account creation/edition: @organicvegan","sub_header_admin_ex":"Account creation/edition: @organicvegan","tx_type":"newaccount_","request":{"requested_type":"type_new_account","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"buyrambytes - buyrambytes_","sub_header":"buyrambytes - buyrambytes_","sub_header_admin":"buyrambytes - buyrambytes_","sub_header_admin_ex":"buyrambytes - buyrambytes_","tx_type":"buyrambytes_","request":{"requested_type":"type_unknown","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"delegatebw - delegatebw_","sub_header":"delegatebw - delegatebw_","sub_header_admin":"delegatebw - delegatebw_","sub_header_admin_ex":"delegatebw - delegatebw_","tx_type":"delegatebw_","request":{"requested_type":"type_unknown","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"Customer creation/edition","sub_header":"Customer creation/edition: @organicvegan. Type: business","sub_header_admin":"Customer creation/edition: @organicvegan. Type: business","sub_header_admin_ex":"Customer creation/edition: @organicvegan. Type: business","tx_type":"upsertcust_","request":{"requested_type":"type_upsert_cust","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Account creation/edition","sub_header":"Account creation/edition: @organicvegan","sub_header_admin":"Account creation/edition: @organicvegan","sub_header_admin_ex":"Account creation/edition: @organicvegan","tx_type":"newaccount_","request":{"requested_type":"type_new_account","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"c1d3d50a3e4192fe6af57132d7caa9b8572f2399303c87a6839b7c9d49713cdb","block_time":"2019-11-28T20:24:37","block_time_number":20191128202437,"transaction_id":"c1d3d50a3e4192fe6af57132d7caa9b8572f2399303c87a6839b7c9d49713cdb","block_num":62467125,"account":"eosio","name":"newaccount","authorization":[{"actor":"cristaltoken","permission":"active"}],"data":{"active":{"accounts":[],"keys":[{"key":"EOS7YUugC9BZV4QMXM7b1vsM4FXXKLBc3TBaueZSLYSCXWhpjhpSk","weight":1}],"threshold":1,"waits":[]},"creator":"cristaltoken","name":"tutinopablo1","owner":{"accounts":[{"permission":{"actor":"cristaltoken","permission":"active"},"weight":1}],"keys":[{"key":"EOS7YUugC9BZV4QMXM7b1vsM4FXXKLBc3TBaueZSLYSCXWhpjhpSk","weight":1}],"threshold":1,"waits":[]}},"hex_data":"3015a4399a8cdd4510683ca6d2e9b2ce010000000100035da88f10142d136501a0d87f70d5c089a8342f085bb6d2e6f51e70b85ce772d40100013015a4399a8cdd4500000000a8ed3232010000010000000100035da88f10142d136501a0d87f70d5c089a8342f085bb6d2e6f51e70b85ce772d401000000","operations":[{"header":"Account creation/edition","sub_header":"Account creation/edition: @tutinopablo1","sub_header_admin":"Account creation/edition: @tutinopablo1","sub_header_admin_ex":"Account creation/edition: @tutinopablo1","tx_type":"newaccount_","request":{"requested_type":"type_new_account","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"buyrambytes - buyrambytes_","sub_header":"buyrambytes - buyrambytes_","sub_header_admin":"buyrambytes - buyrambytes_","sub_header_admin_ex":"buyrambytes - buyrambytes_","tx_type":"buyrambytes_","request":{"requested_type":"type_unknown","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"delegatebw - delegatebw_","sub_header":"delegatebw - delegatebw_","sub_header_admin":"delegatebw - delegatebw_","sub_header_admin_ex":"delegatebw - delegatebw_","tx_type":"delegatebw_","request":{"requested_type":"type_unknown","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"header":"Customer creation/edition","sub_header":"Customer creation/edition: @tutinopablo1. Type: personal","sub_header_admin":"Customer creation/edition: @tutinopablo1. Type: personal","sub_header_admin_ex":"Customer creation/edition: @tutinopablo1. Type: personal","tx_type":"upsertcust_","request":{"requested_type":"type_upsert_cust","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Account creation/edition","sub_header":"Account creation/edition: @tutinopablo1","sub_header_admin":"Account creation/edition: @tutinopablo1","sub_header_admin_ex":"Account creation/edition: @tutinopablo1","tx_type":"newaccount_","request":{"requested_type":"type_new_account","request_id":null,"request_counter":null},"i_sent":true,"amount":0},{"id":"d1afb01685306df302da262e2c6972c6fd1614163ee95c0002e623318c11f112","block_time":"2019-11-28T14:01:25","block_time_number":20191128140125,"transaction_id":"d1afb01685306df302da262e2c6972c6fd1614163ee95c0002e623318c11f112","block_num":62421551,"account":"cristaltoken","name":"upsertcust","authorization":[{"actor":"cristaltoken","permission":"active"}],"data":{"account":"cristaltoken","account_type":4,"fee":"0.0000 INK","overdraft":"0.0000 INK","state":1},"hex_data":"3015a4399a8cdd45000000000000000004494e4b00000000000000000000000004494e4b000000000400000001000000","operations":[{"header":"Customer creation/edition","sub_header":"Customer creation/edition: @cristaltoken. Type: bankadmin","sub_header_admin":"Customer creation/edition: @cristaltoken. Type: bankadmin","sub_header_admin_ex":"Customer creation/edition: @cristaltoken. Type: bankadmin","tx_type":"upsertcust_","request":{"requested_type":"type_upsert_cust","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"header":"Customer creation/edition","sub_header":"Customer creation/edition: @cristaltoken. Type: bankadmin","sub_header_admin":"Customer creation/edition: @cristaltoken. Type: bankadmin","sub_header_admin_ex":"Customer creation/edition: @cristaltoken. Type: bankadmin","tx_type":"upsertcust_","request":{"requested_type":"type_upsert_cust","request_id":null,"request_counter":null},"i_sent":true,"amount":0}],"cursor":"4va6_cS1Oq0e4GobB1X-8fe7IpQ8BFtqUArvIEVA1N2k8HPD1ZilAA=="};
    // this.onNewData(x, is_first)

    let that = this;
    this.setState({loading:true});
    api.dfuse.allTransactions((is_first===true?undefined:this.state.cursor) )
      .then( (res) => {
          that.onNewData(res.data, is_first);
      } ,(ex) => {
          this.openNotificationWithIcon('error', 'Oops!', JSON.stringify(ex));
          that.setState({loading:false});  
        } 
      );
    
  }

  onNewData(data, is_first){
    
    const _txs          = (is_first===true)?data.txs:[...this.state.txs, ...data.txs];
    const pagination    = {...this.state.pagination};
    pagination.pageSize = _txs.length;
    pagination.total    = _txs.length;

    // console.log(' >> BUSINESS EXTRATO >> data:', JSON.stringify(data.txs));
    // console.log(' >>>>>>>>>>> this.state.cursor:', this.state.cursor)
    // console.log(' >>>>>>>>>>> data.cursor:', data.cursor)
    this.setState({pagination:pagination, txs:_txs, cursor:data.cursor, loading:false})

    if(!data.txs || data.txs.length==0)
    {
      this.openNotificationWithIcon("info", "End of transactions","You have reached the end of transaction list!")
    }
    else{
      this.computeStats();
    }
  }

  computeStats(txs){
    let stats = this.currentStats();
    if(txs===undefined)
      txs = this.state.txs;
    const money_in  = txs.filter( tx => request_helper.blockchain.isNegativeTransaction(tx)===false 
                                        && request_helper.blockchain.isValidTransaction(tx))
                    .map(tx =>tx.amount)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const money_out = txs.filter( tx => request_helper.blockchain.isNegativeTransaction(tx)
                                        && request_helper.blockchain.isValidTransaction(tx))
                    .map(tx =>tx.amount)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    
    stats[this.state.active_tab] = {money_out:money_out||0, money_in:money_in||0, count:txs.length}
    this.setState({stats:stats})
  }

  currentStats(){
    const x = this.state.stats[this.state.active_tab];
    const _default = {money_in:  0,money_out: 0, count:0};
    return x?x:_default;
  }

  refreshCurrentTable(){
    const that         = this;
    const {active_tab} = this.state;

    if(active_tab==DISPLAY_ALL_TXS)
    {
      this.setState(
        {txs:[]}
        , ()=>{
          that.loadAllTransactions(true);
        })
      return;
    }

    let need_refresh = this.state.need_refresh;
    need_refresh[active_tab]=true;
    this.setState(
        {need_refresh:need_refresh}
        , ()=>{
          need_refresh[active_tab]=false;
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
  
  renderTableViewStats(){
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
    return (<><Button key="load-more-data" disabled={!this.state.cursor} onClick={()=>this.loadAllTransactions(false)}>More!!</Button> </>)
  }

  renderContent(){
    let content = null;
    
    const {active_tab} = this.state;
    
    if(active_tab==DISPLAY_PDA){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_PDA} 
          need_refresh={this.state.need_refresh[DISPLAY_PDA]}
          request_type={DISPLAY_PDA} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          multiple={true}
          i_am_admin={true}
          />
      );
    }

    //
    if(active_tab==DISPLAY_EXTERNAL){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_EXTERNAL} 
          need_refresh={this.state.need_refresh[DISPLAY_EXTERNAL]}
          request_type={DISPLAY_EXTERNAL} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          multiple={true}
          i_am_admin={true}
          />
      );
    }
    
    // columns={ columns_helper.getColumnsForOperations(this.onTransactionClick, this.props.actualRoleId)}
    if(active_tab==DISPLAY_ALL_TXS){
      content = (
        <Table
          key={"table_"+DISPLAY_ALL_TXS} 
          rowKey={record => record.id} 
          loading={this.state.loading} 
          columns={ columns_helper.getColumnsBlockchainTXsForAdmin(this.onTransactionClick)}
          dataSource={this.state.txs} 
          footer={() => this.renderFooter()}
          pagination={this.state.pagination}
          scroll={{ x: 700 }}
          />
      );
    }
    // className="styles listCard"
    // style={{ marginTop: 24 }}

    return (<div style={{ background: '#fff', minHeight: 360, marginTop: 24}}>
        {content}
      </div>)
  }
  //
  render() {
    const content               = this.renderContent();
    const stats                 = this.renderTableViewStats();
    const filters               = this.renderFilterContent();
    const {routes, active_tab}  = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={[
            <Button size="small" key="refresh" icon="redo" disabled={this.state.loading} onClick={()=>this.refreshCurrentTable()} ></Button>,
            
          ]}
          title="Operations"
          subTitle="List of blockchain transactions, Deposits & Withdraw requests, and Exchanges & Provider Payment requests"
        >
        </PageHeader>
        
        <div className="styles standardList" style={{ marginTop: 24 }}>
          <Card key={'card_master'} style = { { marginBottom: 24 } } 
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

//
/*
<Card key="tabs_card" bordered={false}>
            <Tabs  defaultActiveKey={DISPLAY_ALL_TXS} onChange={this.onTabChange}>
              <TabPane tab={tabs[DISPLAY_ALL_TXS]}   key={DISPLAY_ALL_TXS} />
              <TabPane tab={tabs[DISPLAY_PDA]}       key={DISPLAY_PDA} />
              <TabPane tab={tabs[DISPLAY_EXTERNAL]}  key={DISPLAY_EXTERNAL} />
            </Tabs>
          </Card>
*/
export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRole:           loginRedux.actualRole(state),
        actualRoleId:         loginRedux.actualRoleId(state),
        balance:              balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(Operations)));