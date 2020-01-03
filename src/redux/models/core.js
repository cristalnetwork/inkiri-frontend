import { takeEvery, put, } from '@redux-saga/core/effects';

// Constantes
export const INIT                = 'core/BOOT'
export const ACTION_START        = 'core/ACTION_START';
export const ACTION_END          = 'core/ACTION_END';
export const INIT_READY_TO_START = 'core/READY';

const wait = (time, cb) => new Promise((res) => { setTimeout(res,time); });

function* bootSaga({ type, payload }) {
    yield wait(250);
    console.log(' -- core-redux::bootSaga')
    yield put({type: INIT_READY_TO_START})
    // yield put({type: INIT})
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la función
export const coreSagas = [
  takeEvery(INIT, bootSaga),
]

// Selectores - Conocen el stado y retornan la info que es necesaria
export const isLoading   = (state) => state.core.loading
export const pending     = (state) => state.core.pending

// El reducer del modelo
const defaultState = { pending: {}, loading: true, boot: false };

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
    case INIT:
        console.log(' INIT core event?');
        return {...state}
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
        console.log(' INIT_READY_TO_START core event?');
        return {
            ...state,
            boot: true
        }
    default: return state;
  }
}