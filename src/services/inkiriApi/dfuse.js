import * as globalCfg from '@app/configs/global';
import { createDfuseClient, DfuseClient } from "@dfuse/client";
import * as txsHelper from './transactionHelper';

const DFUSE_AUTH_TOKEN_KEY = 'dfuse_auth_token_key';
// Item format:
// {
//   "token": "eyJhbGciOiJLTVNFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NTA2OTIxNzIsImp0aSI6IjQ0Y2UzMDVlLWMyN2QtNGIzZS1iN2ExLWVlM2NlNGUyMDE1MyIsImlhdCI6MTU1MDYwNTc3MiwiaXNzIjoiZGZ1c2UuaW8iLCJzdWIiOiJ1aWQ6bWRmdXNlMmY0YzU3OTFiOWE3MzE1IiwidGllciI6ImVvc3EtdjEiLCJvcmlnaW4iOiJlb3NxLmFwcCIsInN0YmxrIjotMzYwMCwidiI6MX0.k1Y66nqBS7S6aSt-zyt24lPFiNfWiLPbICc89kxoDvTdyDnLuUK7JxuGru9_PbPf89QBipdldRZ_ajTwlbT-KQ",
//   "expires_at": 1550692172 // An UNIX timestamp (UTC) indicating when the JWT will expire.
// }  							
		
export const auth = () =>   new Promise((res,rej)=> {
	
	// Check if already have a valid token at localstorage
	let dfuse_auth = localStorage.getItem(DFUSE_AUTH_TOKEN_KEY);
	
	console.log('dfuse::auth >> ', JSON.stringify(dfuse_auth))	

	if(dfuse_auth===null || !isValidUnixDate(JSON.parse(dfuse_auth).expires_at))
	{
		console.log('dfuse::auth >> ', 'About to post dfuse auth api')	
		// Retrieve dfuse token
		const opts = {"api_key":globalCfg.dfuse.api_key}
		fetch(globalCfg.dfuse.auth_url, {
	    method: 'post',
	    body: JSON.stringify(opts)
		  }).then(function(response) {
		    return response.json();
		  }).then(function(data) {
		  	console.log('dfuse::auth >> ', 'About to set local storage', JSON.stringify(data))	
		  	localStorage.setItem(DFUSE_AUTH_TOKEN_KEY, JSON.stringify(data))
				res({data:data});
		  });
	  return;
	}

	console.log('dfuse::auth >> ', 'About to retrieve from local storage', dfuse_auth)	
	res({data:JSON.parse(dfuse_auth)})

})

function isValidUnixDate(unixDate){
	return (new Date().getTime()/1000|0)<unixDate;
}

export function createClient(){
	let client = createDfuseClient({
    apiKey: globalCfg.dfuse.api_key,
    network: globalCfg.dfuse.network
  })
  return client;
} 

export const getAccountBalance = (account) => new Promise((res,rej)=> {
	
	console.log('dfuse::getAccountBalance >> ', 'About to retrieve balance for account:', account)	
	
	let client = createClient();
	client.stateTable(
      globalCfg.currency.token,
      account,
      "accounts",
      { blockNum: undefined }
    )
    .then(data => {
      console.log(' dfuse::getAccountBalance >> receive balance for account:', account, JSON.stringify(data));
      const _res = {
                      data:{
                        balance:       txsHelper.getEOSQuantityToNumber(data.rows[0].json.balance),
                        balanceText:   data.rows[0].json.balance
                      }
                    };
      console.log(' dfuse::getAccountBalance >> about to dispatch balance for account:', account, JSON.stringify(_res));
      res (_res);
    })
    .catch(ex=>{
      console.log('dfuse::getAccountBalance >> ERROR ', JSON.stringify(ex));
      rej(ex);
    })
    .finally(function(){
      client.release();
    })

})	

export const listBankAccounts = () => new Promise((res,rej)=> {
	
	console.log('dfuse::listBankAccounts >> ', 'About to retrieve listBankAccounts')	
	
	// get_table_rows

	let client = createClient();
	client.stateTable(
      globalCfg.bank.issuer,
      globalCfg.bank.issuer,
      "ikaccounts",
      { blockNum: undefined }
    )
    .then(data => {
      // console.log(' dfuse::listBankAccounts >> ', JSON.stringify(data));
      // {"state":1,"account_type":1,"overdraft":"0x00000000000000000000000000000000","fee":"0x05000000000000000000000000000000","xchg_counter":0,"xchg_amount":"0x00000000000000000000000000000000","withdraw_counter":0,"withdraw_amount":"0x00000000000000000000000000000000","deposits_counter":0,"locked_amount":"0x00000000000000000000000000000000","key":"ikadminoooo1"}}}

			var accounts = data.rows.map(account => 
				({	...account.json
									,'state_description' : getStateDescription(account.json.state)
									,'account_type_description' : getAccountTypeDescription(account.json.account_type) }));

			let _res = {data:{accounts:accounts}};
			console.log(' dfuse::listBankAccounts >> ', JSON.stringify(_res));
      res (_res);

    })
    .catch(ex=>{
      console.log('dfuse::listBankAccounts >> ERROR ', JSON.stringify(ex));
      rej(ex);
    })
    .finally(function(){
      client.release();
    })

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
	.then(data => {
		// console.log(' dfuse::searchBankAccount >> ', JSON.stringify(data));
  	var account = data.data.accounts.filter(account => account.key === account_name);
    if(account)
    {
    	let _res = {data:{account:account[0]}};
    	console.log(' dfuse::searchBankAccount >> ', JSON.stringify(_res));	
    	res (_res)
    }
    else
  	{
  		console.log(' dfuse::searchBankAccount >> ', 'Account not Found!');	
  		rej({error:'Account not found'});
  	}
  })
  .catch(ex=>{
    console.log('dfuse::searchBankAccount >> ERROR ', JSON.stringify(ex));
    rej(ex);
  })
})	

