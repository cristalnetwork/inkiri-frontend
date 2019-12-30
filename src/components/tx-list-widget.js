import React, {useEffect, useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as pageRedux from '@app/redux/models/page'
import * as loginRedux from '@app/redux/models/login'
import * as operationsRedux from '@app/redux/models/operations'

import { Table, Button, Tooltip } from 'antd';

import OperationsFilter from '@app/components/Filters/operations';
import TableStats, { buildItemUp, buildItemDown, buildItemCompute, buildItemSimple} from '@app/components/TransactionTable/stats';

import * as request_helper from '@app/components/TransactionCard/helper';
import * as columns_helper from '@app/components/TransactionTable/columns';

import IntlMessages from "@app/components/intl-messages";

const TxListWidget = (props) => {

  const [key, setKey]                   = useState(props.the_key);
  const [stats, setStats]               = useState([]);
  const [txs, setTxs]                   = useState(props.operations[props.the_key]||props.rawOperations);
  const [pagination, setPagination]     = useState({ pageSize: 0 , total: 0 })
  const [isMobile, setIsMobile]         = useState(props.isMobile)
  const [isOperationsLoading, setIsOperationsLoading] = useState(props.isOperationsLoading)

  useEffect(() => {
    setIsOperationsLoading(props.isOperationsLoading);
  }, [props.isOperationsLoading]);

  useEffect(() => {
    setIsMobile(props.isMobile);
  }, [props.isMobile]);

  useEffect(() => {
    setKey(props.the_key);
  }, [props.the_key]);

  useEffect(() => {
    console.log(' tx-list-widget::trySetFilterKeyValue ... ')
    props.trySetFilterKeyValue(props.the_key, {});
  }, []);

  var t_id3 = null;
  useEffect(() => {
    const opers = props.operations[key]||props.rawOperations;
    setTxs(opers);
    const _pagination = {
      pageSize : (opers||[]).length,
      total    : (opers||[]).length};
    setPagination(_pagination);
    
    // clearTimeout(t_id3);
    // t_id3 = setTimeout(()=> {
    //   // buildStats()
    // } ,100); 
  }, [props.operations]);

  // const loadBlockchainTXs = () => {
  //   if(!txs||txs.length==0)
  //     props.loadBlockchainOperations();
  // }

  var t_id2 = null;
  const operationsFilterCallback = (error, cancel, values) => {
    
    if(cancel)
    {
      return;
    }
    if(error)
    {
      return;
    }

    console.log(' Vino callback de filters:', values)

    clearTimeout(t_id2);
    t_id2 = setTimeout(()=> {
      console.log('about to set filter')
      props.trySetFilterKeyValue(props.the_key, values);
    } ,100);
    
  }

  const buildStats = () => {
    
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
    setStats(items);
  }

  var t_id = null;
  const onTransactionClick = (tx) => {
    
    if(!props.callback || typeof props.callback !== 'function')
      return;
    clearTimeout(t_id);
    t_id = setTimeout(()=> {
      props.callback(tx)
    } ,100);
  }

  const footer = () => {
    return (<><Button key="load-more-data" disabled={!props.operationsCursor} onClick={()=>props.loadOldBlockchainOperations()}>More!!</Button> </>)
  }

  return(
      <>
        { !isMobile && <OperationsFilter callback={operationsFilterCallback} /> }
        <TableStats stats_array={stats}/>
        <div className="code-box-actions">
            <Tooltip title={<IntlMessages id="components.tx-list-widget.refresh" />} >
              <Button 
                type="link" 
                icon="plus" 
                onClick={() => props.loadNewBlockchainOperations()} 
                className="load_more_txs"
                disabled={isOperationsLoading} 
                >More</Button>
            </Tooltip>
        </div>
        <Table
          key={'table_'+key} 
          rowKey={record => record.id} 
          loading={isOperationsLoading} 
          columns={ columns_helper.getColumnsBlockchainTXs(onTransactionClick)} 
          dataSource={txs} 
          footer={() => footer()}
          pagination={pagination}
          onRow={(record, rowIndex) => {
            return { onDoubleClick: event => { onTransactionClick(record) }
            };
          }}
          scroll={{ x: 950 }}
          />
      </>
    );
}
//
export default connect(
    (state)=> ({
        operations:           operationsRedux.operations(state),
        rawOperations:        operationsRedux.rawOperations(state),
        isOperationsLoading:  operationsRedux.isOperationsLoading(state),
        operationsCursor:     operationsRedux.operationsCursor(state),
        filterKeyValues:      operationsRedux.filterKeyValues(state),

        actualAccountName:    loginRedux.actualAccountName(state),
        page_key_values:      pageRedux.pageKeyValues(state),

        isMobile :            menuRedux.isMobile(state),
    }),
    (dispatch)=>({
        setPageKeyValue:      bindActionCreators(pageRedux.setPageKeyValue, dispatch),
        trySetFilterKeyValue: bindActionCreators(operationsRedux.trySetFilterKeyValue, dispatch),

        loadOldBlockchainOperations:  bindActionCreators(operationsRedux.loadOldBlockchainOperations, dispatch),
        loadBlockchainOperations:     bindActionCreators(operationsRedux.loadBlockchainOperations, dispatch),
        loadNewBlockchainOperations:  bindActionCreators(operationsRedux.loadNewBlockchainOperations, dispatch),
    })
)(TxListWidget)

