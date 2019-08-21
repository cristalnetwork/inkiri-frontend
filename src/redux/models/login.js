import { takeEvery, put } from '@redux-saga/core/effects';
import { store } from '../configureStore'
import { tryUserState } from './user'; 
import { getStorage, clearStorage, setStorage } from '@app/services/localStorage'
import * as core from './core';
import * as api from '@app/services/inkiriApi';

// Constantes
const TRY_LOGIN = 'login/TRY';
const TRY_LOGIN_END = 'login/TRY_LOGIN_END';
const SET_LOGIN = 'login/SET_LOGIN'
const LOGOUT = 'login/LOGOUT'

// Creadores de acciones (se pueden usar desde los compoenentes)
// export const tryLogin = (account, save) =>({ type: TRY_LOGIN, payload: {account, save } });
export const tryLogin = (account_name, password, remember) =>({ type: TRY_LOGIN, payload: {account_name, password, remember } });
export const logout = () => ({type: LOGOUT});
export const set = (loginData) =>({ type: SET_LOGIN, payload: loginData});

const ACCOUNT_DATA = 'account_data'

//Eventos que requieren del async
function* loadLoginData() {
  yield put({type: core.ACTION_START, payload: { login: 'Check local storage'}})
  const { data } = yield getStorage(ACCOUNT_DATA);
  if(data && data.account_name && data.password) {
    // console.log(' -- redux::models::login::loadLoginData >> tryLogin', JSON.stringify(data))
    // yield put(tryLogin(data.account, true))
    yield put(tryLogin(data.account_name, data.password, false))
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
    const login_data = yield api.login(account_name, password);
    
    if(payload.remember) {
      setStorage(ACCOUNT_DATA, {account_name, password, remember, login_data})
    }
    yield put(set({userId: account_name, role: 'business', login_data:login_data }))
  } catch(e) {
    console.log(' >> LOGIN REDUX ERROR#1', e)
  }
  yield put({type: TRY_LOGIN_END})
  yield put( tryUserState(account_name))
}


// function* tryLoginSaga({ type, payload }) {

//   // LLAMO A inkiriAPI.login
//   // api.login(account, api.dummyPrivateKeys[account]);

//   const { account, save} = payload
//   try {
//     if(payload.save) {
//       setStorage('login',{account, save})
//     }
//     yield put(set({userId: account.key, role: 'business'}))
//   } catch(e) {
//     console.err(e)
//   }
//   yield put({type: TRY_LOGIN_END})
//   yield put( tryUserState(account.key))
// }

function* logoutSaga( ) {
  yield clearStorage();
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la funcià¸£à¸“n
store.injectSaga('login', [
  takeEvery(core.INIT, loadLoginData),
  takeEvery(TRY_LOGIN, tryLoginSaga),
  takeEvery(LOGOUT, logoutSaga)
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const isLoading           = (state) => state.login.loading > 0
// export const accounts = (state) => state.login.accounts || []
export const actualAccount       = (state) => state.login.userId
export const actualRole          = (state) => state.login.role

export const personalAccount     = (state) => state.login.login_data.personalAccount
export const corporateAccounts   = (state) => state.login.login_data.corporateAccounts
export const adminAccount        = (state) => state.login.login_data.adminAccount

// El reducer del modelo
// const defaultState = { loading: 0, role: undefined, userId: undefined, accounts: [] };
const defaultState = { loading: 0, role: undefined, userId: undefined};

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
    case SET_LOGIN: 
      return {
        ...state,
        userId:     action.payload.userId,
        role:       action.payload.role,
        login_data: action.payload.login_data
      }
    case LOGOUT:
      return defaultState;
    default: return state;
  }}

  store.injectReducer('login', reducer)