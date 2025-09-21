export const environment = {
  production: true,
  version: '1.2.61',

  /////////////////////////////////////////////////////////////////////////////////////////

  //hostAPI: "https://admi.egybell-apps.com/api/api/",
   //hostAPI: "https://internal.egybell-apps.com/api/api/",

  //hostAPI: "https://lab7software.com/api.dynamico/api/",
   hostAPI: "https://dynamico.cloud/api.beyti/api/",
 
  //hostAPI: "https://vacation.dynamico.cloud/api/",

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //companyName: 'Internal',
  //companyName: 'Dynamico',
  //companyName: 'ADMI',
  //companyName: 'Internal',
  companyName: '',

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //appTitle: 'Egybell.Internal',
  //appTitle: 'Lab7.Internal',
  appTitle: 'Beyti',
  // appTitle: 'Lab7',
  // appTitle: 'Vacation',
  //appTitle: 'Mystro',

  //appTitle: 'Egybell.ADMI',

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

 companyLogo: 'assets/img/beyti.png',
  // companyLogo:'assets/img/logoNoName.png',
  //companyLogo: 'assets/img/MystroLogo2.png',

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  appName: 'PWA',
  //APP_URL: 'https://app-internal.egybell-apps.com/',   // Internal  app-internal.egybell-apps.com pwa admi
  //APP_URL: 'https://lab7software.com/DynamicoApp/',
  //APP_URL: 'https://app-admi.egybell-apps.com/',   // Internal  app-internal.egybell-apps.com pwa admi

  //APP_URL: 'https://lab7software.com/DynamicoApp/',
  APP_URL: 'https://dynamico.cloud/beytiapp/',
  //APP_URL: 'https://app-vacation.dynamico.cloud/',

 // APP_URL: 'https://www.lab7software.com/DynamicoApp/',
 


  /////////////////////////////////////////////////////////////////////////////////////////

/*   firebase: {
    apiKey: "AIzaSyD3opHG18VdZ1OYGJZICGRMAK5B6OVDQIs",
    authDomain: "dynamicocloud.firebaseapp.com",
    projectId: "dynamicocloud",
    storageBucket: "dynamicocloud.appspot.com",
    messagingSenderId: "178261450313",
    appId: "1:178261450313:web:ddbd34310fe88d688f6998",
    measurementId: "G-H0NER3WF13",
    vapidKey: "BKTm9vxTjCIbTS1mfN-EPmFaOpA8GrpbjcX6fa0a0v_QRy0bkIaTkSowq5IVD5a1gS3sy7M2hvnrxKc1xlTY4JM"
  }, */
  showSaveButton  : true,

  firebase: {
    apiKey: "AIzaSyAz-VXCUhh8cytvpEM5OZhD0JnxMsoyGrk",
    authDomain: "qadynamico.firebaseapp.com",
    projectId: "qadynamico",
    storageBucket: "qadynamico.appspot.com",
    messagingSenderId: "678182888011",
    appId: "1:678182888011:web:f9acf48c202a0f8aea63ce",
    vapidKey: "BCgzg0XU9HxJayM2r-b8zsZ1n97KcOfr6YDXBhP9F01IXLwVgdBq1QMZgR6ITWtQWpUONpMmIadYOUDKcWnu9tc",
  },
  friendlyErrorMessage:'Something Went Wrong !',
  //redirectUrl: '', // admi - internal
  //redirectUrl: '/login',

  redirectUrl:'/beytiapp/login',
  //  redirectUrl:'/DynamicoApp/login',
  //redirectUrl:'/mystroApp/login',

  apiEndpoint: 'https://dynamico.cloud/api.beyti/api/ChecklistRecords/SaveChecklistRecord',
  //apiEndpoint: 'https://lab7software.com/api.dynamico/api/ChecklistRecords/SaveChecklistRecord',

  locationLogger: {
    timer: 5 * 60 * 1000, // 15 minutes in milliseconds
    dayStart: '08:00',
    dayEnd: '18:00',
    activateLocationLogger: true,
    formId: 26,
  }
};


