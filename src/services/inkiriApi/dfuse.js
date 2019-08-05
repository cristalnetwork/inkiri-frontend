import * as globalCfg from '@app/configs/global';
import { createDfuseClient, DfuseClient } from "@dfuse/client";

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
	
	console.log('dfuse::getAccountBalance >> ', 'About to retrieve balance')	
	
	let client = createClient();
	client.stateTable(
      globalCfg.currency.token,
      account,
      "accounts",
      { blockNum: undefined }
    )
    .then(data => {
      console.log(' dfuse::getAccountBalance >> ', JSON.stringify(data));
      res ({data:{balance:data.rows[0].json.balance}})
    })
    .catch(ex=>{
      console.log(' error fetchBALANCE ', JSON.stringify(ex));
      rej(ex);
    })
    .finally(function(){
      client.release();
    })

})	