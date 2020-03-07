import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import {i18n} from '@app/lang/provider'; 
/*
* Explode raw event/search result transaction to a human readable format.
*  
*/
export const toReadable = (account_name, transaction) => {
  
  const is_ws_event       = (typeof transaction.data !== 'undefined');
  const is_search         = (typeof transaction.lifecycle !== 'undefined');
  const is_spectrum_event = (typeof transaction.action !== 'undefined');
  const is_graphql        = (!is_ws_event&&!is_search&&!is_spectrum_event)//(typeof transaction.undo !== 'undefined');

  if(is_graphql)
  {
    return toReadableGraphQL(account_name, transaction);
  }

  if(is_spectrum_event)
  {
    return toReadableSpectrum(account_name, transaction);
  }

  const operations       = (is_ws_event)
    ? [transaction.data.trace]
    : transaction.lifecycle.execution_trace.action_traces;
  
  const transaction_data = (is_ws_event)
    ? transaction.data
    : transaction.lifecycle.execution_trace;

  const getMainAction = (operation) => {
    return operation.act?operation.act:operation;
  }
  const readable_operations  = operations.map( operation => getOperationMetadata(account_name, getMainAction(operation)));
  const readable_transaction = buildHeadersMulti(account_name, operations[0].act)
  
  const total_Amount          = operations.reduce(function (accumulator, operation) {
    return accumulator + globalCfg.currency.toNumber(getMainAction(operation).data.quantity);
  }, 0);
  

  return {
    id :                (!is_ws_event)?transaction_data.id:transaction_data.trx_id
    , block_time:        transaction_data.block_time.split('.')[0]
    , block_time_number: utils.dateToNumber(transaction_data.block_time)
    , transaction_id:    (is_ws_event)?transaction_data.trx_id:transaction_data.id
    , block_num:         transaction_data.block_num
    
    , ...operations[0].act

    , operations:        readable_operations
    , ...readable_operations[0]
    , ...readable_transaction
    , amount : total_Amount
  }
}

const toReadableSpectrum = (account_name, tx) => {
  console.log('..toReadableSpectrum..')
  console.log('..toReadableSpectrum..#1')
  let readable_operations  = [getOperationMetadata(account_name, tx.action.act)];
  console.log('..toReadableSpectrum..#2')
  let total_Amount         = globalCfg.currency.toNumber(tx.action.act.data.quantity);
  console.log('..toReadableSpectrum..#3')
  let my_oper  = readable_operations[0];
  let raw_oper = tx.action.act;
  console.log('..toReadableSpectrum..#4')
  return {
    id :                 tx.action.trxid
    , transaction_id:    tx.action.trxid
    , block_time:        tx.action.block_timestamp.split('.')[0]
    , block_time_number: utils.dateToNumber(tx.action.block_timestamp.split('.')[0])
    , block_num:         tx.action.block_num
    , ...raw_oper
    , operations:        readable_operations
    , ...my_oper
    // , ...readable_transaction
    , amount : total_Amount
  }  
}
const toReadableGraphQL = (account_name, tx) => {

  let readable_operations   = tx.trace.topLevelActions.map( operation => getOperationMetadata(account_name, operation));
  // const readable_transaction = buildHeadersMulti(account_name, operations[0].act)
  let total_Amount          = tx.trace.topLevelActions.reduce(function (accumulator, operation) {
    return accumulator + globalCfg.currency.toNumber(operation.data.quantity);
  }, 0);

  let my_oper  = readable_operations[0];
  let raw_oper = tx.trace.topLevelActions[0];
  const test   = readable_operations.filter(oper => oper.to==account_name).length>0;
  if(tx.trace.topLevelActions.length>1 
      && my_oper.request.requested_type==globalCfg.api.TYPE_SALARY
      && test)
  {
    my_oper  = readable_operations.filter(oper => oper.to==account_name)[0];
    // console.log('readable_operations:', readable_operations)
    raw_oper = tx.trace.topLevelActions.filter(oper => oper.data.to==account_name)[0];
    // console.log('tx.trace.topLevelActions:', tx.trace.topLevelActions)
    readable_operations = [my_oper];
    total_Amount = globalCfg.currency.toNumber(raw_oper.data.quantity);
    // console.log('raw_oper:', raw_oper);

  }

  

  return {
    id :                 tx.trace.id
    , transaction_id:    tx.trace.id
    , block_time:        tx.block.timestamp.split('.')[0]
    , block_time_number: utils.dateToNumber(tx.block.block_time)
    , block_num:         tx.block.num
    , ...raw_oper
    , operations:         readable_operations
    , ...my_oper
    // , ...readable_transaction
    , amount : total_Amount
  }
}

