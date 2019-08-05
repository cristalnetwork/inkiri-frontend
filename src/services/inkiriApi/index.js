import global from '@app/configs/global';
import { createDfuseClient, DfuseClient } from "@dfuse/client"
import * as globalCfg from '@app/configs/global';

import * as eosHelper from './eosHelper.js';
import * as dfuse from './dfuse.js';

import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';

export {eosHelper};
export {dfuse};

// function eosConfig() {
//   const endpoint 		= "https://jungle.eos.dfuse.io"
//   const guaranteed 	= "in-block" // Or "irreversible", "handoff:1", "handoffs:2", "handoffs:3"
//   const transferTo 	= this.state.destination_account;
//   const transferQuantity = this.getFormattedAmount();
//   const dfuseApiToken = globalCfg.dfuse.api_key
//   const privateKey = this.getSenderPriv();

//   const transferFrom = this.state.sender_account;
  
//   return {
//     endpoint,
//     guaranteed,
//     dfuseApiToken: dfuseApiToken,
//     privateKey: privateKey,
//     transferFrom: transferFrom,
//     transferTo,
//     transferQuantity
//   }
// }

function formatAmount(amount){
  return Number(amount).toFixed(4) + ' ' + globalCfg.currency.eos_symbol;
}

function prettyJson(input){
  return JSON.stringify(input, null, 2)
}

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
        actor: sender_account,
        permission: "active"
      }
    ],
    data: {
      from: sender_account,
      to: receiver_account,
      quantity: formatAmount(amount),
      memo: 'snd|key'
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

export const getAccountInformation = (account_name) =>  new Promise((res,rej)=> {
    
  //   dfuse.listBankAccounts()
  // 	.then( response => {
		// 	return response.json();
		// })
		// .then(data => {
		//     console.log(' InkiriApi::sendMoney (then#1) >> ', JSON.stringify(data));
		//     res({data:data})
		// })
		// .catch(ex=>{
		//   console.log(' InkiriApi::sendMoney (error#1) >>  ', JSON.stringify(ex));
		//   rej(ex);
		// })
		// .finally(function(){
		//   console.log(' InkiriApi::sendMoney (finally#1).  ');
		// })

  //   setTimeout(()=> {
  //       res({ data:  
  //       			{ 
  //     					accounts: [{ 
		// 								name 								: 'betosarasasa'
		// 								, balance 					: 1000
		// 								, account_id  			: 'aaaaa'
		// 							  , account_type 			: 'type_personal' // (personal, fundo, negocio)
		// 							  , locked_amount 		: 100
		// 							  , deposits_counter  : 1
		// 							  , withdraw_amount   : 0
		// 							  , withdraw_counter  : 0
		// 							  , xchg_amount 			: 0
		// 							  , xchg_counter 			: 0
		// 							  , permission 				: 'owner'
		// 						}]
		// 					} 
		// 				});
        
  //   }, 500)
})

export const  getAvailableAccounts = () =>   new Promise((res,rej)=> {
    return dfuse.listBankAccounts();
})
