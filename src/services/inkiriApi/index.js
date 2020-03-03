import * as globalCfg from '@app/configs/global';

import * as eosHelper from './eos-helper.js';
import * as permissionHelper from './eos-permission-helper.js';
import * as nameHelper from './eosjs-name.js';
import * as accountNameHelper from './eosjs-account-name.js';
import * as keyHelper from './eosjs-key.js';
import * as dfuse from './dfuse.js';
import * as bank from './bank.priv.js';
import * as jwt from './jwt-helper.js';
import * as pap_helper from './pre-auth-payments.helper.js';
import ecc from 'eosjs-ecc';

import * as txsHelper from './txs-helper';

// import { Api, JsonRpc, RpcError } from 'eosjs';
import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';

import _ from 'lodash';

export {permissionHelper}
export {txsHelper};
export {nameHelper};
export {accountNameHelper};
export {eosHelper};
export {dfuse};
export {bank};
export {jwt};
export {pap_helper};
export {keyHelper};

function prettyJson(input){
  return JSON.stringify(input, null, 2)
}

/*
* Retrieves Smart Contract's Bank accounts profile list.
*/
// export const listBankAccounts  = () => dfuse.listBankAccounts();
export const listBankAccounts  = () => listAllBankAccounts();

const listAllBankAccounts = async () => { 
  const jsonRpc   = new JsonRpc(globalCfg.eos.endpoint)
  // const response  = await jsonRpc.get_account(account_name)
  const response = await jsonRpc.get_table_rows({
    json:           true                 
    , code:         globalCfg.bank.issuer
    , scope:        globalCfg.bank.issuer
    , table:        globalCfg.bank.table_customers
    , limit:        1000
    , reverse:      false
    , show_payer :  false
  });
  // console.log(' api::listAllBankAccounts >> ', JSON.stringify(response));
  // Ver https://github.com/EOSIO/eos/issues/3948
  // if more==true, entonces hay que traer mas usando lower_bound o upper_bound
  var accounts = response.rows.map(account => 
        ({  ...account
            ,'state_description' :        globalCfg.bank.getAccountState(account.state)
            ,'account_type_description' : globalCfg.bank.getAccountType(account.account_type) }));
  return {data:{accounts:accounts, more:response.more}};
}


/*
* Search an account on the Smart Contract's Bank account's table.
*/
export const findBankAccount = async (account_name) => { 
  const jsonRpc   = new JsonRpc(globalCfg.eos.endpoint)
  const response = await jsonRpc.get_table_rows({
    json:           true                 
    , code:         globalCfg.bank.issuer
    , scope:        globalCfg.bank.issuer
    , table:        globalCfg.bank.table_customers
    , lower_bound:  account_name
    , upper_bound:  account_name
    , limit:        1
    , reverse:      false
    , show_payer :  false
  });
  const _found = (response.rows&&response.rows.length>0);
  // if(_found)
  //   console.log(' InkiriApi::findBankAccount >> ', JSON.stringify(response.rows[0]));
  // else
  //   console.log(' InkiriApi::findBankAccount >> ', 'NOT FOUND');
  return _found?{...response.rows[0]}:undefined;
}


/*
* Retrieves a bank  an account on the Smart Contract's Bank account's table.
*/
// export const getBankAccount = (account_name) => dfuse.searchBankAccount(account_name);
export const getBankAccount = (account_name) => findBankAccount(account_name);

/*
* Retrieves if given account name is a customer (aka: account exists in SmartContract account table?).
*/
export const isBankCustomer = (account_name) => isBankCustomerImpl(account_name); 
const isBankCustomerImpl = async (account_name) => { 
  const customer = await getBankAccount(account_name);
  return customer!==undefined;
}

/*
* Retrieves EOS account structure for a given accoutn name.
*/
export const getAccount = (account_name) => getAccountImpl(account_name);
const getAccountImpl = async (account_name) => { 
  const jsonRpc   = new JsonRpc(globalCfg.eos.endpoint)
  const response  = await jsonRpc.get_account(account_name)
  return {data:response}
}

