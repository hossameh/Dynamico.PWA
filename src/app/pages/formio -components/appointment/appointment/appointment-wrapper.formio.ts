import { Injector } from '@angular/core';
import {  FormioCustomComponentInfo, registerCustomFormioComponent } from 'angular-formio';
import { AppointmentComponent } from './appointment.component';

import { appointmentEditForm } from './appointmentEditForm';



const COMPONENT_OPTIONS: FormioCustomComponentInfo = {
  type: 'appointment', // custom type. Formio will identify the field with this type.
  selector: 'my-appointment', // custom selector. Angular Elements will create a custom html tag with this selector
  title: 'Appointment', // Title of the component
  group: 'advanced', // Build Group
  icon: 'calendar-check-o', // Icon
  fieldOptions: [
    'slotDuration',
    'customSlotDuration',
    'intervals',
    'lunchTime',
    'lunchTimeDuration', // table container key not handle in appointment component
    'lunchTimeFrom',
    'lunchTimeTo',
    'startDate',
    'endDate',
    'displayedValue',
    'vacations',
    'popupView'
  ],
  editForm: () => {
    return {
      components: appointmentEditForm
    }
  }
  
};

export function registerAppointmentComponent(injector: Injector) {


  registerCustomFormioComponent(COMPONENT_OPTIONS, AppointmentComponent, injector);
}


