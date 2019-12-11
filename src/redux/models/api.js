import { takeEvery, put, call } from '@redux-saga/core/effects';
import { store } from '../configureStore'
import * as api from '@app/services/inkiriApi'
import * as core from './core';

import {LOAD_BALANCE} from './balance';

const CALL_API_EX_FUNCTION       = 'api/CALL_API_EX_FUNCTION'
const CALL_API_FUNCTION          = 'api/CALL_API_FUNCTION'
const END_CALL_API_FUNCTION      = 'api/END_CALL_API_FUNCTION'
const TRY_RELOAD_ACCOUNT_STATE   = 'api/TRY_RELOAD_ACCOUNT_STATE'

const CLEAR_RESULTS              = 'api/CLEAR_RESULTS'
const SET_RESULT                 = 'api/SET_RESULT'

const CLEAR_ERRORS               = 'api/CLEAR_ERRORS'
const SET_ERROR                  = 'api/SET_ERROR'

const CLEAR_ERRORS_AND_RESULTS   = 'api/CLEAR_ERRORS_AND_RESULTS'

// Creadores de acciones (se pueden usar desde los compoenentes)
export const callAPIEx             = ( _steps)             =>({ type: CALL_API_EX_FUNCTION, payload: { _steps } });
export const callAPI               = ( _function, _params) =>({ type: CALL_API_FUNCTION, payload: { _function, _params } });
export const clearErrors           = ()                    =>({ type: CLEAR_ERRORS });
export const setError              = (error)               =>({ type: SET_ERROR,  payload: {error:error}});
export const clearResults          = ()                    =>({ type: CLEAR_RESULTS });
export const setResult             = (result)              =>({ type: SET_RESULT,  payload: {result:result}});
export const clearAll              = ()                    =>({ type: CLEAR_ERRORS_AND_RESULTS });

export const tryRealodAccountState = (account_name)        =>({ type: TRY_RELOAD_ACCOUNT_STATE,  payload: {account_name}});

//Eventos que requieren del async


/*
* Functions that receives an array of methods to call.
* Structure:
* @param: _function String Function name in the format namespace#1.namespace#2...func
* @param: _params Array
* @param: last_result_param String Name of last function call result to append to this call. optional
*/
function* callApiExtendedSaga({action, payload}) {
  
  console.log('  ******************* APICALLEX_REDUX!');

  const { _steps } = payload;
  let results      = [];
  for(var step_idx = 0; step_idx < _steps.length; step_idx++) {
    
    const the_object = _steps[step_idx];
    
    console.log(` STEP[${step_idx}]: ${JSON.stringify(the_object)}`);            

    try{

      const result = yield buildAndCall(the_object, step_idx, results); 
      console.log(`#RESULT[${step_idx}]: ${result}`)
      results.push(result);
      console.log(` ---> RESULTS: ${JSON.stringify(results)}`)

    }
    catch(e){
      console.log(' APICALLEX_REDUX EXCEPTION!', step_idx);
      console.log(e);
      
      if(the_object.on_failure)
      {
        try{
          const result = buildAndCall(the_object.on_failure, results); 
        }catch(e2){
          console.log(' APICALLEX_REDUX OnFail EXCEPTION!!!!!!!!!!!!!!!!!', step_idx);
          console.log(e2);
        }
        
      }
      yield put({ type: END_CALL_API_FUNCTION })
      yield put(setError(e));
      return;
    }
  }
  
  yield put(setResult(results));
  yield put(tryRealodAccountState(null)) ;

}

function* buildAndCall(step, step_idx, results) {
  
  const namespaces = step._function.split('.');
  const func       = namespaces.pop();
  let context      = namespaces.reduce((acc, namespace) => acc[namespace], api)
  
  let new_params   = [];
  if(step.last_result_param)
    new_params = step.last_result_param.map(last_res_cfg => {
      return results[step_idx + last_res_cfg.result_idx_diff][last_res_cfg.field_name]
    })

  const _params = [...step._params, ...new_params]

  console.log( ' - buildAndCall ')
  console.log( ' -- func :', func)
  console.log( ' -- _params :', JSON.stringify(_params))

  const data = yield context[func](..._params);  
              
  if(!data)
    return null;
  
  const result = data.data?data.data:data;
  return result;
  
}

function* callApiSaga({action, payload}) {
  
  const { _function, _params } = payload;
  const namespaces = _function.split('.');
  const func       = namespaces.pop();
  let context      = namespaces.reduce((acc, namespace) => acc[namespace], api)

  try{
    const data = yield context[func](..._params);  
    
    if(!data) {
      yield put({ type: END_CALL_API_FUNCTION })
      return;
    }

    const result = (data&&data.data)?data.data:data;
    yield put(setResult(result));
    yield put(tryRealodAccountState(null)) ;
    return;
    
  }
  catch(e){
    console.log(' APICALL_REDUX EXCEPTION!');
    console.log(e);
    yield put({ type: END_CALL_API_FUNCTION })
    yield put(setError(e))
  }
}

function* tryReloadAccountStateSaga ({type, payload}) {
  let account_name = payload.account_name;
  if(!account_name)
    account_name = store.getState().login.current_account.permissioner.account_name;

  if(!account_name)
  {
    console.log(' -- tryReloadAccountStateSaga ERROR, no ACCOUNT NAME.')
    yield put(setError('Can not get current account name to update account state (balance, persmission, etc. Please logout and login again!)'))
    return; 
  }

  console.log(' -- tryReloadAccountStateSaga calling LOAD_BALANCE.')
  // reload balance
  yield put({ type: LOAD_BALANCE , payload: { account_name:account_name }})
  

}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la función
store.injectSaga('api', [
  takeEvery(CALL_API_EX_FUNCTION, callApiExtendedSaga),
  takeEvery(CALL_API_FUNCTION, callApiSaga),
  takeEvery(TRY_RELOAD_ACCOUNT_STATE, tryReloadAccountStateSaga),
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const isFetching            = (state) => state.api.is_loading ;
export const getErrors             = (state) => state.api.errors ;
export const getLastError          = (state) => state.api.errors&&state.api.errors.length>0?state.api.errors[state.api.errors.length-1]:null ;
export const getResults            = (state) => state.api.results ;
export const getLastResult         = (state) => state.api.results&&state.api.results.length>0?state.api.results[state.api.results.length-1]:null ;

// El reducer del modelo
const defaultState = {
  is_loading:         false,
  errors:             [],
  results:            []
}

function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    
    case CALL_API_EX_FUNCTION:
    case CALL_API_FUNCTION:
      return {
        ...state,
        is_loading: true
      }
    
    case END_CALL_API_FUNCTION: 
      return {
        ...state,
        is_loading: false
      }
    
    case CLEAR_ERRORS_AND_RESULTS:
      return {
        ...state
        , errors: []
        , results: []
      }

    case CLEAR_ERRORS: 
      return {
        ...state,
        errors: []
      }
    case SET_ERROR:
      // console.log('apiRedux::SET_ERROR:')
      // console.log(action.payload)
      const errors = (Array.isArray(state.errors))?state.errors.push(action.payload.error):[action.payload.error];
      return  {
        ...state
        , errors:       errors
        , is_loading: false
      }

    case CLEAR_RESULTS: 
      return {
        ...state,
        results: []
      }
    case SET_RESULT:
      const results = (Array.isArray(state.results))?state.results.push(action.payload.result):[action.payload.result];
      return  {
        ...state
        , results:       results
        , is_loading: false
      }
    default: return state;
  }
}

store.injectReducer('api', reducer)