export const getCurrencyStats = async () => { 
  const jsonRpc   = new JsonRpc(globalCfg.eos.endpoint)
  // console.log('getCurrencyStats.....')
  const response  = await jsonRpc.get_currency_stats(globalCfg.currency.issuer, globalCfg.currency.eos_symbol)
  // console.log(' API :)', response[globalCfg.currency.eos_symbol]);
  return response[globalCfg.currency.eos_symbol];
}

/*
* Retrieves account names related to a given public key.
*/
export const getKeyAccounts = (public_key) => dfuse.getKeyAccounts(public_key);
// export const getKeyAccounts = (public_key) => getKeyAccountsImpl(public_key);
const getKeyAccountsImpl = async (public_key) => { 
  const jsonRpc   = new JsonRpc(globalCfg.eos.endpoint);
  // const jsonRpc   = new JsonRpc(globalCfg.dfuse.base_url);
  
  const response  = await jsonRpc.history_get_key_accounts(public_key);
  
  console.log(' ########## getKeyAccounts:', JSON.stringify(response));
  return response?response.account_names:[];
}


/*
* Retrieves account Balance for DApp's Token for a given account name.
*/
// export const getAccountBalance = (account_name) =>  dfuse.getAccountBalance(account_name);
export const getAccountBalance = (account_name) =>  getAccountBalanceImpl(account_name);
const getAccountBalanceImpl = async (account_name) => { 
  const jsonRpc   = new JsonRpc(globalCfg.eos.endpoint);
  const params    = {
    "code" : globalCfg.currency.token,
    "scope" : account_name,
    "table" : "accounts",
    "json" : true
  }

  const response  = await jsonRpc.get_table_rows(params);
  // console.log(' ########## getAccountBalance:', JSON.stringify(response));
  // {"rows":[{"balance":"5498.0000 INK"}],"more":false}
  let res = {
              balance:       (response && response.rows &&  response.rows.length)?globalCfg.currency.toNumber(response.rows[0].balance):0,
              balanceText:   (response && response.rows &&  response.rows.length)?response.rows[0].balance:0
            }
  return {data:res}
}

// v1/chain/get_table_rows
// jsonRpc.get_table_rows(callParams);

// const getControlledAccounts = async (controllingAccount) => { 
//   const jsonRpc   = new JsonRpc(globalCfg.dfuse.base_url)
//   const response  = await jsonRpc.history_get_controlled_accounts(controllingAccount);
//   return {data:response}
// }


export const listTransactions = (account_name, cursor) => dfuse.listTransactions(account_name, cursor);
// export const listTransactions = (account_name, cursor) => new Promise((res,rej)=> { 

// });  

export const setAccountPermission = async (tx, privatekey) => pushTX (tx, privatekey);

const pushTX = async (tx, privatekey) => { 
	const signatureProvider = new JsSignatureProvider([privatekey])
  // const rpc = new JsonRpc(globalCfg.dfuse.base_url)
  const rpc = new JsonRpc(globalCfg.eos.endpoint)
  const api = new Api({
    rpc,
    signatureProvider
  })
  const my_actions = Array.isArray(tx)?tx:[tx];
  
  console.log(' -- inkiriApi::pushTX::tx = ', my_actions, JSON.stringify(my_actions));

  const actions    = { actions: my_actions };
  const tx_options = globalCfg.eos.push.use_options 
    ?  globalCfg.eos.push.options
    : {};

  const retries = globalCfg.eos.push.retries;

  const isBreakException = (e) => {
    const error_code = e.json && e.json.error && e.json.error.error_code;
    /*
      Exception Source: https://github.com/EOSIO/eos/blob/e19afc8072219282a7c3fc20e47aa80cb70299e4/libraries/chain/include/eosio/chain/exceptions.hpp
      3081001 -> leeway_deadline_exception
    */
    return globalCfg.eos.push.breakable_error_codes.includes(error_code);

  }

  const push_retry = async (actions, options, retries) => {

    try {
      const result = await api.transact(
        actions,
        options 
      );
      console.log(' InkiriApi::pushTX (then#1) >> ', JSON.stringify(result));
      return {data:result};
      
    } catch (e) {

      console.log(' ================pushTX (error#1) >>  ')
      console.log(JSON.stringify(e));
      console.log(e);
      // throw e.json.error.details[0].message;
      if (retries <= 1 || isBreakException(e)) 
        throw e;
      const res = await push_retry(actions, options, retries - 1);
      return res;
    }
  }

  const response = await push_retry(actions, tx_options, retries);
  return response;

}

