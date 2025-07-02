import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { Components } from 'formiojs';

import { CapacitorCameraFileComponent } from './app/pages/formio -components/helper/capacitor-camera-file/capacitor-camera-file.component';

Components.addComponent('file', CapacitorCameraFileComponent);
if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
