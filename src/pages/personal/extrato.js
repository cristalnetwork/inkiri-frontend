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

class Extrato extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),

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

  componentDidMount(){
    this.loadTransactionsForAccount(true);  
  } 

  
  loadTransactionsForAccount(is_first){

    // HACK!!!!!!!!!!!
    // console.log(' ** PERSONAL EXTRATO LISTA HACKED!')
    // this.onNewData({
    //   txs: [{"account":"inkirimaster","name":"upsertikacc","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"account_type":1,"fee":"5.00000000000000000","overdraft":"100.00000000000000000","state":1,"user":"pablotutino1"},"hex_data":"10e87459671a8fa90000000000001440000000000000594001000000000000000100000000000000","tx_type":"upsertikacc_","request":{"requested_type":"type_upsert","request_id":null,"request_counter":null},"tx_name":"upsertikacc","tx_code":"","i_sent":true,"header":"header","quantity":0,"id":"b05333bb6ef9323ebf26cd23a66db64f806839873b6804f9f381d4f6da01925a","block_time":"2019-09-04T17:24:40","block_time_number":20190904172440,"transaction_id":"b05333bb6ef9323ebf26cd23a66db64f806839873b6804f9f381d4f6da01925a","block_num":47929432},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkpersonal1","permission":"active"}],"data":{"from":"inkpersonal1","memo":"snd","quantity":"5398.0000 INK","to":"pablotutino1"},"hex_data":"10a299145f55e17410e87459671a8fa960ab37030000000004494e4b0000000003736e64","tx_type":"transfer_snd","request":{"requested_type":"type_send","request_id":null,"request_counter":null},"tx_name":"transfer","tx_code":"snd","i_sent":false,"header":"header","sub_header":"Te enviaron dinero","quantity":5398,"quantity_txt":"5398.0000 INK","id":"ac91af6ca3e48f04dbd441fa812bc5f7ac68569c3cd2a329b8a1c42c9204188e","block_time":"2019-09-05T17:01:31","block_time_number":20190905170131,"transaction_id":"ac91af6ca3e48f04dbd441fa812bc5f7ac68569c3cd2a329b8a1c42c9204188e","block_num":48097524},{"account":"inkiritoken1","name":"issue","authorization":[{"actor":"inkiritoken1","permission":"active"}],"data":{"memo":"dep|brls|43","quantity":"33.0000 INK","to":"pablotutino1"},"hex_data":"10e87459671a8fa9100905000000000004494e4b000000000b6465707c62726c737c3433","tx_type":"issue_dep","request":{"requested_type":"type_deposit","request_id":null,"request_counter":"43"},"tx_name":"issue","tx_code":"dep","tx_subcode":"brls","i_sent":false,"header":"header","sub_header":"Depositaste en brls","quantity":33,"quantity_txt":"33.0000 INK","id":"b2e828a10eec401b0cdc6d1aef040b5982fd3941305e1a0a2f55b1ee98234114","block_time":"2019-11-02T01:02:50","block_time_number":20191102010250,"transaction_id":"b2e828a10eec401b0cdc6d1aef040b5982fd3941305e1a0a2f55b1ee98234114","block_num":57896282},{"account":"inkiritoken1","name":"issue","authorization":[{"actor":"inkiritoken1","permission":"active"}],"data":{"memo":"dep|iks|44","quantity":"45.0000 INK","to":"pablotutino1"},"hex_data":"10e87459671a8fa9d0dd06000000000004494e4b000000000a6465707c696b737c3434","tx_type":"issue_dep","request":{"requested_type":"type_deposit","request_id":null,"request_counter":"44"},"tx_name":"issue","tx_code":"dep","tx_subcode":"iks","i_sent":false,"header":"header","sub_header":"Depositaste en iks","quantity":45,"quantity_txt":"45.0000 INK","id":"963d0dc657e9a563627802aa6d5ca0b11131def7fee6998fbcfe1d045742ae58","block_time":"2019-11-02T01:05:28","block_time_number":20191102010528,"transaction_id":"963d0dc657e9a563627802aa6d5ca0b11131def7fee6998fbcfe1d045742ae58","block_num":57896597},{"account":"inkiritoken1","name":"issue","authorization":[{"actor":"inkiritoken1","permission":"active"}],"data":{"memo":"dep|iks|44","quantity":"45.0000 INK","to":"pablotutino1"},"hex_data":"10e87459671a8fa9d0dd06000000000004494e4b000000000a6465707c696b737c3434","tx_type":"issue_dep","request":{"requested_type":"type_deposit","request_id":null,"request_counter":"44"},"tx_name":"issue","tx_code":"dep","tx_subcode":"iks","i_sent":false,"header":"header","sub_header":"Depositaste en iks","quantity":45,"quantity_txt":"45.0000 INK","id":"0b889b917f4da50197daa614543354759fdc9b6a21952e7dd31aae006b5e6a47","block_time":"2019-11-02T01:09:48","block_time_number":20191102010948,"transaction_id":"0b889b917f4da50197daa614543354759fdc9b6a21952e7dd31aae006b5e6a47","block_num":57897116},{"account":"inkiritoken1","name":"issue","authorization":[{"actor":"inkiritoken1","permission":"active"}],"data":{"memo":"dep|iks|44","quantity":"45.0000 INK","to":"pablotutino1"},"hex_data":"10e87459671a8fa9d0dd06000000000004494e4b000000000a6465707c696b737c3434","tx_type":"issue_dep","request":{"requested_type":"type_deposit","request_id":null,"request_counter":"44"},"tx_name":"issue","tx_code":"dep","tx_subcode":"iks","i_sent":false,"header":"header","sub_header":"Depositaste en iks","quantity":45,"quantity_txt":"45.0000 INK","id":"05c56d09733d348eab0c5ba51e84162e631735afea8e5b3c095dc67c6f4c3a03","block_time":"2019-11-02T01:10:31","block_time_number":20191102011031,"transaction_id":"05c56d09733d348eab0c5ba51e84162e631735afea8e5b3c095dc67c6f4c3a03","block_num":57897200},{"account":"inkiritoken1","name":"issue","authorization":[{"actor":"inkiritoken1","permission":"active"}],"data":{"memo":"dep|iks|44","quantity":"45.0000 INK","to":"pablotutino1"},"hex_data":"10e87459671a8fa9d0dd06000000000004494e4b000000000a6465707c696b737c3434","tx_type":"issue_dep","request":{"requested_type":"type_deposit","request_id":null,"request_counter":"44"},"tx_name":"issue","tx_code":"dep","tx_subcode":"iks","i_sent":false,"header":"header","sub_header":"Depositaste en iks","quantity":45,"quantity_txt":"45.0000 INK","id":"6da09b4c160cb309db27a04cf51cb8f23fcdec564f2a29f3b7f7c40859497bd7","block_time":"2019-11-02T01:13:34","block_time_number":20191102011334,"transaction_id":"6da09b4c160cb309db27a04cf51cb8f23fcdec564f2a29f3b7f7c40859497bd7","block_num":57897566},{"account":"inkiritoken1","name":"issue","authorization":[{"actor":"inkiritoken1","permission":"active"}],"data":{"memo":"dep|iks|44","quantity":"45.0000 INK","to":"pablotutino1"},"hex_data":"10e87459671a8fa9d0dd06000000000004494e4b000000000a6465707c696b737c3434","tx_type":"issue_dep","request":{"requested_type":"type_deposit","request_id":null,"request_counter":"44"},"tx_name":"issue","tx_code":"dep","tx_subcode":"iks","i_sent":false,"header":"header","sub_header":"Depositaste en iks","quantity":45,"quantity_txt":"45.0000 INK","id":"7feed4e2109a09fad3c47024c868401ad7037cc24572b8d06ce10163a1bd52f3","block_time":"2019-11-02T01:15:24","block_time_number":20191102011524,"transaction_id":"7feed4e2109a09fad3c47024c868401ad7037cc24572b8d06ce10163a1bd52f3","block_num":57897784},{"account":"inkiritoken1","name":"issue","authorization":[{"actor":"inkiritoken1","permission":"active"}],"data":{"memo":"dep|iks|44","quantity":"45.0000 INK","to":"pablotutino1"},"hex_data":"10e87459671a8fa9d0dd06000000000004494e4b000000000a6465707c696b737c3434","tx_type":"issue_dep","request":{"requested_type":"type_deposit","request_id":null,"request_counter":"44"},"tx_name":"issue","tx_code":"dep","tx_subcode":"iks","i_sent":false,"header":"header","sub_header":"Depositaste en iks","quantity":45,"quantity_txt":"45.0000 INK","id":"ba3eed9af7c4b4ee36920cd24cf309678dd57ae0a295fcb3dd9fd3c4b33c11a0","block_time":"2019-11-02T01:19:16","block_time_number":20191102011916,"transaction_id":"ba3eed9af7c4b4ee36920cd24cf309678dd57ae0a295fcb3dd9fd3c4b33c11a0","block_num":57898247},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"pablotutino1","permission":"active"}],"data":{"from":"pablotutino1","memo":"wth|5dbcf5251cb05e4cda1ca6e0","quantity":"8.0000 INK","to":"inkirimaster"},"hex_data":"10e87459671a8fa97055c646baebe074803801000000000004494e4b000000001c7774687c356462636635323531636230356534636461316361366530","tx_type":"transfer_wth","request":{"requested_type":"type_withdraw","request_id":"5dbcf5251cb05e4cda1ca6e0","request_counter":null},"tx_name":"transfer","tx_code":"wth","tx_subcode":"5dbcf5251cb05e4cda1ca6e0","i_sent":true,"header":"header","sub_header":"Solicitaste retiro en billete","quantity":8,"quantity_txt":"8.0000 INK","id":"7a669125b7c95cb8edbdb39e65c3c144a51ee38af6cf8b6308d5168f2304d1ab","block_time":"2019-11-02T03:16:55","block_time_number":20191102031655,"transaction_id":"7a669125b7c95cb8edbdb39e65c3c144a51ee38af6cf8b6308d5168f2304d1ab","block_num":57912309},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"pablotutino1","permission":"active"}],"data":{"from":"pablotutino1","memo":"wth|5dbcf5691cb05e4cda1ca6e1","quantity":"7.0000 INK","to":"inkirimaster"},"hex_data":"10e87459671a8fa97055c646baebe074701101000000000004494e4b000000001c7774687c356462636635363931636230356534636461316361366531","tx_type":"transfer_wth","request":{"requested_type":"type_withdraw","request_id":"5dbcf5691cb05e4cda1ca6e1","request_counter":null},"tx_name":"transfer","tx_code":"wth","tx_subcode":"5dbcf5691cb05e4cda1ca6e1","i_sent":true,"header":"header","sub_header":"Solicitaste retiro en billete","quantity":7,"quantity_txt":"7.0000 INK","id":"39602032027a244cc545dafbbe85e584ce2c6cc52471e74bf226bef761634d7d","block_time":"2019-11-02T03:18:03","block_time_number":20191102031803,"transaction_id":"39602032027a244cc545dafbbe85e584ce2c6cc52471e74bf226bef761634d7d","block_num":57912445},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"from":"inkirimaster","memo":"bck|5dbcf5691cb05e4cda1ca6e1|","quantity":"7.0000 INK","to":"pablotutino1"},"hex_data":"7055c646baebe07410e87459671a8fa9701101000000000004494e4b000000001d62636b7c3564626366353639316362303565346364613163613665317c","tx_type":"transfer_bck","request":{"requested_type":"type_refund","request_id":"5dbcf5691cb05e4cda1ca6e1","request_counter":null},"tx_name":"transfer","tx_code":"bck","tx_subcode":"5dbcf5691cb05e4cda1ca6e1","i_sent":false,"header":"header","sub_header":"Te restituyeron monto por transacción undefined","quantity":7,"quantity_txt":"7.0000 INK","id":"0af4ec2a8313498c2f12a990dc46e4b8dae3a0cda7b6e8ff22de7345700f2ebe","block_time":"2019-11-02T03:44:17","block_time_number":20191102034417,"transaction_id":"0af4ec2a8313498c2f12a990dc46e4b8dae3a0cda7b6e8ff22de7345700f2ebe","block_num":57915580},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"pablotutino1","permission":"active"}],"data":{"from":"pablotutino1","memo":"wth|5dbd698a97e12513eb67c1a3","quantity":"50.0000 INK","to":"inkirimaster"},"hex_data":"10e87459671a8fa97055c646baebe07420a107000000000004494e4b000000001c7774687c356462643639386139376531323531336562363763316133","tx_type":"transfer_wth","request":{"requested_type":"type_withdraw","request_id":"5dbd698a97e12513eb67c1a3","request_counter":null},"tx_name":"transfer","tx_code":"wth","tx_subcode":"5dbd698a97e12513eb67c1a3","i_sent":true,"header":"header","sub_header":"Solicitaste retiro en billete","quantity":50,"quantity_txt":"50.0000 INK","id":"f8648f850f519953944d5cadd4052153729c5bb1ff470b52ea3cb7064a0ae525","block_time":"2019-11-02T11:33:33","block_time_number":20191102113333,"transaction_id":"f8648f850f519953944d5cadd4052153729c5bb1ff470b52ea3cb7064a0ae525","block_num":57971643},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"from":"inkirimaster","memo":"bck|5dbd698a97e12513eb67c1a3|","quantity":"50.0000 INK","to":"pablotutino1"},"hex_data":"7055c646baebe07410e87459671a8fa920a107000000000004494e4b000000001d62636b7c3564626436393861393765313235313365623637633161337c","tx_type":"transfer_bck","request":{"requested_type":"type_refund","request_id":"5dbd698a97e12513eb67c1a3","request_counter":null},"tx_name":"transfer","tx_code":"bck","tx_subcode":"5dbd698a97e12513eb67c1a3","i_sent":false,"header":"header","sub_header":"Te restituyeron monto por transacción undefined","quantity":50,"quantity_txt":"50.0000 INK","id":"9a6a93291254a104db1184bfd95dc69fc95ef25ba4f19d5cd5d1beff1b11b53a","block_time":"2019-11-02T11:40:33","block_time_number":20191102114033,"transaction_id":"9a6a93291254a104db1184bfd95dc69fc95ef25ba4f19d5cd5d1beff1b11b53a","block_num":57972479},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"pablotutino1","permission":"active"}],"data":{"from":"pablotutino1","memo":"xch|5dbfca1541450422692e792c|5dbfa68fcae447637f2bbe46","quantity":"15.0000 INK","to":"inkirimaster"},"hex_data":"10e87459671a8fa97055c646baebe074f04902000000000004494e4b00000000357863687c3564626663613135343134353034323236393265373932637c356462666136386663616534343736333766326262653436","tx_type":"transfer_xch","request":{"requested_type":"type_exchange","request_id":"5dbfca1541450422692e792c","request_counter":null},"tx_name":"transfer","tx_code":"xch","tx_subcode":"5dbfca1541450422692e792c","i_sent":true,"header":"header","sub_header":"Solicitaste cambio a banco BANK_ID","quantity":15,"quantity_txt":"15.0000 INK","id":"e9954fc56d974bbaab838676160dfcc11e82be3560d3bbe90a34985f3e727fd3","block_time":"2019-11-04T06:50:00","block_time_number":20191104065000,"transaction_id":"e9954fc56d974bbaab838676160dfcc11e82be3560d3bbe90a34985f3e727fd3","block_num":58281906},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"from":"inkirimaster","memo":"bck|5dbfca1541450422692e792c|","quantity":"15.0000 INK","to":"pablotutino1"},"hex_data":"7055c646baebe07410e87459671a8fa9f04902000000000004494e4b000000001d62636b7c3564626663613135343134353034323236393265373932637c","tx_type":"transfer_bck","request":{"requested_type":"type_refund","request_id":"5dbfca1541450422692e792c","request_counter":null},"tx_name":"transfer","tx_code":"bck","tx_subcode":"5dbfca1541450422692e792c","i_sent":false,"header":"header","sub_header":"Te restituyeron monto por transacción undefined","quantity":15,"quantity_txt":"15.0000 INK","id":"6cc3d7c55d8ce9cf17174ef74bc743d3bea9cbee430199b41345ed672f05415c","block_time":"2019-11-04T07:10:14","block_time_number":20191104071014,"transaction_id":"6cc3d7c55d8ce9cf17174ef74bc743d3bea9cbee430199b41345ed672f05415c","block_num":58284324},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"from":"inkirimaster","memo":"bck|5dbfca1541450422692e792c|","quantity":"15.0000 INK","to":"pablotutino1"},"hex_data":"7055c646baebe07410e87459671a8fa9f04902000000000004494e4b000000001d62636b7c3564626663613135343134353034323236393265373932637c","tx_type":"transfer_bck","request":{"requested_type":"type_refund","request_id":"5dbfca1541450422692e792c","request_counter":null},"tx_name":"transfer","tx_code":"bck","tx_subcode":"5dbfca1541450422692e792c","i_sent":false,"header":"header","sub_header":"Te restituyeron monto por transacción undefined","quantity":15,"quantity_txt":"15.0000 INK","id":"bd8b247f45ae49f35b9e9fecae8ab5f88e00a4d35781a0e512e462fe35cf28b9","block_time":"2019-11-04T07:16:07","block_time_number":20191104071607,"transaction_id":"bd8b247f45ae49f35b9e9fecae8ab5f88e00a4d35781a0e512e462fe35cf28b9","block_num":58285028},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"pablotutino1","permission":"active"}],"data":{"from":"pablotutino1","memo":"xch|5dbfd17d5def1b30230a83f4|5dbfa68fcae447637f2bbe46","quantity":"55.0000 INK","to":"inkirimaster"},"hex_data":"10e87459671a8fa97055c646baebe074706408000000000004494e4b00000000357863687c3564626664313764356465663162333032333061383366347c356462666136386663616534343736333766326262653436","tx_type":"transfer_xch","request":{"requested_type":"type_exchange","request_id":"5dbfd17d5def1b30230a83f4","request_counter":null},"tx_name":"transfer","tx_code":"xch","tx_subcode":"5dbfd17d5def1b30230a83f4","i_sent":true,"header":"header","sub_header":"Solicitaste cambio a banco BANK_ID","quantity":55,"quantity_txt":"55.0000 INK","id":"89a96c6db9157de06110bb77790dad1767f9ef1a5eabd31255b1ed7d1397072c","block_time":"2019-11-04T07:21:36","block_time_number":20191104072136,"transaction_id":"89a96c6db9157de06110bb77790dad1767f9ef1a5eabd31255b1ed7d1397072c","block_num":58285682},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"pablotutino1","permission":"active"}],"data":{"from":"pablotutino1","memo":"xch|5dbfd4850c65f4359a2a379e|5dbf9b9acae447637f2bbe44","quantity":"115.0000 INK","to":"inkirimaster"},"hex_data":"10e87459671a8fa97055c646baebe074308c11000000000004494e4b00000000357863687c3564626664343835306336356634333539613261333739657c356462663962396163616534343736333766326262653434","tx_type":"transfer_xch","request":{"requested_type":"type_exchange","request_id":"5dbfd4850c65f4359a2a379e","request_counter":null},"tx_name":"transfer","tx_code":"xch","tx_subcode":"5dbfd4850c65f4359a2a379e","i_sent":true,"header":"header","sub_header":"Solicitaste cambio a banco BANK_ID","quantity":115,"quantity_txt":"115.0000 INK","id":"d1b99637e4bc78f57340c82873f6fac5540f16449e2ea7d1eee939787feba75a","block_time":"2019-11-04T07:34:32","block_time_number":20191104073432,"transaction_id":"d1b99637e4bc78f57340c82873f6fac5540f16449e2ea7d1eee939787feba75a","block_num":58287228},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"pablotutino1","permission":"active"}],"data":{"from":"pablotutino1","memo":"xch|5dbfdf98f1579f0017a50254|5dbfde399568310017495c79","quantity":"55.0000 INK","to":"inkirimaster"},"hex_data":"10e87459671a8fa97055c646baebe074706408000000000004494e4b00000000357863687c3564626664663938663135373966303031376135303235347c356462666465333939353638333130303137343935633739","tx_type":"transfer_xch","request":{"requested_type":"type_exchange","request_id":"5dbfdf98f1579f0017a50254","request_counter":null},"tx_name":"transfer","tx_code":"xch","tx_subcode":"5dbfdf98f1579f0017a50254","i_sent":true,"header":"header","sub_header":"Solicitaste cambio a banco BANK_ID","quantity":55,"quantity_txt":"55.0000 INK","id":"86058944be6ca2fa2413b09b75640f872dd96f0c0b510d1e03fe82ffec71994d","block_time":"2019-11-04T08:21:46","block_time_number":20191104082146,"transaction_id":"86058944be6ca2fa2413b09b75640f872dd96f0c0b510d1e03fe82ffec71994d","block_num":58292873}]
    // })
    // return;
    
    let account_name = this.props.actualAccountName;
    
    let that = this;
    this.setState({loading:true});
    // console.log(' <><><><><><><><><> this.state.cursor:', this.state.cursor)
    api.listTransactions(account_name, (is_first===true?undefined:this.state.cursor) )
    .then( (res) => {
        that.onNewData(res.data);
      } ,(ex) => {
        // console.log(' -- extrato.js::listTransactions ERROR --');
        // console.log('---- ERROR:', JSON.stringify(ex));
        that.setState({loading:false});  
      } 
    );
    
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
                    .map(tx =>tx.quantity)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const money_out = txs.filter( tx => request_helper.blockchain.isNegativeTransaction(tx)
                                        && request_helper.blockchain.isValidTransaction(tx))
                    .map(tx =>tx.quantity)
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
    const {money_in, money_out, count} = this.currentStats();
    const variacion = money_in-money_out;
    return (
      <div className="styles standardList" style={{ marginTop: 24 }}>
        <Card key="the_card_key" bordered={false}>
          <Row>
            <Col xs={24} sm={12} md={5} lg={5} xl={5}>
            <Statistic
                    title="Entradas"
                    value={money_in}
                    precision={2}
                    valueStyle={{ color: 'green' }}
                    prefix={<Icon type="arrow-up" />}
                  />
            </Col>
            <Col xs={24} sm={12} md={5} lg={5} xl={5}>
              <Statistic
                    title="Saidas"
                    value={money_out}
                    precision={2}
                    valueStyle={{ color: 'red' }}
                    prefix={<Icon type="arrow-down" />}
                  />
            </Col>
            <Col xs={24} sm={12} md={5} lg={5} xl={5}>
              <Statistic
                    title="Variacao de caja"
                    value={variacion}
                    precision={2}
                    valueStyle={variacion>0?{ color: 'green' }:{ color: 'red' }}
                    prefix={((variacion==0)?null:(variacion>0?<Icon type="arrow-up" />:<Icon type="arrow-down" />))}
                  />
            </Col>
            <Col xs={24} sm={12} md={4} lg={4} xl={4}>
              <Statistic
                    title="Transações"
                    value={count|0}
                    precision={0}
                    
                  />
            </Col>
            <Col xs={24} sm={12} md={5} lg={5} xl={5}>
              <Statistic
                title="Account Balance"
                value={Number(this.props.balance)}
                precision={2}
                prefix={globalCfg.currency.symbol}
              />
            </Col>
          </Row>
        </Card>
      </div>
    );
  }

  renderFooter(){
    return (<><Button key="load-more-data" disabled={this.state.cursor==''} onClick={()=>this.loadTransactionsForAccount(false)}>More!!</Button> </>)
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

    if(this.state.active_tab==DISPLAY_ALL_TXS){
      content = (
        <Table
          key={"table_"+DISPLAY_ALL_TXS} 
          rowKey={record => record.id} 
          loading={this.state.loading} 
          columns={ columns_helper.getColumnsForPersonalExtrato(this.onTransactionClick, this.props.actualRoleId)} 
          dataSource={this.state.txs} 
          footer={() => this.renderFooter()}
          pagination={this.state.pagination}
          scroll={{ x: 700 }}
          />
      );
    }

    return (<div style={{ margin: '0 0px', padding: 24, background: '#fff', minHeight: 360, marginTop: 24  }}>
      {content}</div>)
  }
  //
  render() {
    const {routes} = this.state;
    const content = this.renderContent();
    const stats = this.renderTableViewStats();
    const filters = this.renderFilterContent();
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
        <div className="styles standardList" style={{ marginTop: 0 }}>
          <Card key="tabs_card" bordered={false}>
            <Tabs  defaultActiveKey={DISPLAY_ALL_TXS} onChange={this.onTabChange}>
              <TabPane tab="Movements" key={DISPLAY_ALL_TXS} />
              <TabPane tab="Deposits"  key={DISPLAY_DEPOSIT} />
              <TabPane tab="Withdraws" key={DISPLAY_WITHDRAWS} />
              <TabPane tab="Exchanges" key={DISPLAY_EXCHANGES} />
              <TabPane tab="Payments"  key={DISPLAY_PAYMENTS} disabled />
              <TabPane tab="Requests"  key={DISPLAY_REQUESTS} disabled />
            </Tabs>
          </Card>
        </div>
        
        {filters}

        {stats}
        
        {content}

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
    }),
    (dispatch)=>({
        setLastRootMenuFullpath:  bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(Extrato)));