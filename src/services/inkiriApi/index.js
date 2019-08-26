import { createDfuseClient, DfuseClient } from "@dfuse/client"
import * as globalCfg from '@app/configs/global';

import * as eosHelper from './eosHelper.js';
import * as dfuse from './dfuse.js';
import * as bank from './bank.priv.js';
import ecc from 'eosjs-ecc';

import * as txsHelper from './transactionHelper';

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

const listAllBankAccounts = async () => { 
  const jsonRpc   = new JsonRpc(globalCfg.dfuse.base_url)
  // const response  = await jsonRpc.get_account(account_name)
  const response = await jsonRpc.get_table_rows({
    json:           true                 
    , code:         globalCfg.bank.issuer
    , scope:        globalCfg.bank.issuer
    , table:        'ikaccounts'        
    , limit:        1000
    , reverse:      false
    , show_payer :  false
  });
  // Ver https://github.com/EOSIO/eos/issues/3948
  // if more==true, entonces hay que traer mas usando lower_bound o upper_bound
  var accounts = response.rows.map(account => 
        ({  ...account
                  ,'state_description' :        txsHelper.getStateDescription(account.state)
                  ,'account_type_description' : txsHelper.getAccountTypeDescription(account.account_type) }));
  return {...accounts}
}

// export const getBankAccount = async (account_name) => { 
//   const jsonRpc   = new JsonRpc(globalCfg.dfuse.base_url)
//   const response = await jsonRpc.get_table_rows({
//     json:           true                 
//     , code:         globalCfg.bank.issuer
//     , scope:        globalCfg.bank.issuer
//     , table:        'ikaccounts'        
//     , lower_bound:  account_name
//     , limit:        1
//     , reverse:      false
//     , show_payer :  false
//   });
//   const _found = (response.rows&&response.rows.length>0);
//   console.log(' InkiriApi::getBankAccount >> ', (_found?{...response.rows[0]}:'NOT FOUND'));
//   return _found?{...response.rows[0]}:undefined;
// }
export const getBankAccount = (account_name) => dfuse.searchBankAccount(account_name);

export const isBankCustomer = async (account_name) => { 
  const customer = await getBankAccount(account_name);
  return customer!==undefined;
}

