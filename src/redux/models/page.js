import { takeEvery, put, call } from '@redux-saga/core/effects';
import { store } from '../configureStore'
import * as core from './core';

// Constantes
const TRY_SET_PAGE_KEY_VALUE           = 'operations/TRY_SET_PAGE_KEY_VALUE';
const SET_PAGE_KEY_VALUE               = 'operations/SET_PAGE_KEY_VALUE';
const DELETE_PAGE_KEY_VALUE            = 'operations/DELETE_PAGE_KEY_VALUE';

// Creadores de acciones (se pueden usar desde los compoenentes)
export const trySetPageKeyValue        = (key, value)   =>({ type: TRY_SET_PAGE_KEY_VALUE, payload: { key:key, value:value }});
export const setPageKeyValue           = (key, value)   =>({ type: SET_PAGE_KEY_VALUE, payload: { key:key, value:value }});
export const deletePageKeyValue        = (key)          =>({ type: DELETE_PAGE_KEY_VALUE, payload: { key:key }});

//Eventos que requieren del async
function* trySetPagesSaga({ type, payload }){
  const {key, value} = payload;
  yield put(setPageKeyValue(key, value));
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la función
store.injectSaga('page', [
  // takeEvery(core.INIT, initOperationsReduxSaga),
  takeEvery(TRY_SET_PAGE_KEY_VALUE, trySetPagesSaga),
  
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const pageKeyValues      = (state) => state.page.page_key_values;

// El reducer del modelo
const defaultState = {
  page_key_values:      {} 
}

function reducer(state = defaultState, action = {}) {
  
  switch (action.type) {
    case SET_PAGE_KEY_VALUE:
      let _page_key_values = state.page_key_values;
      return  {
        ...state,
        page_key_values : { ..._page_key_values, [action.payload.key] : action.payload.value }
      }
    case DELETE_PAGE_KEY_VALUE:
      let _page_key_values1 = state.page_key_values;
      delete _page_key_values1[action.payload.key];
      return  {
        ...state,
        page_key_values : { ..._page_key_values1 }
      }
    default: return state;
  }
}

store.injectReducer('page', reducer)
