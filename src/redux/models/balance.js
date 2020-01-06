import { takeEvery, put, call } from '@redux-saga/core/effects';
import { store } from '../configureStore'
import * as api from '@app/services/inkiriApi'
import * as core from './core';
import * as globalCfg from '@app/configs/global';
import * as accounts from './accounts';

// Constantes
export const LOAD_BALANCE      = 'balance/LOAD_BALANCE'
const SET_BALANCE              = 'balance/SET_BALANCE'

const LOAD_CURRENCY_STATS      = 'balance/LOAD_CURRENCY_STATS'
const END_LOAD_CURRENCY_STATS  = 'balance/END_LOAD_CURRENCY_STATS'
const SET_CURRENCY_STATS       = 'balance/SET_CURRENCY_STATS'

// Creadores de acciones (se pueden usar desde los compoenentes)
export const loadBalance         = (account_name) =>({ type: LOAD_BALANCE, payload: { account_name } });
export const setBalance          = ({account_name, balance}) =>({ type: SET_BALANCE, payload: { account_name, balance }});

export const loadCurrencyStats   = () =>({ type: LOAD_CURRENCY_STATS });
export const setCurrencyStats    = (stats) =>({ type: SET_CURRENCY_STATS, payload: {stats}});


//Eventos que requieren del async
function* loadBalanceSaga({action, payload}) {
  const { account_name } = payload;
  // console.log(' -- loadBalanceSaga (LOAD_BALANCE) me llamaron con account_name:', account_name)
  if(!account_name) return;

  const { data }= yield api.getAccountBalance(account_name);
  if(data) {
    const balance           = data.balance||0;
    let without_overdraft   = balance;
    try{
      // console.log('--balance redux#1:')
      if(!store.getState().accounts.bank_account)
        yield put(accounts.loadBankAccount(account_name))
      
      const oft = store.getState().accounts.bank_account.overdraft;
      // console.log('--balance redux#2:', oft)
      const oft_number = globalCfg.currency.toNumber(oft);
      // console.log('--balance redux#3:', oft_number)
      without_overdraft = without_overdraft - oft_number; 
    }catch(e){
      // console.log('--balance error#1:', JSON.stringify(e))
    }
    yield put(setBalance({account_name, balance: {balance:balance, without_overdraft:without_overdraft}}))
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
    // console.log(e);
    yield put({ type: END_LOAD_CURRENCY_STATS })
    // TODO -> throw global error!
  }
}

function* initBalanceReduxSaga () {
  console.log( ' # core.INIT@balance-saga ' )
  // yield put({type: core.ACTION_START, payload: { loadCurrencyStats: 'Loading currency stats'}})
  // console.log('balance-redux :: Me llamo core?')
  yield call(loadCurrencyStatsSaga)
  // yield put({type: core.ACTION_END, payload: 'loadCurrencyStats'})
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la función
store.injectSaga('balances', [
  takeEvery(core.INIT, initBalanceReduxSaga),
  // takeEvery(core.INIT_READY_TO_START, initBalanceReduxSaga),
  takeEvery(LOAD_BALANCE, loadBalanceSaga),
  takeEvery(LOAD_CURRENCY_STATS, loadCurrencyStatsSaga),
  
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const userBalance           = (state) => state.balances.balance;
export const userBalanceFormatted  = (state) => Number(state.balances.balance).toFixed(2);

export const userBalanceNoOft      = (state) => state.balances.without_overdraft;
export const userBalanceNoOftFormatted  = (state) => Number(state.balances.without_overdraft).toFixed(2);

export const isLoading             = (state) => state.balances.isLoading > 0
export const currencyStats         = (state) => state.balances.currency_stats
export const isLoadingStats        = (state) => state.balances.is_loading_stats

// El reducer del modelo
const defaultState = {
  balance:           0,
  without_overdraft:          0,
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
    // console.log('SET_CURRENCY_STATS', action.payload.stats)
      return  { ...state
                , currency_stats:   action.payload.stats
                , is_loading_stats: false}

    case LOAD_BALANCE: 
      // console.log('*********************', '*********************', ' REDUCER CON USER:', action.payload.key);
      if(!action.payload.account_name) return state;
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
        , without_overdraft:     action.payload.balance.without_overdraft
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