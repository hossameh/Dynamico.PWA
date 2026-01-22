export const environment = {
  production: true,
  version: '1.2.63',
  signUpEmail: 'shopper@registration.com',

  /////////////////////////////////////////////////////////////////////////////////////////

  //hostAPI: "https://admi.egybell-apps.com/api/api/",
  //hostAPI: "https://internal.egybell-apps.com/api/api/",

  //hostAPI: "https://lab7software.com/api.dynamico/api/",
  // hostAPI: "https://dynamico.cloud/api.beyti/api/",
  hostAPI: "https://mystro.dynamico.cloud/api/api/",
  //hostAPI: "https://lab7software.com/api.mystro/api/",


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //companyName: 'Internal',
  //companyName: 'Dynamico',
  //companyName: 'ADMI',
  //companyName: 'Internal',
  //companyName: '',
  companyName: '',

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //appTitle: 'Egybell.Internal',
  //appTitle: 'Lab7.Internal',
  appTitle: 'Mystro',
  // appTitle: 'Lab7',
  //appTitle: 'Dynamico',
  //appTitle: 'Mystro',

  //appTitle: 'Egybell.ADMI',

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //companyLogo: 'assets/img/beyti.png',
  // companyLogo:'assets/img/logoNoName.png',
  companyLogo: 'assets/img/MystroLogo2.png',

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  appName: 'PWA',
  //APP_URL: 'https://app-internal.egybell-apps.com/',   // Internal  app-internal.egybell-apps.com pwa admi
  /*  APP_URL: 'https://lab7software.com/DynamicoApp/',*/
  //APP_URL: 'https://app-admi.egybell-apps.com/',   // Internal  app-internal.egybell-apps.com pwa admi
  APP_URL: 'https://app-mystro.dynamico.cloud/',   // Internal  app-internal.egybell-apps.com pwa admi
  //APP_URL: 'https://lab7software.com/mystroApp/',

  //APP_URL: 'https://lab7software.com/DynamicoApp/',
  //  APP_URL: 'https://dynamico.cloud/beytiapp/',
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
  showSaveButton: true,

  firebase: {
    apiKey: "AIzaSyAz-VXCUhh8cytvpEM5OZhD0JnxMsoyGrk",
    authDomain: "qadynamico.firebaseapp.com",
    projectId: "qadynamico",
    storageBucket: "qadynamico.appspot.com",
    messagingSenderId: "678182888011",
    appId: "1:678182888011:web:f9acf48c202a0f8aea63ce",
    vapidKey: "BCgzg0XU9HxJayM2r-b8zsZ1n97KcOfr6YDXBhP9F01IXLwVgdBq1QMZgR6ITWtQWpUONpMmIadYOUDKcWnu9tc",
  },
  friendlyErrorMessage: 'Something Went Wrong !',
  redirectUrl: '', // admi - internal
  //redirectUrl: '/login',

  //redirectUrl:'/beytiapp/login',
  //  redirectUrl:'/DynamicoApp/login',
  //redirectUrl:'/mystroApp/login',

  //apiEndpoint: 'https://dynamico.cloud/api.beyti/api/ChecklistRecords/SaveChecklistRecord',
  //apiEndpoint: 'https://lab7software.com/api.dynamico/api/ChecklistRecords/SaveChecklistRecord',
  //apiEndpoint: 'https://dynamico.cloud/api.beyti/api/ChecklistRecords/SaveChecklistRecord',
  //apiEndpoint: 'https://dynamico.cloud/api.beyti/api/ChecklistRecords/SaveChecklistRecord',
  apiEndpoint: 'https://mystro.dynamico.cloud/api/api/ChecklistRecords/SaveChecklistRecord',

  locationLogger: {
    timer: 5 * 60 * 1000, // 15 minutes in milliseconds
    dayStart: '08:00',
    dayEnd: '18:00',
    activateLocationLogger: false,
    formId: 26,
  },

  //mystroProd
  mystroGuestLoginBaseUrl: 'https://app-mystro.dynamico.cloud/GuestLogin',
  mystroGuestLoginCode: '51b5c671-7514-40c0-b6f2-20e240bc0fad'

  //mystroLab7]
  //mystroGuestLoginBaseUrl: 'https://lab7software.com/mystroApp/GuestLogin',
  //mystroGuestLoginCode: '40055ac4-dad9-4cb7-9660-86e85c6bcaca'
};


