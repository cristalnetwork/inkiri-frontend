import { takeEvery, put, call } from '@redux-saga/core/effects';
import { store } from '../configureStore'
import * as api from '@app/services/inkiriApi'
import * as core from './core';

// Constantes
const LOAD_BLOCKCHAIN_OPERATIONS         = 'operations/LOAD_BLOCKCHAIN_OPERATIONS'
const SET_BLOCKCHAIN_OPERATIONS          = 'operations/SET_BLOCKCHAIN_OPERATIONS'

const LOAD_OLD_BLOCKCHAIN_OPERATIONS     = 'operations/LOAD_OLD_BLOCKCHAIN_OPERATIONS'
const APEND_BLOCKCHAIN_OPERATIONS        = 'operations/APEND_BLOCKCHAIN_OPERATIONS'

const LOAD_NEW_BLOCKCHAIN_OPERATIONS     = 'operations/LOAD_NEW_BLOCKCHAIN_OPERATIONS'
const PREPEND_BLOCKCHAIN_OPERATIONS      = 'operations/PREPEND_BLOCKCHAIN_OPERATIONS'

const END_LOAD_BLOCKCHAIN_OPERATIONS     = 'operations/END_LOAD_BLOCKCHAIN_OPERATIONS'

const TRY_SET_FILTER_KEY_VALUE           = 'operations/TRY_SET_FILTER_KEY_VALUE';
const SET_FILTER_KEY_VALUE               = 'operations/SET_FILTER_KEY_VALUE';
const DELETE_FILTER_KEY_VALUE            = 'operations/DELETE_FILTER_KEY_VALUE';

// Creadores de acciones (se pueden usar desde los compoenentes)
export const loadBlockchainOperations    = ()       =>({ type: LOAD_BLOCKCHAIN_OPERATIONS});
export const setBlockchainOperations     = (data)   =>({ type: SET_BLOCKCHAIN_OPERATIONS, payload: { data }});

export const loadOldBlockchainOperations = ()       =>({ type: LOAD_OLD_BLOCKCHAIN_OPERATIONS});
export const apendBlockchainOperations   = (data)   =>({ type: APEND_BLOCKCHAIN_OPERATIONS, payload: { data }});

export const loadNewBlockchainOperations = ()       =>({ type: LOAD_NEW_BLOCKCHAIN_OPERATIONS});
export const prependBlockchainOperations = (data)   =>({ type: PREPEND_BLOCKCHAIN_OPERATIONS, payload: { data:data }});

export const trySetFilterKeyValue        = (key, value)   =>({ type: TRY_SET_FILTER_KEY_VALUE, payload: { key:key, value:value }});
export const setFilterKeyValue           = (key, value)   =>({ type: SET_FILTER_KEY_VALUE, payload: { key:key, value:value }});
export const deleteFilterKeyValue        = (key)   =>({ type: DELETE_FILTER_KEY_VALUE, payload: { key:key }});

//Eventos que requieren del async
function* loadBlockchainOperationsSaga() {
  try
  {
    // const {data} = yield api.dfuse.allTransactions();
    const {data} = yield api.dfuse.queryTransactions();
    console.log(' loadBlockchainOperationsSaga# ABOUT TO PUT!')
    if(data) {
        yield put(setBlockchainOperations(data))
    }
  }
  catch(e){
    //HACK Mandar error a GLOBAL_ERROR_HANDLER
    console.log(' loadBlockchainOperationsSaga#ERROR#1:', JSON.stringify(e))
    yield put({ type: END_LOAD_BLOCKCHAIN_OPERATIONS })
    return;
  }
  
}

function* loadOldBlockchainOperationsSaga() {
  const { operations_cursor } = store.getState().operations;
  if(!operations_cursor)
  {  
    yield put({ type: END_LOAD_BLOCKCHAIN_OPERATIONS })
    return;
  }

  try{
    // const {data} = yield api.dfuse.allTransactions(operations_cursor);
    const {data} = yield api.dfuse.queryTransactionsCursor(operations_cursor);
    if(data) {
        yield put(apendBlockchainOperations(data))
    }
  }
  catch(e)
  {
    console.log(' loadOldBlockchainOperationsSaga#ERROR#2:', JSON.stringify(e))
    //HACK Mandar error a GLOBAL_ERROR_HANDLER
    yield put({ type: END_LOAD_BLOCKCHAIN_OPERATIONS })
    return;
  }
  
}

