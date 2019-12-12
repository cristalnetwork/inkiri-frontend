import * as globalCfg from '@app/configs/global';
import { createDfuseClient, DfuseClient } from "@dfuse/client";
import * as txsHelper from './txs-helper';
import * as jwtHelper from './jwt-helper';

// Item format:
// {
//   "token": "eyJhbGciOiJLTVNFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NTA2OTIxNzIsImp0aSI6IjQ0Y2UzMDVlLWMyN2QtNGIzZS1iN2ExLWVlM2NlNGUyMDE1MyIsImlhdCI6MTU1MDYwNTc3MiwiaXNzIjoiZGZ1c2UuaW8iLCJzdWIiOiJ1aWQ6bWRmdXNlMmY0YzU3OTFiOWE3MzE1IiwidGllciI6ImVvc3EtdjEiLCJvcmlnaW4iOiJlb3NxLmFwcCIsInN0YmxrIjotMzYwMCwidiI6MX0.k1Y66nqBS7S6aSt-zyt24lPFiNfWiLPbICc89kxoDvTdyDnLuUK7JxuGru9_PbPf89QBipdldRZ_ajTwlbT-KQ",
//   "expires_at": 1550692172 // An UNIX timestamp (UTC) indicating when the JWT will expire.
// }  							

export const isAuth = () => {
  return jwtHelper.getTokenIfNotExpired(jwtHelper.DFUSE_AUTH_TOKEN_KEY)!==null;
}

export const auth = () =>   new Promise((res,rej)=> {
	
	// Check if already have a valid token at localstorage
	const token = jwtHelper.getTokenIfNotExpired(jwtHelper.DFUSE_AUTH_TOKEN_KEY);

  // console.log(' >> dfuse::auth >> is TOKEN at local storage? >> ')  
  console.log(' >> dfuse::auth >> TOKEN? >> ', token);  
  if(!token)
	{
		// console.log('dfuse::auth >> NO >>', 'About to post dfuse auth api')	
		// Retrieve dfuse token
		const opts = {"api_key":globalCfg.dfuse.api_key}
		fetch(globalCfg.dfuse.auth_url, {
	    method: 'POST',
	    body: JSON.stringify(opts)
		  }).then((response) => response.json(), (err) => {rej(err);})
      .then((data) => {
		  	// console.log('dfuse::auth >> ', 'About to set local storage', JSON.stringify(data))	
		  	// localStorage.setItem(jwtHelper.DFUSE_AUTH_TOKEN_KEY, JSON.stringify(data))
        jwtHelper.setTokenToStorage(jwtHelper.DFUSE_AUTH_TOKEN_KEY, JSON.stringify(data));
				res(jwtHelper.buildResponse(data.token));
        return;
		  }, (ex) => {
        rej(ex);
        return;
      });
	  return;
	}
  else{
    // console.log('dfuse::auth >> YES >>', 'About to retrieve from local storage', token)  
    // res({data:JSON.parse(dfuse_auth)})
    res(jwtHelper.buildResponse(token));
  }
	
})



// GET /v0/state/key_accounts
// In replace of -> /v1/history/get_key_accounts
// Source -> https://docs.dfuse.io/#rest-get-v0-state-key-accounts
export const getKeyAccounts = (public_key) => new Promise((res,rej)=> {
  auth()
    .then((token) => {
      // console.log( ' >>>>>> dfuse::getKeyAccounts >> token ->' , token)
      const path = globalCfg.dfuse.base_url + '/v0/state/key_accounts';
      const method = 'GET';
      const query = '?public_key='+public_key;
      
      jwtHelper.apiCall(path+query, method)
        .then((data) => {
            // console.log( ' >> dfuse::getKeyAccounts OK >>', data)
            if(!data.account_names){
              rej('No name for given public key');
              return;
            }
            res(data.account_names);
            return;
          }, (ex) => {
            console.log( ' >> dfuse::getKeyAccounts ERROR#2 >>', ex)
            rej(ex);
            return;
          });
    }, (ex) => {
      console.log( ' >> dfuse::getKeyAccounts ERROR#1 >>', ex)
      rej(ex);
    });
})

