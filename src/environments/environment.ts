// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  version:'1.2.2',
  //hostAPI: "https://localhost:44392/api/",
  hostAPI: "https://qa-farm.tensorforms.com/api.dynamico/api/",
  //hostAPI:"http://5.189.153.30/api.dynamico/api/"

  appName: 'PWA',
  APP_URL: 'https://qa-farm.tensorforms.com/DynamicoApp/',

  firebase: {
    apiKey: "AIzaSyAz-VXCUhh8cytvpEM5OZhD0JnxMsoyGrk",
    authDomain: "qadynamico.firebaseapp.com",
    projectId: "qadynamico",
    storageBucket: "qadynamico.appspot.com",
    messagingSenderId: "678182888011",
    appId: "1:678182888011:web:f9acf48c202a0f8aea63ce",
    vapidKey: "BCgzg0XU9HxJayM2r-b8zsZ1n97KcOfr6YDXBhP9F01IXLwVgdBq1QMZgR6ITWtQWpUONpMmIadYOUDKcWnu9tc",
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
