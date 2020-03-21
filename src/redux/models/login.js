import { takeEvery, put } from '@redux-saga/core/effects';
import { store } from '../configureStore'
import * as globalCfg from '@app/configs/global';
import * as storage from '@app/services/localStorage';
import * as core from './core';
import * as api from '@app/services/inkiriApi';
import {TRY_DELETE_SESSION} from './page';
import history from '@app/history.js';

// Constantes
const TRY_LOGIN         = 'login/TRY_LOGIN';
const TRY_LOGIN_END     = 'login/TRY_LOGIN_END';
const TRY_LOGIN_ERROR   = 'login/TRY_LOGIN_ERROR';
const SET_LOGIN         = 'login/SET_LOGIN'
const LOGOUT            = 'login/LOGOUT'
const CLEAR_SESSION     = 'login/CLEAR_SESSION'

// const TRY_SWITCH        = 'login/TRY_SWITCH';
const TRY_SWITCH2       = 'login/TRY_SWITCH2';
const TRY_SWITCH_END    = 'login/TRY_SWITCH_END';

const LOAD_PROFILE      = 'login/LOAD_PROFILE';
const SET_PROFILE       = 'login/SET_PROFILE';


// Creadores de acciones (se pueden usar desde los compoenentes)
// export const tryLogin = (account, save) =>({ type: TRY_LOGIN, payload: {account, save } });
// export const trySwitchAccount = (account_name)             => ({ type: TRY_SWITCH, payload: { account_name } });
export const trySwitchAccount2 = (account_name, role)      => ({ type: TRY_SWITCH2, payload: { account_name:account_name , role:role } });
export const tryLogin = (account_name, password, remember) => ({ type: TRY_LOGIN, payload: { account_name, password, remember } });
export const tryLoginError = (e)                           => ({ type: TRY_LOGIN_ERROR, payload: { exception:e } });
export const logout = ()                                   => ({ type: LOGOUT });
export const clearSession = ()                             => ({ type: CLEAR_SESSION });
export const setLoginData = (loginData)                    => ({ type: SET_LOGIN, payload: loginData });

export const loadProfile = (account_name)                  =>({ type: LOAD_PROFILE, payload: {account_name} });
export const setProfile = ({account_name, profile})        =>({ type: SET_PROFILE, payload: { account_name, profile }});


const ACCOUNT_DATA = 'account_data'

//Eventos que requieren del async
function* initLoginDataSaga() {
    console.log( ' # core.INIT@login-saga ' )
    yield put({ type: core.ACTION_START, payload: { login: 'Check local storage' } })
    const { data } = yield storage.getStorage(ACCOUNT_DATA);
    console.log(' loginREDUX::loadLoginData >> storage >> ', JSON.stringify(data))
    if (data && data.account_name && data.password) {
        //yield put(tryLogin(data.account_name, data.password, false))
        const stateData = getLoginDataFromStorage(data);
        // console.log(' >> LOGIN REDUX loadLoginData: ', JSON.stringify(stateData.profile))
        yield put({ type: TRY_DELETE_SESSION });
        yield put(setLoginData(stateData))
    } else {
        console.log(' -- redux::login::loadLoginData >> could NOT LOGIN', JSON.stringify(data))
    }
    yield put({ type: core.ACTION_END, payload: 'login' })
}

function* tryLoginSaga({ type, payload }) {

    const { account_name, password, remember } = payload
    // console.log(' LOGIN REDUX >> tryLoginSaga >> ', account_name, password, remember)
    try {
        // LLAMO A inkiriAPI.login
        console.log(' login-redux::tryloginsaga::apip.login', account_name, password)
        const accounts = yield api.login(account_name, password);
        // console.log('login.redux -> api.login -> :', accounts)
        console.log(' login-redux::tryloginsaga::result', accounts)
        if (payload.remember) {
            storage.setVersion(globalCfg.version);
            let master_account = account_name;
            const profile = accounts.profile;
            storage.setStorage(ACCOUNT_DATA, { account_name, password, remember, accounts, master_account, profile })
        }
        yield put({ type: TRY_DELETE_SESSION });
        yield put(setLoginData({ 
                userId:             account_name
                , accounts:         accounts
                , master_account:   account_name
                , current_account:  accounts.personalAccount
                , password:         password
                , profile:          accounts.profile }))
    } catch (e) {
        console.log(' >> LOGIN REDUX ERROR#1', e)
        yield put({ type: TRY_LOGIN_ERROR, payload: {exception:e} })
    }
    yield put({ type: TRY_LOGIN_END })
    // yield put( tryUserState(account_name))
}

