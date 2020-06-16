// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.14.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/7.14.0/firebase-messaging.js')
// importScripts('https://www.gstatic.com/firebasejs/7.14.0/analytics.js')

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// firebase.initializeApp({
//   messagingSenderId: '953654846878'
// })

firebaseConfig = {
  apiKey: "AIzaSyDTc_r8rfooRQMZrcgEIdGQEbXYyJoG11s",
  authDomain: "cristalnetwork-a4720.firebaseapp.com",
  databaseURL: "https://cristalnetwork-a4720.firebaseio.com",
  projectId: "cristalnetwork-a4720",
  storageBucket: "cristalnetwork-a4720.appspot.com",
  messagingSenderId: "953654846878",
  appId: "1:953654846878:web:b4b5946dcfea3750ef628f",
  measurementId: "G-HVBRMHZBDV"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.usePublicVapidKey('BL5yhFPcmYQmRmeagmGUycnk5HrY-QvBr7AevdKeD52XU110KGpxSQlaD5qs5x6vfZdpPSrKKcKasPZ1RLTP61A');

// messaging.onMessage((payload) => {
//   console.log('Message received. ', payload);
// });