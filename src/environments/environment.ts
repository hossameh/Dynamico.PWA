// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  version: '1.2.1',
  hostAPI: "https://qa-farm.tensorforms.com/api.dynamico/api/",
  //hostAPI:"http://5.189.153.30/api.dynamico/api/"

  appName: 'PWA',

  firebase: {
    apiKey: "AIzaSyBy3U-CpZ8_Wad19d3dU7dQskBxiBzWd3I",
    authDomain: "qafarmadmin.firebaseapp.com",
    projectId: "qafarmadmin",
    storageBucket: "qafarmadmin.appspot.com",
    messagingSenderId: "32296479187",
    appId: "1:32296479187:web:7d18ce442a7a47c74b6726",
    measurementId: "G-PBNG4MSG6E",
    vapidKey: "BEd-j1ujDH0tT3uNSs1bFtic81AEi3cnyh9QBLf8GE5clCbZGxCKgoQG3gHA8357KEFRXHtHQ-NHdjPllyH-lAA",
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