export function createClient(){
	let client = createDfuseClient({
    apiKey: globalCfg.dfuse.api_key,
    network: globalCfg.dfuse.network
  })
  return client;
} 

// https://jungle.eos.dfuse.io/v0/state/tables/scopes?account=inkiritoken1&scopes=inkiritoken1|inkpersonal1|inkpersonal3&table=accounts&json=true

export const getAccountsBalances = (account_names_array) => new Promise((res,rej)=> {
  auth()
    .then((token) => {
      // console.log( ' >>>>>> dfuse::getKeyAccounts >> token ->' , token)
      const path           = globalCfg.dfuse.base_url + '/v0/state/tables/scopes';
      const method         = 'GET';
      const currency_token = globalCfg.currency.token;
      const scopes         = account_names_array.join('|');

      const query = `?account=${currency_token}&scopes=${scopes}&table=accounts&json=true`;
      
      jwtHelper.apiCall(path+query, method)
        .then((data) => {
            res(data.tables.map(row=>{
              return{account:row.scope, balance:((row.rows&&row.rows.length>0)?globalCfg.currency.toNumber(row.rows[0].json.balance):0)}} ) )
          }, (ex) => {
            rej(ex);
          });
    }, (ex) => {
      // console.log( ' >> dfuse::getKeyAccounts ERROR >>', ex)
      rej(ex);
    });
})


export const getAccountBalance = (account) => new Promise((res,rej)=> {
	
	// console.log('dfuse::getAccountBalance >> ', 'About to retrieve balance for account:', account)	
	
	let client = createClient();
	client.stateTable(
      globalCfg.currency.token,
      account,
      "accounts",
      { blockNum: undefined }
    )
    .then((data) => {
      // console.log(' dfuse::getAccountBalance >> receive balance for account:', account, JSON.stringify(data));
      const _res = {
          data:{
            balance:       data.rows.length? globalCfg.currency.toNumber(data.rows[0].json.balance):0,
            balanceText:   data.rows.length?data.rows[0].json.balance:0
          }
        };
      // console.log(' dfuse::getAccountBalance >> about to dispatch balance for account:', account, JSON.stringify(_res));
      res (_res);
      client.release();
    }, (ex)=>{
      // console.log('dfuse::getAccountBalance >> ERROR ', JSON.stringify(ex));
      rej(ex);
      client.release();
    });
    

})	

/**
 * Function that retrieves all blockchain transactions that includes
 * the account that was given authority over a permission.
 *
 * @param {string} account_name – Description.
 */
export const searchPermissioningAccounts = (account_name) => new Promise( (res, rej) => {

  /*
  {
    "query" : "{searchTransactionsForward(query: \"data.auth.accounts.permission.actor:inkpersonal3\") {cursor results { undo trace { id matchingActions { json }}}}}"
  }
  */
  // ToDo: Improve GraphQL query! Filter duplicates and find latest.
  auth()
    .then((token) => {
      
      const path   = globalCfg.dfuse.base_url + '/graphql';
      const method = 'POST';
      const data   = {"query" : '{searchTransactionsForward(query: "data.auth.accounts.permission.actor:'+account_name+'") {cursor results { undo trace { id matchingActions { json }}}}}'};
      
      jwtHelper.apiCall(path, method, data)
        .then((data) => {
            // Filter transactions to get unique permissioners account names.
            const accounts = data.data.searchTransactionsForward.results
              .map(txs => txs.trace.matchingActions[0].json.account)
              .filter(account=>account!=account_name);
            const _res = [...new Set(accounts)];
            console.log(' dfuse::searchPermissioningAccounts() account_name:', account_name, ' | result: ', JSON.stringify(_res))
            res(_res);

            // const ret = data.data.searchTransactionsForward.results
            //   .filter((obj, index) => obj)
            //   .map(txs => ({ 
            //     permissioner:txs.trace.matchingActions[0].json.account, 
            //     permission:txs.trace.matchingActions[0].json.permission, 
            //     permissioned:txs.trace.matchingActions[0].json.auth.accounts.filter(perm => perm.permission.actor==account_name)[0].permission }))
            // res(ret)

          }, (ex) => {
            rej(ex);
          });
    }, (ex) => {
      // console.log( ' >> dfuse::getKeyAccounts ERROR >>', ex)
      rej(ex);
    });
  
})

