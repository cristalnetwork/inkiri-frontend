import React, {useEffect, useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as pageRedux from '@app/redux/models/page'
import * as loginRedux from '@app/redux/models/login'
import * as menuRedux from '@app/redux/models/menu';

import RequestsFilter from '@app/components/Filters/requests';
import TableStats, { buildItemUp, buildItemDown, buildItemCompute, buildItemSimple} from '@app/components/TransactionTable/stats';

import TransactionTable, { DISPLAY_ALL_TXS, DISPLAY_DEPOSIT, DISPLAY_EXCHANGES, DISPLAY_PAYMENTS, DISPLAY_REQUESTS, DISPLAY_WITHDRAWS, DISPLAY_PROVIDER, DISPLAY_SEND, DISPLAY_SERVICE} from '@app/components/TransactionTable';
import {REQUEST_MODE_BANK_TRANSFERS, REQUEST_MODE_EXTRATO, REQUEST_MODE_ALL, REQUEST_MODE_INNER_PAGE } from '@app/components/TransactionTable';
import * as request_helper from '@app/components/TransactionCard/helper';
import { injectIntl } from "react-intl";

export {REQUEST_MODE_BANK_TRANSFERS, REQUEST_MODE_EXTRATO, REQUEST_MODE_ALL, REQUEST_MODE_INNER_PAGE };

const RequestListWidget = (props) => {

  // const [stored, setStored]             = useState(props.page_key_values);
  const [key, setKey]                            = useState(props.the_key);
  const [filter, setFilter]                      = useState(props.filter);
  const [request_type, setRequestType]           = useState(props.request_type);
  const [filter_hidden_fields, setHiddenFields]  = useState(props.search_hidden_fields || []);
  const [mode, setMode]                          = useState(props.mode || REQUEST_MODE_ALL);
  const [table_ref, setTableRef]                 = useState(null);
  const [stats, setStats]                        = useState([]);
  const [hide_stats, setHideStats]               = useState(props.hide_stats||false);
  
  useEffect(() => {
      setHideStats(props.hide_stats);
    }, [props.hide_stats]);
  useEffect(() => {
      setHiddenFields(props.filter_hidden_fields || []);
    }, [props.filter_hidden_fields]);
  useEffect(() => {
      setFilter(props.filter);
    }, [props.filter]);
  useEffect(() => {
      setMode(props.mode);
    }, [props.mode]);
  
  var t_id2 = null;
  const requestFilterCallback = (error, cancel, values, refresh) => {
    
    if(cancel)
    {
      return;
    }
    if(error)
    {
      return;
    }

    if(refresh)
    {
      if(table_ref)
      {
        clearTimeout(t_id2);
        t_id2 = setTimeout(()=> {
          table_ref.refresh()
        } ,100);
      }
      return;
    }
    
    if(table_ref && values!==undefined)
    {
      clearTimeout(t_id2);
      t_id2 = setTimeout(()=> {
        table_ref.applyFilter({...values, ...(filter||{})})
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
        buildItemUp(props.intl.formatMessage( { id:'components.request-list-widget.stats.money-in'}) , money_in)
        , buildItemDown(props.intl.formatMessage( { id:'components.request-list-widget.stats.money-out'}) , money_out)
        , buildItemCompute(props.intl.formatMessage( { id:'components.request-list-widget.stats.balance-movement'}) , (money_in-money_out))
        , buildItemSimple(props.intl.formatMessage( { id:'components.request-list-widget.stats.transactions-count'}) , (count||0))
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
      { !props.isMobile && <RequestsFilter 
              callback={requestFilterCallback} 
              request_type={request_type}
              hidden_fields={filter_hidden_fields} />}
      { !props.isMobile && !hide_stats && <TableStats stats_array={stats}/> }
      <TransactionTable 
        onChange={onTableChange}
        key={'table_'+key} 
        request_type={request_type} 
        callback={onRequestClick}
        onRef={ref => (setTableRef(ref))}
        filter={filter}
        mode={mode}
        />
      </>
    )
}

export default connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        page_key_values:      pageRedux.pageKeyValues(state),
        isAdmin:              loginRedux.isAdmin(state),
        isMobile :            menuRedux.isMobile(state),
    }),
    (dispatch)=>({
        setPageKeyValue:      bindActionCreators(pageRedux.setPageKeyValue, dispatch),
      
    })
)(injectIntl(RequestListWidget))

