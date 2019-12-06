import jwt from 'jsonwebtoken';
import * as globalCfg from '@app/configs/global';
import { store } from '@app/redux/configureStore';

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

const isTokenExpired = (token) => {
  const _jwt_decode = jwt.decode(token);
  if (token && _jwt_decode) {
    const expires_at = _jwt_decode.expires_at;
    const now = new Date();
    if(do_log) console.log (' ********************************************')
    if(do_log) console.log (JSON.stringify(expires_at));
    const expired = (expires_at < Math.floor((new Date()).getTime() / 1000));
    return expired;
  }
  return true;
}

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
  if(do_log) console.log( 'jwtHelper::getTokenIfNotExpired >> ', json_token)
  // return (isTokenExpired(json_token.token))?null:json_token.token;
  return isTimestampExpired(json_token.expires_at)?null:json_token.token;
}

export const apiCall = (path, method, data) => new Promise((res,rej)=> {
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

  if(do_log) console.log( ' ###### jwtHelper::apiCall >> path:', path);
  if(do_log) console.log( ' ###### jwtHelper::apiCall >> method', method || "GET")
  if(do_log) console.log( ' ###### jwtHelper::apiCall >> fetchOptions.body', JSON.stringify(fetchOptions.body))
  if(do_log) console.log( ' ###### jwtHelper::apiCall >> fetchOptions.headers', bearer_token)

  
  fetch(path, fetchOptions)
      .then((resp) => resp.json(), (ex) => { rej(ex) })
      .then((data) => {
        if(do_log) console.log( ' ###### jwtHelper::apiCall >> result:', JSON.stringify(data));
        
        if(!data)
        {
          rej('UNKNOWN ERROR!')
        }
        else
        if(data && data.error)
        {
          rej (data.error);
        }
        else
        if(data && data.errors)
        {
          rej (data.errors[0]);
        }
        else
          res(data);
        // if (store.getState().App.toJS().connectionStatus.status === false) {
        //   store.dispatch(appActions.connectionStatus(true));
        // }
        // return { data };
      }, (err) => {
        // if (store.getState().App.toJS().connectionStatus.status === true) {
        //   store.dispatch(appActions.connectionStatus(false));
        // }
        console.warn({ networkError: err });
        rej ({ data: { error: err }, networkError: true });
      });

});
