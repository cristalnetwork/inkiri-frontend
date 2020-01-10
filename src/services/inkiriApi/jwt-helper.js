import jwt from 'jsonwebtoken';
import * as globalCfg from '@app/configs/global';

export const BANK_AUTH_TOKEN_KEY     = 'bank_auth_token_key';
export const DFUSE_AUTH_TOKEN_KEY    = 'dfuse_auth_token_key';

const do_log = false;

const isTimestampExpired = (expires_at) => {
  if(!expires_at) return true;
  return (expires_at < Math.floor((new Date()).getTime() / 1000));
}

// function isValidUnixDate(unixDate){
//   return (Math.floor((new Date()).getTime() / 1000)|0)<unixDate;
// }

export const buildResponse = (_token) => {
  return {token:_token, bearer_token: getBearerToken(_token)};
}

// const isTokenExpired = (token) => {
//   const _jwt_decode = jwt.decode(token);
//   if (token && _jwt_decode) {
//     const expires_at = _jwt_decode.expires_at;
//     const now = new Date();
//     do_log && console.log (' ********************************************')
//     do_log && console.log (JSON.stringify(expires_at));
//     const expired = (expires_at < Math.floor((new Date()).getTime() / 1000));
//     return expired;
//   }
//   return true;
// }

export const getBearerTokenByKey = (key) => {
  if(!key)
    key=BANK_AUTH_TOKEN_KEY
  return getBearerToken(getTokenIfNotExpired(key));
}

export const getBearerToken = (token) => {
  if(!token)
    return null;
  return 'Bearer ' + token;
}

export const getTokenFromStorage = (key) => {
  return localStorage.getItem(key);
}

export const setTokenToStorage = (key, value) => {
  return localStorage.setItem(key, value);
}

export const getTokenIfNotExpired = (key) => {
  let _token = getTokenFromStorage(key);
  if(!_token) return null;
  let json_token = JSON.parse(_token);
  do_log && console.log( 'jwtHelper::getTokenIfNotExpired >> ', json_token)

  return isTimestampExpired(json_token.expires_at)?null:json_token.token;
}

export const apiCall = (path, method, data, timeout) => new Promise((res,rej)=> {
  let bearer_token;
  let _key = DFUSE_AUTH_TOKEN_KEY;
  if(!path.startsWith(globalCfg.dfuse.base_url) )
    _key = BANK_AUTH_TOKEN_KEY;
  bearer_token = getBearerToken(getTokenIfNotExpired(_key));
  method = method || "GET";

  console.log(_key, bearer_token)
  let fetchOptions = {
    method: method,
    headers: {
      Accept: "application/json, text/plain, */*", "Content-Type": "application/json",
      Authorization: bearer_token
    }
  };

  // POST PARAMS
  if (typeof data !== "undefined" && data && method!="GET") {
    fetchOptions.body = JSON.stringify(data);
  }

  if (typeof data !== "undefined" && data && method=="GET") {
    // console.log(' API CALL usando QS:', data); 
    // fetchOptions.qs = data;
    // path = path + $.param(qs)
    path = path + '?' + Object.keys(data).map(key => `${key}=${data[key]}`).join('&')
  }

  do_log && console.log( ' ###### jwtHelper::apiCall >> path:', path);
  do_log && console.log( ' ###### jwtHelper::apiCall >> method', method || "GET")
  do_log && console.log( ' ###### jwtHelper::apiCall >> fetchOptions.body', JSON.stringify(fetchOptions.body))
  do_log && console.log( ' ###### jwtHelper::apiCall >> fetchOptions.headers', bearer_token)

  let timer = null;
  if (timeout && !isNaN(timeout) && timeout>1000)
    timer = setTimeout(
        () => rej( new Error('Request timed out') ),
        timeout
    );

  

  fetch(path, fetchOptions)
      .then((resp) => resp.json()
          , (ex) => { 
            do_log && console.log('ApiCallError#0');
            do_log && console.log(ex);
            rej(ex) 
        })
      .finally( () => (timer!=null) && clearTimeout(timer) )
      .then((data) => {
        do_log && console.log( ' ###### jwtHelper::apiCall >> result:', JSON.stringify(data));
        
        if(!data)
        {
          do_log && console.log('ApiCallError#0.5');
          do_log && console.log(data);
          rej('UNKNOWN ERROR!')
          return;
        }

        if(data && data.error)
        {
          do_log && console.log('ApiCallError#1');
          do_log && console.log(data.error);
          rej(data.error);
          return;
        }
        
        if(data && data.errors)
        {
          do_log && console.log('ApiCallError#2');
          do_log && console.log(data.errors);
          rej(data.errors[0]);
          return;
        }

        res(data);
        // if (store.getState().App.toJS().connectionStatus.status === false) {
        //   store.dispatch(appActions.connectionStatus(true));
        // }
        // return { data };
      }, (err) => {
        // if (store.getState().App.toJS().connectionStatus.status === true) {
        //   store.dispatch(appActions.connectionStatus(false));
        // }
        do_log && console.log('ApiCallError#3');
        do_log && console.log(err);
        // rej ({ data: { error: err }, networkError: true });
        rej({ error: err , networkError: true });
      });

});