export const transformTransactions = (txs, account_name) => transformTransactionsImpl(txs, account_name);
const transformTransactionsImpl = (txs, account_name) => {
  
  if (!txs || txs.length <= 0) {
    console.log(' TRANSFOMR TX txs is empty :( ');
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
        console.log(' TRANSFOMR TX ERROR#1 => ', JSON.stringify(transaction), JSON.stringify(e))
        return null;
      }

    })
  
  return my_txs.filter(tx=> tx!=null);
}

export const listPAPPayments = async (account_name, provider, customer, cursor) => new Promise(async(res,rej)=> {
  
  const query = `action:${globalCfg.bank.table_paps_charge}  account:${globalCfg.currency.token} data.from:${customer} data.to:${provider}`;
  
  console.log('listPAPPayments:', query);
  let options = { 
    limit: globalCfg.dfuse.default_page_size 
    , sort: 'desc'
    , irreversibleOnly: false};

  if(cursor)
    options['cursor'] = cursor;
  let client = createClient();
  client.searchTransactions(
      query,
      options
    )
    .then( (data) => {
      const txs = transformTransactionsImpl(data.transactions, account_name);
      res ({data:{txs:txs, cursor:data.cursor}})
      client.release();
    }, (ex) => {
      console.log('dfuse::listTransactions >> ERROR#1 ', JSON.stringify(ex));
      rej(ex);
      client.release();
    });
  
})  


/*

https://jungle.eos.dfuse.io/graphiql/?query=cXVlcnl7IAoKCXNlYXJjaFRyYW5zYWN0aW9uc0ZvcndhcmQoCgkJcXVlcnk6ICJhY2NvdW50OmNyaXN0YWx0b2tlbiIKICAgICwgbG93QmxvY2tOdW06IDYyNDIxNTUxKSB7CiAgCSAJY3Vyc29yIAogICAgCXJlc3VsdHMgeyAKICAgICAgICBibG9jayB7IG51bSBpZCB9CiAgICAgICAgdW5kbyB0cmFjZSB7IAogICAgICAgICAgaWQgCiAgICAgICAgICB0b3BMZXZlbEFjdGlvbnMgewogICAgICAgICAgICBhY2NvdW50CiAgICAgICAgICAgIG5hbWUKICAgICAgICAgICAgYXV0aG9yaXphdGlvbiB7CiAgICAgICAgICAgICAgICBhY3RvcgogICAgICAgICAgICAgICAgcGVybWlzc2lvbgogICAgICAgICAgICB9CiAgICAgICAgICAgIGRhdGEKICAgICAgICB9CiAgICAgICAgfSAKICAgICAgfSAKICB9Cn0K

query{ 
  searchTransactionsForward(
    query: "account:cristaltoken"
    , lowBlockNum: 62421551) {
       cursor 
      results { 
        block { num id timestamp }
        undo trace { 
          id 
          topLevelActions {
            account
            name
            authorization {
                actor
                permission
            }
            data
        }
        } 
      } 
  }
}

*/

//

