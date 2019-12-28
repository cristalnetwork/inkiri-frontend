import React, {useEffect, useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as pageRedux from '@app/redux/models/page'
import * as loginRedux from '@app/redux/models/login'

import RequestsFilter from '@app/components/Filters/requests';
import TableStats, { buildItemUp, buildItemDown, buildItemCompute, buildItemSimple} from '@app/components/TransactionTable/stats';

import TransactionTable, { DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_EXCHANGES, DISPLAY_PAYMENTS, DISPLAY_REQUESTS, DISPLAY_WITHDRAWS, DISPLAY_PROVIDER, DISPLAY_SEND, DISPLAY_SERVICE} from '@app/components/TransactionTable';
import * as request_helper from '@app/components/TransactionCard/helper';

const RequestListWidget = (props) => {

  // const [stored, setStored]             = useState(props.page_key_values);
  const [key, setKey]                   = useState(props.key);
  const [request_type, setRequestType]  = useState(props.request_type);
  // const [cb, setCB]                     = useState(props.callback);
  
  const [table_ref, setTableRef]        = useState(null);
  const [stats, setStats]               = useState([]);
  
  // useEffect(() => {
  //   setCB(props.callback);
  // }, [props.callback]);

  // useEffect(() => {
  //   setStored(props.page_key_values);
  // }, [props.page_key_values]);

  var t_id2 = null;
  const requestFilterCallback = (error, cancel, values) => {
    
    if(cancel)
    {
      return;
    }
    if(error)
    {
      return;
    }

    if(table_ref && values!==undefined)
    {
      clearTimeout(t_id2);
      t_id2 = setTimeout(()=> {
        table_ref.applyFilter(values)
      } ,100);
    }
  }

  var t_id3 = null;
  const onTableChange = (key, txs) => {
    console.log('onTableChange', key)
    clearTimeout(t_id3);
    t_id3 = setTimeout(()=> {
      buildStats(txs)
    } ,100);
  }

  const buildStats = (txs) => {
    
    console.log('buildStats')
    const money_in  = txs.filter( tx => request_helper.blockchain.is_money_in(tx, props.actualAccountName))
                    .map(tx =>tx.amount)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const money_out = txs.filter( tx => request_helper.blockchain.is_money_out(tx, props.actualAccountName))
                    .map(tx =>tx.amount)
                    .reduce((acc, amount) => acc + Number(amount), 0);
    const count = txs.length;
    
    const items = [
        buildItemUp('Entradas', money_in)
        , buildItemDown('Saidas', money_out)
        , buildItemCompute('Variacao de caja', (money_in-money_out))
        , buildItemSimple('Transações', (count||0))
      ];
    console.log('...about to set stats')
    setStats(items);
  }

  var t_id = null;
  const onRequestClick = (request) => {
    
    if(!props.callback || typeof props.callback !== 'function')
      return;
    clearTimeout(t_id);
    t_id = setTimeout(()=> {
      props.callback(request)
    } ,100);
  }

  return(
      <>
      <RequestsFilter callback={requestFilterCallback} />
      <TableStats stats_array={stats}/>
      <TransactionTable 
        onChange={onTableChange}
        key={'table_'+key} 
        request_type={request_type} 
        callback={onRequestClick}
        onRef={ref => (setTableRef(ref))}
        />
      </>
    )
}

export default connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        page_key_values:      pageRedux.pageKeyValues(state),
    }),
    (dispatch)=>({
        setPageKeyValue:      bindActionCreators(pageRedux.setPageKeyValue, dispatch),
      
    })
)(RequestListWidget)

