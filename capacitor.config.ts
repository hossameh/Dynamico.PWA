import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.beyti.app',
  appName: 'beytiapp',
  webDir: 'dist/dynamico',
  "server": {
    cleartext:true,// just for test
    "androidScheme": "https",
/*      "url": "https://dynamico.cloud/beytiapp/login"  */
    "url": "https://lab7software.com/DynamicoApp/login"
  }
};

export default config;
