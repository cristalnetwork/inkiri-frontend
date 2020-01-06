import { takeEvery, put } from '@redux-saga/core/effects';
import { store } from '../configureStore'

// Constantes
const TRY_SET_PAGE_KEY_VALUE           = 'operations/TRY_SET_PAGE_KEY_VALUE';
const SET_PAGE_KEY_VALUE               = 'operations/SET_PAGE_KEY_VALUE';
const DELETE_PAGE_KEY_VALUE            = 'operations/DELETE_PAGE_KEY_VALUE';
export const TRY_DELETE_SESSION        = 'operations/TRY_DELETE_SESSION';
const DELETE_SESSION                   = 'operations/DELETE_SESSION';

// Creadores de acciones (se pueden usar desde los compoenentes)
export const trySetPageKeyValue        = (key, value)   =>({ type: TRY_SET_PAGE_KEY_VALUE, payload: { key:key, value:value }});
export const setPageKeyValue           = (key, value)   =>({ type: SET_PAGE_KEY_VALUE, payload: { key:key, value:value }});
export const deletePageKeyValue        = (key)          =>({ type: DELETE_PAGE_KEY_VALUE, payload: { key:key }});
export const deleteSession             = ()             =>({ type: DELETE_SESSION});

//Eventos que requieren del async
function* trySetPagesSaga({ type, payload }){
  const {key, value} = payload;
  yield put(setPageKeyValue(key, value));
}

function* tryDeleteSessionSaga () {
  yield put(deleteSession());
}
//Se envan las sagas a redux estableciendo que y cuantas veces dispara la función
store.injectSaga('page', [
  // takeEvery(core.INIT, initOperationsReduxSaga),
  takeEvery(TRY_SET_PAGE_KEY_VALUE, trySetPagesSaga),
  takeEvery(TRY_DELETE_SESSION, tryDeleteSessionSaga),
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
    case DELETE_SESSION:
      return  {
        ...defaultState
      }
    default: return state;
  }
}

store.injectReducer('page', reducer)
