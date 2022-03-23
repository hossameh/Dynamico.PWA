import { Component, OnInit } from '@angular/core';
import { FormioEditorOptions } from '@davebaol/angular-formio-editor';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss']
})
export class ChecklistComponent implements OnInit {



  form: any;
  options: FormioEditorOptions;

  constructor() {
    this.form = {
      "display": "form",
      "components": [
        {
          "type": "panel",
          "label": "Panel",
          "title": "Page 1",
          "key": "panel",
          "theme": "default",
          "input": false,
          "placeholder": "",
          "prefix": "",
          "customClass": "",
          "suffix": "",
          "multiple": false,
          "defaultValue": null,
          "protected": false,
          "unique": false,
          "persistent": false,
          "hidden": false,
          "clearOnHide": false,
          "refreshOn": "",
          "redrawOn": "",
          "tableView": false,
          "modalEdit": false,
          "labelPosition": "top",
          "description": "",
          "errorLabel": "",
          "tooltip": "",
          "hideLabel": false,
          "tabindex": "",
          "disabled": false,
          "autofocus": false,
          "dbIndex": false,
          "customDefaultValue": "",
          "calculateValue": "",
          "widget": null,
          "attributes": {},
          "validateOn": "change",
          "validate": {
            "required": false,
            "custom": "",
            "customPrivate": false,
            "strictDateValidation": false,
            "multiple": false,
            "unique": false
          },
          "conditional": {
            "show": null,
            "when": null,
            "eq": "",
            "json": ""
          },
          "overlay": {
            "style": "",
            "left": "",
            "top": "",
            "width": "",
            "height": "",
            "page": ""
          },
          "allowCalculateOverride": false,
          "encrypted": false,
          "showCharCount": false,
          "showWordCount": false,
          "properties": {},
          "allowMultipleMasks": false,
          "tree": false,
          "breadcrumb": "default",
          "components": [
            {
              "input": true,
              "key": "firstName",
              "placeholder": "",
              "prefix": "",
              "customClass": "",
              "suffix": "",
              "multiple": false,
              "defaultValue": "",
              "protected": false,
              "unique": false,
              "persistent": true,
              "hidden": false,
              "clearOnHide": true,
              "refreshOn": "",
              "redrawOn": "",
              "tableView": true,
              "modalEdit": false,
              "label": "First name",
              "labelPosition": "top",
              "description": "",
              "errorLabel": "",
              "tooltip": "",
              "hideLabel": false,
              "tabindex": "",
              "disabled": false,
              "autofocus": false,
              "dbIndex": false,
              "customDefaultValue": "",
              "calculateValue": "",
              "widget": {
                "type": "input"
              },
              "attributes": {},
              "validateOn": "change",
              "validate": {
                "required": false,
                "custom": "",
                "customPrivate": false,
                "strictDateValidation": false,
                "multiple": false,
                "unique": false,
                "minLength": "",
                "maxLength": "",
                "pattern": "",
                "customMessage": "",
                "json": ""
              },
              "conditional": {
                "show": null,
                "when": null,
                "eq": "",
                "json": ""
              },
              "overlay": {
                "style": "",
                "left": "",
                "top": "",
                "width": "",
                "height": "",
                "page": ""
              },
              "allowCalculateOverride": false,
              "encrypted": false,
              "showCharCount": false,
              "showWordCount": false,
              "properties": {},
              "allowMultipleMasks": false,
              "type": "textfield",
              "mask": false,
              "inputType": "text",
              "inputFormat": "plain",
              "inputMask": "",
              "id": "e1z95vn",
              "spellcheck": true,
              "case": "",
              "calculateServer": false,
              "tags": [],
              "customConditional": "",
              "logic": []
            }
          ],
          "id": "e8dmzgg",
          "collapsible": false,
          "tags": [],
          "customConditional": "",
          "logic": [],
          "breadcrumbClickable": true,
          "buttonSettings": {
            "previous": true,
            "cancel": true,
            "next": true
          },
          "nextPage": ""
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "size": "md",
          "block": false,
          "action": "submit",
          "disableOnInvalid": true,
          "theme": "primary",
          "input": true,
          "placeholder": "",
          "prefix": "",
          "customClass": "",
          "suffix": "",
          "multiple": false,
          "defaultValue": null,
          "protected": false,
          "unique": false,
          "persistent": false,
          "hidden": false,
          "clearOnHide": true,
          "refreshOn": "",
          "redrawOn": "",
          "tableView": false,
          "modalEdit": false,
          "labelPosition": "top",
          "description": "",
          "errorLabel": "",
          "tooltip": "",
          "hideLabel": false,
          "tabindex": "",
          "disabled": false,
          "autofocus": false,
          "dbIndex": false,
          "customDefaultValue": "",
          "calculateValue": "",
          "widget": {
            "type": "input"
          },
          "attributes": {},
          "validateOn": "change",
          "validate": {
            "required": false,
            "custom": "",
            "customPrivate": false,
            "strictDateValidation": false,
            "multiple": false,
            "unique": false
          },
          "conditional": {
            "show": null,
            "when": null,
            "eq": ""
          },
          "overlay": {
            "style": "",
            "left": "",
            "top": "",
            "width": "",
            "height": ""
          },
          "allowCalculateOverride": false,
          "encrypted": false,
          "showCharCount": false,
          "showWordCount": false,
          "properties": {},
          "allowMultipleMasks": false,
          "leftIcon": "",
          "rightIcon": "",
          "dataGridLabel": true,
          "id": "eirhzrm"
        }
      ]
    }
    this.options = {
      builder: {
        hideTab: true,
        hideDisplaySelect: true,

      },
      json: {
        hideTab: true,
        changePanelLocations: ['top', 'bottom'],
        input: {

        },
    
      },
      renderer: {
        defaultTab: true,
        submissionPanel: {
          disabled: true,
          // Whether to initially show full or partial submission. Default to false.
          fullSubmission: false,
          // The json editor of the submitted resource.
          resourceJsonEditor: {

            input: {
              
            },
            output: {
             
            }
          },
          schemaJsonEditor: {
            // Whether to show or not the schema json editor. Defaults to false.
            enabled: false,
            // Input and output arguments of this component <json-editor>.
            // See options.json.input and options.json.output above.
            input: {},
            output: {}
          }
        },
        output: {
          submit: (event) => { console.log(event) },
        },
        input: {
          //submission: {
          //  data: {
          //    fullName: "mano",
          //    emailAddress: "supddder@admin.com",
          //    password: "a123123",
          //    confirmPassword: "asdddd",
          //    submit: true
          //  }
          //},
          //readOnly: true,
        
     
        }
      }
    };
  }
  ngOnInit(): void {
  }
}