const CURRENCY_SYMBOL = globalCfg.eos.currency_symbol;

export const createAccount = async (creator_priv, new_account_name, new_account_public_key, account_type, fee, overdraft, permissions) => { 

  const fee_string       = globalCfg.currency.toEOSNumber(fee);
  const overdraft_string = globalCfg.currency.toEOSNumber(overdraft);

  const is_business = account_type==globalCfg.bank.ACCOUNT_TYPE_BUSINESS||account_type==2||account_type=='business';
  const ram         = 4096 ;
  const net         = is_business? '0.5000' : '0.2500'; 
  const cpu         = is_business? '1.0000' : '0.2500';

  let actions = [];
  let newAccountAction = 
    {
    account:             'eosio',
    name:                'newaccount',
    authorization: [{
      actor:             globalCfg.bank.issuer,
      permission:        'active',
    }],
    data: {
      creator:           globalCfg.bank.issuer,
      name:              new_account_name,
      owner: {
        threshold:       1,
        keys: [{
          key:           new_account_public_key,
          weight:        1
        }],
        accounts: [{
          permission: {
            actor:       globalCfg.bank.issuer,
            permission:  "active"
          },
          weight:        1
        }],
        waits:           []
      },
      active: {
        threshold:       1,
        keys: [{
          key:           new_account_public_key,
          weight:        1
        }],
        accounts:        [],
        waits:           []
      },
    },
  };
  // actions.push(newAccountAction)

  if(permissions)
  {
    // console.log(' ******* HAY PERMISOS')
    Object.keys(permissions).forEach(function (key, idx) {
      if(!(key in newAccountAction.data))
      {
        newAccountAction.data[key] = {
          threshold:     1,
          keys:          [],
          accounts:      [],
          waits:         []
        };
      }
      
      // console.log(' ******* ITERANDO: ', key, ' | con items: ', JSON.stringify(permissions[key]))
      permissions[key].forEach(function(auth_account){
        newAccountAction.data[key].accounts.push(
            {
              permission: {
                actor:       auth_account,
                permission:  "active"
              },
              weight:        1
            }
          );
      });

      // SORTING
      // console.log(' ******* SORTING! ')
      const ordered = _.sortBy(newAccountAction.data[key].accounts, function(perm) { return perm.permission.actor; })
      newAccountAction.data[key].accounts = ordered;  
    });
  }

  console.log(JSON.stringify(newAccountAction));

  const buyRamAction = {
    account:               'eosio',
    name:                  'buyrambytes',
    authorization: [{
      actor:               globalCfg.bank.issuer,
      permission:          'active',
    }],
    data: {
      payer:               globalCfg.bank.issuer,
      receiver:            new_account_name,
      // bytes: 8192,
      bytes:               ram,
    },
  };
  // actions.push(buyRamAction)

  const delegateBWAction= {
    account:               'eosio',
    name:                  'delegatebw',
    authorization: [{
      actor:               globalCfg.bank.issuer,
      permission:          'active',
    }],
    data: {
      from:                globalCfg.bank.issuer,
      receiver:            new_account_name,
      stake_net_quantity:  net + ' ' + CURRENCY_SYMBOL,
      stake_cpu_quantity:  cpu + ' ' + CURRENCY_SYMBOL,
      transfer:            false,
    }
  }
  // actions.push(delegateBWAction)

  const createBankAccountAction = {
    account:               globalCfg.bank.issuer,
    name:                  globalCfg.bank.table_customers_action,
    authorization: [{
      actor:               globalCfg.bank.issuer,
      permission:          'active',
    }],
    data: {
      to              :    new_account_name
      , fee           :    fee_string
      , overdraft     :    overdraft_string
      , account_type  :    account_type
      , state         :    1
      , memo          :    ''
    },
  }
  
  const issueAction = null;
  // This should be executed at the Smart Contract.
  // const issueAction = (overdraft>0)
  //   ?{
  //     account: globalCfg.currency.token,
  //     name: "issue",
  //     authorization: [
  //       {
  //         actor: globalCfg.currency.issuer,
  //         permission: "active"
  //       }
  //     ],
  //     data: {
  //       to: new_account_name,
  //       quantity: globalCfg.currency.toEOSNumber(overdraft),
  //       memo: ('oft|create')
  //     }
  //   }
  //   :null;
  // 

  actions = [newAccountAction, buyRamAction, delegateBWAction, createBankAccountAction]
  if(issueAction)
    actions.push(issueAction)
  // throw new Error('ESTA!');  
  return pushTX(actions, creator_priv);
}

