// import * as api from '../../services/userApi'
import { getRoutesByRole } from '@app/services/routes'
import { takeEvery, call, put } from '@redux-saga/core/effects';
import { store } from '@app/redux/configureStore'
// ConstantesT
const GET_ASYNC              = 'menu/GET_ASYNC';
const GET_ASYNC_END          = 'menu/GET_ASYNC_END';
const GET_FAIL               = 'menu/GET_FAIL';
const SET                    = 'menu/SET';
const CLEAN_MENU             = ' menu/CLEAN_MENU'

const TRY_COLLAPSE           = 'menu/TRY_COLLAPSE'
const SET_COLLAPSE           = 'menu/SET_COLLAPSE'

const TRY_SET_MENU_FATHER    = 'menu/TRY_SET_MENU_FATHER'
const SET_MENU_FATHER        = 'menu/SET_MENU_FATHER'

// Creadores de acciones (se pueden usar desde los compoenentes)
export const getMenu                  = (account_name, account_type) =>({ type: GET_ASYNC, payload: { account_name, account_type }});
export const getMenuFail              = (error)                      =>({ type: GET_FAIL, payload: { error }});
export const setMenu                  = ({ role, menu })             =>({ type: SET, payload: { role, menu }});
export const cleanMenu                = ()                           =>({ type: CLEAN_MENU });
export const collapseMenu             = (is_collapsed)               =>({ type: TRY_COLLAPSE, payload: { is_collapsed } });
export const setLastRootMenuFullpath  = (fullpath)                   =>({ type: TRY_SET_MENU_FATHER, payload: { fullpath }});

//Eventos que requieren del async
function* getMenuSaga({ type, payload }) {
  try {
    // const {error, data } = yield call(api.getRole, payload.userId)
    // account_name: actualAccountName, account_type:actualRole
    // if (typeof error === 'undefined') {
      // yield put(setMenu({ role: data.role, menu: getRoutesByRole( data.role )}))
    // }
    
    const {account_name, account_type } = payload;
    // console.log(' --------------- getMENUSAGA > payload', payload)
    // console.log(' --------------- getMENUSAGA > account_name', account_name)
    // console.log(' --------------- getMENUSAGA > account_type', account_type)
    yield put(setMenu({ role: account_type, menu: getRoutesByRole( account_type )}))
  } catch(error) {
    console.log({error})
    yield put(getMenuFail(error))
  }
  yield put({type: GET_ASYNC_END})
}

function* tryCollapseMenuSaga({ type, payload }) {

  const { is_collapsed } = payload
  // console.log(' MENU REDUX >> tryCollapseMenuSaga >> payload: ', payload)
  console.log(' MENU REDUX >> tryCollapseMenuSaga >> is_collapsed: ', is_collapsed)
  yield put({type: SET_COLLAPSE, payload: {is_collapsed:is_collapsed} })
}

function* trySetMenuFatherSaga({ type, payload }) {

  const { fullpath } = payload
  // console.log(' MENU REDUX >> tryCollapseMenuSaga >> payload: ', payload)
  // console.log(' MENU REDUX >> trySetMenuFatherSaga >> fullpath: ', fullpath)
  yield put({type: SET_MENU_FATHER, payload: {fullpath:fullpath} })
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la funcion
store.injectSaga('menu', [
  takeEvery(GET_ASYNC, getMenuSaga),
  takeEvery(TRY_COLLAPSE, tryCollapseMenuSaga),
  takeEvery(TRY_SET_MENU_FATHER, trySetMenuFatherSaga),
])

// Selectores - Conocen el stado y retornan la info que es necesaria
export const isLoading = (state) => state.menu.loading > 0
export const getMenuItems = (state) => state.menu.items
export const isCollapsed = (state) => state.menu.is_collapsed
export const lastRootMenu = (state) => state.menu.last_root_menu_fullpath

// El reducer del modelo
const defaultState = { items: [], loading: 0, is_collapsed:false, error: undefined, last_root_menu_fullpath : undefined };
function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case SET:
      return {
        ...state,
        items: action.payload.menu.items
      };
    case GET_ASYNC:
      return  {
        ...state,
        loading: state.loading +1
      }
    case GET_FAIL:
        return {
          ...state,
          error: action.payload.error
        }
    case GET_ASYNC_END:
      return {
        ...state,
        loading: state.loading - 1
      }
    case SET_COLLAPSE:
      // console.log(' menuREDUX::SET_COLLAPSE -> action.payload >> ', action.payload)
      return {
        ...state,
        is_collapsed: action.payload.is_collapsed
      }
     case SET_MENU_FATHER:
       return{
        ...state, 
        last_root_menu_fullpath: action.payload.fullpath
      }
    case CLEAN_MENU:
      return defaultState
    default: return state;
  }
}

store.injectReducer('menu', reducer)