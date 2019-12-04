// humanizeTXs
import * as globalCfg from '@app/configs/global';

/*
* Explode raw event/search result transaction to a human readable format.
*  
*/
export const toReadable = (account_name, transaction) => {
  
  const is_ws_event      = (typeof transaction.data !== 'undefined');
  const is_search        = (typeof transaction.lifecycle !== 'undefined');
  const is_graphql       = (typeof transaction.trace !== 'undefined'); // NOT IMPLEMENTED YET

  const operations       = (is_ws_event)
    ? [transaction.data.trace]
    : ((is_search)
        ? transaction.lifecycle.execution_trace.action_traces
        : transaction.trace.topLevelActions[0])
  
  const transaction_data = (is_ws_event)
    ? transaction.data
    : ((is_search)
      ? transaction.lifecycle.execution_trace
      : transaction.trace.topLevelActions);

  // const is_event         = (typeof transaction.lifecycle === 'undefined');
  // const operations       = (is_event)
  //   ?[transaction.data.trace] // .act
  //   : transaction.lifecycle.execution_trace.action_traces //[0].act
  // const transaction_data = (is_event)
  //   ? transaction.data
  //   : transaction.lifecycle.execution_trace;
  const getMainAction = (operation) => {
    return operation.act?operation.act:operation;
  }
  const readable_operations  = operations.map( operation => getOperationMetadata(account_name, getMainAction(operation)));
  const readable_transaction = (is_graphql)?null:buildHeadersMulti(account_name, operations[0].act)
  
  const total_Amount          = operations.reduce(function (accumulator, operation) {
    return accumulator + globalCfg.currency.toNumber(getMainAction(operation).data.quantity);
  }, 0);
  

  return {
    id :                (!is_ws_event)?transaction_data.id:transaction_data.trx_id
    , block_time:        transaction_data.block_time.split('.')[0]
    , block_time_number: Number(transaction_data.block_time.split('.')[0].replace(/-/g,'').replace(/T/g,'').replace(/:/g,'') )
    , transaction_id:    (is_ws_event)?transaction_data.trx_id:transaction_data.id
    , block_num:         transaction_data.block_num
    
    , ...operations[0].act

    , operations:        readable_operations
    , ...readable_operations[0]
    , ...readable_transaction
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
function isSender(account_name, tx)    { return tx.data.to!==account_name; }

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
  // if(!my_type)
  //   console.log(' ** keyCodeToRequestType ->', key_code )
  // console.log(' ** keyCodeToRequestType:: ', key_code , ' -> ' , my_type )
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
  const memo_parts = getTxMemoSplitted(tx);
  switch(tx_type) {
    case KEY_ISSUE_DEP:
      return { sub_header:        'Depositaste'
              , sub_header_admin: 'Emisión por depósito.'
              , sub_header_admin_ex: `Se le ha emitido dinero a @${tx.data.to} por depósito `
            };
      break;
    case KEY_ISSUE_IUG:
      return { sub_header:           'Recibiste pago via IUGU'
              , sub_header_admin:    'Emisión por recibimento en IUGU'
              , sub_header_admin_ex: `Se le ha emitido dinero a @${tx.data.to} por pago recibido via IUGU `
            };
      break;
    case KEY_ISSUE_OFT:
      return { sub_header:           'Emisión por seteo de descubierto en cuenta'
              , sub_header_admin:    'Acreditación de descubierto en cuenta'
              , sub_header_admin_ex: `Se le ha emitido dinero a @${tx.data.to} por descubierto en cuenta `
            };
      break;
    case KEY_TRANSFER_BCK:
      return { sub_header:           'Te restituyeron monto por transacción.'
              , sub_header_admin:    'Restitución de monto por transacción.'
              , sub_header_admin_ex: `Se le ha restituído a @${tx.data.from} por operación cancelada/invalidada`
              , to: tx.data.to };
      break;
    case KEY_TRANSFER_WTH:
      return { sub_header:           'Solicitud de retiro en billete'
              , sub_header_admin:    'Solicitaron retiro en billete'
              , sub_header_admin_ex: `@${tx.data.from} ha solicitado/realizado un retiro`
              , from: tx.data.from};
      break;
    case KEY_TRANSFER_XCH:
      return { sub_header:           'Solicitaste cambio a banco.'
              , sub_header_admin:    'Solicitaron cambio a banco.'
              , sub_header_admin_ex: `@${tx.data.from} ha solicitado cambio a banco`
              , from: tx.data.from};
      break;
    case KEY_TRANSFER_PRV:
      return { sub_header:           'Solicitaste pago a proveedor.'
              , sub_header_admin:    'Solicitaron pago a proveedor.'
              , sub_header_admin_ex: `@${tx.data.from} ha solicitado pago a proveedor`
              , from: tx.data.from};
      break;
    case KEY_TRANSFER_PAY:
      // return i_sent?'Realizaste un pago':'Te realizaron un pago'
      return { 
              // sub_header:            i_sent?'Realizaste un pago':'Te realizaron un pago'
              sub_header:             i_sent?`Realizaste un pago a @${tx.data.to}`:`@${tx.data.from} te ha realizado un pago`
              , sub_header_admin:     'Envío de pago'
              , sub_header_admin_ex:  `@${tx.data.from} le ha realizado un pago a @${tx.data.to}`
              , from: tx.data.from
              , to:   tx.data.to};
      break;
    case KEY_TRANSFER_PAP:
      return { sub_header:           'Pago preacordado'
              , sub_header_admin:    'Envío de pago preacordado'
              , sub_header_admin_ex: `@${tx.data.from} le ha realizado un pago preacordado a @${tx.data.to}`
              , from: tx.data.from
              , to:   tx.data.to};
      break;
    case KEY_TRANSFER_SLR:
      if(multi)
        return { sub_header:            i_sent?`Realizaste un pago de salario. - ${memo_parts[1]}`:''
                , sub_header_admin:    'Pago de salario'
                , sub_header_admin_ex: `@${tx.data.from} ha realizado un pago de salario. - ${memo_parts[1]}`
                , from: tx.data.from
                , to:   tx.data.to};  
      return { sub_header:            i_sent?`Realizaste un pago de salario a @${tx.data.to}. - ${memo_parts[1]}`:`@${tx.data.from} te ha realizado un pago de salario. - ${memo_parts[1]}`
              , sub_header_admin:    'Pago de salario'
              , sub_header_admin_ex: `@${tx.data.from} le ha realizado el pago de salario a @${tx.data.to}. - ${memo_parts[1]}`
              , from: tx.data.from
              , to:   tx.data.to};
      break;
    case KEY_TRANSFER_SND:
      return { 
              //sub_header:           i_sent?'Enviaste dinero':'Te enviaron dinero'
              sub_header:            i_sent?`Enviaste dinero a @${tx.data.to}`:`@${tx.data.from} te ha enviado dinero`
              , sub_header_admin:    'Envío de dinero'
              , sub_header_admin_ex: `@${tx.data.from} le ha enviado dinero a @${tx.data.to}.`
              , from: tx.data.from
              , to:   tx.data.to
            };
      break;
    case KEY_NEW_ACCOUNT:
      return { sub_header:         `Account creation: @${tx.data.name}`
            , sub_header_admin:    `Account creation: @${tx.data.name}`
            , sub_header_admin_ex: `Account creation: @${tx.data.name}` };
      break;
    
    case KEY_UPSERT_PAP:
      return { sub_header:         `Pre Authorized Payment. Customer @${tx.data.from||tx.data.account} <-> Provider @${tx.data.to||tx.data.provider}`
            , sub_header_admin:    `Pre Authorized Payment. Customer @${tx.data.from||tx.data.account} <-> Provider @${tx.data.to||tx.data.provider}`
            , sub_header_admin_ex: `Pre Authorized Payment. Customer @${tx.data.from||tx.data.account} <-> Provider @${tx.data.to||tx.data.provider}` };
      break;
    case KEY_ERASE_CUST:
      return { sub_header:         `Customer account removed. Customer @${tx.data.to||tx.data.provider}`
            , sub_header_admin:    `Customer account removed. Customer @${tx.data.to||tx.data.provider}`
            , sub_header_admin_ex: `Customer account removed. Customer @${tx.data.to||tx.data.provider}` };
      break;
    case KEY_CHARGE_PAP:
      // pap|pay|2
      const desc = (memo_parts&&memo_parts.length>=3)?` - Period ${memo_parts[2]} paid`:'';
      return { sub_header:         `Charge Pre Authorized Payment${desc}. Customer @${tx.data.from||tx.data.account} <-> Provider @${tx.data.to||tx.data.provider}#${tx.data.service_id}`
            , sub_header_admin:    `Charge Pre Authorized Payment${desc}. Customer @${tx.data.from||tx.data.account} <-> Provider @${tx.data.to||tx.data.provider}#${tx.data.service_id}`
            , sub_header_admin_ex: `Charge Pre Authorized Payment${desc}. Customer @${tx.data.from||tx.data.account} <-> Provider @${tx.data.to||tx.data.provider}#${tx.data.service_id}` };
      break;
    
    case KEY_UPSERT_CUST:
      return { sub_header:         `Customer creation: @${tx.data.account||tx.data.to}. Type: ${globalCfg.bank.getAccountType(tx.data.account_type)}`
            , sub_header_admin:    `Customer creation: @${tx.data.account||tx.data.to}. Type: ${globalCfg.bank.getAccountType(tx.data.account_type)}`
            , sub_header_admin_ex: `Customer creation: @${tx.data.account||tx.data.to}. Type: ${globalCfg.bank.getAccountType(tx.data.account_type)}` };
      break;      
    case KEY_ERASE_PAP:
      return { sub_header:         `Erase Pre Authorized Payment. Customer @${tx.data.from||tx.data.account} <-> Provider @${tx.data.to||tx.data.provider}#${tx.data.service_id}`
            , sub_header_admin:    `Erase Pre Authorized Payment. Customer @${tx.data.from||tx.data.account} <-> Provider @${tx.data.to||tx.data.provider}#${tx.data.service_id}`
            , sub_header_admin_ex: `Erase Pre Authorized Payment. Customer @${tx.data.from||tx.data.account} <-> Provider @${tx.data.to||tx.data.provider}#${tx.data.service_id}` };
      break;
    default:
      return { sub_header:         `${tx.name} - tx_type=[${tx_type}] | [${JSON.stringify(tx.data)}]`
            , sub_header_admin:    `${tx.name} - tx_type=[${tx_type}] | [${JSON.stringify(tx.data)}]`
            , sub_header_admin_ex: `${tx.name} - tx_type=[${tx_type}] | [${JSON.stringify(tx.data)}]` };
  }
}
