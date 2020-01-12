import { takeEvery, put, call } from '@redux-saga/core/effects';
import { store } from '../configureStore'
import * as api from '@app/services/inkiriApi'
import * as core from './core';
import * as api_errors from './api';
import _ from 'lodash';
import * as utils from '@app/utils/utils';
import moment from 'moment';

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

const TRY_FILTER_OPERATIONS              = 'operations/TRY_FILTER_OPERATIONS';
const SET_FILTERED_OPERATIONS            = 'operations/SET_FILTERED_OPERATIONS';

// const LOAD_OPERATIONS                    = 'operations/LOAD_OPERATIONS'

// Creadores de acciones (se pueden usar desde los compoenentes)
export const loadBlockchainOperations    = ()       =>({ type: LOAD_BLOCKCHAIN_OPERATIONS});
export const setBlockchainOperations     = (data)   =>({ type: SET_BLOCKCHAIN_OPERATIONS, payload: { data }});

export const loadOldBlockchainOperations = ()       =>({ type: LOAD_OLD_BLOCKCHAIN_OPERATIONS});
export const apendBlockchainOperations   = (data)   =>({ type: APEND_BLOCKCHAIN_OPERATIONS, payload: { data }});

export const loadNewBlockchainOperations = ()       =>({ type: LOAD_NEW_BLOCKCHAIN_OPERATIONS});
export const prependBlockchainOperations = (data)   =>({ type: PREPEND_BLOCKCHAIN_OPERATIONS, payload: { data:data }});

export const trySetFilterKeyValue        = (key, value)   =>({ type: TRY_SET_FILTER_KEY_VALUE, payload: { key:key, value:value }});
export const setFilterKeyValue           = (key, value)   =>({ type: SET_FILTER_KEY_VALUE, payload: { key:key, value:value }});
export const deleteFilterKeyValue        = (key)          =>({ type: TRY_SET_FILTER_KEY_VALUE, payload: { key:key , value:{} }});

export const tryFilterOperations         = ()       =>({ type: TRY_FILTER_OPERATIONS });
export const setFilteredOperations       = (opers)  =>({ type: SET_FILTERED_OPERATIONS , payload: { filtered_operations : opers }});

//Eventos que requieren del async
function* loadBlockchainOperationsSaga() {

  const { current_account } = store.getState().login;
  if(!current_account)
  {
    console.log('#ERROR# loadBlockchainOperationsSaga -> no tengo login!')
    yield put({ type: END_LOAD_BLOCKCHAIN_OPERATIONS })
    return;
  }
  try
  {
    const {data} = yield api.dfuse.queryTransactions(current_account.permissioner);
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
  const { current_account }   = store.getState().login;
  const { last_block }     = store.getState().operations;
  if(!last_block || !current_account)
  {    
    yield put({ type: api_errors.SET_ERROR, payload: {error: 'LOAD NEW BLOCKCHAINS OPERS - No last_block nor permissioner :('}})
    yield put({ type: END_LOAD_BLOCKCHAIN_OPERATIONS })
    return;
  }
  
  try{
    const {data} = yield api.dfuse.queryTransactionsNew(current_account.permissioner, last_block);
    if(data) {
      yield put(prependBlockchainOperations(data))
      yield put({ type: TRY_FILTER_OPERATIONS })
    }

  }
  catch(e)
  {
    console.log(' loadNewBlockchainOperationsSaga#ERROR#3:', JSON.stringify(e))
    //HACK Mandar error a GLOBAL_ERROR_HANDLER
    yield put({ type: api_errors.SET_ERROR, payload: {error: `Error occurred while loading NEW BLOCKCHAINS OPERS: ${JSON.stringify(e)}`}})
    yield put({ type: END_LOAD_BLOCKCHAIN_OPERATIONS })
    return;
  }
}
  
function* trySetFiltersSaga({ type, payload }){
  const {key, value} = payload;
  yield put(setFilterKeyValue(key, value));
  // if(utils.objectNullOrEmpty(value))
  // {
  //   yield put({ type: LOAD_BLOCKCHAIN_OPERATIONS })    
  // }
  yield put({ type: TRY_FILTER_OPERATIONS })

}

const comparer = {
  from : (filter, oper)             => { return !filter || oper.data.from==filter }
  , to : (filter, oper)             => { return !filter || oper.data.to==filter }
  , requested_type : (filter, oper) => { return utils.arrayNullOrEmpty(filter, true) || oper.request && filter.includes(oper.request.requested_type) }
  , date_range : (filter, oper)     => { 
    // console.log(' --- ')
    // console.log('oper.block_time_number = ', oper.block_time_number)
    // console.log('filter[0] = ' , utils.dateToNumber(filter[0]));
    // console.log('filter[1] = ' , utils.dateToNumber(filter[1]));
    // oper.block_time_number>=utils.dateToNumber(filter[0]) && oper.block_time_number<=utils.dateToNumber(filter[1]
    const my_date = moment(oper.block_time);
    return utils.arrayNullOrEmpty(filter, true) || (my_date.isSameOrAfter(filter[0]) && my_date.isSameOrBefore(filter[1]));
  }
}

function* tryFilterOperationsSaga(){
  
  const raw_operations = store.getState().operations.raw_operations;
  const filters        = store.getState().operations.filter_key_values;

  if(!raw_operations || !filters){
    // fire error ?
    console.log(' NO se puede filtrar papa!!')
    yield put( setFilteredOperations( raw_operations||{} ) )
    return;
  }

  // console.log(JSON.stringify(raw_operations));

  try{
    const filters_keys = Object.keys(filters);
    
    const filtered_operations = filters_keys.map(
      (filter_key) => {
        const filter               = filters[filter_key];
        const current_filter_keys  = Object.keys(filter);
        if(!current_filter_keys.length)
        {
          return [...raw_operations];
        }
        return raw_operations.filter( (oper) => {
          
          const comparison = _.reduce(filter, function(result, value, key) {
              const _ok = comparer[key](value, oper)
              return _ok ?
                  result.concat(key) : result;
          }, []);

          return comparison.length>=current_filter_keys.length

        });   
      }
    )
    
    const ret = _.zipObject(filters_keys, filtered_operations)
    // console.log('zipObject:', JSON.stringify(ret))
    yield put( setFilteredOperations(ret||{}) )
  }catch(e){
    console.log(' -- tryFilterOperationsSaga: exception', JSON.stringify(e))
    console.log(' filter:', JSON.stringify(filters))
    // ToDo: putError!
  }
}


function* initOperationsReduxSaga () {
  console.log( ' # core.INIT@operations-saga ' )
  // yield put({type: core.ACTION_START, payload: { loadBlockchainOperations: 'Loading blockahin operations'}})
  yield call(loadBlockchainOperationsSaga)
  // yield put({type: core.ACTION_END, payload: 'loadBlockchainOperations'})
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la función
store.injectSaga('operations', [
  takeEvery(core.INIT_READY_TO_START, initOperationsReduxSaga),
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
    case SET_FILTERED_OPERATIONS:
      // console.log(' redux-operations::SET_FILTERED_OPERATIONS: ', JSON.stringify(action.payload.filtered_operations))
      return  {
        ...state
        , operations:              action.payload.filtered_operations
        , is_operations_loading:   false
      }
    default: return state;
  }
}

store.injectReducer('operations', reducer)
