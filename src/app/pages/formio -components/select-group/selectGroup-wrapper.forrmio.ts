import { Injector } from '@angular/core';
import { Components, Formio, FormioCustomComponentInfo, registerCustomFormioComponent } from 'angular-formio';
import { SelectGroupComponent } from './select-group.component';

import { selectGroupFormEdit } from './selectGroupEditForm';



const COMPONENT_OPTIONS: FormioCustomComponentInfo = {
  type: 'selectGroup', // custom type. Formio will identify the field with this type.
  selector: 'select-group', // custom selector. Angular Elements will create a custom html tag with this selector
  title: 'Select Group', // Title of the component
  group: 'basic', // Build Group
  icon: 'th-list', // Icon
  fieldOptions: ['items', 'itemsGroupProperty', 'data'], // Optional: explicit field options to get as `Input` from the schema (may edited by the editForm)
  editForm: () => {
    return {
      components: selectGroupFormEdit
    }
  }
};

export function registerSelectGroupComponent(injector: Injector) {

  // const editForm = Components.components.selectboxes.editForm();
  // console.log(editForm)

  registerCustomFormioComponent(COMPONENT_OPTIONS, SelectGroupComponent, injector);
}


