import * as globalCfg from '@app/configs/global';
import * as txsHelper from './txs-helper';
import * as jwtHelper from './jwt-helper';

import { JsonRpc } from "@eoscafe/hyperion";

const endpoint    = globalCfg.eos.history_endpoint;


// Item format:
// {
//   "token": "eyJhbGciOiJLTVNFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NTA2OTIxNzIsImp0aSI6IjQ0Y2UzMDVlLWMyN2QtNGIzZS1iN2ExLWVlM2NlNGUyMDE1MyIsImlhdCI6MTU1MDYwNTc3MiwiaXNzIjoiZGZ1c2UuaW8iLCJzdWIiOiJ1aWQ6bWRmdXNlMmY0YzU3OTFiOWE3MzE1IiwidGllciI6ImVvc3EtdjEiLCJvcmlnaW4iOiJlb3NxLmFwcCIsInN0YmxrIjotMzYwMCwidiI6MX0.k1Y66nqBS7S6aSt-zyt24lPFiNfWiLPbICc89kxoDvTdyDnLuUK7JxuGru9_PbPf89QBipdldRZ_ajTwlbT-KQ",
//   "expires_at": 1550692172 // An UNIX timestamp (UTC) indicating when the JWT will expire.
// }                


// GET /v0/state/key_accounts
// In replace of -> /v1/history/get_key_accounts
// Source -> https://docs.dfuse.io/#rest-get-v0-state-key-accounts
// export const getKeyAccounts = async (public_key) => new Promise( async (res,rej)=> {

//   const jsonRpc   = new JsonRpc(globalCfg.eos.endpoint)

//   try{
//     const response = await jsonRpc.get_key_accounts(public_key);
//     console.log(response.account_names);

//     if(!response.account_names){
//       rej('No name for given public key');
//       return;
//     }
//     res(response.account_names);
//   }catch(ex){
//     console.log('error', ex)
//     rej(ex);
//   }          
           
// })

export const getAccountBalance = (account_name) => new Promise(async(res,rej)=> {
  
  const jsonRpc   = new JsonRpc(globalCfg.eos.endpoint) 
  try{
    const response = await jsonRpc.get_currency_balance(globalCfg.currency.token, account_name, globalCfg.currency.eos_symbol)
    const balance = response && response.length>0
      ?response[0]
      :'0.0000 INK';
    const _res = {
          data:{
            balance:       globalCfg.currency.toNumber(balance),
            balanceText:   balance
          }
    };
    res(_res);
  }
  catch(ex){
      // do_log && console.log('dfuse::getAccountBalance >> ERROR ', JSON.stringify(ex));
      rej(ex);
 }

})  

/**
 * Function that retrieves all blockchain transactions that includes
 * the account that was given authority over a permission.
 *
 * @param {string} account_name – Description.
 */
export const searchPermissioningAccounts = (account_name) => new Promise( async(res, rej) => {

  // const jsonRpc   = new JsonRpc(globalCfg.eos.endpoint)

  try{
    // const response = await jsonRpc.history_get_controlled_accounts(account_name);
    
    //curl -X POST "https://testnet.telosusa.io/v1/history/get_controlled_accounts" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"controlling_account\":\"cristaltoken\"}"
    const path    = globalCfg.eos.endpoint_history_v1 + '/v1/history/get_controlled_accounts';
    
    const method       = 'POST';
    const post_params = {'controlling_account':               account_name};
    const options      = { method: method, body : JSON.stringify(post_params)};
    const response     = await fetch(path, options);
    const responseJSON = await response.json();
    console.log('----responseJSON:',responseJSON)
    return res(responseJSON.controlled_accounts.filter(account=>account!=account_name) || []);

    // const method  = 'POST';
    // const post_params = {'controlling_account':               account_name};
    // console.log(' inkiriApi::searchPermissioningAccounts >> ABOUT TO POST', JSON.stringify(post_params))
    // jwtHelper.apiCall(path, method, post_params)
    // .then((response) => {
    //     console.log(`DFUSE::searchPermissioningAccounts(${account_name})::response:`, response)
    //     if(!response || !response.controlled_accounts){
    //       rej('No controlling accounts');
    //       return;
    //     }
    //     res(response.controlled_accounts.filter(account=>account!=account_name));
        
    //   }, (ex) => {
    //     console.log(' inkiriApi::createDeposit >> ERROR ', JSON.stringify(ex))
    //     rej(ex);
    //   });

  }catch(ex){
    console.log('error', ex)
    rej(ex);
  }
  
})

export const transformTransactions = (txs, account_name) => transformTransactionsImpl(txs, account_name);
const transformTransactionsImpl = (txs, account_name) => {
  
  if (!txs || txs.length <= 0) {
    // do_log && console.log(' TRANSFOMR TX txs is empty :( ');
    return [];
  }
  if(!Array.isArray(txs)) 
    txs = [txs];

  const my_txs = txs.map(
     (transaction) => {
      
      try{
        const ret = txsHelper.toReadable(account_name, transaction);  
        return ret;
      }
      catch(e)
      {
        // do_log && console.log(' TRANSFORM TX ERROR#1 => ', JSON.stringify(transaction), JSON.stringify(e))
        return null;
      }

    })
  
  return my_txs.filter(tx=> tx!=null);
}

export const listPAPPayments = async (account_name, provider, customer, service_id, cursor) => new Promise(async(res,rej)=> {
  
  res ({data:{txs:[], cursor:''}})
      
});


export const incomingTransactions = (account_name, cursor) => listTransactions(account_name, cursor, true);
/*
*  Retrieves TXs from DFUSE for a given account.
* account_name
* cursor
* received -> undefined (both received and sent) | true (received) | sent (false) 
*
*  Options:
*    blockCount: 10,
*    cursor: "cursor",
*    limit: 1,
*    sort: "desc",
*    startBlock: 10,
*    withReversible: true
*  Source: https://github.com/dfuse-io/client-js/blob/73cce71b5a73b2bf2f21f608d7af17b956cb9e82/src/client/__tests__/client.test.ts
*/
export const listTransactions = (account_name, cursor, received, start_block) => new Promise( async(res,rej)=> {
  
  const jsonRpc   = new JsonRpc(globalCfg.eos.endpoint)
  const options = {
    // from: '' , // string? source account
    to: account_name , // string? destination account
    symbol: globalCfg.currency.eos_symbol , // string? token symbol
    contract: globalCfg.currency.token , // string? token contract
    skip: 0 , // number? skip [n] actions (pagination)
    limit: 100 , // number? limit of [n] actions per page
    // after: '' , // string? filter after specified date (ISO8601)
    // before: ''  // string? filter before specified date (ISO8601)
  }
  try{
    const response = await jsonRpc.get_transfers(options);
    for (const action of response.actions) {
        console.log(action.act.data);
        // => { from: 'eosio.bpay', to: 'eosnewyorkio', amount: 326.524, symbol: 'EOS', memo: 'producer block pay' }
    }

    const txs = transformTransactionsImpl(response.actions, account_name);
    res ({data:{txs:txs, cursor:null}})
  }catch (ex) {
      rej(ex);
  }
  
})  

export const getTxId = (result_tx) => {

  return result_tx.transaction_id;
}