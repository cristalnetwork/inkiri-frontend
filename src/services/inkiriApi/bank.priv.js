import * as globalCfg from '@app/configs/global';
import * as eosHelper from './eosHelper.js';
import * as jwtHelper from './jwtHelper';

export const isAuth = () => {
  return jwtHelper.getTokenIfNotExpired(jwtHelper.BANK_AUTH_TOKEN_KEY)!==null;
}

export const auth = (account_name, private_key) =>   new Promise((res,rej)=> {
  
  const token = jwtHelper.getTokenIfNotExpired(jwtHelper.BANK_AUTH_TOKEN_KEY);
  
  if(!token)
  {
    const challenge_endpoint = globalCfg.api.end_point+'/eos/challenge/'+account_name;
    
    fetch(challenge_endpoint, {
      method: 'GET'
    }).then(
      (response) => {
         if (!response.ok) {
            console.log(' ********************************** !OK')
            rej(response.statusText);
            throw new Error(response.statusText);
          }
          return response.json()
      }, (err) => {
        console.log(' ********************************** !OK#2', err)
        rej(err.message);
        throw err;
      })
    .then((data) => {

      console.log(' bank::auth >> ', JSON.stringify(data));
      const challenge = data.to_sign;

      eosHelper.signString(private_key, challenge).then((signed) => {  
        
        const auth_params = {
          'account_name': account_name
          , 'signature' : signed.data.signed_data
          , 'challenge':  challenge
        };
        
        const auth_endpoint      = globalCfg.api.end_point+'/eos/auth';    
        
        console.log(' AUTH PARAMS:', auth_endpoint, JSON.stringify(auth_params))

        fetch(auth_endpoint, {
          method: 'POST',
          body: JSON.stringify(auth_params),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          }
        })
          .then((response2) => {
            if (!response2.ok) {
              console.log(' ********************************** !OK#3')
              rej(response2.statusText);
              throw new Error(response2.statusText);
            }
            return response2.json()
          }, (err) => {
            console.log(' ********************************** !OK#4')
            rej(err); 
            throw err;
          })
          .then((auth_data) => {
            jwtHelper.setTokenToStorage  (jwtHelper.BANK_AUTH_TOKEN_KEY, JSON.stringify(auth_data));
            // res({data:auth_data});
            // res(buildResponse(auth_data.token));
            res(jwtHelper.buildResponse(auth_data.token));
          }, (ex) => {
            rej(ex);
          });  


      } , (error) => {
        console.log('---- RES:', JSON.stringify(error));
        rej({error:error})
      });


    }, (ex) => {
      rej({error:ex});
    });
    
  }
  else{
    // res(buildResponse(token));
    res(jwtHelper.buildResponse(token));
  }
})

export const listMyRequests = (account_name, page, limit) =>   new Promise((res,rej)=> {
  
  const path    = globalCfg.api.end_point + '/requests';
  const method  = 'GET';
  let query     = '?page='+(page|0); 
  query=query+'&limit='+(limit|10);
  if(account_name)
    query=query+'&requested_by='+account_name;
  jwtHelper.apiCall(path+query, method)
    .then((data) => {
        res(data)
      }, (ex) => {
        rej(ex);
      });
});

export const createDeposit = (account_name, amount) =>   new Promise((res,rej)=> {
  
  // "from": "inkiritoken1",
  // "requested_type": "type_deposit",
  // "amount": "500",
  // "envelope_id": "500",  

  const path    = globalCfg.api.end_point + '/requests';
  const method  = 'POST';
  const post_params = {
          'account_name': account_name
          , 'requested_type': 'type_deposit'
          , 'amount':  Number(amount).toFixed(2)
        };
  jwtHelper.apiCall(path, method, post_params)
    .then((data) => {
        res(data)
      }, (ex) => {
        rej(ex);
      });

});