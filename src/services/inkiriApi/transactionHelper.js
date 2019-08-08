// humanizeTXs
import * as globalCfg from '@app/configs/global';

function getTxMetadata(account_name, fullTx){
  
  const tx         = fullTx.action_traces[0].act;
  const tx_type    = combineTxNameCode(tx);
  const tx_name    = getTxName(tx);
  const tx_code    = getTxCode(tx);
  const tx_subcode = getTxSubCode(tx);
  const i_sent     = isSender(account_name, tx)
  return {
    tx_type:               tx_type,
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

function getEOSQuantityToNumber(quantity){ 
	return Number(quantity.replace(globalCfg.currency.eos_symbol, ''));
}

function getTxQuantity(tx)             { return tx.data.quantity;}
function getTxQuantityToNumber(tx)     { return getEOSQuantityToNumber(tx.data.quantity); }
function getTxName(tx)                 { return tx.name ; }
function getTxCode(tx)                 { return (tx.data && tx.data.memo)?tx.data.memo.split('|')[0]:''; }
function getTxSubCode(tx)              { return tx.data.memo.split('|').length>1 ? tx.data.memo.split('|')[1] : '';}
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

const tx_keycodes = [
  'issue_dep',
  'issue_iug',
  'issue_oft',
  'transfer_bck',
  'transfer_wth',
  'transfer_xch',
  'transfer_snd',
  'transfer_pay',
  'transfer_pap'
]
function getTxHeaderText(account_name, tx, i_sent){
  return 'header';
}
function getTxSubHeaderText(account_name, tx, i_sent, tx_type, tx_name, tx_code, tx_subcode){
  
  switch(tx_type) {
    case 'issue_dep':
      return i_sent?'Emisión por depósito en '+tx_subcode:'Depositaste en '+tx_subcode
      break;
    case 'issue_iug':
      return i_sent?'Emisión por recibimento en IUGU':'Recibiste pago via IUGU'
      break;
    case 'issue_oft':
      return i_sent?'Emisión por seteo de descubierto en cuenta':'Acreditación de descubierto en cuenta'
      break;
    case 'transfer_bck':
      const data_transfer_bck = getBackInfo(tx);
      return i_sent?'Restituiste monto de transacción '+data_transfer_bck.opration:'Te restituyeron monto por transacción '+data_transfer_bck.opration
      break;
    case 'transfer_wth':
      return i_sent?'Solicitaste retiro en billete':'Solicitaron retiro en billete'
      break;
    case 'transfer_xch':
      const data_transfer_xch = getExchangeInfo(tx);
      return i_sent?'Solicitaste cambio a banco '+data_transfer_xch.bank_id:'Solicitaron cambio a banco '+data_transfer_xch.bank_id
      break;
    case 'transfer_snd':
      return i_sent?'Enviaste dinero':'Te enviaron dinero'
      break;
    case 'transfer_pay':
      return i_sent?'Realizaste un pago':'Te realizaron un pago'
      break;
    case 'transfer_pap':
      const data_transfer_pap = getPreAuthPaymentInfo(tx);
      return i_sent?'Pago preacordado':'Pago preacordado'
      break;
    default:
      // code block
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
// LIST OF POSSIBLE TRANSACTIONS ////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
// ISSUE
// iss: depositar       >> issue_dep
//   dep|brl|deposit_tx_id  
//   dep|iks|deposit_tx_id  
// iss: iugu            >> issue_iug
//   iug|iugu_tx_id
// iss: overdraft
//   oft|               >> issue_oft
// TRANSFER
// [X] dep: depositar
// bck: devolucion      >> transfer_bck
//   bck|wth|tx_id
//   bck|xch|tx_id
//   bck|pay|tx_id
//   bck|pap|tx_id
const backOperationInfo = {
  'wth': 'Withdraw',
  'xch': 'Exchange',
  'pay': 'Payment',
  'pap': 'Withdraw',
}
function getBackInfo(tx){
  const sub_code = getTxSubCode(tx);
  return {
    tx_id :           'tx_id',
    operation_code:   sub_code,
    operation:        backOperationInfo[sub_code]
  }
}
// wth: retirar         >> transfer_wth
// xch: exchange        >> transfer_xch
//   xch|bank_id
function getExchangeInfo(tx){
  return {
    bank_id : 'BANK_ID'
    // ,bank : {} ToDo: retrieve bank information from private server!!!
  }
}
// req: request
// snd: send            >> transfer_snd
// rcv: receive and me as receipt
// pay: payment         >> transfer_pay
//   pay|description
// pap:                 >> transfer_pap
// * pre-authorized payment 
//   pap|contract_id
function getPreAuthPaymentInfo(tx){
  return {
    contract :          '??'
    ,customer:          '??'
    ,service_provider:  '??'
    ,service:           '??'
    //ToDo: retrieve contract information, customer and service provider from Blockchain!
  }
}
//END////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

export { getTxMetadata, getEOSQuantityToNumber };