// function* trySwitchAccountSaga({ type, payload }) {
//     const { account_name } = payload
//     // console.log(' LOGIN REDUX >> trySwitchAccountSaga >> ', account_name);
//     const { data } = yield storage.getStorage(ACCOUNT_DATA);
//     if (account_name === data.account_name) {
//         // console.log(' LOGIN REDUX >> trySwitchAccountSaga >> NOTHING TO DO >> account_name===data.account_name', account_name);
//         yield put({ type: TRY_SWITCH_END })
//         return;
//     }
//     const stateData = getLoginDataFromStorage(data, account_name);
//     const profile = yield api.bank.getProfile(account_name);
//     stateData['profile'] = profile;
//     // console.log(' LOGIN REDUX >> trySwitchAccountSaga >>putting new data', JSON.stringify(stateData));
//     storage.setStorage(ACCOUNT_DATA, { account_name: account_name
//                                , password: data.password
//                                , remember: data.remember
//                                , accounts: stateData.accounts
//                                , master_account: stateData.master_account
//                                , profile:profile })
//     yield put({ type: TRY_DELETE_SESSION });
//     yield put(setLoginData(stateData))
//     yield put({ type: TRY_SWITCH_END })
//     history.replace('/');
// }

function* trySwitchAccount2Saga({ type, payload }) {

    const { account_name, role } = payload
    // console.log(' LOGIN REDUX >> trySwitchAccount2Saga >> ', account_name, role);
    const { data } = yield storage.getStorage(ACCOUNT_DATA);
    if (account_name === data.account_name) {
        // console.log(' LOGIN REDUX >> trySwitchAccount2Saga >> NOTHING TO DO >> account_name===data.account_name', account_name);
        yield put({ type: TRY_SWITCH_END })
        return;
    }

    const stateData = getLoginDataFromStorage(data, account_name);

    const profile = yield api.bank.getProfile(account_name);
    stateData['profile'] = profile;
    // console.log(' LOGIN REDUX >> trySwitchAccount2Saga >>putting new data', JSON.stringify(stateData));
    storage.setStorage(ACCOUNT_DATA, { account_name: account_name
                               , password: data.password
                               , remember: data.remember
                               , accounts: stateData.accounts
                               , master_account: stateData.master_account
                               , profile:profile })
    yield put({ type: TRY_DELETE_SESSION });
    yield put(setLoginData(stateData))
    yield put({ type: TRY_SWITCH_END })

    setTimeout(()=> {
      history.replace('/');
    } , 500);
    
}

function* loadProfileSaga({ type, payload }) {
  const { account_name } = payload;
  // console.log(' ** LOGIN-REDUX::loadProfileSaga account_name: ', account_name)
  if(!account_name) return;
  const profile = yield api.bank.getProfile(account_name);
  // console.log(' ** LOGIN-REDUX::loadProfileSaga profile: ', JSON.stringify(profile))
  if(profile) {
    const { data } = yield storage.getStorage(ACCOUNT_DATA);
    // console.log(' ** LOGIN-REDUX::loadProfileSaga storage.getStorage: ', JSON.stringify(data))
    storage.setStorage(ACCOUNT_DATA, { account_name: account_name
                               , password: data.password
                               , remember: data.remember
                               , accounts: data.accounts
                               , master_account: data.master_account
                               , profile:profile });
    yield put(setProfile({account_name:account_name, profile:profile}))
  }
}


function* logoutSaga() {
    setTimeout(()=> {
      history.replace('/');
    } , 500);
    yield storage.clearStorage();
    storage.setVersion(globalCfg.version);
}

function getLoginDataFromStorage(storageData, switch_to) {

    const account_name    = storageData.account_name;
    const master_account  = storageData.master_account;
    const password        = storageData.password;
    const new_account     = (switch_to !== undefined) ? switch_to : account_name;
    const account         = accountsToArray(storageData.accounts).filter(acc => acc.permissioner.account_name == new_account)[0]
    const profile         = storageData.profile;

    const _loginData = { userId: new_account, accounts: storageData.accounts, master_account: master_account, current_account: account, password: password, profile:profile};
    // console.log(' lodingREDUX::getLoginDataFromStorage >> ', _loginData)
    return _loginData;
}

