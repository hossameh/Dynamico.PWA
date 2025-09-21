// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.beyti.app',
  appName: 'beytiapp',
  webDir: 'dist/dynamico', 
    server: {
      url: 'https://dynamico.cloud/beytiapp/login',

    //url: 'https://lab7software.com/DynamicoApp/login',
    cleartext: false,           // keep it OFF
    androidScheme: 'https',
    allowNavigation: [
      'lab7software.com',
      'www.lab7software.com',
      'dynamico.cloud',
      'www.dynamico.cloud',
      'api.dynamico.cloud',
      'app-admi.egybell-apps.com',
      'app-internal.egybell-apps.com',
      'app-vacation.dynamico.cloud',
      'admi.egybell-apps.com',
      'internal.egybell-apps.com',
      'vacation.dynamico.cloud',


      
    ]
  }
};
export default config;
