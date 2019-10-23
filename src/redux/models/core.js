import { takeEvery, put, } from '@redux-saga/core/effects';
import { store } from '@app/redux/configureStore'

// Constantes
export const INIT             = 'core/BOOT'
export const ACTION_START     = 'core/ACTION_START';
export const ACTION_END       = 'core/ACTION_END';

const TRY_MOBILE              = 'core/TRY_MOBILE'
const SET_MOBILE              = 'core/SET_MOBILE'

const INIT_READY_TO_START     = 'core/READY';

const wait = (time, cb) => new Promise((res) => { setTimeout(res,time); });

function* bootSaga({ type, payload }) {
    yield wait(500);
    yield put({type: INIT_READY_TO_START})

    store.injectSaga('core', [
      takeEvery(TRY_MOBILE, tryMobileSaga),
    ])

}

function* tryMobileSaga({ type, payload }) {

  // const { is_mobile } = payload
  yield put({type: SET_MOBILE, payload: payload })
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la función
export const coreSagas = [
  takeEvery(INIT, bootSaga),
]

// Selectores - Conocen el stado y retornan la info que es necesaria
export const isLoading   = (state) => state.core.loading
export const pending     = (state) => state.core.pending
export const isMobile    = (state) => state.core.is_mobile
export const setIsMobile = (is_mobile) => ({ type: TRY_MOBILE, payload: { is_mobile } });

// El reducer del modelo
const defaultState = { pending: {}, loading: true, boot: false , is_mobile:false};
export function coreReducer(state = defaultState, action = {}) {
  switch (action.type) {
      case ACTION_START:
        return {
            ...state,
            pending: {
                ...state.pending,
                ...action.payload
            },
            loading: true
        }
    case ACTION_END:
        delete state.pending[action.payload];
        return {
            ...state,
            pending: {
                ...state.pending
            },
            loading: Object.keys(state.pending).length > 0? true: false,
        }
    case INIT_READY_TO_START:
        return {
            ...state,
            boot: true
        }
    case SET_MOBILE:
            return {
                ...state,
                is_mobile: action.payload.is_mobile
            }
    default: return state;
  }
}