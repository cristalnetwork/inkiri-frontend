/*
  Refer to https://firebase.google.com/docs/cloud-messaging/js/client?authuser=0
  and https://github.com/prescottprue/react-redux-firebase
  and https://www.npmjs.com/package/firebase
  and https://redux-saga-firebase.js.org/reference/dev/messaging
  and https://github.com/n6g7/redux-saga-firebase/tree/master/example/src/redux
*/

import { all, put, takeEvery, take } from 'redux-saga/effects'
import { store } from '../configureStore'
import * as core from './core';
import firebase from 'firebase'
import * as globalCfg from '@app/configs/global';
import rsf from '../rsf'

const do_log = false;

export const SET_REGISTRATION_TOKEN = 'messaging/SET_REGISTRATION_TOKEN';
export const ON_MESSAGE             = 'messaging/ON_MESSAGE';
export const ON_READ_MESSAGES       = 'messaging/ON_READ_MESSAGES';
export const REGISTER_IF_NOT        = 'messaging/REGISTER_IF_NOT';
export const DO_READ_MESSAGES       = 'messaging/DO_READ_MESSAGES';

export const setRegistrationToken = token          => ({type: SET_REGISTRATION_TOKEN, payload: {token} });
export const setReadMessages      = (index, count) => ({type: ON_READ_MESSAGES, payload: {index, count} });
export const registerIfNot        = ()             => ({type: REGISTER_IF_NOT} );
export const doReadMessages       = ()             => ({type: DO_READ_MESSAGES} );

function* requestPermissionSaga() {
  const messaging = firebase.messaging()

  try {
    yield messaging.requestPermission()
    messaging.usePublicVapidKey(globalCfg.firebase.vapid);
    const token = yield messaging.getToken()
    do_log && console.log('PUSH-NOTIFICATION_TOKEN:', token)
    yield put(setRegistrationToken(token))
  } catch (error) {
    do_log && console.log(' !!!! PUSH-NOTIFICATION_ERROR:', error)
    // console.warn('Notifications blocked')
  }
}

function* readMessagesSaga() {
  do_log && console.log('PUSH-NOTIFICATION::readMessagesSaga:#1')
  // while(true) {
  // console.log('PUSH-NOTIFICATION::readMessagesSaga:#2')
  //   const message = yield take(channel);
  //   if(message)
  //     yield put({type: ON_MESSAGE, payload: {message : {read:false, message:message, mode: 'a_manuk'}}})
  // }

  // rsf.messaging.syncMessages,

  do_log && console.log('PUSH-NOTIFICATION::readMessagesSaga:#3')
  do_log && console.log('PUSH-NOTIFICATION::readMessagesSaga:END:')
}


function* registerMessageHandlerSaga()
{
  const messageChannel = rsf.messaging.channel()
  
  // yield takeEvery(messageChannel, function*(message) {
  //   console.log("You've got mail!", JSON.stringify(message.data));
  //   yield put({type: ON_MESSAGE, payload: {message : {read:false, message:message, mode: 'unknown'}}})
  // })
  
  do_log && console.log('PUSH-NOTIFICATION::try to register messages listener!')
  store.injectSaga('messaging', [
    takeEvery(core.INIT, initMessaging)
    , takeEvery(REGISTER_IF_NOT, initMessaging)
    , takeEvery(messageChannel, messageHandlerSaga)
    , takeEvery(DO_READ_MESSAGES, readMessagesSaga)
  ]);
  do_log && console.log('PUSH-NOTIFICATION::messages listener REGISTERED!')
}

function* messageHandlerSaga(message) {
  // console.log(" ============================ onMessage", JSON.stringify(message.data))
  yield put({type: ON_MESSAGE, payload: {message : {read:false, message:message, mode: 'auto'}}})
}

// function* OLDmessageHandlerSaga() {
//   const messageChannel = rsf.messaging.channel()

//   yield takeEvery(messageChannel, function*(message) {
//     console.log("You've got mail!", message)
//   })
// }



function* initMessaging () {
  const { token } = store.getState().messaging;
  if(token)
    return;
  yield requestPermissionSaga()
  do_log && console.log('PUSH-NOTIFICATION::requested ok!')
  yield all([
    registerMessageHandlerSaga(),
    // OLDmessageHandlerSaga(),
    rsf.messaging.syncToken({
      successActionCreator: setRegistrationToken,
    }),
  ])
  do_log && console.log('PUSH-NOTIFICATION::yielded all ok!')
}

// //Se envan las sagas a redux estableciendo que y cuantas veces dispara la funcià¸£à¸“n
store.injectSaga('messaging', [
  takeEvery(core.INIT, initMessaging)
  , takeEvery(REGISTER_IF_NOT, initMessaging)
  , takeEvery(DO_READ_MESSAGES, readMessagesSaga)
  
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const token     = (state) => state.messaging.registrationToken ;
export const messages  = (state) => state.messaging.messages ;


// El reducer del modelo
const defaultState = {
    registrationToken:  null,
    messages:           []
  };

function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case SET_REGISTRATION_TOKEN: 
      return { ...state
              , registrationToken: action.payload.token}
    case ON_MESSAGE:
      const messages = state.messages;
      return  {
        ...state
        , messages:         [action.payload.message, ...messages]
      };
    case ON_READ_MESSAGES:
      let messages_1 = state.messages;
      return  {
        ...state
        , messages:         messages_1
      }
    default: return state;
  }
}

store.injectReducer('messaging', reducer)