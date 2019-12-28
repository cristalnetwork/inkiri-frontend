import { takeEvery, put, call } from '@redux-saga/core/effects';
import { store } from '../configureStore'
import * as api from '@app/services/inkiriApi'
import * as gqlService from '@app/services/inkiriApi/graphql'
import * as core from './core';
import * as globalCfg from '@app/configs/global';

const LOAD_CONFIG          = 'graphql/LOAD_CONFIG'
const END_LOAD_CONFIG      = 'graphql/END_LOAD_CONFIG'
const SET_CONFIG           = 'graphql/SET_CONFIG'

const LOAD_DATA            = 'graphql/LOAD_DATA'
const END_LOAD_DATA        = 'graphql/END_LOAD_DATA'
const SET_DATA             = 'graphql/SET_DATA'

// Creadores de acciones (se pueden usar desde los compoenentes)
export const loadConfig   = ()                           =>({ type: LOAD_CONFIG });
export const setConfig    = (config)                     =>({ type: SET_CONFIG,  payload: {config:config}});

export const loadData     = (account_name, account_type) =>({ type: LOAD_DATA, payload: {account_type:account_type, account_name:account_name} });
export const setData      = (key, data)                  =>({ type: SET_DATA,  payload: {key:key, data:data}});
//Eventos que requieren del async

function* tryLoadConfigSaga () {
  
  try
  {
    console.log(' about to load gql')
    const data = yield gqlService.loadConfig();
    console.log(' gql loaded', data)
    if(data) {
      yield put(setConfig(data))
    }
    else
      yield put({ type: END_LOAD_CONFIG })
    
    return;
  }
  catch(e){
    console.log(e);
    yield put({ type: END_LOAD_CONFIG })
  }
  
}

function* tryLoadDataSaga ({type, payload}) {
  const {account_type, account_name} = payload;
  if(!account_type || !account_name)
  {
    return;
  } 
  console.log('graphql redux:', account_type, account_name)
  try
  {
    if(globalCfg.bank.isAdminAccount(account_type)){
      // const data = yield gqlService.loadXX(account_name);
      // if(data) {
      //   yield put(setData(account_type, data))
      // }
    }
    if(globalCfg.bank.isBusinessAccount(account_type)){
      const data = yield gqlService.loadBizData(account_name);
      if(data) {
        yield put(setData(account_type, data))
      }
    }
    if(globalCfg.bank.isPersonalAccount(account_type)){
      // const data = yield gqlService.loadXX(account_name);
      // if(data) {
      //   yield put(setData(account_type, data))
      // }
    }
    
    yield put({ type: END_LOAD_DATA })
    
    return;
  }
  catch(e){
    console.log(e);
    yield put({ type: END_LOAD_DATA })
  }
  
}

function* initGraphqlReduxSaga () {
  // yield put({type: core.ACTION_START, payload: { loadCurrencyStats: 'Loading currency stats'}})
  console.log( ' # core.INIT@graphql-saga ' )
  yield call(tryLoadConfigSaga)
  // yield put({type: core.ACTION_END, payload: 'loadCurrencyStats'})
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la función
console.log(' ... store.injectSaga(graphql)...')
store.injectSaga('graphql', [
  // takeEvery(core.INIT_READY_TO_START, initGraphqlReduxSaga),
  takeEvery(core.INIT, initGraphqlReduxSaga),
  takeEvery(LOAD_CONFIG, tryLoadConfigSaga),
  takeEvery(LOAD_DATA, tryLoadDataSaga)
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const isLoading            = (state) => state.graphql.is_loading ;
export const isLoaded             = (state) => state.graphql.loaded ;
export const getConfig            = (state) => state.graphql.config ;

export const jobPositions         = (state) => state.graphql.config['configurationsJobPositions']
export const payVehicles          = (state) => state.graphql.config['configurationsPayVehicles']
export const payCategories        = (state) => state.graphql.config['configurationsPayCategory']
export const payTypes             = (state) => state.graphql.config['configurationsPayType']
export const payModes             = (state) => state.graphql.config['configurationsPayMode']
export const externalTxFees       = (state) => state.graphql.config['configurationsExternalTxFee']
export const accountConfigs       = (state) => state.graphql.config['configurationsAccountConfig']

export const team                 = (state) => state.graphql.data[globalCfg.bank.ACCOUNT_TYPE_BUSINESS]
                                                ?state.graphql.data[globalCfg.bank.ACCOUNT_TYPE_BUSINESS]['team']
                                                :null

// El reducer del modelo
const defaultState = {
  is_loading:        false,
  loaded:            false,
  config:            {},
  data:              {}
}

function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    
    case LOAD_CONFIG:
      return {
        ...state,
        is_loading: true
      }
    case LOAD_DATA:
      return {
        ...state,
        is_loading: true
      }
    case SET_DATA:
      const data = state.data;
      return  {
        ...state
        , data:         {...data, [action.payload.key]:action.payload.data}
        , is_loading:   false
      }
    case SET_CONFIG:
      return  {
        ...state
        , config:       action.payload.config
        , loaded:       true
        , is_loading:   false
      }
    default: return state;
  }
}

store.injectReducer('graphql', reducer)