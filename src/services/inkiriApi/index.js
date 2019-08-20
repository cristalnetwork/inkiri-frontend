import global from '@app/configs/global';
import { createDfuseClient, DfuseClient } from "@dfuse/client"
import * as globalCfg from '@app/configs/global';

import * as eosHelper from './eosHelper.js';
import * as dfuse from './dfuse.js';
import * as bank from './bank.priv.js';
import ecc from 'eosjs-ecc';

import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';

export {eosHelper};
export {dfuse};
export {bank};

function formatAmount(amount){
  return Number(amount).toFixed(4) + ' ' + globalCfg.currency.eos_symbol;
}

function prettyJson(input){
  return JSON.stringify(input, null, 2)
}

// const getKeyAccounts = async (publicKey) => { 
//   const jsonRpc   = new JsonRpc(globalCfg.dfuse.base_url)
//   const response  = await jsonRpc.history_get_key_accounts(publicKey);
//   return {data:response}
// }

// const getControlledAccounts = async (controllingAccount) => { 
//   const jsonRpc   = new JsonRpc(globalCfg.dfuse.base_url)
//   const response  = await jsonRpc.history_get_controlled_accounts(controllingAccount);
//   return {data:response}
// }

const pushTX = async (tx, privatekey) => { 
	const signatureProvider = new JsSignatureProvider([privatekey])
  const rpc = new JsonRpc(globalCfg.dfuse.base_url)
  const api = new Api({
    rpc,
    signatureProvider
  })

  try {
	  const result = await api.transact(
	    { actions: [tx] },
	    {
	      blocksBehind: 3,
	      expireSeconds: 30
	    }
	  );
	  console.log(' InkiriApi::pushTX (then#1) >> ', JSON.stringify(result));
    return {data:result};
	  
	} catch (e) {
	  console.log(' InkiriApi::pushTX (error#1) >>  ', JSON.stringify(e));
    throw e.json.error.details[0].message;
	}
}

export const sendMoney = async (sender_account, sender_priv, receiver_account, amount) => { 
	console.log(' inkiriApi::sendMoney ', 
		'param@sender_account:', sender_account,
		'param@sender_priv:', sender_priv,
		'param@receiver_account:', receiver_account,
		'param@amount:', amount
		);

  const transferAction = {
    account: globalCfg.currency.token,
    name: "transfer",
    authorization: [
      {
        actor:         sender_account,
        permission:    'active'
      }
    ],
    data: {
      from: sender_account,
      to: receiver_account,
      quantity: formatAmount(amount),
      memo: 'snd'
    }
  }

  console.log(' InkiriApi::sendMoney >> About to send >> ', prettyJson(transferAction));

  return pushTX(transferAction, sender_priv);

}

export const issueMoney = async (issuer_account, issuer_priv, receiver_account, amount) => { 

	console.log(' inkiriApi::sendMoney ', 
		'param@issuer_account:', issuer_account,
		'param@issuer_priv:', issuer_priv,
		'param@receiver_account:', receiver_account,
		'param@amount:', amount
		);

	const issueAction = {
    account: globalCfg.currency.token,
    name: "issue",
    authorization: [
      {
        actor: issuer_account,
        permission: "active"
      }
    ],
    data: {
      to: receiver_account,
      quantity: formatAmount(amount),
      memo: 'iss|key'
    }
  }

  console.log(' InkiriApi::issueMoney >> About to issue >> ', prettyJson(issueAction))

  return pushTX(issueAction, issuer_priv);

}

export const addPersonalBankAccount = async (auth_account, auth_priv, account_name) => { 

	// cleos -u http://jungle2.cryptolions.io:80 push action ikmasterooo1 upsertikacc '{"user":"ikadminoooo1", "fee":5, "overdraft":0, "account_type":1, "state":1}' -p ikmasterooo1@active

	console.log(' inkiriApi::addPersonalBankAccount ', 
		'param@auth_account:', auth_account,
		'param@auth_priv:', auth_priv,
		'param@account_name:', account_name
		);

	const addAccountAction = {
    account: globalCfg.bank.contract,
    name: "upsertikacc",
    authorization: [
      {
        actor: auth_account,
        permission: "active"
      }
    ],
    data: {
      user : 					account_name
      , fee : 				globalCfg.bank.DEFAULT_FEE
      , overdraft: 		globalCfg.bank.DEFAULT_OVERDRAFT
      , account_type: globalCfg.bank.ACCOUNT_TYPE_PERSONAL
      , state: 				globalCfg.bank.ACCOUNT_STATE_OK
    }
  }
  
  console.log(' InkiriApi::addPersonalBankAccount >> About to add account >> ', prettyJson(addAccountAction))

  return pushTX(addAccountAction, auth_priv);

}

export const getAccountInformation = (account_name) =>  dfuse.searchBankAccount(account_name);
export const getAvailableAccounts  = () =>   dfuse.listBankAccounts();
export const getAccountBalance = (account_name) =>  dfuse.getAccountBalance(account_name);

export const dummyPrivateKeys = {
		'ikmasterooo1': '5J2bKBbHH6xB2U255CWbXJ6uAuibg5KCh1omKdhpKoCfrTxWkUN'
    , 'ikadminoooo1': '5KkKKHiFqNfyFRTWQSdVmg7UBTdwvmkRz48dUyE6pQCEbfJLm6u'
    , 'inkiritoken1': '5K5Sk4A2V3MeS7uWw5itgQYzoGF3Aaeer3iZB7qCj3GbqmknVvM'
    , 'marcostest13': ''
    , 'inkpersonal1': '5JtCAhCxKEbMfU3XSHpF451P9sVnPkzxD2WgUgVgPtWEKikTXsh'
    , 'inkirimaster': '5KesM1e6XqoTMtbJ8P5bakYom1rd3KbBQa9dKg3FqE23YAK9BPE'
    , 'inkpersonal2': '5KRg4dqcdAnGzRVhM4vJkDRVkfDYrH3RXG2CVzA61AsfjyHDvBh'
  }


export const login = async (account_name, private_key) => {
  
  // 1.- Obtengo la publica de la privada.
  const pubkey  = ecc.privateToPublic(private_key); 
  
  // 2.- Obtengo las controlling accounts.
  const key_accounts = await dfuse.getKeyAccounts(pubkey);
  
  // 3.- Valido account_name en array de cuentas de la publica.
  if(key_accounts.indexOf(account_name)<0)
  {
    throw new Error('Account and key not matching!') 
  }  

  // 4.- Valido que account esta en la tabla del bank, es decir es cliente.
  let customer_info;
  try{
    customer_info = await dfuse.searchBankAccount(account_name);
  }
  catch(ex){
    console.log('inkiriApi::login ERROR >> Account is not a Bank customer!') 
    throw new Error('Account is not a Bank customer!') 
  }


  // 5.- me logeo al banko
  let bank_auth;
  try{
    bank_auth = await bank.auth(account_name, private_key);
  }
  catch(ex){
    // console.log('inkiriApi::login ERROR >> Account is not on private servers!', ex) 
    // throw new Error('Account is not on private servers!'); 
    throw ex;
    return; 
  }

  const bank_requests = await bank.listMyRequests(account_name, 0, 10);

  console.log(' ************************************* '
      , ' inkiriApi::login >> KEY ACCOUNTS: '
      , JSON.stringify(key_accounts)
      , ' | BANK CUSTOMER INFO:'
      , JSON.stringify(customer_info)
      , ' | BANK PRIVATE INFO:'
      , JSON.stringify(bank_auth)
      , ' | BANK REQUESTS'
      , JSON.stringify(bank_requests));

  return key_accounts;
} 