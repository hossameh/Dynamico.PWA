import { Injector } from '@angular/core';
import { FormioCustomComponentInfo, registerCustomFormioComponent } from 'angular-formio';
import { CaptureComponent } from './capture.component';
import { captureEditForm } from './captureEditForm';

const COMPONENT_OPTIONS: FormioCustomComponentInfo = {
  type: 'capture',                  // unique type key stored in form JSON
  selector: 'my-capture',           // custom element tag created by Angular Elements
  title: 'Capture',                 // label shown in the form builder panel
  group: 'advanced',               // builder group
  icon: 'camera',                   // FontAwesome icon name (without "fa-")
  // Tell Form.io this field always stores an array (same contract as the File component).
  // `multiple: true`              → value is an array
  // `disableMultiValueWrapper: true` → the Angular component manages the array internally;
  //   Form.io must NOT split it into separate per-item inputs (which would re-trigger
  //   the "must not be an array" validation on each individual element).
  schema: {
    multiple: true,
    disableMultiValueWrapper: true,
  },
  fieldOptions: [
    'key',              // needed for the module-level image cache lookup
    'storage',
    'url',
    'dir',
    'fileNameTemplate',
    'multiple',
    'maxSize',
    'fileMinSize',
    'fileMaxSize',
    'filePattern',
    'image',
    'imageSize',
    'showWatermark',
    'watermarkPosition',
    'showLocationWatermark',
    'locationWatermarkPosition',
  ],
  editForm: () => ({
    components: captureEditForm,
  }),
};

export function registerCaptureComponent(injector: Injector) {
  registerCustomFormioComponent(COMPONENT_OPTIONS, CaptureComponent, injector);
}