const getAccount = async (account_name) => { 
  const jsonRpc   = new JsonRpc(globalCfg.dfuse.base_url)
  const response  = await jsonRpc.get_account(account_name)
  return {data:response}
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


// permissioning_accounts

  /*
  personal account
    owner -> root
    active -> manager
    viewer -> --


    admin account - inkirimaster
    owner -> root
    active -> manager, --
        pda  -> --
        viewer-> --

    corporate account
        owner -> root
    active -> manager
        pdv -> can sell
        viewer -> can view

    Token issuer account - inkiritoken1
        owner -> private_key
        active -> inkirimaster

  */
  

const getMaxPermissionForAccount = async (account_name, permissioner_account) => {
  
  // console.log('inkiriApi::getMaxPermissionForAccount >> account_name:', account_name, ' | permissioner_account:', permissioner_account)

  const permissioner = await getAccount(permissioner_account)
  const perms = permissioner.data.permissions.reduce((_arr, perm) =>  {
    const perm_auths = perm.required_auth.accounts.filter(acc_perm => acc_perm.permission.actor == account_name) ;
    if(perm_auths.length>0)
    { 
      _arr.push({ permission: perm_auths[0].permission, perm_name:perm.perm_name, permissioner:permissioner_account});
    }; 
    return _arr;
  } ,[] )

  const perms_hierarchy = ['viewer', 'pda', 'active', 'owner',]
  return perms.length<1 ? undefined : perms.sort(function(a, b){return perms_hierarchy.indexOf(a.perm_name)<perms_hierarchy.indexOf(b.perm_name)})[0];
}

const getPermissionedAccountsForAccount = (account_name) => new Promise((res, rej) => {
  
  // console.log(' ************* #1 searchPermissioningAccounts')
  dfuse.searchPermissioningAccounts(account_name)
  .then(
    (permissioning_accounts)=>{
      
      let isCustomerPromises = [];
      let bank_customer_tmp  = {};
      // console.log(JSON.stringify(permissioning_accounts))
      // console.log(' ************* #2 isBankCustomer ??')
      permissioning_accounts.forEach((perm) => {
        // console.log(' ++ iterator: ', perm.permissioner)
        isCustomerPromises.push(getBankAccount(perm.permissioner))
      })
      Promise.all(isCustomerPromises).then((values) => {
        // console.log(JSON.stringify(values))
        let permissionPromises = [];
        // console.log(' ************* #3 getMaxPermissionForAccount ??')
        values.forEach((bank_customer, index) => {
          if(bank_customer) 
          {
            bank_customer_tmp[bank_customer.key] = bank_customer;
            permissionPromises.push(getMaxPermissionForAccount(account_name, permissioning_accounts[index].permissioner))
          }
        })
        Promise.all(permissionPromises).then((permissions) => {
            
            res(permissions.filter(permission => (permission!==undefined)).map((permission) => {
              const bank_customer = bank_customer_tmp[permission.permissioner];
              return {
                  permission         : permission.perm_name
                  , permissioner     : {
                      account_name               : permission.permissioner
                      , account_type             : bank_customer.account_type
                      , account_type_description : txsHelper.getAccountTypeDescription(bank_customer.account_type)}
                  , permissioned     : permission.permission  
                  }
            }));
          }, (err)=>{
          console.log(' ************ inkiriApi::getPermissionedAccountsForAccount getMaxPermissionForAccount ERROR >> ', JSON.stringify(err));
          rej(err);
        });

      }, (err)=>{
        console.log(' ************ inkiriApi::getPermissionedAccountsForAccount isCustomerPromises ERROR >> ', JSON.stringify(err));
        rej(err);
      });
    },
    (error)=>{
      console.log('inkiriApi::getPermissionedAccountsForAccount ERROR >> ', error) 
      throw new Error(JSON.stringigy(error)) 
    }
  )
})

export const login = async (account_name, private_key) => {
  
  // 1.- Obtengo la publica de la privada.
  const pubkey  = ecc.privateToPublic(private_key); 
  
  // 2.- Obtengo las controlling accounts.
  const key_accounts = await dfuse.getKeyAccounts(pubkey);
  
  // 3.- Valido que account_name en array de cuentas de la publica.
  if(key_accounts.indexOf(account_name)<0)
  {
    throw new Error('Account and key not matching!') 
  }  

  // 4.- Valido que account esta en la tabla del bank, es decir es cliente, y es cuenta personal.
  let customer_info;
  try{
    // customer_info = (await dfuse.searchOneBankAccount(account_name)).data.account;
    customer_info = await getBankAccount(account_name);
    console.log('inkiriApi::login customer_info >> ', JSON.stringify(customer_info))
  }
  catch(ex){
    console.log('inkiriApi::login ERROR >> Account is not a Bank customer!') 
    throw new Error('Account is not a Bank customer!') 
  }

  if( !globalCfg.bank.isPersonalAccount(customer_info.account_type) 
    || !globalCfg.bank.isEnabledAccount(customer_info.state))
  {
    throw new Error('Your account should be an enabled and a Personal type account!')
    return; 
  }
  
  const bchain_account_info = await getAccount(account_name);
  const personalAccount   = { 

      // account_name:       bchain_account_info.data.account_name,
      // account_type:       customer_info.account_type,
      // account_type_desc:  customer_info.account_type_description,
      // role:               '??',          
      extra:        {
        bank: customer_info, 
        blockchain : bchain_account_info.data
      }
      , permission       : 'active'
      , permissioner     : {
          account_name               : account_name
          , account_type             : customer_info.account_type
          , account_type_description : txsHelper.getAccountTypeDescription(customer_info.account_type)}
      , permissioned     : {
            "actor": account_name,
            "permission": "active"
        }
  };

  let persmissionedAccounts = await getPermissionedAccountsForAccount(account_name);
  let corporateAccounts     = persmissionedAccounts.filter(perm => globalCfg.bank.isBusinessAccount(perm.permissioner.account_type))
  let adminAccount          = persmissionedAccounts.filter(perm => globalCfg.bank.isAdminAccount(perm.permissioner.account_type))
  let personalAccounts      = persmissionedAccounts.filter(perm => globalCfg.bank.isPersonalAccount(perm.permissioner.account_type))
  // // HACK
  // if(account_name==globalCfg.bank.issuer)
  // {
  //   adminAccount = { ...personalAccount}
  // }

  
  // 6.- me logeo al banko
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

  const ret= {
    personalAccount       : personalAccount,
    // persmissionedAccounts : persmissionedAccounts,
    corporateAccounts     : corporateAccounts.length>0?corporateAccounts:undefined,
    adminAccount          : (adminAccount&&adminAccount.length>0)?adminAccount[0]:undefined,
    otherPersonalAccounts : personalAccounts
  };

  console.log(' **************** '
      , ' +-+-+-+-+-+-+- inkiriApi::login >> result: '
      , JSON.stringify(ret));

  return ret;
} 