function getOperationMetadata(account_name, operation){
  
  const tx         = operation; // .action_traces[0].act;
  const tx_type    = combineTxNameCode(tx);
  const i_sent     = isSender(account_name, tx)
  const request    = getRequestMetadata(tx, tx_type)
  const headers    = buildHeaders(account_name, tx, i_sent, tx_type);
  return {
    ...headers,
    tx_type:               tx_type,
    request:               request,
    i_sent:                i_sent,
    amount:                getTxQuantityToNumber(tx),
    // quantity_txt:          getTxQuantity(tx)
    // may_have_newer_tx:     mayTxHaveNewerTx(tx_code),
    // may_have_private_data: mayTxHavePrivateData(tx_code),
    // visible:               isVisibleTx(tx_code)
  };
}


// BUSINESS
// "memo": "prv|5d925b3cb1651e30fd49eb9f",
// "memo": "prv|undefined",
// "memo": "bck|5db7616e780dab1a00f54d3f|",
//
// PERSONAL
// "memo": "snd",
// "memo": "dep|brls|43",
// "memo": "dep|iks|44",
// "memo": "wth|5dbcf5251cb05e4cda1ca6e0",
// "memo": "bck|5dbcf5691cb05e4cda1ca6e1|",
// "memo": "xch|5dbfca1541450422692e792c|5dbfa68fcae447637f2bbe46",

const getRequestMetadata = (tx, tx_type) => {
  if(!tx_type) tx_type   = combineTxNameCode(tx);
  
  const tx_code   = getTxCode(tx);
  
  const requested_type   = keyCodeToRequestType(tx_type);
  
  const _default = (request_id, request_counter) => {
      return {
            requested_type:        requested_type,
            request_id:            request_id||null,
            request_counter:       request_counter||null
      };
    }
  
  const memo = getTxMemoSplitted(tx)
  if(!memo) return _default();
    
  switch(memo[0]){
    case MEMO_KEY_DEP:
      return _default(null, memo[2])
      break;
    case MEMO_KEY_IUG:
      return _default()
      break;
    case MEMO_KEY_OFT:
      return _default()
      break;
    case MEMO_KEY_BCK:
      return _default(memo[1], null)
      break;
    case MEMO_KEY_WTH:
      return _default(memo[1], null)
      break;
    case MEMO_KEY_XCH:
      // memo[2] -> commercial bank account id
      return _default(memo[1], null);
      break;
    case MEMO_KEY_PRV:
      return _default(memo[1], null);
      break;
    case MEMO_KEY_SND:
    return _default();
      break;
    case MEMO_KEY_PAY:
      return _default();
      break;
    case MEMO_KEY_PAP:
      return _default();
      break;
    default:
      return _default();
  }
}

// export const getEOSQuantityToNumber = (quantity) => { 
// 	return !quantity?0:Number(quantity.replace(globalCfg.currency.eos_symbol, ''));
// }

const getTxMemo = (tx) =>{
  return (tx.data && tx.data.memo)?tx.data.memo:''; 
}
const getTxMemoSplitted = (tx) =>{
  return getTxMemo(tx).split('|'); 
}

function getTxQuantity(tx)             { return tx.data.quantity;}
function getTxQuantityToNumber(tx)     { return globalCfg.currency.toNumber(tx.data.quantity); }
function getTxName(tx)                 { return tx.name ; }
function getTxCode(tx)                 { return getTxMemoSplitted(tx)[0]; }
function getTxSubCode(tx)              { const memo = getTxMemoSplitted(tx); return (!memo||memo.length<1)?'':memo[1];}
function combineTxNameCode(tx)         { return getTxName(tx) + '_' + getTxCode(tx) ; }
function isTransfer(param)             { return param=='transfer';}
function isIssue(param)                { return param=='issue'; }
function isSender(account_name, tx)    { 
  const ret = tx.data.to!==account_name; 
  
  // if(tx.data.memo && tx.data.memo.indexOf('slr')>-1)
  // {
  //   console.log(' -- isSender')
  //   console.log(' tx:', tx)
  //   console.log(' account_name', account_name)
  //   console.log(' result?', ret)
  // }

  return ret;}

