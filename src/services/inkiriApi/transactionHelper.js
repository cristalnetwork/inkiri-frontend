// humanizeTXs
import * as globalCfg from '@app/configs/global';

function getTxMetadata(account_name, fullTx){
  
  const tx         = fullTx.action_traces[0].act;
  const tx_type    = combineTxNameCode(tx);
  const tx_name    = getTxName(tx);
  const tx_code    = getTxCode(tx);
  const tx_subcode = getTxSubCode(tx);
  const i_sent     = isSender(account_name, tx)
  const request    = getRequestMetadata(tx, tx_type, tx_code)
  return {
    tx_type:               tx_type,
    request:               request,
    tx_name:               tx_name,
    tx_code:               tx_code, 
    tx_subcode:            tx_subcode, 
    i_sent:                i_sent,
    header:                getTxHeaderText(account_name, tx, i_sent),
    sub_header:            getTxSubHeaderText(account_name, tx, i_sent, tx_type, tx_name, tx_code, tx_subcode),
    quantity:              getTxQuantityToNumber(tx),
    quantity_txt:          getTxQuantity(tx)
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

function getRequestMetadata(tx, tx_type, tx_code){
  if(!tx_type) tx_type   = combineTxNameCode(tx);
  if(!tx_code) tx_code   = getTxCode(tx);
  
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

function getEOSQuantityToNumber(quantity){ 
	return !quantity?0:Number(quantity.replace(globalCfg.currency.eos_symbol, ''));
}

const getTxMemo = (tx) =>{
  return (tx.data && tx.data.memo)?tx.data.memo:''; 
}
const getTxMemoSplitted = (tx) =>{
  return getTxMemo(tx).split('|'); 
}

function getTxQuantity(tx)             { return tx.data.quantity;}
function getTxQuantityToNumber(tx)     { return getEOSQuantityToNumber(tx.data.quantity); }
function getTxName(tx)                 { return tx.name ; }
function getTxCode(tx)                 { return getTxMemoSplitted(tx)[0]; }
function getTxSubCode(tx)              { const memo = getTxMemoSplitted(tx); return (!memo||memo.length<1)?'':memo[1];}
function combineTxNameCode(tx)         { return getTxName(tx) + '_' + getTxCode(tx) ; }
function isTransfer(param)             { return param=='transfer';}
function isIssue(param)                { return param=='issue'; }
function isSender(account_name, tx_act){ return tx_act.data.to!=account_name; }

function mayTxHaveNewerTx(tx_code){
  const search = ['transfer_bck']; 
  return search.indexOf(tx_code)>=0;
}
function mayTxHavePrivateData(tx_code){
  const search = ['transfer_bck', 'transfer_xch', 'transfer_pap', 'issue_iug'];
  return search.indexOf(tx_code)>=0;
}
function isVisibleTx(tx_code){
  return true;
}

 
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
const KEY_UPSERT       =  'upsertikacc_';

const typesMap = {
  [KEY_ISSUE_DEP]     : globalCfg.api.TYPE_DEPOSIT,
  [KEY_ISSUE_IUG]     : globalCfg.api.TYPE_PAYMENT,
  [KEY_ISSUE_OFT]     : globalCfg.api.TYPE_ISSUE,
  [KEY_TRANSFER_BCK]  : globalCfg.api.TYPE_REFUND,
  [KEY_TRANSFER_WTH]  : globalCfg.api.TYPE_WITHDRAW,
  [KEY_TRANSFER_XCH]  : globalCfg.api.TYPE_EXCHANGE,
  [KEY_TRANSFER_PRV]  : globalCfg.api.TYPE_PROVIDER,
  [KEY_TRANSFER_SND]  : globalCfg.api.TYPE_SEND,
  [KEY_TRANSFER_PAY]  : globalCfg.api.TYPE_PAYMENT,
  [KEY_TRANSFER_PAP]  : globalCfg.api.TYPE_SERVICE,
  [KEY_UPSERT]        : globalCfg.api.TYPE_UPSERT
}
const keyCodeToRequestType = (key_code) => {
  const my_type = typesMap[key_code];
  if(!my_type)
    console.log(' ** keyCodeToRequestType ->', key_code )
  console.log(' ** keyCodeToRequestType:: ', key_code , ' -> ' , my_type )
  return my_type || globalCfg.api.TYPE_UNKNOWN;
}

function getTxHeaderText(account_name, tx, i_sent){
  return 'header';
}

function getTxSubHeaderText(account_name, tx, i_sent, tx_type, tx_name, tx_code, tx_subcode){

  switch(tx_type) {
    // case 'issue_iss': //ToDo: Remove case.
    //   return i_sent?'Emisión por depósito en '+tx_subcode:'Depositaste en '+tx_subcode
    //   break;
    case KEY_ISSUE_DEP:
      return i_sent?'Emisión por depósito.':'Depositaste'
      break;
    case KEY_ISSUE_IUG:
      return i_sent?'Emisión por recibimento en IUGU':'Recibiste pago via IUGU'
      break;
    case KEY_ISSUE_OFT:
      return i_sent?'Emisión por seteo de descubierto en cuenta':'Acreditación de descubierto en cuenta'
      break;
    case KEY_TRANSFER_BCK:
      return i_sent?'Restituiste monto de transacción.':'Te restituyeron monto por transacción.'
      break;
    case KEY_TRANSFER_WTH:
      // return i_sent?'Solicitaste retiro en billete':'Solicitaron retiro en billete'
      return i_sent?'Solicitud de retiro en billete':'Solicitaron retiro en billete'
      break;
    case KEY_TRANSFER_XCH:
      return i_sent?'Solicitaste cambio a banco.':'Solicitaron cambio a banco.'
      break;
    case KEY_TRANSFER_PRV:
      return i_sent?'Solicitaste pago a proveedor.':'Solicitaron pago a proveedor.'
      break;
    case KEY_TRANSFER_SND:
      return i_sent?'Enviaste dinero':'Te enviaron dinero'
      break;
    case KEY_TRANSFER_PAY:
      return i_sent?'Realizaste un pago':'Te realizaron un pago'
      break;
    case KEY_TRANSFER_PAP:
      return i_sent?'Pago preacordado':'Pago preacordado'
      break;
    default:
      // code block
  }
}


// This is an amazing HACK!
// Check https://github.com/cristalnetwork/inkiri-eos-contracts/blob/master/inkiribank.cpp
function getStateDescription(state_id){
  // const states = globalCfg.bank.ACCOUNT_STATES;
  // if(state_id>=states.length)
  //   return states[0];
  // return states[state_id];
  return globalCfg.bank.getAccountState(state_id)
}

// This is another amazing HACK!
// Check https://github.com/cristalnetwork/inkiri-eos-contracts/blob/master/inkiribank.cpp
function getAccountTypeDescription(account_type_id){
  // const account_types = globalCfg.bank.ACCOUNT_TYPES;
  // if(account_type_id>=account_types.length)
  //   return account_types[0];
  // return account_types[account_type_id];
  return globalCfg.bank.getAccountType(account_type_id)
}

export { getTxMetadata, getEOSQuantityToNumber, getStateDescription, getAccountTypeDescription };