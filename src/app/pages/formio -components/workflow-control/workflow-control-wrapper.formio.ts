import { Injector } from '@angular/core';
import {  FormioCustomComponentInfo, registerCustomFormioComponent } from 'angular-formio';

import { WorkflowControlComponent } from './workflow-control.component';


import { workflowControlFormEdit } from './workflow-controlEditForm';



const COMPONENT_OPTIONS: FormioCustomComponentInfo = {
  type: 'workflowStage', // custom type. Formio will identify the field with this type.
  selector: 'my-workflow-stage', // custom selector. Angular Elements will create a custom html tag with this selector
  title: 'Workflow ', // Title of the component
  group: 'advanced', // Build Group
  icon: 'road', // Icon
  fieldOptions: ['workflow', 'stagesConfig'],
  schema: {
    "hidden":true
    },
  // Optional: explicit field options to get as `Input` from the schema (may edited by the editForm)
  editForm: () => {
    return {
      components: workflowControlFormEdit
    }
  }
};

export function registerWorkflowControlComponent(injector: Injector) {

  registerCustomFormioComponent(COMPONENT_OPTIONS, WorkflowControlComponent, injector);
}


