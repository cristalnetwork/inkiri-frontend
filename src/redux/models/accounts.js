import { takeEvery, put, call } from '@redux-saga/core/effects';
import { store } from '../configureStore'
import { listBankAccounts } from '@app/services/inkiriApi'
import * as core from './core';

// Constantes
const LOAD_ACCOUNTS = 'accounts/LOAD_ACCOUNTS'
const SET_ACCOUNTS = 'accounts/SET_ACCOUNTS'

// Creadores de acciones (se pueden usar desde los compoenentes)
export const loadAccounts = () =>({ type: LOAD_ACCOUNTS });
export const setAccounts = (accounts = []) =>({ type: SET_ACCOUNTS, payload: {accounts}});

//Eventos que requieren del async
function* loadAccountsSaga() {
  const {data} = yield listBankAccounts();
  if(data) {
    yield put(setAccounts(data.accounts))
  }
}

function* initLoadAccounts () {
  yield put({type: core.ACTION_START, payload: { loadAccounts: 'Loading accounts'}})
  yield call(loadAccountsSaga)
  yield put({type: core.ACTION_END, payload: 'loadAccounts'})
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la funcià¸£à¸“n
store.injectSaga('accounts', [
  takeEvery(core.INIT, initLoadAccounts),
  takeEvery(LOAD_ACCOUNTS, loadAccountsSaga),
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const accounts = (state) => state.accounts || []

// El reducer del modelo
const defaultState = [];

function reducer(state = defaultState, action = {}) {
  switch (action.type) {

    case SET_ACCOUNTS: 
      return  [...action.payload.accounts]

    default: return state;
  }
}

store.injectReducer('accounts', reducer)
