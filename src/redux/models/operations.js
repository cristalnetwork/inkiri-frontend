import { takeEvery, put, call } from '@redux-saga/core/effects';
import { store } from '../configureStore'
import * as api from '@app/services/inkiriApi'
import * as core from './core';
import _ from 'lodash';

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

const TRY_FILTER_OPERATIONS              = 'operations/TRY_FILTER_OPERATIONS';
const SET_FILTERED_OPERATIONS            = 'operations/SET_FILTERED_OPERATIONS';

// Creadores de acciones (se pueden usar desde los compoenentes)
export const loadBlockchainOperations    = ()       =>({ type: LOAD_BLOCKCHAIN_OPERATIONS});
export const setBlockchainOperations     = (data)   =>({ type: SET_BLOCKCHAIN_OPERATIONS, payload: { data }});

export const loadOldBlockchainOperations = ()       =>({ type: LOAD_OLD_BLOCKCHAIN_OPERATIONS});
export const apendBlockchainOperations   = (data)   =>({ type: APEND_BLOCKCHAIN_OPERATIONS, payload: { data }});

export const loadNewBlockchainOperations = ()       =>({ type: LOAD_NEW_BLOCKCHAIN_OPERATIONS});
export const prependBlockchainOperations = (data)   =>({ type: PREPEND_BLOCKCHAIN_OPERATIONS, payload: { data:data }});

export const trySetFilterKeyValue        = (key, value)   =>({ type: TRY_SET_FILTER_KEY_VALUE, payload: { key:key, value:value }});
export const setFilterKeyValue           = (key, value)   =>({ type: SET_FILTER_KEY_VALUE, payload: { key:key, value:value }});
export const deleteFilterKeyValue        = (key)    =>({ type: DELETE_FILTER_KEY_VALUE, payload: { key:key }});

export const tryFilterOperations         = ()       =>({ type: TRY_FILTER_OPERATIONS });
export const setFilteredOperations       = (opers)  =>({ type: SET_FILTERED_OPERATIONS , payload: { filtered_operations : opers }});