export const acceptService = async (auth_account, auth_priv, account_name, provider_name, service_id, price, begins_at, periods, request_id) => { 

  const acceptServiceAction = {
    account:            globalCfg.bank.issuer,
    name:               globalCfg.bank.table_paps_action,
    authorization: [
      {
        actor:          auth_account,
        permission:     "active"
      }
    ],
    data: {
      from:              account_name
      , to:              provider_name
      , service_id:      service_id
      , price:           globalCfg.currency.toEOSNumber(price)
      , begins_at:       begins_at
      , periods:         periods
      , last_charged:    0
      , enabled:         globalCfg.bank.ACCOUNT_STATE_OK
      , memo:            `pap|${request_id}`
    }
  }
  
  console.log(' InkiriApi::acceptService >> About to add push >> ', prettyJson(acceptServiceAction))

  return pushTX(acceptServiceAction, auth_priv);

}

export const chargeService = async (auth_account, auth_priv, account_name, provider_name, service_id, quantity, period_to_charge) => { 

  const acceptServiceAction = {
    account:            globalCfg.bank.issuer,
    name:               globalCfg.bank.table_paps_charge,
    authorization: [
      {
        actor:          auth_account,
        permission:     "active"
      }
    ],
    data: {
      from:              account_name
      , to:              provider_name
      , service_id:      service_id
      , quantity:        quantity
      , memo:            `pap|pay|${period_to_charge}`
    }
  }
  
  console.log(' InkiriApi::acceptService >> About to add push >> ', prettyJson(acceptServiceAction))

  return pushTX(acceptServiceAction, auth_priv);

}


// export const refund                 = (sender_account, sender_priv, receiver_account, amount, request_id, tx_id) => transferMoney(sender_account, sender_priv, receiver_account, amount, ('bck|' + request_id + '|' + tx_id));
export const refund                 = (sender_account, sender_priv, receiver_account, amount, request_counter, new_state) => transferMoney(sender_account, sender_priv, receiver_account, amount, ('bck|' + request_counter + '|' + new_state));
export const sendMoney              = (sender_account, sender_priv, receiver_account, amount, memo)              => transferMoney(sender_account, sender_priv, receiver_account, amount, ('snd|'+memo)); 
export const sendPayment            = (sender_account, sender_priv, receiver_account, amount, memo, request_id)  => transferMoney(sender_account, sender_priv, receiver_account, amount, ('pay|' + request_id + '|' + memo)); 
export const requestProviderPayment = (sender_account, sender_priv, receiver_account, amount, request_id)        => transferMoney(sender_account, sender_priv, receiver_account, amount, ('prv|' + request_id)); 
export const requestExchange        = (sender_account, sender_priv, receiver_account, amount, bank_account_id, request_id) => transferMoney(sender_account, sender_priv, receiver_account, amount, ('xch|' + request_id + '|' + bank_account_id)); 
export const requestWithdraw        = (sender_account, sender_priv, receiver_account, amount, request_id) => transferMoney(sender_account, sender_priv, receiver_account, amount, ('wth|' + request_id)); 

