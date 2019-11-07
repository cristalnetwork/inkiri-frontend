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

import './providers.css'; 
import styles from './providers.less';

import TransactionTable from '@app/components/TransactionTable';
import { DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_EXCHANGES, DISPLAY_PAYMENTS, DISPLAY_REQUESTS, DISPLAY_WITHDRAWS, DISPLAY_PROVIDER, DISPLAY_SEND, DISPLAY_SERVICE} from '@app/components/TransactionTable';

import * as columns_helper from '@app/components/TransactionTable/columns';

import * as utils from '@app/utils/utils';

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
      deposits:            [],

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

    // // HACK!!!!!!!!!!!
    // this.onNewData({
    //   txs: [{"account":"eosio","name":"newaccount","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"active":{"accounts":[],"keys":[{"key":"EOS7ABCURsx4rLzEQ4amXFK46bmULDDXVLCy8nNBys9EUEVezhtnk","weight":1}],"threshold":1,"waits":[]},"creator":"inkirimaster","name":"yogamatrix12","owner":{"accounts":[{"permission":{"actor":"inkirimaster","permission":"active"},"weight":1},{"permission":{"actor":"pablotutino1","permission":"active"},"weight":1}],"keys":[{"key":"EOS7ABCURsx4rLzEQ4amXFK46bmULDDXVLCy8nNBys9EUEVezhtnk","weight":1}],"threshold":1,"waits":[]}},"hex_data":"7055c646baebe074204277371b6918f5010000000100032b02eb563bd6d2a465762bf8176574fb0f6f388bea0cc32a093d8a5018735db10100027055c646baebe07400000000a8ed3232010010e87459671a8fa900000000a8ed3232010000010000000100032b02eb563bd6d2a465762bf8176574fb0f6f388bea0cc32a093d8a5018735db101000000","tx_type":"newaccount_","request":{"requested_type":"type_unknown","request_id":null,"request_counter":null},"tx_name":"newaccount","tx_code":"","i_sent":true,"header":"header","quantity":0,"id":"34881b2a3a7f57b7e8287685ac75f0d734d7f9b7db821fcabff5cf83842d1997","block_time":"2019-09-25T10:16:05","block_time_number":20190925101605,"transaction_id":"34881b2a3a7f57b7e8287685ac75f0d734d7f9b7db821fcabff5cf83842d1997","block_num":51458730},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|5d925b3cb1651e30fd49eb9f","quantity":"15.0000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe074f04902000000000004494e4b000000001c7072767c356439323562336362313635316533306664343965623966","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"5d925b3cb1651e30fd49eb9f","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"5d925b3cb1651e30fd49eb9f","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:5d925b3cb1651e30fd49eb9f","quantity":15,"quantity_txt":"15.0000 INK","id":"43a02a6104aa4f60d06209c3bff75f485f6cfefddd6dd4ce6d406e46ef76ee4c","block_time":"2019-09-30T19:45:02","block_time_number":20190930194502,"transaction_id":"43a02a6104aa4f60d06209c3bff75f485f6cfefddd6dd4ce6d406e46ef76ee4c","block_num":52374236},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|5d926000b1651e30fd49eba0","quantity":"16.0000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe074007102000000000004494e4b000000001c7072767c356439323630303062313635316533306664343965626130","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"5d926000b1651e30fd49eba0","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"5d926000b1651e30fd49eba0","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:5d926000b1651e30fd49eba0","quantity":16,"quantity_txt":"16.0000 INK","id":"a9efb2ef2bf39b7166fb34a214672e5e78818d7776368668461e4eb49e07d1f9","block_time":"2019-09-30T20:05:22","block_time_number":20190930200522,"transaction_id":"a9efb2ef2bf39b7166fb34a214672e5e78818d7776368668461e4eb49e07d1f9","block_num":52376657},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|5d926188b1651e30fd49eba1","quantity":"63.0000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe074f09c09000000000004494e4b000000001c7072767c356439323631383862313635316533306664343965626131","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"5d926188b1651e30fd49eba1","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"5d926188b1651e30fd49eba1","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:5d926188b1651e30fd49eba1","quantity":63,"quantity_txt":"63.0000 INK","id":"de2d4d307f5f7c3244c429181155e163c49ad54762b82cfdf8339e79b28c7f23","block_time":"2019-09-30T20:11:54","block_time_number":20190930201154,"transaction_id":"de2d4d307f5f7c3244c429181155e163c49ad54762b82cfdf8339e79b28c7f23","block_num":52377423},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|undefined","quantity":"550.0000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe07460ec53000000000004494e4b000000000d7072767c756e646566696e6564","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"undefined","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"undefined","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:undefined","quantity":550,"quantity_txt":"550.0000 INK","id":"e13ab2d4a38772b7ea4ae51a4632ff04c6738b80f21e147610c31f26737b3304","block_time":"2019-10-25T19:30:27","block_time_number":20191025193027,"transaction_id":"e13ab2d4a38772b7ea4ae51a4632ff04c6738b80f21e147610c31f26737b3304","block_num":56655406},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|undefined","quantity":"55.0000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe074706408000000000004494e4b000000000d7072767c756e646566696e6564","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"undefined","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"undefined","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:undefined","quantity":55,"quantity_txt":"55.0000 INK","id":"110a8c936ccfd51080a5ee5e457d5a2b68f15717d216d3c05660a90782aaeaed","block_time":"2019-10-25T19:37:28","block_time_number":20191025193728,"transaction_id":"110a8c936ccfd51080a5ee5e457d5a2b68f15717d216d3c05660a90782aaeaed","block_num":56656244},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|undefined","quantity":"55.0000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe074706408000000000004494e4b000000000d7072767c756e646566696e6564","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"undefined","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"undefined","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:undefined","quantity":55,"quantity_txt":"55.0000 INK","id":"80192c70083cf259b49a9a57db5ba2e3ad8efdac81c09f6cfcb1b22bcc609eac","block_time":"2019-10-25T19:40:55","block_time_number":20191025194055,"transaction_id":"80192c70083cf259b49a9a57db5ba2e3ad8efdac81c09f6cfcb1b22bcc609eac","block_num":56656657},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|5db35498e0c3e5766eecf33d","quantity":"7.0000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe074701101000000000004494e4b000000001c7072767c356462333534393865306333653537363665656366333364","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"5db35498e0c3e5766eecf33d","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"5db35498e0c3e5766eecf33d","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:5db35498e0c3e5766eecf33d","quantity":7,"quantity_txt":"7.0000 INK","id":"2f775c596148751c9b55ac5249f89a471330363bed294cfdf80d7b4ea5f59e7b","block_time":"2019-10-25T20:01:31","block_time_number":20191025200131,"transaction_id":"2f775c596148751c9b55ac5249f89a471330363bed294cfdf80d7b4ea5f59e7b","block_num":56659117},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|5db6eae9faf529390f4f5512","quantity":"3.5000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe074b88800000000000004494e4b000000001c7072767c356462366561653966616635323933393066346635353132","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"5db6eae9faf529390f4f5512","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"5db6eae9faf529390f4f5512","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:5db6eae9faf529390f4f5512","quantity":3.5,"quantity_txt":"3.5000 INK","id":"a6979740b44ce5811d87f3485cab00266a2e744559ada07ec1cf0978a6c1bade","block_time":"2019-10-28T13:19:40","block_time_number":20191028131940,"transaction_id":"a6979740b44ce5811d87f3485cab00266a2e744559ada07ec1cf0978a6c1bade","block_num":57126851},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|5db6eb0ffaf529390f4f5513","quantity":"3.5000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe074b88800000000000004494e4b000000001c7072767c356462366562306666616635323933393066346635353133","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"5db6eb0ffaf529390f4f5513","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"5db6eb0ffaf529390f4f5513","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:5db6eb0ffaf529390f4f5513","quantity":3.5,"quantity_txt":"3.5000 INK","id":"fc15c6260e9e06709a287eac70e354a240f976dcf661b63b9e10ad814972f3fb","block_time":"2019-10-28T13:20:17","block_time_number":20191028132017,"transaction_id":"fc15c6260e9e06709a287eac70e354a240f976dcf661b63b9e10ad814972f3fb","block_num":57126925},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|5db6ececfaf529390f4f5514","quantity":"5.0000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe07450c300000000000004494e4b000000001c7072767c356462366563656366616635323933393066346635353134","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"5db6ececfaf529390f4f5514","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"5db6ececfaf529390f4f5514","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:5db6ececfaf529390f4f5514","quantity":5,"quantity_txt":"5.0000 INK","id":"357907cf550c4a56ab54a83a5f89db7490ddac090d92e53cb8bcceeb0292a1ac","block_time":"2019-10-28T13:28:15","block_time_number":20191028132815,"transaction_id":"357907cf550c4a56ab54a83a5f89db7490ddac090d92e53cb8bcceeb0292a1ac","block_num":57127876},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|5db7534c780dab1a00f54d3d","quantity":"4.0000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe074409c00000000000004494e4b000000001c7072767c356462373533346337383064616231613030663534643364","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"5db7534c780dab1a00f54d3d","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"5db7534c780dab1a00f54d3d","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:5db7534c780dab1a00f54d3d","quantity":4,"quantity_txt":"4.0000 INK","id":"a0dea1c79d2ef178b728176bf024cedcc47e2f6c01621c735789d8c3798dcef0","block_time":"2019-10-28T20:45:03","block_time_number":20191028204503,"transaction_id":"a0dea1c79d2ef178b728176bf024cedcc47e2f6c01621c735789d8c3798dcef0","block_num":57180068},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|5db7613d780dab1a00f54d3e","quantity":"3.0000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe074307500000000000004494e4b000000001c7072767c356462373631336437383064616231613030663534643365","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"5db7613d780dab1a00f54d3e","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"5db7613d780dab1a00f54d3e","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:5db7613d780dab1a00f54d3e","quantity":3,"quantity_txt":"3.0000 INK","id":"1918728f5678d83451950b206147ac940d3a59f062390c385878f17466228ab7","block_time":"2019-10-28T21:44:32","block_time_number":20191028214432,"transaction_id":"1918728f5678d83451950b206147ac940d3a59f062390c385878f17466228ab7","block_num":57187175},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|5db7616e780dab1a00f54d3f","quantity":"3.6000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe074a08c00000000000004494e4b000000001c7072767c356462373631366537383064616231613030663534643366","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"5db7616e780dab1a00f54d3f","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"5db7616e780dab1a00f54d3f","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:5db7616e780dab1a00f54d3f","quantity":3.6,"quantity_txt":"3.6000 INK","id":"a91e04de1b04afce225308e2c84e832453e1fac2ff508f62dbc9d094a030966f","block_time":"2019-10-28T21:45:20","block_time_number":20191028214520,"transaction_id":"a91e04de1b04afce225308e2c84e832453e1fac2ff508f62dbc9d094a030966f","block_num":57187272},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|5db7627d780dab1a00f54d40","quantity":"4.1000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe07428a000000000000004494e4b000000001c7072767c356462373632376437383064616231613030663534643430","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"5db7627d780dab1a00f54d40","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"5db7627d780dab1a00f54d40","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:5db7627d780dab1a00f54d40","quantity":4.1,"quantity_txt":"4.1000 INK","id":"1356fdfea6e896511754071b36449e6b20264ac6c7362fd5d8b32ee3650b8743","block_time":"2019-10-28T21:49:53","block_time_number":20191028214953,"transaction_id":"1356fdfea6e896511754071b36449e6b20264ac6c7362fd5d8b32ee3650b8743","block_num":57187814},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"from":"inkirimaster","memo":"bck|5db7627d780dab1a00f54d40|","quantity":"4.1000 INK","to":"yogamatrix12"},"hex_data":"7055c646baebe074204277371b6918f528a000000000000004494e4b000000001d62636b7c3564623736323764373830646162316130306635346434307c","tx_type":"transfer_bck","request":{"requested_type":"type_refund","request_id":"5db7627d780dab1a00f54d40","request_counter":null},"tx_name":"transfer","tx_code":"bck","tx_subcode":"5db7627d780dab1a00f54d40","i_sent":false,"header":"header","sub_header":"Te restituyeron monto por transacción undefined","quantity":4.1,"quantity_txt":"4.1000 INK","id":"72f319b5bfd363d267ebea143d162f971f260feaadbbf1e3a4dba0dcb40948f0","block_time":"2019-10-30T17:41:11","block_time_number":20191030174111,"transaction_id":"72f319b5bfd363d267ebea143d162f971f260feaadbbf1e3a4dba0dcb40948f0","block_num":57502239},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"from":"inkirimaster","memo":"bck|5db7616e780dab1a00f54d3f|","quantity":"3.6000 INK","to":"yogamatrix12"},"hex_data":"7055c646baebe074204277371b6918f5a08c00000000000004494e4b000000001d62636b7c3564623736313665373830646162316130306635346433667c","tx_type":"transfer_bck","request":{"requested_type":"type_refund","request_id":"5db7616e780dab1a00f54d3f","request_counter":null},"tx_name":"transfer","tx_code":"bck","tx_subcode":"5db7616e780dab1a00f54d3f","i_sent":false,"header":"header","sub_header":"Te restituyeron monto por transacción undefined","quantity":3.6,"quantity_txt":"3.6000 INK","id":"143c9c5f55c9e9ae0644151b146bec1b1955c4906d33f30a7ef2f4e3679638bf","block_time":"2019-10-30T17:41:48","block_time_number":20191030174148,"transaction_id":"143c9c5f55c9e9ae0644151b146bec1b1955c4906d33f30a7ef2f4e3679638bf","block_num":57502312},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"from":"inkirimaster","memo":"bck|5db7616e780dab1a00f54d3f|","quantity":"3.6000 INK","to":"yogamatrix12"},"hex_data":"7055c646baebe074204277371b6918f5a08c00000000000004494e4b000000001d62636b7c3564623736313665373830646162316130306635346433667c","tx_type":"transfer_bck","request":{"requested_type":"type_refund","request_id":"5db7616e780dab1a00f54d3f","request_counter":null},"tx_name":"transfer","tx_code":"bck","tx_subcode":"5db7616e780dab1a00f54d3f","i_sent":false,"header":"header","sub_header":"Te restituyeron monto por transacción undefined","quantity":3.6,"quantity_txt":"3.6000 INK","id":"ad5ff71a7fccb53179257a785b5fe16d7fd3873b4e9d6a2c564ae609b4f0e621","block_time":"2019-10-30T17:56:23","block_time_number":20191030175623,"transaction_id":"ad5ff71a7fccb53179257a785b5fe16d7fd3873b4e9d6a2c564ae609b4f0e621","block_num":57504055},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|5dbb2436fdcfb61717d85fda","quantity":"12.0000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe074c0d401000000000004494e4b000000001c7072767c356462623234333666646366623631373137643835666461","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"5dbb2436fdcfb61717d85fda","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"5dbb2436fdcfb61717d85fda","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:5dbb2436fdcfb61717d85fda","quantity":12,"quantity_txt":"12.0000 INK","id":"eed824e2f449494cf7a6dcd096b04b77589dd18cb704ef8dd7053867221bc4d3","block_time":"2019-10-31T18:13:12","block_time_number":20191031181312,"transaction_id":"eed824e2f449494cf7a6dcd096b04b77589dd18cb704ef8dd7053867221bc4d3","block_num":57678065},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"from":"inkirimaster","memo":"bck|5db7613d780dab1a00f54d3e|","quantity":"3.0000 INK","to":"yogamatrix12"},"hex_data":"7055c646baebe074204277371b6918f5307500000000000004494e4b000000001d62636b7c3564623736313364373830646162316130306635346433657c","tx_type":"transfer_bck","request":{"requested_type":"type_refund","request_id":"5db7613d780dab1a00f54d3e","request_counter":null},"tx_name":"transfer","tx_code":"bck","tx_subcode":"5db7613d780dab1a00f54d3e","i_sent":false,"header":"header","sub_header":"Te restituyeron monto por transacción undefined","quantity":3,"quantity_txt":"3.0000 INK","id":"aa5d12a2564a9b8dab2f8fb4fce014f8ca454fe8cb2fbb04069a03c9eb27c08b","block_time":"2019-10-31T18:40:50","block_time_number":20191031184050,"transaction_id":"aa5d12a2564a9b8dab2f8fb4fce014f8ca454fe8cb2fbb04069a03c9eb27c08b","block_num":57681367},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"from":"inkirimaster","memo":"bck|5db7534c780dab1a00f54d3d|","quantity":"4.0000 INK","to":"yogamatrix12"},"hex_data":"7055c646baebe074204277371b6918f5409c00000000000004494e4b000000001d62636b7c3564623735333463373830646162316130306635346433647c","tx_type":"transfer_bck","request":{"requested_type":"type_refund","request_id":"5db7534c780dab1a00f54d3d","request_counter":null},"tx_name":"transfer","tx_code":"bck","tx_subcode":"5db7534c780dab1a00f54d3d","i_sent":false,"header":"header","sub_header":"Te restituyeron monto por transacción undefined","quantity":4,"quantity_txt":"4.0000 INK","id":"2fbdd9f037bb1183ccbaa2dcb1d763b6e9bd581a548493cba5acf294bc0f1575","block_time":"2019-10-31T18:53:45","block_time_number":20191031185345,"transaction_id":"2fbdd9f037bb1183ccbaa2dcb1d763b6e9bd581a548493cba5acf294bc0f1575","block_num":57682911},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"from":"inkirimaster","memo":"bck|5db6eb0ffaf529390f4f5513|","quantity":"3.5000 INK","to":"yogamatrix12"},"hex_data":"7055c646baebe074204277371b6918f5b88800000000000004494e4b000000001d62636b7c3564623665623066666166353239333930663466353531337c","tx_type":"transfer_bck","request":{"requested_type":"type_refund","request_id":"5db6eb0ffaf529390f4f5513","request_counter":null},"tx_name":"transfer","tx_code":"bck","tx_subcode":"5db6eb0ffaf529390f4f5513","i_sent":false,"header":"header","sub_header":"Te restituyeron monto por transacción undefined","quantity":3.5,"quantity_txt":"3.5000 INK","id":"18f385cf118ebdf203552b34a1e68f29ed64df17c27790a6ae252df63a060bcf","block_time":"2019-10-31T18:57:40","block_time_number":20191031185740,"transaction_id":"18f385cf118ebdf203552b34a1e68f29ed64df17c27790a6ae252df63a060bcf","block_num":57683379},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"from":"inkirimaster","memo":"bck|5db6eae9faf529390f4f5512|","quantity":"3.5000 INK","to":"yogamatrix12"},"hex_data":"7055c646baebe074204277371b6918f5b88800000000000004494e4b000000001d62636b7c3564623665616539666166353239333930663466353531327c","tx_type":"transfer_bck","request":{"requested_type":"type_refund","request_id":"5db6eae9faf529390f4f5512","request_counter":null},"tx_name":"transfer","tx_code":"bck","tx_subcode":"5db6eae9faf529390f4f5512","i_sent":false,"header":"header","sub_header":"Te restituyeron monto por transacción undefined","quantity":3.5,"quantity_txt":"3.5000 INK","id":"5525b428dcc4931599fac611256d7c99698ba31cc87428c80c2e292cdfe5ab19","block_time":"2019-10-31T19:00:11","block_time_number":20191031190011,"transaction_id":"5525b428dcc4931599fac611256d7c99698ba31cc87428c80c2e292cdfe5ab19","block_num":57683679},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"yogamatrix12","permission":"active"}],"data":{"from":"yogamatrix12","memo":"prv|5dbb2f9ffdcfb61717d85fdb","quantity":"12.0000 INK","to":"inkirimaster"},"hex_data":"204277371b6918f57055c646baebe074c0d401000000000004494e4b000000001c7072767c356462623266396666646366623631373137643835666462","tx_type":"transfer_prv","request":{"requested_type":"type_provider","request_id":"5dbb2f9ffdcfb61717d85fdb","request_counter":null},"tx_name":"transfer","tx_code":"prv","tx_subcode":"5dbb2f9ffdcfb61717d85fdb","i_sent":true,"header":"header","sub_header":"Solicitaste pago a proveedor. Request_id:5dbb2f9ffdcfb61717d85fdb","quantity":12,"quantity_txt":"12.0000 INK","id":"3e70087eca6eb588130e3e8c24bf129faeb9a32d99488ca27f2bd2259b84ac13","block_time":"2019-10-31T19:01:53","block_time_number":20191031190153,"transaction_id":"3e70087eca6eb588130e3e8c24bf129faeb9a32d99488ca27f2bd2259b84ac13","block_num":57683884},{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkirimaster","permission":"active"}],"data":{"from":"inkirimaster","memo":"bck|5dbb2f9ffdcfb61717d85fdb|","quantity":"12.0000 INK","to":"yogamatrix12"},"hex_data":"7055c646baebe074204277371b6918f5c0d401000000000004494e4b000000001d62636b7c3564626232663966666463666236313731376438356664627c","tx_type":"transfer_bck","request":{"requested_type":"type_refund","request_id":"5dbb2f9ffdcfb61717d85fdb","request_counter":null},"tx_name":"transfer","tx_code":"bck","tx_subcode":"5dbb2f9ffdcfb61717d85fdb","i_sent":false,"header":"header","sub_header":"Te restituyeron monto por transacción undefined","quantity":12,"quantity_txt":"12.0000 INK","id":"63eed88898f01979d9065c4de9d39fbe4961a4bacf419cdac81eca776a57e30d","block_time":"2019-10-31T21:48:55","block_time_number":20191031214855,"transaction_id":"63eed88898f01979d9065c4de9d39fbe4961a4bacf419cdac81eca776a57e30d","block_num":57703846}]
    // })
    // return;
    

    let account_name = this.props.actualAccountName;
    // console.log(' pages::business::extrato >> this.props.actualAccountName:', this.props.actualAccountName, ' | fetching history for:', account_name)
    
    let that = this;
    this.setState({loading:true});
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
    
    const _txs          = [...this.state.txs, ...data.txs];
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
    const money_in  = txs.filter( tx => tx.i_sent)
                    .map(tx =>tx.quantity)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const money_out = txs.filter( tx => !tx.i_sent)
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
    if(this.state.active_tab==DISPLAY_PROVIDER){
      content = (
        <TransactionTable 
          key={'table_'+DISPLAY_PROVIDER} 
          need_refresh={this.state.need_refresh[DISPLAY_PROVIDER]}
          request_type={DISPLAY_PROVIDER} 
          onChange={this.onTableChange}
          callback={this.onRequestClick}
          />
      );
    }
    
    //


    if(this.state.active_tab==DISPLAY_ALL_TXS){
      // content = (
      //   <Table
      //     key={"table_"+DISPLAY_ALL_TXS} 
      //     rowKey={record => record.id} 
      //     loading={this.state.loading} 
      //     columns={columns_helper.getDefaultColumns(this.props.actualRoleId, this.onTransactionClick)} 
      //     dataSource={this.state.txs} 
      //     footer={() => this.renderFooter()}
      //     pagination={this.state.pagination}
      //     scroll={{ x: 700 }}
      //     />
      // );

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
          footer={
           <></>   
          }
        >
        </PageHeader>
        <div className="styles standardList" style={{ marginTop: 0 }}>
          <Card key="tabs_card" bordered={false}>
            <Tabs  defaultActiveKey={DISPLAY_ALL_TXS} onChange={this.onTabChange}>
              <TabPane tab="All"       key={DISPLAY_ALL_TXS} />
              <TabPane tab="Deposits"  key={DISPLAY_DEPOSIT} />
              <TabPane tab="Withdraws" key={DISPLAY_WITHDRAWS} />
              <TabPane tab="Provider payments"  key={DISPLAY_PROVIDER} />
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
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRole:           loginRedux.actualRole(state),
        actualRoleId:         loginRedux.actualRoleId(state),
        balance:              balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(Extrato)));