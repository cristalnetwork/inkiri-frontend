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

// import demo_messages from './messaging.demo';
const demo_messages = undefined;
const do_log = false;

export const SET_REGISTRATION_TOKEN = 'messaging/SET_REGISTRATION_TOKEN';
export const ON_MESSAGE             = 'messaging/ON_MESSAGE';
export const ON_READ_MESSAGE        = 'messaging/ON_READ_MESSAGE';
export const ON_READ_MESSAGES       = 'messaging/ON_READ_MESSAGES';
export const REGISTER_IF_NOT        = 'messaging/REGISTER_IF_NOT';
export const ON_SHOWN_MESSAGES      = 'messaging/ON_SHOWN_MESSAGES';
export const ON_CLEAR_MESSAGES      = 'messaging/ON_CLEAR_MESSAGES';

export const setRegistrationToken = (token)        => ({type: SET_REGISTRATION_TOKEN, payload: {token} });
export const onReadMessage        = (_id)          => ({type: ON_READ_MESSAGE, payload: {_id} });
export const clearMessages        = (_id_array)    => ({type: ON_CLEAR_MESSAGES, payload: {_id_array} });
export const registerIfNot        = ()             => ({type: REGISTER_IF_NOT} );
export const onReadMessages       = ()             => ({type: ON_READ_MESSAGES} );
export const onShownMessages      = ()             => ({type: ON_SHOWN_MESSAGES} );

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
  // do_log && console.log('PUSH-NOTIFICATION::readMessagesSaga:#1')
  // do_log && console.log('PUSH-NOTIFICATION::readMessagesSaga:#3')
  // do_log && console.log('PUSH-NOTIFICATION::readMessagesSaga:END:')
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
    , takeEvery(ON_READ_MESSAGES, readMessagesSaga)
  ]);
  do_log && console.log('PUSH-NOTIFICATION::messages listener REGISTERED!')
}

/*
  Message structure:
  {
    message : {
      data:{
        account_name: "dargonarbizz"
        , amount: "8"
        , body: "type_payment@state_requested by atomakinnaka to dargonarbizz. Amount: 8.00. "
        , message: "type_payment@state_requested by atomakinnaka to dargonarbizz. Amount: 8.00. "
        , request_counter_id: "4041"
        , title: "New TRANSITION_NEW_REQUEST"
      }    
  }}
*/
function* messageHandlerSaga(message) {
  // console.log(" ============================ onMessage", JSON.stringify(message.data))
  yield put({type: ON_MESSAGE, payload: {message : { shown:false, read:false, message:message, mode: 'auto'}}})
}


// function* OLDmessageHandlerSaga() {
//   const messageChannel = rsf.messaging.channel()

//   yield takeEvery(messageChannel, function*(message) {
//     console.log("You've got mail!", message)
//   })
// }



function* initMessaging () {
  const { registrationToken } = store.getState().messaging;
  if(registrationToken)
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
  , takeEvery(ON_READ_MESSAGES, readMessagesSaga)
  
]);

// Selectores - Conocen el stado y retornan la info que es necesaria
export const token     = (state) => state.messaging.registrationToken ;
export const messages  = (state) => state.messaging.messages ;


// El reducer del modelo
const defaultState = {
    registrationToken:  null,
    messages:           demo_messages||[]
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
    case ON_SHOWN_MESSAGES:
      let shown_messages = state.messages.map(msg=>{msg.shown=true;return msg;});
      return  {
        ...state
        , messages:         shown_messages
      }
    case ON_CLEAR_MESSAGES:
      // let cleared_messages = state.messages.splice(action.payload.index, action.payload.count);
      let cleared_messages = state.messages.filter(msg=>!action.payload._id_array.includes(msg.message._id));
      return  {
        ...state
        , messages:         cleared_messages
      }
    case ON_READ_MESSAGE: 
      let read_messages1 = state.messages.map(msg=>{if(msg.message._id==action.payload._id)msg.read=true;return msg;}); 
      return  {
        ...state
        , messages:         read_messages1
      }
    case ON_READ_MESSAGES:
      let read_messages = state.messages.map(msg=>{msg.read=true;return msg;});
      return  {
        ...state
        , messages:         read_messages
      }
    default: return state;
  }
}

store.injectReducer('messaging', reducer)