export const transferMoney          = async (sender_account, sender_priv, receiver_account, amount, memo) => { 

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
      quantity: globalCfg.currency.toEOSNumber(amount),
      memo: memo
    }
  }

  console.log(' InkiriApi::transferMoney >> About to send >> ', prettyJson(transferAction));

  return pushTX(transferAction, sender_priv);

}

export const paySalaries = async(sender_account, sender_priv, to_amount_array, ref, month) => { 

  const memo = 'slr|'+(ref||'')+'|'+(month||'');
  const actions = to_amount_array.map(
    payment => {
      return {
        account: globalCfg.currency.token,
        name: "transfer",
        authorization: [
          {
            actor:         sender_account,
            permission:    'active'
          }
        ],
        data: {
          from:       sender_account,
          to:         payment.account_name,
          quantity:   globalCfg.currency.toEOSNumber(payment.amount),
          memo:       memo
        }
      }
    });
  

  console.log(' InkiriApi::paySalaries >> About to send >> ', prettyJson(actions));

  return pushTX(actions, sender_priv);

}

export const issueMoney = async (issuer_account, issuer_priv, receiver_account, amount, memo) => { 

	console.log(' inkiriApi::issueMoney ', 
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
      quantity: globalCfg.currency.toEOSNumber(amount),
      memo: memo||''
    }
  }

  console.log(' InkiriApi::issueMoney >> About to issue >> ', prettyJson(issueAction))

  return pushTX(issueAction, issuer_priv);

}


// permissioning_accounts

  /*
  personal account
    owner -> root
    active -> manager
    viewer -> --


    admin account - inkirimaster|cristaltoken
    owner -> root
    active -> manager, --
        pda  -> --
        viewer-> --

    corporate account
        owner -> root
    active -> manager
        pdv -> can sell
        viewer -> can view

    Token issuer account - inkiritoken1|cristaltoken
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

  // ToDo: I have to move this to another file and a config file. 
  const perms_hierarchy = ['viewer', 'pda', 'active', 'owner',]
  return perms.length<1 ? undefined : perms.sort(function(a, b){return perms_hierarchy.indexOf(a.perm_name)<perms_hierarchy.indexOf(b.perm_name)})[0];
}

/**
 * Function that retrieves all blockchain transactions that includes
 * the account that was given authority over a permission.
 *
 * @param {string} account_name – Description.
 */
