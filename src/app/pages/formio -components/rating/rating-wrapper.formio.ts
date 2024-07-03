import { Injector } from '@angular/core';
import {  Components, Formio, FormioCustomComponentInfo, registerCustomFormioComponent } from 'angular-formio';
import { RatingWrapperComponent } from './rating-wrapper.component';

import { rateFormEdit } from './rateEditForm';



const COMPONENT_OPTIONS: FormioCustomComponentInfo = {
  type: 'rate', // custom type. Formio will identify the field with this type.
  selector: 'my-rating', // custom selector. Angular Elements will create a custom html tag with this selector
  title: 'Rating', // Title of the component
  group: 'basic', // Build Group
  icon: 'signal', // Icon
  fieldOptions: ['rateLimit', 'fillColor', 'iconSize', 'rateIcon' ,'customRateIcon' , 'customFillColor'], // Optional: explicit field options to get as `Input` from the schema (may edited by the editForm)
  editForm: () => {
    return {
      components: rateFormEdit
    }
  }
};

export function registerRatingComponent(injector: Injector) {

  //const editForm = Components.components.select.editForm();
  //console.log(editForm)
  
  registerCustomFormioComponent(COMPONENT_OPTIONS, RatingWrapperComponent, injector);
}