// function mayTxHaveNewerTx(tx_code){
//   const search = ['transfer_bck']; 
//   return search.indexOf(tx_code)>=0;
// }
// function mayTxHavePrivateData(tx_code){
//   const search = ['transfer_bck', 'transfer_xch', 'transfer_pap', 'issue_iug'];
//   return search.indexOf(tx_code)>=0;
// }
// function isVisibleTx(tx_code){
//   return true;
// }
 
const  MEMO_KEY_DEP =  'dep';
const  MEMO_KEY_IUG =  'iug';
const  MEMO_KEY_OFT =  'oft';
const  MEMO_KEY_BCK =  'bck';
const  MEMO_KEY_WTH =  'wth';
const  MEMO_KEY_XCH =  'xch';
const  MEMO_KEY_PRV =  'prv';
const  MEMO_KEY_SND =  'snd';
const  MEMO_KEY_PAY =  'pay';
const  MEMO_KEY_PAP =  'pap';
const  MEMO_KEY_SLR =  'slr';

const KEY_ISSUE_DEP    =  'issue_'+MEMO_KEY_DEP;
const KEY_ISSUE_IUG    =  'issue_'+MEMO_KEY_IUG;
const KEY_ISSUE_OFT    =  'issue_'+MEMO_KEY_OFT;
const KEY_TRANSFER_BCK =  'transfer_'+MEMO_KEY_BCK;
const KEY_TRANSFER_WTH =  'transfer_'+MEMO_KEY_WTH;
const KEY_TRANSFER_XCH =  'transfer_'+MEMO_KEY_XCH;
const KEY_TRANSFER_PRV =  'transfer_'+MEMO_KEY_PRV;
const KEY_TRANSFER_SND =  'transfer_'+MEMO_KEY_SND;
const KEY_TRANSFER_PAY =  'transfer_'+MEMO_KEY_PAY;
const KEY_TRANSFER_PAP =  'transfer_'+MEMO_KEY_PAP;
const KEY_TRANSFER_SLR =  'transfer_'+MEMO_KEY_SLR;

const KEY_NEW_ACCOUNT  =  `newaccount_`;
const KEY_UPSERT_CUST  =  `${globalCfg.bank.table_customers_action}_`;
const KEY_ERASE_CUST   =  `${globalCfg.bank.table_customers_delete}_`;
const KEY_UPSERT_PAP   =  `${globalCfg.bank.table_paps_action}_${MEMO_KEY_PAP}`;
const KEY_ERASE_PAP    =  `${globalCfg.bank.table_paps_delete}_`;
const KEY_CHARGE_PAP   =  `${globalCfg.bank.table_paps_charge}_${MEMO_KEY_PAP}`;

const typesMap = {
  [KEY_ISSUE_DEP]     : globalCfg.api.TYPE_DEPOSIT,
  [KEY_ISSUE_IUG]     : globalCfg.api.TYPE_IUGU,
  [KEY_ISSUE_OFT]     : globalCfg.api.TYPE_ISSUE,
  [KEY_TRANSFER_BCK]  : globalCfg.api.TYPE_REFUND,
  [KEY_TRANSFER_WTH]  : globalCfg.api.TYPE_WITHDRAW,
  [KEY_TRANSFER_XCH]  : globalCfg.api.TYPE_EXCHANGE,
  [KEY_TRANSFER_PRV]  : globalCfg.api.TYPE_PROVIDER,
  [KEY_TRANSFER_SND]  : globalCfg.api.TYPE_SEND,
  [KEY_TRANSFER_PAY]  : globalCfg.api.TYPE_PAYMENT,
  [KEY_TRANSFER_PAP]  : globalCfg.api.TYPE_SERVICE,
  [KEY_TRANSFER_SLR]  : globalCfg.api.TYPE_SALARY,

  [KEY_NEW_ACCOUNT]   : globalCfg.api.TYPE_NEW_ACCOUNT,
  [KEY_UPSERT_CUST]   : globalCfg.api.TYPE_UPSERT_CUST,
  [KEY_ERASE_CUST]    : globalCfg.api.TYPE_ERASE_CUST,
  [KEY_UPSERT_PAP]    : globalCfg.api.TYPE_UPSERT_PAP,
  [KEY_ERASE_PAP]     : globalCfg.api.TYPE_ERASE_PAP,
  [KEY_CHARGE_PAP]    : globalCfg.api.TYPE_CHARGE_PAP,
}
const keyCodeToRequestType = (key_code) => {
  const my_type = typesMap[key_code];
  return my_type || globalCfg.api.TYPE_UNKNOWN;
}