/*
* @param account => {account_name, account_type}
*/
export const queryTransactionsNew = (account, last_block) => queryTransactions(account, null, last_block+1);
export const queryTransactionsCursor = (account, cursor)  => queryTransactions(account, cursor, null);
export const queryTransactions = async (account, cursor, last_block) => new Promise(async(res,rej)=> {
  console.log(' queryTransactions => ', account)
  if(!account)
    account = {  acount_name:     globalCfg.currency.issuer
                 , account_type:  globalCfg.bank.ACCOUNT_TYPE_BANK_ADMIN};
  const {account_name, account_type} = account;                 
  const query          = {
        [globalCfg.bank.ACCOUNT_TYPE_BANKADMIN]  : `account:${globalCfg.currency.token}`
        , [globalCfg.bank.ACCOUNT_TYPE_PERSONAL] : `account: ${globalCfg.currency.token} (data.from:${account_name} OR data.to:${account_name} OR data.account:${account_name})`
        , [globalCfg.bank.ACCOUNT_TYPE_BUSINESS] : `account: ${globalCfg.currency.token} (data.from:${account_name} OR data.to:${account_name} OR data.account:${account_name})`
  };

  const searchTransactions = `query ($limit: Int64, $irreversibleOnly:Boolean, $lowBlockNum:Int64, $cursor:String){
    searchTransactionsForward(query: "${query[account_type]}", limit: $limit, irreversibleOnly: $irreversibleOnly, lowBlockNum: $lowBlockNum, cursor:$cursor) {
      cursor 
      results { 
        block { num id timestamp}
        undo trace { 
          id 
          topLevelActions {
            account
            name
            authorization {
                actor
                permission
            }
            data
        }
        } 
      }
    }
  }`;

  let client = createClient();
  try {
    const response = await client.graphql(searchTransactions, {
      variables: { limit:             100 
                  , irreversibleOnly: false
                  , lowBlockNum:      last_block||null
                  , cursor:           cursor||null
        }
    })

    // console.log(response)
    const results = response.data.searchTransactionsForward.results || []
    if (results.length <= 0) {
      res ({data:{txs:[], cursor:''}})
      console.log("Oups nothing found")
      return;
    }

    // console.log(' dfuse::queryTransactions >> RAW data >>', JSON.stringify(response));

    const txs = transformTransactionsImpl(results, account_name);
    console.log(' DFUSE transformo las txs!!!!!!', txs.length)
    // console.log(' dfuse::listTransactions >> RAW data >>', JSON.stringify(data));
    res ({data:{txs:txs.reverse(), cursor:response.data.searchTransactionsForward.cursor}})
    
  } catch (error) {
    rej(error);
    console.log("An error occurred", error)
  }

  client.release()

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
export const listTransactions = (account_name, cursor, received, start_block) => new Promise((res,rej)=> {
	
  
  // const query = 'account:' + globalCfg.currency.token + ' (data.from:'+account_name+' OR data.to:'+account_name+')'
  const query = (account_name)
    ?(
      received===undefined
      ?`account: ${globalCfg.currency.token} (data.from:${account_name} OR data.to:${account_name} OR data.account:${account_name})`
      :
        (received===true)
        ?`account: ${globalCfg.currency.token} data.to:${account_name}`
        :`account: ${globalCfg.currency.token} data.from:${account_name}`
      )
    :`account: ${globalCfg.currency.token} `;

	// console.log('dfuse::listTransactions >> ', 'About to retrieve listTransactions >>', query);	

  let options = { 
      limit: globalCfg.dfuse.default_page_size 
      , sort: 'desc'
      // , irreversibleOnly: false
      , withReversible: true
  };
  if(cursor!==undefined)
    options['cursor'] = cursor;
  if(start_block!==undefined)
    options['lowBlockNum'] = start_block;

  console.log(' DFUSE TRANSACTION OPTIONS:', JSON.stringify(options))
  let client = createClient();
	
  client.searchTransactions(
      query,
      options
    )
    .then( (data) => {
    	const txs = transformTransactionsImpl(data.transactions, account_name);
      // console.log(' dfuse::listTransactions >> RAW data >>', JSON.stringify(data));
      res ({data:{txs:txs, cursor:data.cursor}})
      client.release();
    }, (ex) => {
      console.log('dfuse::listTransactions >> ERROR#1 ', JSON.stringify(ex));
      rej(ex);
      client.release();
    });
  
})	

// Extract tx_id from push transaction result
export const getBlockExplorerTxLink = (tx_id) => {

  return globalCfg.dfuse.getBlockExplorerTxLink( tx_id);
}

export const getTxId = (result_tx) => {

  return result_tx.transaction_id;
}

export const getBlockExplorerAccountLink = (account_name) => {

  return globalCfg.dfuse.account_url + account_name;
}