export const listTransactions = (account_name) => new Promise((res,rej)=> {
	
	const query = 'account:' + globalCfg.currency.token + ' (data.from:'+account_name+' OR data.to:'+account_name+')'

	console.log('dfuse::listTransactions >> ', 'About to retrieve listTransactions >>', query);	

	let client = createClient();
	client.searchTransactions(
      query,
      { limit: 50 }
    )
    .then(data => {
    	// var txs = data.transactions.map(transaction => transaction.lifecycle.execution_trace.action_traces[0].act);
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
      console.log(' dfuse::listTransactions >> ', JSON.stringify(txs));
      res ({data:{txs:txs}})
    })
    .catch(ex=>{
      console.log('dfuse::listTransactions >> ERROR ', JSON.stringify(ex));
      rej(ex);
    })
    .finally(function(){
      client.release();
    })

})	

// Extract tx_id from push transaction result
/*
{"transaction_id":"0229d296bd4bb7fc0e049b30d460e80c2c7c24e5f16bb15f2691c0f7f848ab46","processed":{"id":"0229d296bd4bb7fc0e049b30d460e80c2c7c24e5f16bb15f2691c0f7f848ab46","block_num":43312771,"block_time":"2019-08-08T16:29:01.000","producer_block_id":null,"receipt":{"status":"executed","cpu_usage_us":2382,"net_usage_words":16},"elapsed":2382,"net_usage":128,"scheduled":false,"action_traces":[{"action_ordinal":1,"creator_action_ordinal":0,"closest_unnotified_ancestor_action_ordinal":0,"receipt":{"receiver":"inkiritoken1","act_digest":"869b3e03441b82e3f5f775be71d10c07b8e872e91077ad3a92f0d62feea2280a","global_sequence":462147232,"recv_sequence":18,"auth_sequence":[["inkpersonal1",10]],"code_sequence":1,"abi_sequence":1},"receiver":"inkiritoken1","act":{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkpersonal1","permission":"active"}],"data":{"from":"inkpersonal1","to":"ikadminoooo1","quantity":"1.1000 INK","memo":"snd"},"hex_data":"10a299145f55e1741028a5743a990c74f82a00000000000004494e4b0000000003736e64"},"context_free":false,"elapsed":1850,"console":"","trx_id":"0229d296bd4bb7fc0e049b30d460e80c2c7c24e5f16bb15f2691c0f7f848ab46","block_num":43312771,"block_time":"2019-08-08T16:29:01.000","producer_block_id":null,"account_ram_deltas":[],"except":null,"error_code":null,"inline_traces":[{"action_ordinal":2,"creator_action_ordinal":1,"closest_unnotified_ancestor_action_ordinal":1,"receipt":{"receiver":"inkpersonal1","act_digest":"869b3e03441b82e3f5f775be71d10c07b8e872e91077ad3a92f0d62feea2280a","global_sequence":462147233,"recv_sequence":8,"auth_sequence":[["inkpersonal1",11]],"code_sequence":1,"abi_sequence":1},"receiver":"inkpersonal1","act":{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkpersonal1","permission":"active"}],"data":{"from":"inkpersonal1","to":"ikadminoooo1","quantity":"1.1000 INK","memo":"snd"},"hex_data":"10a299145f55e1741028a5743a990c74f82a00000000000004494e4b0000000003736e64"},"context_free":false,"elapsed":7,"console":"","trx_id":"0229d296bd4bb7fc0e049b30d460e80c2c7c24e5f16bb15f2691c0f7f848ab46","block_num":43312771,"block_time":"2019-08-08T16:29:01.000","producer_block_id":null,"account_ram_deltas":[],"except":null,"error_code":null,"inline_traces":[]},{"action_ordinal":3,"creator_action_ordinal":1,"closest_unnotified_ancestor_action_ordinal":1,"receipt":{"receiver":"ikadminoooo1","act_digest":"869b3e03441b82e3f5f775be71d10c07b8e872e91077ad3a92f0d62feea2280a","global_sequence":462147234,"recv_sequence":25,"auth_sequence":[["inkpersonal1",12]],"code_sequence":1,"abi_sequence":1},"receiver":"ikadminoooo1","act":{"account":"inkiritoken1","name":"transfer","authorization":[{"actor":"inkpersonal1","permission":"active"}],"data":{"from":"inkpersonal1","to":"ikadminoooo1","quantity":"1.1000 INK","memo":"snd"},"hex_data":"10a299145f55e1741028a5743a990c74f82a00000000000004494e4b0000000003736e64"},"context_free":false,"elapsed":34,"console":"","trx_id":"0229d296bd4bb7fc0e049b30d460e80c2c7c24e5f16bb15f2691c0f7f848ab46","block_num":43312771,"block_time":"2019-08-08T16:29:01.000","producer_block_id":null,"account_ram_deltas":[],"except":null,"error_code":null,"inline_traces":[]}]}],"account_ram_delta":null,"except":null,"error_code":null}}
*/
export const getBlockExplorerTxLink = (result_tx) => {

  return globalCfg.dfuse.tx_url + getTxId(result_tx);
}
export const getTxId = (result_tx) => {

  return result_tx.transaction_id;
}