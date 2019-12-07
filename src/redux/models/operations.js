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

// Creadores de acciones (se pueden usar desde los compoenentes)
export const loadBlockchainOperations    = ()       =>({ type: LOAD_BLOCKCHAIN_OPERATIONS});
export const setBlockchainOperations     = (data)   =>({ type: SET_BLOCKCHAIN_OPERATIONS, payload: { data }});

export const loadOldBlockchainOperations = ()       =>({ type: LOAD_OLD_BLOCKCHAIN_OPERATIONS});
export const apendBlockchainOperations   = (data)   =>({ type: APEND_BLOCKCHAIN_OPERATIONS, payload: { data }});

export const loadNewBlockchainOperations = ()       =>({ type: LOAD_NEW_BLOCKCHAIN_OPERATIONS});
export const prependBlockchainOperations = (data)   =>({ type: PREPEND_BLOCKCHAIN_OPERATIONS, payload: { data }});

//Eventos que requieren del async
function* loadBlockchainOperationsSaga() {
  
  return;

  const {data} = yield api.dfuse.allTransactions();
  if(data) {
      yield put(setBlockchainOperations(data))
  }
}

function* loadOldBlockchainOperationsSaga() {
  // console.log(' oeprations-redux :: loadOldBlockchainOperationsSaga')
  const { operations_cursor } = store.getState().operations;
  // console.log(' oeprations-redux :: loadOldBlockchainOperationsSaga #2 :: ', operations_cursor)
  if(!operations_cursor)
  {  
    // console.log(' oeprations-redux :: loadOldBlockchainOperationsSaga #3 :: ')
    yield put({ type: END_LOAD_BLOCKCHAIN_OPERATIONS })
    return;
  }
  // console.log(' oeprations-redux :: loadOldBlockchainOperationsSaga #4 :: ')
  const {data} = yield api.dfuse.allTransactions(operations_cursor);
  // console.log(' oeprations-redux :: loadOldBlockchainOperationsSaga #5 :: ', data)
  if(data) {
      yield put(apendBlockchainOperations(data))
  }
}

function* loadNewBlockchainOperationsSaga() {
  // console.log(' oeprations-redux :: loadOldBlockchainOperationsSaga')
  const { last_block } = store.getState().operations;
  // console.log(' oeprations-redux :: loadOldBlockchainOperationsSaga #2 :: ', operations_cursor)
  if(!last_block)
  {  
    // console.log(' oeprations-redux :: loadOldBlockchainOperationsSaga #3 :: ')
    yield put({ type: END_LOAD_BLOCKCHAIN_OPERATIONS })
    return;
  }
  // console.log(' oeprations-redux :: loadOldBlockchainOperationsSaga #4 :: ')
  const {data} = yield api.dfuse.allTransactionsSince(last_block);
  // console.log(' oeprations-redux :: loadOldBlockchainOperationsSaga #5 :: ', data)
  if(data) {
      yield put(prependBlockchainOperations(data))
  }
}

function* initOperationsReduxSaga () {
  console.log(' operations-redux:: me llamo core?')
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
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const operations           = (state) => state.operations.operations;
export const operationsCursor     = (state) => state.operations.operations_cursor;
export const isOperationsLoading  = (state) => state.operations.is_operations_loading

// El reducer del modelo
const defaultState = {
  operations:             [],
  is_operations_loading:  false,
  last_block:             null,
  operations_cursor:      null
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
      const last_block = (action.payload.data.txs&&action.payload.data.txs.length>0)
        ? action.payload.data.txs[0].block_num
        : state.last_block;
      console.log(' operations-redux::reducer::SET_BLOCKCHAIN_OPERATIONS', action.payload.data)
      return  {
        ...state
        , operations:              action.payload.data.txs 
        , operations_cursor:       action.payload.data.cursor
        // , last_block:              last_block 
        , is_operations_loading:   false
      }
    default: return state;
  }
}

store.injectReducer('operations', reducer)
