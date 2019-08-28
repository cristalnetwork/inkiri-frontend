import jwt from 'jsonwebtoken';
import * as globalCfg from '@app/configs/global';
import { store } from '@app/redux/configureStore';

export const BANK_AUTH_TOKEN_KEY     = 'bank_auth_token_key';
export const DFUSE_AUTH_TOKEN_KEY    = 'dfuse_auth_token_key';

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
    console.log (' ********************************************')
    console.log (JSON.stringify(expires_at));
    const expired = (expires_at < Math.floor((new Date()).getTime() / 1000));
    return expired;
  }
  return true;
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
  // console.log( 'jwtHelper::getTokenIfNotExpired >> ', json_token)
  // return (isTokenExpired(json_token.token))?null:json_token.token;
  return isTimestampExpired(json_token.expires_at)?null:json_token.token;
}

export const apiCall = (path, method, data) => new Promise((res,rej)=> {
  let bearer_token;
  let _key = DFUSE_AUTH_TOKEN_KEY;
  if(!path.startsWith(globalCfg.dfuse.base_url) )
    _key = BANK_AUTH_TOKEN_KEY;
  bearer_token = getBearerToken(getTokenIfNotExpired(_key));

  let fetchOptions = {
    method: method || "GET",
    headers: {
      Accept: "application/json, text/plain, */*", "Content-Type": "application/json",
      Authorization: bearer_token,
    }
  };

  if (typeof data !== "undefined" && data) {
    fetchOptions.body = JSON.stringify(data);
  }

  console.log( ' ###### jwtHelper::apiCall >> path:', path);
  console.log( ' ###### jwtHelper::apiCall >> method', method || "GET")
  console.log( ' ###### jwtHelper::apiCall >> fetchOptions.body', JSON.stringify(fetchOptions.body))
  console.log( ' ###### jwtHelper::apiCall >> fetchOptions.headers', bearer_token)

  
  fetch(path, fetchOptions)
      .then((resp) => resp.json(), (ex) => { rej(ex) })
      .then((data) => {
        console.log( ' ###### jwtHelper::apiCall >> result:', JSON.stringify(data));
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

