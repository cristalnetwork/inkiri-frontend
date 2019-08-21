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
            // console.log(' ********************************** !OK')
            rej(response.statusText);
            throw new Error(response.statusText);
          }
          return response.json()
      }, (err) => {
        // console.log(' ********************************** !OK#2', err)
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

export const nextEnvelopeId = (account_name) =>   new Promise((res,rej)=> {

  var promise1 = nextRequestId(account_name);
  var promise2 = getMyUser(account_name);
  
  Promise.all([promise1, promise2]).then((values) => {
    console.log(' ************ inkiriApi::nextEnvelopeId >> ', JSON.stringify(values));
      let next_id = values[0];
      let user_id = values[1].userCounterId;
      let envId   = pad(user_id, 5)+pad(next_id, 5);
      res(envId)
  }, (err)=>{
    console.log(' ************ inkiriApi::nextEnvelopeId ERROR >> ', JSON.stringify(err));
    rej(err);
  });

  
});

function pad(num, size) {
    var s = "00000" + num;
    return s.substr(s.length-size);
}

export const nextRequestId = (account_name) =>   new Promise((res,rej)=> {
  listMyRequests(account_name, 0, 1)
    .then(
      (responseJson) => {
        if(!responseJson || responseJson.length==0)
        {
          res(1)
        }
        else{
          res(responseJson[0].requestCounterId+1)
        }
      },
      (err) => {
        rej(err);
      })
});

export const getMyUser = (account_name) =>   new Promise((res,rej)=> {
  
  const path    = globalCfg.api.end_point + '/users';
  const method  = 'GET';
  let query     = '?page=0&limit=1&account_name='+account_name;
  jwtHelper.apiCall(path+query, method)
    .then((data) => {
        res(data[0])
      }, (ex) => {
        rej(ex);
      });
});

export const listMyRequests = (account_name, page, limit, request_type) =>   new Promise((res,rej)=> {
  
  console.log(' BANKAPI::LIST MY REQUESTS>> account_name:', account_name
  , '| page: ', page, ' | limit:', limit, ' | request_type: ', request_type );
  const path    = globalCfg.api.end_point + '/requests';
  const method  = 'GET';
  let query     = '?page='+(page|0); 
  query=query+'&limit='+(limit|10);
  if(account_name)
    query=query+'&from='+account_name;
  if(request_type!== undefined)
    query=query+'&requested_type='+request_type;

  jwtHelper.apiCall(path+query, method)
    .then((data) => {
        res(data)
      }, (ex) => {
        rej(ex);
      });
});

export const createDeposit = (account_name, amount, currency) =>   new Promise((res,rej)=> {
  
  // "from": "inkiritoken1",
  // "requested_type": "type_deposit",
  // "amount": "500",
  // "envelope_id": "500",  

  const path    = globalCfg.api.end_point + '/requests';
  const method  = 'POST';
  const post_params = {
          'account_name':       account_name
          , 'requested_type':   'type_deposit'
          , 'amount':           Number(amount).toFixed(2)
          , 'deposit_currency': currency
        };
  console.log(' inkiriApi::createDeposit >> ABOUT TO POST', JSON.stringify(post_params))
  jwtHelper.apiCall(path, method, post_params)
    .then((data) => {
        console.log(' inkiriApi::createDeposit >> RESPONSE', JSON.stringify(data))
        res(data)
      }, (ex) => {
        console.log(' inkiriApi::createDeposit >> ERROR ', JSON.stringify(ex))
        rej(ex);
      });

});