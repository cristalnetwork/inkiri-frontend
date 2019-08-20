import * as globalCfg from '@app/configs/global';
import { createDfuseClient, DfuseClient } from "@dfuse/client";
import * as txsHelper from './transactionHelper';
import * as jwtHelper from './jwtHelper';

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
            res(data.account_names)
          }, (ex) => {
            rej(ex);
          });
    }, (ex) => {
      // console.log( ' >> dfuse::getKeyAccounts ERROR >>', ex)
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
                        balance:       txsHelper.getEOSQuantityToNumber(data.rows[0].json.balance),
                        balanceText:   data.rows[0].json.balance
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

export const listBankAccounts = () => new Promise((res,rej)=> {
	
	// console.log('dfuse::listBankAccounts >> ', 'About to retrieve listBankAccounts')	
	
	// get_table_rows

	let client = createClient();
	client.stateTable(
      globalCfg.bank.issuer,
      globalCfg.bank.issuer,
      "ikaccounts",
      { blockNum: undefined }
    )
    .then((data) => {
      
			var accounts = data.rows.map(account => 
				({	...account.json
									,'state_description' : getStateDescription(account.json.state)
									,'account_type_description' : getAccountTypeDescription(account.json.account_type) }));

			let _res = {data:{accounts:accounts}};
			// console.log(' dfuse::listBankAccounts >> ', JSON.stringify(_res));
      res (_res);
      client.release();
    }, (ex)=>{
      // console.log('dfuse::listBankAccounts >> ERROR ', JSON.stringify(ex));
      rej(ex);
      client.release();
    });

})	

// This is an amazing HACK!
// Check https://github.com/cristalnetwork/inkiri-eos-contracts/blob/master/inkiribank.cpp
function getStateDescription(state_id){
	const states = globalCfg.bank.ACCOUNT_STATES;
	if(state_id>=states.length)
		return states[0];
	return states[state_id];
}

// This is another amazing HACK!
// Check https://github.com/cristalnetwork/inkiri-eos-contracts/blob/master/inkiribank.cpp
function getAccountTypeDescription(account_type_id){
	const account_types = globalCfg.bank.ACCOUNT_TYPES;
	if(account_type_id>=account_types.length)
		return account_types[0];
	return account_types[account_type_id];
}

export const searchBankAccount = (account_name) => new Promise((res,rej)=> {
	listBankAccounts()
	.then((data) => {
		// console.log(' dfuse::searchBankAccount >> ', JSON.stringify(data));
  	var account = data.data.accounts.filter(account => account.key === account_name);
    if(account && account.length>0)
    {
    	let _res = {data:{account:account[0]}};
    	// console.log(' dfuse::searchBankAccount >> ', JSON.stringify(_res));	
    	res (_res)
    }
    else
  	{
  		console.log(' dfuse::searchBankAccount >> ', 'Account not Found!');	
  		rej({error:'Account not found'});
  	}
  }, (ex)=>{
    console.log('dfuse::searchBankAccount >> ERROR ', JSON.stringify(ex));
    rej(ex);
  });
})	

export const listTransactions = (account_name, cursor) => new Promise((res,rej)=> {
	
	const query = 'account:' + globalCfg.currency.token + ' (data.from:'+account_name+' OR data.to:'+account_name+')'

	console.log('dfuse::listTransactions >> ', 'About to retrieve listTransactions >>', query);	

  let options = { limit: globalCfg.dfuse.default_page_size }
  if(cursor!==undefined)
    options['cursor'] = cursor;

	let client = createClient();
	
  client.searchTransactions(
      query,
      options
    )
    .then( (data) => {
    	// var txs = data.transactions.map(transaction => transaction.lifecycle.execution_trace.action_traces[0].act);

      if (!data.transactions || data.transactions.length <= 0) {
        // rej(ex);
        res ({data:{txs:[], cursor:''}})
        client.release();
        return;
      }

      var txs = data.transactions.map(
        function (transaction) {
          const expandedTx = txsHelper.getTxMetadata(account_name, transaction.lifecycle.execution_trace);
          return {  
              ...transaction.lifecycle.execution_trace.action_traces[0].act
              , ...expandedTx
              ,'id' :               transaction.lifecycle.execution_trace.id 
              ,'block_time' :       transaction.lifecycle.execution_trace.block_time.split('.')[0]
              ,'block_time_number': Number(transaction.lifecycle.execution_trace.block_time.split('.')[0].replace(/-/g,'').replace(/T/g,'').replace(/:/g,'') )
              ,'transaction_id' :   transaction.lifecycle.execution_trace.id 
              ,'block_num' :        transaction.lifecycle.execution_trace.block_num 
          };
        })
        
      // console.log(' dfuse::listTransactions >> RAW data >>', JSON.stringify(data));
      // console.log(' dfuse::listTransactions >> ', JSON.stringify(txs));
      console.log(' dfuse::listTransactions cursor>> ', JSON.stringify(data.cursor));
      res ({data:{txs:txs, cursor:data.cursor}})
      client.release();
    }, (ex) => {
      console.log('dfuse::listTransactions >> ERROR#1 ', JSON.stringify(ex));
      rej(ex);
      client.release();
    });
  
})	

// Extract tx_id from push transaction result
/*
{"transaction_id":"0229d296bd4bb7fc0e049b30d460e80c2c7c24e5f16bb15f2691c0f7f848ab46","processed":{"id":"0229d296bd4bb7fc0e049b30d460e80c2c7c24e5f16bb15f2691c0f7f848ab46","block_num":43312771,"block_time":"2019-08-08T16:29:01.000","producer_block_id":null,"receipt":{"status":"executed","cpu_usage_us":2382,"net_usage_words":16},"elapsed":2382,"net_usage":128,"scheduled":false,"action_traces":[{"action_ordinal":1,"creator_action_ordinal":0,"closest_unnotified_ancestor_action_ordinal":0,"receipt":{"receiver":"inkiritoken1","act_digest":"869b3e03441b82e3f5f775be71d10c07b8e872e91077ad3a92f0d62feea2280a","global_sequence":462147232,"recv_sequence":18,"auth_sequence":[["inkpersonal1",10]],"code_sequence":1,"abi_sequence":1},"receiver":"inkiritoken1","act":{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkpersonal1","permission":"active"}],"data":{"from":"inkpersonal1","to":"ikadminoooo1","quantity":"1.1000 INK","memo":"snd"},"hex_data":"10a299145f55e1741028a5743a990c74f82a00000000000004494e4b0000000003736e64"},"context_free":false,"elapsed":1850,"console":"","trx_id":"0229d296bd4bb7fc0e049b30d460e80c2c7c24e5f16bb15f2691c0f7f848ab46","block_num":43312771,"block_time":"2019-08-08T16:29:01.000","producer_block_id":null,"account_ram_deltas":[],"except":null,"error_code":null,"inline_traces":[{"action_ordinal":2,"creator_action_ordinal":1,"closest_unnotified_ancestor_action_ordinal":1,"receipt":{"receiver":"inkpersonal1","act_digest":"869b3e03441b82e3f5f775be71d10c07b8e872e91077ad3a92f0d62feea2280a","global_sequence":462147233,"recv_sequence":8,"auth_sequence":[["inkpersonal1",11]],"code_sequence":1,"abi_sequence":1},"receiver":"inkpersonal1","act":{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkpersonal1","permission":"active"}],"data":{"from":"inkpersonal1","to":"ikadminoooo1","quantity":"1.1000 INK","memo":"snd"},"hex_data":"10a299145f55e1741028a5743a990c74f82a00000000000004494e4b0000000003736e64"},"context_free":false,"elapsed":7,"console":"","trx_id":"0229d296bd4bb7fc0e049b30d460e80c2c7c24e5f16bb15f2691c0f7f848ab46","block_num":43312771,"block_time":"2019-08-08T16:29:01.000","producer_block_id":null,"account_ram_deltas":[],"except":null,"error_code":null,"inline_traces":[]},{"action_ordinal":3,"creator_action_ordinal":1,"closest_unnotified_ancestor_action_ordinal":1,"receipt":{"receiver":"ikadminoooo1","act_digest":"869b3e03441b82e3f5f775be71d10c07b8e872e91077ad3a92f0d62feea2280a","global_sequence":462147234,"recv_sequence":25,"auth_sequence":[["inkpersonal1",12]],"code_sequence":1,"abi_sequence":1},"receiver":"ikadminoooo1","act":{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkpersonal1","permission":"active"}],"data":{"from":"inkpersonal1","to":"ikadminoooo1","quantity":"1.1000 INK","memo":"snd"},"hex_data":"10a299145f55e1741028a5743a990c74f82a00000000000004494e4b0000000003736e64"},"context_free":false,"elapsed":34,"console":"","trx_id":"0229d296bd4bb7fc0e049b30d460e80c2c7c24e5f16bb15f2691c0f7f848ab46","block_num":43312771,"block_time":"2019-08-08T16:29:01.000","producer_block_id":null,"account_ram_deltas":[],"except":null,"error_code":null,"inline_traces":[]}]}],"account_ram_delta":null,"except":null,"error_code":null}}
*/
export const getBlockExplorerTxLink = (tx_id) => {

  return globalCfg.dfuse.tx_url + tx_id;
}
export const getTxId = (result_tx) => {

  return result_tx.transaction_id;
}
