import { takeEvery, put, } from '@redux-saga/core/effects';
import { store } from '../configureStore'
import { getAccountInformation } from '@app/services/inkiriApi'

// Constantes
const LOAD_BALANCE = 'balance/LOAD_BALANCE'
const SET_BALANCE = 'balance/SET_BALANCE'

// Creadores de acciones (se pueden usar desde los compoenentes)
export const loadBalance = (key) =>({ type: LOAD_BALANCE, payload: { key } });
export const setBalance = ({key, balance}) =>({ type: SET_BALANCE, payload: { key, balance }});

//Eventos que requieren del async
function* loadBalanceSaga({action, payload}) {
  const { key } = payload;
  if(!key) return;
  const { data }= yield getAccountInformation(key)
  if(data) {
    yield put(setBalance({key, balance: data.account}))
  }
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la función
store.injectSaga('balances', [
  takeEvery(LOAD_BALANCE, loadBalanceSaga),
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const userBalance = (state) => (userId) => {
  const ub = state.balances.accounts.find(x => x.key === userId);
  return ub? ub.balance.overdraft || '0' : '0';
}
export const isLoading = (state) => state.balances.isLoading > 0

// El reducer del modelo
const defaultState = {
  accounts: [],
  isLoading: 0
}

function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case LOAD_BALANCE: 
      return {
        ...state,
        isLoading: state.isLoading +1
      }
    case SET_BALANCE: 
      return  {
        ...state,
        accounts: [
          ...state.accounts.filter(x =>x.key !== action.payload.key), //Quito el balance anterior
          action.payload //Agrego el nuevo
        ],
        isLoading: state.isLoading -1
      }
    default: return state;
  }
}

store.injectReducer('balances', reducer)