function accountsToArray(accounts) {
    return [accounts.personalAccount].concat(accounts.otherPersonalAccounts, accounts.corporateAccounts, accounts.adminAccount, accounts.fundAccounts).filter(item => item !== undefined)
}

//Se envan las sagas a redux estableciendo que y cuantas veces dispara la funcià¸£à¸“n
store.injectSaga('login', [
    // takeEvery(core.INIT_READY_TO_START, initLoginDataSaga),
    takeEvery(core.INIT, initLoginDataSaga),
    takeEvery(TRY_LOGIN, tryLoginSaga),
    // takeEvery(TRY_SWITCH, trySwitchAccountSaga),
    takeEvery(TRY_SWITCH2, trySwitchAccount2Saga),
    takeEvery(LOAD_PROFILE, loadProfileSaga),
    takeEvery(LOGOUT, logoutSaga),
    takeEvery(CLEAR_SESSION, logoutSaga)
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const isLoading             = (state) => state.login.loading > 0;
export const isAuth                = (state) => state.login.current_account!=null
export const account               = (state) => state.login.current_account
export const actualAccountName     = (state) => (state.login.current_account) ? state.login.current_account.permissioner.account_name : undefined
export const actualAccountProfile  = (state) => state.login.profile;
export const actualPrivateKey      = (state) => state.login.private_key;
export const actualRole            = (state) => (state.login.current_account) ? globalCfg.bank.getAccountType(state.login.current_account.permissioner.account_type) : undefined
export const actualRoleId          = (state) => (state.login.current_account) ? state.login.current_account.permissioner.account_type : undefined
export const actualPermission      = (state) => (state.login.current_account) ? state.login.current_account.permission : undefined
export const currentAccount        = (state) => state.login.current_account

export const isAdmin               = (state) => state.login.current_account && globalCfg.bank.isAdminAccount(state.login.current_account.permissioner.account_type);
export const isBusiness            = (state) => state.login.current_account && globalCfg.bank.isBusinessAccount(state.login.current_account.permissioner.account_type);
export const isPersonal            = (state) => state.login.current_account && globalCfg.bank.isPersonalAccount(state.login.current_account.permissioner.account_type);
export const isFund                = (state) => state.login.current_account && globalCfg.bank.isFoundationAccount(state.login.current_account.permissioner.account_type);

export const personalAccount       = (state) => state.login.accounts && state.login.accounts.personalAccount
export const otherPersonalAccounts = (state) => state.login.accounts && state.login.accounts.otherPersonalAccounts
export const corporateAccounts     = (state) => state.login.accounts && state.login.accounts.corporateAccounts
export const fundAccounts          = (state) => state.login.accounts && state.login.accounts.fundAccounts
export const adminAccount          = (state) => state.login.accounts && state.login.accounts.adminAccount
export const allAccounts           = (state) => state.login.accounts?accountsToArray(state.login.accounts):[]

export const loginError            = (state) => state.login.error;

// El reducer del modelo
const defaultState = {
    loading:            0,
    userId:             undefined,
    current_account:    null,
    accounts:           {},
    private_key:        undefined,
    error:              null
};

function reducer(state = defaultState, action = {}) {
    switch (action.type) {
        case TRY_LOGIN:
            return {
                ...state,
                loading: state.loading + 1
            }
        case TRY_LOGIN_END:
            return {
                ...state,
                loading: state.loading - 1
            }
        case TRY_LOGIN_ERROR:
            return {
                ...state,
                loading: 0,
                error: action.payload.exception
            }
        // case TRY_SWITCH:
        //     return {
        //         ...state,
        //         loading: state.loading + 1
        //     }
        case TRY_SWITCH2:
            return {
                ...state,
                loading: state.loading + 1
            }
        case TRY_SWITCH_END:
            return {
                ...state,
                loading: state.loading - 1
            }
        case SET_LOGIN:
            // console.log( ' loginREDUX >> action.payload.password >> ' , action.payload.current_account)

            return {
                ...state,
                // userId             : action.payload.accounts.personalAccount.permissioned.actor
                userId:           action.payload.userId,
                private_key:      action.payload.password,
                accounts:         action.payload.accounts,
                master_account:   action.payload.master_account,
                current_account:  action.payload.current_account,
                profile:          action.payload.profile,
                error:            null
            }
        case SET_PROFILE:
           return  {
                ...state
                , profile:     action.payload.profile 
            }
        case LOGOUT:
        case CLEAR_SESSION:
            return defaultState;
        default:
            return state;
    }
}

store.injectReducer('login', reducer)