function* loadNewBlockchainOperationsSaga() {
  const { last_block } = store.getState().operations;
  if(!last_block)
  {    
    yield put({ type: END_LOAD_BLOCKCHAIN_OPERATIONS })
    return;
  }
  
  try{
    // const {data} = yield api.dfuse.allTransactionsSince(last_block);
    const {data} = yield api.dfuse.queryTransactionsNew(last_block);
    if(data) {
        yield put(prependBlockchainOperations(data))
    }
  }
  catch(e)
  {
    console.log(' loadNewBlockchainOperationsSaga#ERROR#3:', JSON.stringify(e))
    //HACK Mandar error a GLOBAL_ERROR_HANDLER
    yield put({ type: END_LOAD_BLOCKCHAIN_OPERATIONS })
    return;
  }
}
  
function* trySetFiltersSaga({ type, payload }){
  const {key, value} = payload;
  yield put(setFilterKeyValue(key, value));
}

function* initOperationsReduxSaga () {
  // yield put({type: core.ACTION_START, payload: { loadBlockchainOperations: 'Loading blockahin operations'}})
  yield call(loadBlockchainOperationsSaga)
  // yield put({type: core.ACTION_END, payload: 'loadBlockchainOperations'})
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la función
store.injectSaga('operations', [
  takeEvery(core.INIT, initOperationsReduxSaga),
  takeEvery(LOAD_BLOCKCHAIN_OPERATIONS, loadBlockchainOperationsSaga),
  takeEvery(LOAD_OLD_BLOCKCHAIN_OPERATIONS,  loadOldBlockchainOperationsSaga),
  takeEvery(LOAD_NEW_BLOCKCHAIN_OPERATIONS,  loadNewBlockchainOperationsSaga),

  takeEvery(TRY_SET_FILTER_KEY_VALUE,  trySetFiltersSaga),
  
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const operations           = (state) => state.operations.operations;
export const operationsCursor     = (state) => state.operations.operations_cursor;
export const isOperationsLoading  = (state) => state.operations.is_operations_loading
export const filterKeyValues      = (state) => state.operations.filter_key_values;

// El reducer del modelo
const defaultState = {
  operations:             [],
  is_operations_loading:  false,
  last_block:             null,
  operations_cursor:      null,
  filter_key_values:      {} 
}

function reducer(state = defaultState, action = {}) {
  
  switch (action.type) {
    case END_LOAD_BLOCKCHAIN_OPERATIONS:
      return {
        ...state,
        is_operations_loading:     false
      }
    break;
    
    case LOAD_NEW_BLOCKCHAIN_OPERATIONS:   
      return {
        ...state,
        is_operations_loading:     true
      }
    case PREPEND_BLOCKCHAIN_OPERATIONS: 
      const current_operations1 = state.operations||[];
      return  {
        ...state
        , operations:              [...action.payload.data.txs, ...current_operations1]
        , operations_cursor:       action.payload.data.cursor
        , is_operations_loading:   false
      }

    case LOAD_OLD_BLOCKCHAIN_OPERATIONS:   
      return {
        ...state,
        is_operations_loading:     true
      }
    case APEND_BLOCKCHAIN_OPERATIONS: 
      const current_operations2 = state.operations||[];
      return  {
        ...state
        , operations:              [...current_operations2, ...action.payload.data.txs ]
        , operations_cursor:       action.payload.data.cursor
        , is_operations_loading:   false
      }

    case LOAD_BLOCKCHAIN_OPERATIONS: 
      return {
        ...state,
        is_operations_loading:     true
      }
    case SET_BLOCKCHAIN_OPERATIONS:
      console.log(' operations-redux::reducer::SET_BLOCKCHAIN_OPERATIONS')
      const {txs, cursor} = action.payload.data 
      console.log(' txs', txs)
      console.log(' cursor', cursor)
      const last_block = (txs&&txs.length>0)
        ? txs[0].block_num
        : state.last_block;
      
      console.log(' operations-redux::reducer::SET_BLOCKCHAIN_OPERATIONS GOOOOOOOOOOOOOl')
      return  {
        ...state
        , operations:              txs 
        , operations_cursor:       cursor
        , last_block:              last_block 
        , is_operations_loading:   false
      }
    case SET_FILTER_KEY_VALUE:
      let _filter_key_values = state.filter_key_values;
      return  {
        ...state,
        filter_key_values : { ..._filter_key_values, [action.payload.key] : action.payload.value }
      }
    case DELETE_FILTER_KEY_VALUE:
      let _filter_key_values1 = state.filter_key_values;
      delete _filter_key_values1[action.payload.key];
      return  {
        ...state,
        filter_key_values : { ..._filter_key_values1 }
      }
    default: return state;
  }
}

store.injectReducer('operations', reducer)