function buildHeadersMulti(account_name, tx){
  const tx_type    = combineTxNameCode(tx);
  const i_sent     = isSender(account_name, tx)
  return buildHeadersImpl(account_name, tx, i_sent, tx_type, true);
}

function buildHeaders(account_name, tx, i_sent, tx_type){
  return buildHeadersImpl(account_name, tx, i_sent, tx_type, false);
}

function buildHeadersImpl(account_name, tx, i_sent, tx_type, multi){
  const memo_parts  = getTxMemoSplitted(tx);
  const _suffix_key = i_sent?'_sent':'_received';
  switch(tx_type) {
    case KEY_ISSUE_DEP:
      return { 
              header:                 i18n({id:'transactions.issue_dep.header'})
              , sub_header:           i18n({id:'transactions.issue_dep.sub_header'})
              , sub_header_admin:     i18n({id:'transactions.issue_dep.sub_header_admin'})
              , sub_header_admin_ex:  i18n({id:'transactions.issue_dep.sub_header_admin_ex'}, {to:tx.data.to})
            };
      break;
    case KEY_ISSUE_IUG:
      return { header:                i18n({id:'transactions.issue_iug.header'}) 
              , sub_header:           i18n({id:'transactions.issue_iug.sub_header'})
              , sub_header_admin:     i18n({id:'transactions.issue_iug.sub_header_admin'})
              , sub_header_admin_ex:  i18n({id:'transactions.issue_iug.sub_header_admin_ex'}, {to:tx.data.to})
            };
      break;
    case KEY_ISSUE_OFT:
      return { header:                 i18n({id:'transactions.issue_oft.header'})
              , sub_header:            i18n({id:'transactions.issue_oft.sub_header'}) 
              , sub_header_admin:      i18n({id:'transactions.issue_oft.sub_header_admin'})
              , sub_header_admin_ex:   i18n({id:'transactions.issue_oft.sub_header_admin_ex'}, {to:tx.data.to})
            };
      break;
    case KEY_TRANSFER_BCK:
      return { header:                 i18n({id:'transactions.transfer_bck.header'})
              , sub_header:            i18n({id:'transactions.transfer_bck.sub_header'})
              , sub_header_admin:      i18n({id:'transactions.transfer_bck.sub_header_admin'})
              , sub_header_admin_ex:   i18n({id:'transactions.transfer_bck.sub_header_admin_ex'}, {from:tx.data.from}) 
              , to: tx.data.to };
      break;
    case KEY_TRANSFER_WTH:
      return { header:                 i18n({id:'transactions.transfer_wth.header'}) 
              , sub_header:            i18n({id:'transactions.transfer_wth.sub_header'}) 
              , sub_header_admin:      i18n({id:'transactions.transfer_wth.sub_header_admin'}) 
              , sub_header_admin_ex:   i18n({id:'transactions.transfer_wth.sub_header_admin_ex'}, {from:tx.data.from})  
              , from: tx.data.from};
      break;
    case KEY_TRANSFER_XCH:
      return { header:                 i18n({id:'transactions.transfer_xch.header'}) 
              , sub_header:            i18n({id:'transactions.transfer_xch.sub_header'}) 
              , sub_header_admin:      i18n({id:'transactions.transfer_xch.sub_header_admin'}) 
              , sub_header_admin_ex:   i18n({id:'transactions.transfer_xch.sub_header_admin_ex'}, {from:tx.data.from})  
              , from: tx.data.from};
      break;
    case KEY_TRANSFER_PRV:
      return { header:                 i18n({id:'transactions.transfer_prv.header'}) 
              , sub_header:            i18n({id:'transactions.transfer_prv.sub_header'}) 
              , sub_header_admin:      i18n({id:'transactions.transfer_prv.sub_header_admin'}) 
              , sub_header_admin_ex:   i18n({id:'transactions.transfer_prv.sub_header_admin_ex'}, {from:tx.data.from})  
              , from: tx.data.from};
      break;
    case KEY_TRANSFER_PAY:
      return { 
              header:                 i18n({id:'transactions.transfer_pay.header'})
              , sub_header:           i18n({id:`transactions.transfer_pay.sub_header${_suffix_key}`}, {account:(i_sent?tx.data.to:tx.data.from)})   
              , sub_header_admin:     i18n({id:'transactions.transfer_pay.sub_header_admin'})
              , sub_header_admin_ex:  i18n({id:'transactions.transfer_pay.sub_header_admin_ex'}, {from:tx.data.from, to:tx.data.to})   
              , from: tx.data.from
              , to:   tx.data.to};
      break;
    case KEY_TRANSFER_PAP:
      return { header:                 i18n({id:'transactions.transfer_pap.header'})
              , sub_header:            i18n({id:'transactions.transfer_pap.sub_header'})
              , sub_header_admin:      i18n({id:'transactions.transfer_pap.sub_header_admin'})
              , sub_header_admin_ex:   i18n({id:'transactions.transfer_pap.sub_header_admin_ex'}, {from:tx.data.from, to:tx.data.to})
              , from: tx.data.from
              , to:   tx.data.to};
      break;
    case KEY_TRANSFER_SLR:
      const salary_period          = (i_sent&&memo_parts&&memo_parts.length>0) 
          ?` - ${memo_parts[1]}`
          :'';
        
      if(multi)
      {
        return { 
              header:                 i18n({id:'transactions.transfer_slr_multi.header'})
              , sub_header:           i18n({id:`transactions.transfer_slr_multi.sub_header${_suffix_key}`}, {period:salary_period})   
              , sub_header_admin:     i18n({id:'transactions.transfer_slr_multi.sub_header_admin'})
              , sub_header_admin_ex:  i18n({id:'transactions.transfer_slr_multi.sub_header_admin_ex'}, {from:tx.data.from, period:salary_period})   
              , from: tx.data.from
              , to:   tx.data.to};
        // return { header:                'Salary Payment'
        //         , sub_header:           i_sent?`You sent a Salary Payment. - ${memo_parts[1]}`:'Salary Payment'
        //         , sub_header_admin:     'Salary Payment'
        //         , sub_header_admin_ex:  `@${tx.data.from} paid salary. - ${memo_parts[1]}`
        //         , from: tx.data.from
        //         , to:   tx.data.to};  
      }
      return { 
            header:                 i18n({id:'transactions.transfer_slr_single.header'})
            , sub_header:           i18n({id:`transactions.transfer_slr_single.sub_header${_suffix_key}`}, {period:salary_period, account:i_sent?tx.data.to:tx.data.from})   
            , sub_header_admin:     i18n({id:'transactions.transfer_slr_single.sub_header_admin'})
            , sub_header_admin_ex:  i18n({id:'transactions.transfer_slr_single.sub_header_admin_ex'}, {from:tx.data.from, to:tx.data.to, period:salary_period})   
            , from: tx.data.from
            , to:   tx.data.to
          };
      // return { header:                 'Salary Payment'
      //         , sub_header:            i_sent?`You paid salary to @${tx.data.to}. - ${memo_parts[1]}`:`@${tx.data.from} paid you a salary. - ${memo_parts[1]}`
      //         , sub_header_admin:      'You paid salary to'
      //         , sub_header_admin_ex:   `@${tx.data.from} paid salary to @${tx.data.to}. - ${memo_parts[1]}`
      //         , from: tx.data.from
      //         , to:   tx.data.to};
      break;
    case KEY_TRANSFER_SND:
      return { 
              header:                 i18n({id:'transactions.transfer_snd.header'})
              , sub_header:           i18n({id:`transactions.transfer_snd.sub_header${_suffix_key}`}, {account:i_sent?tx.data.to:tx.data.from})
              , sub_header_admin:     i18n({id:'transactions.transfer_snd.sub_header_admin'}) 
              , sub_header_admin_ex:  i18n({id:'transactions.transfer_snd.sub_header_admin_ex'}, {from:tx.data.from, to:tx.data.to})
              , from: tx.data.from
              , to:   tx.data.to
            };
      break;
    case KEY_NEW_ACCOUNT:
      return { header:                 i18n({id:'transactions.new_account.header'})
              , sub_header:            i18n({id:'transactions.new_account.sub_header'}, {name:tx.data.name})
              , sub_header_admin:      i18n({id:'transactions.new_account.sub_header_admin'}, {name:tx.data.name})
              , sub_header_admin_ex:   i18n({id:'transactions.new_account.sub_header_admin_ex'}, {name:tx.data.name})
            };
      break;
    
    case KEY_UPSERT_PAP:
      return { header:                 i18n({id:'transactions.upsert_pap.header'})
              , sub_header:            i18n({id:'transactions.upsert_pap.sub_header'}, {from:tx.data.from||tx.data.account, to:tx.data.to||tx.data.provider})
              , sub_header_admin:      i18n({id:'transactions.upsert_pap.sub_header_admin'}, {from:tx.data.from||tx.data.account, to:tx.data.to||tx.data.provider})
              , sub_header_admin_ex:   i18n({id:'transactions.upsert_pap.sub_header_admin_ex'}, {from:tx.data.from||tx.data.account, to:tx.data.to||tx.data.provider})
            };
      break;
    case KEY_ERASE_CUST:
      return { header:                 i18n({id:'transactions.erase_cust.header'})
              , sub_header:            i18n({id:'transactions.erase_cust.sub_header'}, {to:tx.data.to||tx.data.provider})
              , sub_header_admin:      i18n({id:'transactions.erase_cust.sub_header_admin'}, {to:tx.data.to||tx.data.provider})
              , sub_header_admin_ex:   i18n({id:'transactions.erase_cust.sub_header_admin_ex'}, {to:tx.data.to||tx.data.provider})
            };
      break;
    case KEY_CHARGE_PAP:
      // pap|pay|2
      const charged_period = (memo_parts&&memo_parts.length>=3)?` - Period ${memo_parts[2]} paid`:'';
      return { header:                 i18n({id:'transactions.charge_pap.header'})
              , sub_header:            i18n({id:'transactions.charge_pap.sub_header'}, {period:charged_period , customer: tx.data.from||tx.data.account, provider: tx.data.to||tx.data.provider, service_id:tx.data.service_id})
              , sub_header_admin:      i18n({id:'transactions.charge_pap.sub_header_admin'}, {period:charged_period , customer: tx.data.from||tx.data.account, provider: tx.data.to||tx.data.provider, service_id:tx.data.service_id})
              , sub_header_admin_ex:   i18n({id:'transactions.charge_pap.sub_header_admin_ex'}, {period:charged_period , customer: tx.data.from||tx.data.account, provider: tx.data.to||tx.data.provider, service_id:tx.data.service_id})
            };
      break;
    
    case KEY_UPSERT_CUST:
      return { header:                 i18n({id:'transactions.upsert_cust.header'})
              , sub_header:            i18n({id:'transactions.upsert_cust.sub_header'}, {customer:tx.data.account||tx.data.to, account_type: globalCfg.bank.getAccountType(tx.data.account_type)})
              , sub_header_admin:      i18n({id:'transactions.upsert_cust.sub_header_admin'}, {customer:tx.data.account||tx.data.to, account_type: globalCfg.bank.getAccountType(tx.data.account_type)})
              , sub_header_admin_ex:   i18n({id:'transactions.upsert_cust.sub_header_admin_ex'}, {customer:tx.data.account||tx.data.to, account_type: globalCfg.bank.getAccountType(tx.data.account_type)})
            };
      break;      
    case KEY_ERASE_PAP:
      return { header:                 i18n({id:'transactions.erase_pap.header'})
              , sub_header:            i18n({id:'transactions.erase_pap.sub_header'}, {customer:tx.data.from||tx.data.account, provider:tx.data.to||tx.data.provider, service_id:tx.data.service_id})
              , sub_header_admin:      i18n({id:'transactions.erase_pap.sub_header_admin'}    , {customer:tx.data.from||tx.data.account, provider:tx.data.to||tx.data.provider, service_id:tx.data.service_id})
              , sub_header_admin_ex:   i18n({id:'transactions.erase_pap.sub_header_admin_ex'} , {customer:tx.data.from||tx.data.account, provider:tx.data.to||tx.data.provider, service_id:tx.data.service_id})
            };
      break;
    default:
      return { header:                 `${tx.name} - ${tx_type}`
              , sub_header:            `${tx.name} - ${tx_type}`
              , sub_header_admin:      `${tx.name} - ${tx_type}`
              , sub_header_admin_ex:   `${tx.name} - ${tx_type}` };
  }
}
