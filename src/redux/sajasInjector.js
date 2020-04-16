import { all, cancel } from "@redux-saga/core/effects";

const do_log = false;
// runSaga is middleware.run function
// rootSaga is a your root saga for static saagas
export function createSagaInjector(runSaga, rootSaga) {
    // Create a dictionary to keep track of injected sagas
    const injectedSagas = new Map();

    const isInjected = key => injectedSagas.has(key);

    const injectSaga = (key, sagas = []) => {
        // We won't run saga if it is already injected
        // if (isInjected(key)) return;
        if (isInjected(key)) 
        {
          const _saga = injectedSagas.get(key)
          if(_saga)
          {
            do_log && console.log('SAGA::About To CANCEL:', key, ' ...');
            cancel(_saga);
          }
          do_log && console.log('SAGA::About To Delete:', key, ' ...');
          const deleted = injectedSagas.delete(key);
          do_log && console.log(' SAGA:', key, ' DELETED? -> ', deleted);
        }
        // Sagas return task when they executed, which can be used
        // to cancel them
        const task = runSaga(function*(){ yield all(sagas)});

        do_log && console.log(' .. on saga injected:', key)

        // Save the task if we want to cancel it in the future
        injectedSagas.set(key, task);
    };

    // Inject the root saga as it a staticlly loaded file,
    injectSaga('root', rootSaga);

    return injectSaga;
}