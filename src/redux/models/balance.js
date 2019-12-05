import { takeEvery, put, call } from '@redux-saga/core/effects';
import { store } from '../configureStore'
import * as api from '@app/services/inkiriApi'
import * as core from './core';

// Constantes
const LOAD_BALANCE             = 'balance/LOAD_BALANCE'
const SET_BALANCE              = 'balance/SET_BALANCE'

const LOAD_CURRENCY_STATS      = 'balance/LOAD_CURRENCY_STATS'
const END_LOAD_CURRENCY_STATS  = 'balance/END_LOAD_CURRENCY_STATS'
const SET_CURRENCY_STATS       = 'balance/SET_CURRENCY_STATS'

// Creadores de acciones (se pueden usar desde los compoenentes)
export const loadBalance         = (key) =>({ type: LOAD_BALANCE, payload: { key } });
export const setBalance          = ({key, balance}) =>({ type: SET_BALANCE, payload: { key, balance }});

export const loadCurrencyStats   = () =>({ type: LOAD_CURRENCY_STATS });
export const setCurrencyStats    = (stats) =>({ type: SET_CURRENCY_STATS, payload: {stats}});


//Eventos que requieren del async
function* loadBalanceSaga({action, payload}) {
  const { key } = payload;
  if(!key) return;
  const { data }= yield api.getAccountBalance(key);
  if(data) {
    yield put(setBalance({key, balance: data}))
  }
}

function* loadCurrencyStatsSaga() {
  try
  {
    const data = yield api.getCurrencyStats();
    if(data) {
      yield put(setCurrencyStats(data))

    }

    yield put({ type: END_LOAD_CURRENCY_STATS })
    return;
  }
  catch(e){
    console.log(e);
    yield put({ type: END_LOAD_CURRENCY_STATS })
    // TODO -> throw global error!
  }
}

function* initBalanceReduxSaga () {
  // yield put({type: core.ACTION_START, payload: { loadCurrencyStats: 'Loading currency stats'}})
  yield call(loadCurrencyStatsSaga)
  // yield put({type: core.ACTION_END, payload: 'loadCurrencyStats'})
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la función
store.injectSaga('balances', [
  takeEvery(core.INIT, initBalanceReduxSaga),
  takeEvery(LOAD_BALANCE, loadBalanceSaga),
  takeEvery(LOAD_CURRENCY_STATS, loadCurrencyStatsSaga),
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const userBalance           = (state) => state.balances.balance;
export const userBalanceText       = (state) => state.balances.balanceText;
export const userBalanceFormatted  = (state) => Number(state.balances.balance).toFixed(2);
export const isLoading             = (state) => state.balances.isLoading > 0
export const currencyStats         = (state) => state.balances.currency_stats
export const isLoadingStats        = (state) => state.balances.is_loading_stats

// El reducer del modelo
const defaultState = {
  balance:           0,
  balanceText:       '0',
  isLoading:         0,
  currency_stats:    {},
  is_loading_stats:  false
}

function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case LOAD_CURRENCY_STATS: 
      return { ...state
              , is_loading_stats:   true}
    case END_LOAD_CURRENCY_STATS: 
      return { ...state
              , is_loading_stats:   false}
    case SET_CURRENCY_STATS: 
    console.log('SET_CURRENCY_STATS', action.payload.stats)
      return  { ...state
                , currency_stats:   action.payload.stats
                , is_loading_stats: false}

    case LOAD_BALANCE: 
      // console.log('*********************', '*********************', ' REDUCER CON USER:', action.payload.key);
      if(!action.payload.key) return state;
      return {
        ...state,
        isLoading: state.isLoading +1
      }
    case SET_BALANCE:
      // console.log('redux::models::balance::SET_BALANCE', JSON.stringify(action))
      // console.log('>> >> >> action.payload.balance.balance', action.payload.balance.balance)
      return  {
        ...state
        , balance:     action.payload.balance.balance 
        , balanceText: action.payload.balance.balanceText
        // , accounts: [
        //   ...state.accounts.filter(x =>x.key !== action.payload.key), //Quito el balance anterior
        //   action.payload //Agrego el nuevo
        // ]
        , isLoading: state.isLoading -1
      }
    default: return state;
  }
}

store.injectReducer('balances', reducer)
