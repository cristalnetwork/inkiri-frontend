import global from '@app/configs/global';
import { createDfuseClient, DfuseClient } from "@dfuse/client"
import * as globalCfg from '@app/configs/global';

// Recibe como parametro el account_name y retorna el balance y las cuentas asociadas a él, y retorna la info de perfil.

export const getAccountInformation = (account_name) =>   new Promise((res,rej)=> {
    setTimeout(()=> {
        res({ data:  
        			{ 
      					accounts: [{ 
										name 								: 'betosarasasa'
										, balance 					: 1000
										, account_id  			: 'aaaaa'
									  , account_type 			: 'type_personal' // (personal, fundo, negocio)
									  , locked_amount 		: 100
									  , deposits_counter  : 1
									  , withdraw_amount   : 0
									  , withdraw_counter  : 0
									  , xchg_amount 			: 0
									  , xchg_counter 			: 0
									  , permission 				: 'owner'
								}]
							} 
						});
        
    }, 500)
})

export const  getAvailableAccounts = () =>   new Promise((res,rej)=> {
    res({ data:  
    			{ 
  					accounts: [{ 
								name 					: 'ikmasterooo1'
								, priv 				: '5J2bKBbHH6xB2U255CWbXJ6uAuibg5KCh1omKdhpKoCfrTxWkUN'
								, pub  				: 'EOS6gWUtcGdykP26Y2JBH7ZQm2RRsNCP8cB5PwSbqiPPR6C5T7rjA'
							  , description : 'Token issuer'
							}
							, { 
									name 					: 'ikadminoooo1'
									, priv 				: '5KkKKHiFqNfyFRTWQSdVmg7UBTdwvmkRz48dUyE6pQCEbfJLm6u'
									, pub  				: 'EOS8FzLw3WfZPXpNo5qXw8fkkMJdFhSmZ42gfpF9MZebAgjhjk7Wu'
								  , description : 'System administrator'
							}
						]
					} 
				});
})

// export const  getAccountBalance = (account) =>   new Promise((res,rej)=> {

//   const client = createDfuseClient({
//     apiKey: globalCfg.dfuse.apiKey,
//     network: globalCfg.dfuse.network
//   })
	
// 	// const _data = fetchBalance(client, account);
// 	// res({ data: { ..._data } }); 


// 	try {
//     const _data = fetchBalance(client, account);
//     _data.then(data => {
// 			console.log(' fetchBALANCE ', JSON.stringify(data));
// 			res (data)
// 		})
// 		.catch(ex=>{
// 			rej()
// 		})
// 		.finally( () => client.release() );

//     return _data;

//   } catch (error) {
//     console.log("An error occurred", error)
//     client.release()
//   }

  

    
// })



// const fetchBalance = (client, account) =>   new Promise((res,rej)=> {

// 	const options = { blockNum: undefined }
//   // const response = client.stateTable<AccountTableRow>(
//   const response = client.stateTable(
//     globalCfg.currency.token,
//     account,
//     "accounts",
//     options
//   )

// 	response
// 	.then(res => res.json())
// 	.then(data => {
// 		console.log(' fetchBALANCE ', JSON.stringify(data));
// 		res ({ balance: data.rows[0].json.balance, blockNum: data.up_to_block_num || undefined }	)
// 	})
// 	.catch(ex=>{
// 		console.log(' error fetchBALANCE ', JSON.stringify(ex));
// 		rej({})
// 	})

//   return response;
//   //return { balance: response.rows[0].json.balance, blockNum: response.up_to_block_num || undefined }
// })
