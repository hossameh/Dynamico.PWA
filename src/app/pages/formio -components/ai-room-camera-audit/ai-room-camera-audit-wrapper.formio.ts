import { Injector } from '@angular/core';
import { FormioCustomComponentInfo, registerCustomFormioComponentWithClass } from 'angular-formio';
import { createCustomFormioComponent } from 'angular-formio/custom-component/create-custom-component';
import { AiRoomCameraAuditComponent } from './ai-room-camera-audit.component';
import { aiRoomCameraAuditEditForm } from './ai-room-camera-audit-edit-form';

const COMPONENT_OPTIONS: FormioCustomComponentInfo = {
  type: 'aiRoomCameraAudit',
  selector: 'my-ai-room-camera-audit',
  title: 'AI Room Camera Audit',
  group: 'advanced',
  icon: 'video-camera',
  emptyValue: [],
  schema: {
    multiple: true,
    disableMultiValueWrapper: true
  },
  fieldOptions: [
    'key',
    'auditEndpoint',
    'roomsEndpoint',
    'roomFloorKey',
    'roomNumberKey',
    'roomTypeKey',
    'roomActiveKey',
    'roomAuditObjectsKey',
    'confidenceThreshold',
    'stableFramesRequired',
    'cooldownSecondsPerArea',
    'globalMinSecondsBetweenAuditCalls',
    'maxAuditsPerSession',
    'autoCapture',
    'showBoundingBoxes',
    'showAuditOverlay',
    'detectableAreas',
    'cameraWidth',
    'cameraHeight',
    'cameraZoom'
  ],
  editForm: () => ({
    components: aiRoomCameraAuditEditForm
  })
};

const BaseClass = createCustomFormioComponent(COMPONENT_OPTIONS);







export class AiRoomCameraAuditFormioComponent extends BaseClass {
  constructor(component: any, options: any, data: any) {
    super(component, options, data);
    if (component) {
      component.multiple = true;
      component.disableMultiValueWrapper = true;
    }
  }

  override attach(element: any) {
    // Find the custom Angular Element
    const outerEl = element ? element.querySelector('my-ai-room-camera-audit') : null;
    if (outerEl) {
      // Check whether an inner bootstrapped Angular Element already exists.
      // The base class (create-custom-component) appends a NEW <my-ai-room-camera-audit> child
      // inside the outer element when it cannot find ng-version on the outer element.
      // On subsequent attach() calls (e.g. after mat-tab destroy/recreate cycles) we must
      // NOT destroy the already-bootstrapped component, otherwise the preview frame disappears.
      const bootstrapped = outerEl.querySelector('my-ai-room-camera-audit[ng-version]');
      if (bootstrapped && bootstrapped.getAttribute('ng-version')) {
        // Preserve the existing Angular component — mirror ng-version onto the outer element
        // so the base class skips its new-element-creation branch and only rebinds options.
        outerEl.setAttribute('ng-version', bootstrapped.getAttribute('ng-version'));
      } else {
        // First render, or stale element with no bootstrapped child — clear children and
        // let the base class bootstrap a fresh Angular Element.
        outerEl.removeAttribute('ng-version');
        while (outerEl.firstChild) {
          outerEl.removeChild(outerEl.firstChild);
        }
      }
    }
    return super.attach(element);
  }
}

export function registerAiRoomCameraAuditComponent(injector: Injector): void {
  registerCustomFormioComponentWithClass(
    COMPONENT_OPTIONS,
    AiRoomCameraAuditComponent,
    AiRoomCameraAuditFormioComponent,
    injector
  );
}
