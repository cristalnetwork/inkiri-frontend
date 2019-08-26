import { takeEvery, put } from '@redux-saga/core/effects';
import { store } from '../configureStore'
import * as globalCfg from '@app/configs/global';
import { getStorage, clearStorage, setStorage } from '@app/services/localStorage'
import * as core from './core';
import * as api from '@app/services/inkiriApi';

import history from '@app/history.js';

// Constantes
const TRY_LOGIN = 'login/TRY_LOGIN';
const TRY_LOGIN_END = 'login/TRY_LOGIN_END';
const SET_LOGIN = 'login/SET_LOGIN'
const LOGOUT = 'login/LOGOUT'

const TRY_SWITCH = 'login/TRY_SWITCH';
const TRY_SWITCH_END = 'login/TRY_SWITCH_END';


// Creadores de acciones (se pueden usar desde los compoenentes)
// export const tryLogin = (account, save) =>({ type: TRY_LOGIN, payload: {account, save } });
export const trySwitchAccount = (account_name) =>({ type: TRY_SWITCH, payload: {account_name } });
export const tryLogin         = (account_name, password, remember) =>({ type: TRY_LOGIN, payload: {account_name, password, remember } });
export const logout           = () => ({type: LOGOUT});
export const set              = (loginData) =>({ type: SET_LOGIN, payload: loginData});

const ACCOUNT_DATA = 'account_data'

//Eventos que requieren del async
function* loadLoginData() {
  yield put({type: core.ACTION_START, payload: { login: 'Check local storage'}})
  const { data } = yield getStorage(ACCOUNT_DATA);
  console.log(' loginREDUX::loadLoginData >> storage >> ', JSON.stringify(data))
  if(data && data.account_name && data.password) {
    //yield put(tryLogin(data.account_name, data.password, false))
    const stateData = getLoginDataFromStorage(data);
    yield put(set(stateData))
  }
  else
  {
    console.log(' -- redux::models::login::loadLoginData >> could NOT LOGIN', JSON.stringify(data))
  }
  yield put({type: core.ACTION_END, payload: 'login'})
}

function* tryLoginSaga({ type, payload }) {

  const { account_name, password, remember} = payload
  console.log(' LOGIN REDUX >> tryLoginSaga >> ', account_name, password, remember)
  try {
    // LLAMO A inkiriAPI.login
    const accounts = yield api.login(account_name, password);
    
    if(payload.remember) {
      let master_account = account_name;
      setStorage(ACCOUNT_DATA, {account_name, password, remember, accounts, master_account})
      // setStorage(ACCOUNT_DATA, {account_name, password, remember, accounts, account_name})
    }
    yield put(set({userId: account_name, role: accounts.personalAccount.permissioner.account_type, accounts:accounts, master_account:account_name , current_account:accounts.personalAccount}))
  } catch(e) {
    console.log(' >> LOGIN REDUX ERROR#1', e)
  }
  yield put({type: TRY_LOGIN_END})
  // yield put( tryUserState(account_name))
}

function* trySwitchAccountSaga({ type, payload }) {

  const { account_name} = payload
  console.log(' LOGIN REDUX >> trySwitchAccountSaga >> ', account_name);
  const { data } = yield getStorage(ACCOUNT_DATA);
  if(account_name===data.account_name)
  {
    console.log(' LOGIN REDUX >> trySwitchAccountSaga >> NOTHING TO DO >> account_name===data.account_name', account_name);
    yield put({type: TRY_SWITCH_END})
    return;
  }

  const stateData = getLoginDataFromStorage(data, account_name );
  
  console.log(' LOGIN REDUX >> trySwitchAccountSaga >>putting new data', JSON.stringify(stateData));
  yield put(set(stateData))
  yield put({type: TRY_SWITCH_END})
  
}

function* logoutSaga( ) {
  yield clearStorage();
  history.replace('/');
}

function getLoginDataFromStorage(storageData, switch_to){
  const account_name    = storageData.account_name;
  const master_account  = storageData.master_account;
  const new_account     = switch_to?switch_to:account_name;
  const account         = accountsToArray(storageData.accounts).filter( acc => acc.permissioner.account_name==new_account)[0]
  return {userId: new_account, role: account.permissioner.account_type, accounts:storageData.accounts, master_account:master_account , current_account:account}
}

function accountsToArray(accounts){
  return [accounts.personalAccount].concat(accounts.otherPersonalAccounts, accounts.corporateAccounts, accounts.adminAccount).filter(item => item!==undefined)
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la funcià¸£à¸“n
store.injectSaga('login', [
  takeEvery(core.INIT, loadLoginData),
  takeEvery(TRY_LOGIN, tryLoginSaga),
  takeEvery(TRY_SWITCH, trySwitchAccountSaga),
  takeEvery(LOGOUT, logoutSaga)
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const isLoading             = (state) => state.login.loading > 0
export const actualAccount         = (state) => (state.login.current_account)?state.login.current_account.permissioned.actor:undefined
export const actualRole            = (state) => (state.login.current_account)?globalCfg.bank.getAccountType(state.login.current_account.permissioner.account_type):undefined
export const currentAccount        = (state) => state.login.current_account

export const personalAccount       = (state) => state.login.accounts.personalAccount
export const otherPersonalAccounts = (state) => state.login.accounts.otherPersonalAccounts
export const corporateAccounts     = (state) => state.login.accounts.corporateAccounts
export const adminAccount          = (state) => state.login.accounts.adminAccount
export const allAccounts           = (state) => accountsToArray(state.login.accounts)

// El reducer del modelo
// const defaultState = { loading: 0, role: undefined, userId: undefined, accounts: [] };
const defaultState = { loading: 0, role: undefined, userId: undefined, current_account: undefined, accounts:{}};

function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case TRY_LOGIN:
      return  {
        ...state,
        loading: state.loading +1
      }
    case TRY_LOGIN_END:
      return {
        ...state,
        loading: state.loading - 1
      }
    case TRY_SWITCH:
      return  {
        ...state,
        loading: state.loading +1
      }
    case TRY_SWITCH_END:
      return {
        ...state,
        loading: state.loading - 1
      }
    case SET_LOGIN: 
      return {
        ...state,
        // userId             : action.payload.accounts.personalAccount.permissioned.actor
        userId             : action.payload.userId
        , role             : action.payload.role
        , accounts         : action.payload.accounts
        , master_account   : action.payload.master_account
        , current_account  : action.payload.current_account
      }
    case LOGOUT:
      return defaultState;
    default: return state;
  }}

  store.injectReducer('login', reducer)