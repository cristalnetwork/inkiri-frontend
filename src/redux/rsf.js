import firebase from 'firebase'
import '@firebase/messaging' // 👈 If you're using firestore
import ReduxSagaFirebase from 'redux-saga-firebase'
import * as globalCfg from '@app/configs/global';

const myFirebaseApp = firebase.initializeApp(globalCfg.firebase)
 
const rsf = new ReduxSagaFirebase(myFirebaseApp)

export default rsf