//Eventos que requieren del async
function* loadBlockchainOperationsSaga() {
  const { permissioner } = store.getState().login.current_account;
  try
  {
    const {data} = yield api.dfuse.queryTransactions(permissioner );
    console.log(' loadBlockchainOperationsSaga# ABOUT TO PUT!')
    if(data) {
        yield put(setBlockchainOperations(data))
        console.log('about to call TRY_FILTER_OPERATIONS')
        yield put({ type: TRY_FILTER_OPERATIONS })
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
  const { permissioner }      = store.getState().login.current_account;
  if(!operations_cursor)
  {  
    yield put({ type: END_LOAD_BLOCKCHAIN_OPERATIONS })
    return;
  }

  try{
    const {data} = yield api.dfuse.queryTransactionsCursor(permissioner, operations_cursor);
    if(data) {
        yield put(apendBlockchainOperations(data))
        yield put({ type: TRY_FILTER_OPERATIONS })
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
  const { permissioner }   = store.getState().login.current_account;
  const { last_block }     = store.getState().operations;
  if(!last_block)
  {    
    yield put({ type: END_LOAD_BLOCKCHAIN_OPERATIONS })
    return;
  }
  
  try{
    const {data} = yield api.dfuse.queryTransactionsNew(permissioner, last_block);
    if(data) {
      yield put(prependBlockchainOperations(data))
      yield put({ type: TRY_FILTER_OPERATIONS })
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
  // filtro?
  yield put({ type: TRY_FILTER_OPERATIONS })

}

function* tryFilterOperationsSaga(){
  
  const raw_operations = store.getState().operations.raw_operations;
  const filters        = store.getState().operations.filter_key_values;

  
  if(!raw_operations || !filters){
    // fire error
    yield put( setFilteredOperations( raw_operations||[] ) )
    return;
  }

  // console.log('raw_operations ->', JSON.stringify(raw_operations));
  try{
    const filter_keys = Object.keys(filters);
    const filtered_operations = filter_keys.map(
      (filter_key) => {
        const filter = filters[filter_key];

        return raw_operations.filter( (oper) => {
          const filter_account_name = filter['account_name'];
          if(!filter_account_name)
            return true;
          return oper.data.from==filter_account_name || oper.data.to==filter_account_name
        });   
      }
    )
    
    const ret = _.zipObject([filter_keys], [filtered_operations])
    yield put( setFilteredOperations(ret||{}) )
  }catch(e){
    console.log(' -- tryFilterOperationsSaga: exception', JSON.stringify(e))
    console.log(' filter:', JSON.stringify(filters))
  }
}

function* initOperationsReduxSaga () {
  // yield put({type: core.ACTION_START, payload: { loadBlockchainOperations: 'Loading blockahin operations'}})
  yield call(loadBlockchainOperationsSaga)
  // yield put({type: core.ACTION_END, payload: 'loadBlockchainOperations'})
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la función
store.injectSaga('operations', [
  // takeEvery(core.INIT, initOperationsReduxSaga),
  takeEvery(LOAD_BLOCKCHAIN_OPERATIONS, loadBlockchainOperationsSaga),
  takeEvery(LOAD_OLD_BLOCKCHAIN_OPERATIONS, loadOldBlockchainOperationsSaga),
  takeEvery(LOAD_NEW_BLOCKCHAIN_OPERATIONS, loadNewBlockchainOperationsSaga),

  takeEvery(TRY_SET_FILTER_KEY_VALUE, trySetFiltersSaga),
  
  takeEvery(TRY_FILTER_OPERATIONS, tryFilterOperationsSaga),
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const operations           = (state) => state.operations.operations;
export const rawOperations        = (state) => state.operations.raw_operations;
export const operationsCursor     = (state) => state.operations.operations_cursor;
export const isOperationsLoading  = (state) => state.operations.is_operations_loading
export const filterKeyValues      = (state) => state.operations.filter_key_values;

// El reducer del modelo
const defaultState = {
  operations:             {},
  raw_operations:         [],
  is_operations_loading:  false,
  last_block:             null,
  operations_cursor:      null,
  filter_key_values:      {} 
}

function reducer(state = defaultState, action = {}) {
  
  switch (action.type) {
    case TRY_FILTER_OPERATIONS:
      return {
        ...state,
        is_operations_loading:     false
      }
    break;

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
      const current_operations1 = state.raw_operations||[];
      return  {
        ...state
        , raw_operations:          [...action.payload.data.txs, ...current_operations1]
        , operations_cursor:       action.payload.data.cursor
        , is_operations_loading:   false
      }

    case LOAD_OLD_BLOCKCHAIN_OPERATIONS:   
      return {
        ...state,
        is_operations_loading:     true
      }
    case APEND_BLOCKCHAIN_OPERATIONS: 
      const current_operations2 = state.raw_operations||[];
      return  {
        ...state
        , raw_operations:          [...current_operations2, ...action.payload.data.txs ]
        , operations_cursor:       action.payload.data.cursor
        , is_operations_loading:   false
      }

    case LOAD_BLOCKCHAIN_OPERATIONS: 
      return {
        ...state,
        is_operations_loading:     true
      }
    case SET_BLOCKCHAIN_OPERATIONS:
      const {txs, cursor} = action.payload.data 
      const last_block = (txs&&txs.length>0)
        ? txs[0].block_num
        : state.last_block;
      
      return  {
        ...state
        , raw_operations:          txs 
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
    case SET_FILTERED_OPERATIONS:
      // console.log(' redux SET_FILTERED_OPERATIONS->', action.payload.filtered_operations)
      return  {
        ...state
        , operations:              action.payload.filtered_operations
        , is_operations_loading:   false
      }
    default: return state;
  }
}

store.injectReducer('operations', reducer)
