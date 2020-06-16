import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '@app/redux/sagas';

import { coreReducer, coreSagas } from './models/core';

import { createSagaInjector } from './sajasInjector'

// import { firebaseReducer } from 'react-redux-firebase';

const coreReducers = {
  core: coreReducer
}

// Configure the store
export default function configureStore(initialState) {

  // Configure middelwares
  const sagaMiddleware = createSagaMiddleware()
  const createStoreWithMiddleware = composeWithDevTools(
    applyMiddleware(sagaMiddleware)
  )(createStore); 

  //Create store
  const store = createStoreWithMiddleware(createReducer(),  initialState)
  
  // Add a dictionary to keep track of the registered async reducers
  store.asyncReducers = {};
  
  // Create an inject reducer function
  // This function adds the async reducer, and creates a new combined reducer
  store.injectReducer = (key, asyncReducer) => {
    console.log(' .. on reducer injected:', key)
    store.asyncReducers[key] = asyncReducer;
    store.replaceReducer(createReducer(store.asyncReducers));
  };
  
  //Add async sagas loader to the store
  store.injectSaga = createSagaInjector(sagaMiddleware.run, rootSaga);
  
  // Return the modified store
  return store;
}

function createReducer(asyncReducers) {
  return combineReducers({
    ...coreReducers,
    ...asyncReducers
    // firebase: firebaseReducer, 
  });
}

export const store = configureStore({})

//Start redux logic
store.injectSaga('core', coreSagas  )
setTimeout(()=>store.dispatch({type: 'core/BOOT'}), 250); //1000