const getPermissionedAccountsForAccount = (account_name) => new Promise((res, rej) => {
  
  // console.log(' ************* #1 searchPermissioningAccounts')
  dfuse.searchPermissioningAccounts(account_name)
  .then(
    (permissioning_accounts)=>{
      
      let isCustomerPromises = [];
      let bank_customer_tmp  = {};
      permissioning_accounts.forEach((perm) => {
        isCustomerPromises.push(getBankAccount(perm))
      })
      Promise.all(isCustomerPromises).then((values) => {
        let permissionPromises = [];
        values.forEach((bank_customer, index) => {
          if(bank_customer) 
          {
            bank_customer_tmp[bank_customer.key] = bank_customer;
            permissionPromises.push(getMaxPermissionForAccount(account_name, permissioning_accounts[index]))
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
                      , account_type_description : globalCfg.bank.getAccountType(bank_customer.account_type)}
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
      // throw new Error(JSON.stringify(error)) 
      rej(error);
    }
  )
})

export const login = async (account_name, private_key) => {
  
  const do_log = true;
  // 1.- Obtengo la publica de la privada.
  const pubkey  = ecc.privateToPublic(private_key); 
  
  // 2.- Obtengo las controlling accounts.
  const key_accounts = await getKeyAccounts(pubkey);

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
    do_log && console.log('inkiriApi::login customer_info >> ', JSON.stringify(customer_info))
  }
  catch(ex){
    do_log && console.log('inkiriApi::login ERROR >> Account is not a Bank customer!') 
    throw new Error('Account is not a Bank customer!') 
  }

  // || !globalCfg.bank.isPersonalAccount(customer_info.account_type)   
  if( !globalCfg.bank.isEnabledAccount(customer_info.state))
  {
    do_log && console.log('inkiriApi::login ERROR >> about to fire error #1') 
    throw new Error('Your account should be an enabled and a Personal type account!')
    return; 
  }

  const bchain_account_info = await getAccount(account_name);
  const personalAccount   = { 

      extra:        {
        bank: customer_info, 
        blockchain : bchain_account_info.data
      }
      , permission       : 'active'
      , permissioner     : {
          account_name               : account_name
          , account_type             : customer_info.account_type
          , account_type_description : globalCfg.bank.getAccountType(customer_info.account_type) 
      }
      , permissioned     : {
            "actor": account_name,
            "permission": "active"
        }
  };

  do_log && console.log('inkiriApi::login::about to retrieve permissions #1') 

  let persmissionedAccounts = [];
  try{
    persmissionedAccounts = await getPermissionedAccountsForAccount(account_name);
  } 
  catch(ex)
  {
    do_log && console.log('inkiriApi::login::permissions error #2', ex) 
    persmissionedAccounts = [];
  } 

  do_log && console.log('inkiriApi::login::permissions retrieved ok!') 

  let corporateAccounts     = persmissionedAccounts.filter(perm => globalCfg.bank.isBusinessAccount(perm.permissioner.account_type))
  let adminAccount          = persmissionedAccounts.filter(perm => globalCfg.bank.isAdminAccount(perm.permissioner.account_type))
  let personalAccounts      = persmissionedAccounts.filter(perm => perm.permissioner.account_name!==account_name && globalCfg.bank.isPersonalAccount(perm.permissioner.account_type))
  
  // // HACK
  // if(account_name==globalCfg.bank.issuer)
  // {
  //   adminAccount = { ...personalAccount}
  // }

  do_log && console.log('inkiriApi::login::about to try to login the bank and get token !') 

  /*
  * 6.- me logeo al banko
  */
  let bank_auth;
  let need_creation = false;
  try{
    bank_auth = await bank.auth(account_name, private_key);
  }
  catch(ex){
    // if(ex && ex.error && parseInt(ex.error)==404){
    //   need_creation = true;
    // }
    bank_auth = undefined;
    console.log('inkiriApi::login ERROR >> Account is not on private servers!', JSON.stringify(ex)) 
    // throw new Error('Account is not on private servers!'); 
    // return; 
  }

  if(!bank_auth)
  {
    do_log && console.log('inkiriApi::login::about to fire error #3 > Account is not a bank customer!',) 
    throw new Error('Account is not a bank customer!'); 
    return;
  }
  // if(!bank_auth&&need_creation)
  // {
  //   try{
  //     let bank_create = await bank.createUser(account_name, globalCfg.bank.getAccountType(customer_info.account_type));
  //     bank_auth = await bank.auth(account_name, private_key);
  //   }
  //   catch(ex){
  //     console.log('inkiriApi::login ERROR#2 >> !', JSON.stringify(ex)) 
  //     throw new Error('Account is not on private servers!'); 
  //     return;
  //   }
  // }
   
  do_log && console.log('inkiriApi::login::about to getprofile',) 
  let profile = null;
  try{
    profile = await bank.getProfile(account_name);
  }
  catch(ex){
    // if(ex && ex.error && parseInt(ex.error)==404){
      
    // }
  }

  const ret= {
    profile               : profile,
    personalAccount       : personalAccount,
    // persmissionedAccounts : persmissionedAccounts,
    corporateAccounts     : corporateAccounts.length>0?corporateAccounts:undefined,
    adminAccount          : (adminAccount&&adminAccount.length>0)?adminAccount[0]:undefined,
    otherPersonalAccounts : personalAccounts
  };

  console.log(' ============================================== inkiriApi::login >> result: '
      , JSON.stringify(ret));

  return ret;
} 