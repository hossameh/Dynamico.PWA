



export const workflowControlFormEdit = [
  {

    "type": "tabs",
    "key": "tabs",
    "components": [
      {
        "key": "display",
        "components": [
          {
            "weight": 1,
            "label": "Workflow",
            "dataSrc": "url",
            "data": {
              "values": [
                {
                  "label": "",
                  "value": ""
                }
              ],
              "resource": "",
              "json": "",
              "url": ``,
              "headers": [
                {
                  "key": "",
                  "value": ""
                }
              ],
              "custom": ""
            },
            "dataType": "",
            "idPath": "",
            "valueProperty": "",
            "limit": 100,
            "template": "<span>{{ item.workflowName }}</span>",
            "clearOnRefresh": false,
            "searchEnabled": true,
            "selectThreshold": 0.3,
            "useExactSearch": false,
            "persistent": true,
            "protected": false,
            "dbIndex": false,
            "encrypted": false,
            "validateOn": "change",
            "validate": {
              "required": true,
            },
            "key": "workflow",
            "tags": [],
            "type": "select",
            "indexeddb": {
              "filter": {}
            },
            "lazyLoad": true,
            "selectValues": "",
            "selectFields": "",
            "disableLimit": false,
            "searchField": "",
            "searchDebounce": 0.3,
            "minSearch": 0,
            "filter": "",
            "authenticate": false,
            "ignoreCache": true,
            "redrawOn": "",
            "input": true,
            "fuseOptions": {
              "include": "score",
              "threshold": 0.3
            },
            "defaultValue": {},
            "sort": "",
           

          },
          {
            "label": "Data Grid",
            "weight": 1,
            "hideLabel": true,
            "addAnotherPosition": "bottom",
            "addAnother": " ",
            "defaultValue": [
              {
                "stage": null,
                "userRole": 1,
                "userId": null,
                "role": null
              }
            ],
            "key": "stagesConfig",
            "type": "datagrid",
            "input": true,
            "layoutFixed":false,
            "components": [
              {
                "label": "firstColumn",
                "columns": [
                  {
                    "components": [
                      {
                        "label": "Stage",
                        "tableView": true,
                        "dataSrc": "custom",
                        "data": {
                          "values": [
                            {
                              "label": "",
                              "value": ""
                            }
                          ],
                          "resource": "",
                          "json": "",
                          "url": "",
                          "custom": "values = data.workflow?.workflowStages"
                        },
                        "dataType": "",
                        "idPath": "id",
                        "valueProperty": "workflowStageName",
                        "limit": 100,
                        "template": "<span>{{ item.workflowStageName }}</span>",
                        "refreshOn": "workflow",
                        "refreshOnBlur": "",
                        "clearOnRefresh": true,
                        "searchEnabled": true,
                        "selectThreshold": 0.3,
                        "readOnlyValue": false,
                        "customOptions": {},
                        "useExactSearch": false,
                        "persistent": true,
                        "protected": false,
                        "dbIndex": false,
                        "encrypted": false,
                        "clearOnHide": true,
                        "validateOn": "change",
                        "validate": {
                          "required": true,
                          "onlyAvailableItems": false,
                          "customMessage": "",
                          "custom": "",
                          "customPrivate": false,
                          "json": "",
                          "strictDateValidation": false,
                          "multiple": false,
                          "unique": false
                        },
                        "unique": false,
                        "key": "stage",
                        "tags": [],
                        "properties": {},
                        "logic": [],
                        "attributes": {},
                        "type": "select",
                        "indexeddb": {
                          "filter": {}
                        },
                        "selectFields": "",
                        "searchField": "",
                        "searchDebounce": 0.3,
                        "minSearch": 0,
                        "filter": "",
                        "redrawOn": "",
                        "input": true,
                        "showCharCount": false,
                        "showWordCount": false,
                        "allowMultipleMasks": false,
                        "addons": [],
                        "lazyLoad": true,
                        "authenticate": false,
                        "ignoreCache": false,
                        "fuseOptions": {
                          "include": "score",
                          "threshold": 0.3
                        },
                        "defaultValue": {}
                      },
                      {
                        "label": "User/Role",
                        "optionsLabelPosition": "right",
                        "inline": true,
                        "tableView": false,
                        "values": [
                          {
                            "label": "User",
                            "value": "1",
                            "shortcut": ""
                          },
                          {
                            "label": "Role",
                            "value": "2",
                            "shortcut": ""
                          }
                        ],
                        "key": "userRole",
                        "type": "radio",
                        "input": true,
                        "defaultValue": 1,
                        "multiple": false,
                        "protected": false,
                        "unique": false,
                        "persistent": true,
                        "hidden": false,
                        "clearOnHide": true,
                        "dataGridLabel": false,
                        "labelPosition": "top",
                        "hideLabel": false,
                        "tabindex": "",
                        "disabled": false,
                        "autofocus": false,
                        "dbIndex": false,
                        "customDefaultValue": "",
                        "calculateValue": "",
                        "calculateServer": false,
                        "widget": null,
                        "attributes": {},
                        "validateOn": "change",
                        "allowCalculateOverride": false,
                        "encrypted": false,
                        "properties": {},
                        "addons": [],
                        "inputType": "radio",
                        "fieldSet": false
                      },
                    ],
                    "width": 12,
                    "offset": 0,
                    "push": 0,
                    "pull": 0,
                    "size": "md",
                    "currentWidth": 12
                  },
                  {
                    "components": [],
                    "width": 6,
                    "offset": 0,
                    "push": 0,
                    "pull": 0,
                    "size": "md",
                    "currentWidth": 6
                  }
                ],
                "hideLabel": true,
                "dataGridLabel": false,
                "key": "stageColumn",
                "logic": [],
                "attributes": {},
                "type": "columns",
                "input": false,
                "tableView": false,
                "protected": false,
                "unique": false,
                "persistent": false,
                "clearOnHide": false,
                "refreshOn": "",
                "redrawOn": "",
                "labelPosition": "top",
                "tabindex": "",
                "disabled": false,
                "autofocus": false,
                "dbIndex": false,
                "widget": null,
                "validateOn": "change",
                "encrypted": false,
                "addons": [],
                "tree": false,
                "lazyLoad": false,
              },
              {
                "label": "secondColumn",
                "columns": [
                  {
                    "components": [
                      {
                        "label": "User",
                        "labelPosition": "top",
                        "widget": "choicesjs",
                        "dataGridLabel": false,
                        "tableView": true,
                        "dataSrc": "url",
                        "data": {
                          "values": [
                            {
                              "label": "",
                              "value": ""
                            }
                          ],
                          "resource": "",
                          "json": "",
                          "url": ``,
                          "headers": [
                            {
                              "key": "",
                              "value": ""
                            }
                          ],
                          "custom": ""
                        },
                        "dataType": "",
                        "idPath": "id",
                        "valueProperty": "userId",
                        "limit": 100,
                        "template": "<span>{{ item.user.fullName }}</span>",
                        "refreshOn": "",
                        "refreshOnBlur": "",
                        "clearOnRefresh": false,
                        "searchEnabled": true,
                        "selectThreshold": 0.3,
                        "readOnlyValue": false,
                        "customOptions": {},
                        "useExactSearch": false,
                        "persistent": true,
                        "protected": false,
                        "dbIndex": false,
                        "encrypted": false,
                        "clearOnHide": true,
                        "validateOn": "change",
                        "unique": false,
                        "key": "userId",
                        "tags": [],
                        "properties": {},
                        "conditional": {
                          "show": null,
                          "when": null,
                          "eq": "",
                          "json": ""
                        },
                        "customConditional": "show = row.userRole == 1 ;",
                        "logic": [],
                        "attributes": {},
                        "type": "select",
                        "indexeddb": {
                          "filter": {}
                        },
                        "lazyLoad": true,
                        "selectValues": "data.list",
                        "selectFields": "",
                        "disableLimit": false,
                        "searchField": "",
                        "searchDebounce": 0.3,
                        "minSearch": 0,
                        "filter": "",
                        "authenticate": false,
                        "ignoreCache": true,
                        "redrawOn": "",
                        "input": true,
                        "addons": [],
                        "fuseOptions": {
                          "include": "score",
                          "threshold": 0.3
                        },
                        "sort": ""
                      },
                      {
                        "label": "Role",
                        "labelPosition": "top",
                        "widget": "choicesjs",
                        "dataGridLabel": false,
                        "tableView": true,
                        "dataSrc": "url",
                        "data": {
                          "values": [
                            {
                              "label": "",
                              "value": ""
                            }
                          ],
                          "resource": "",
                          "json": "",
                          "url": ``,
                          "headers": [
                            {
                              "key": "",
                              "value": ""
                            }
                          ],
                          "custom": ""
                        },
                        "dataType": "",
                        "idPath": "id",
                        "valueProperty": "normalizedName",
                        "limit": 100,
                        "template": "<span>{{ item.normalizedName }}</span>",
                        "refreshOn": "",
                        "refreshOnBlur": "",
                        "clearOnRefresh": false,
                        "searchEnabled": true,
                        "selectThreshold": 0.3,
                        "readOnlyValue": false,
                        "customOptions": {},
                        "useExactSearch": false,
                        "persistent": true,
                        "protected": false,
                        "dbIndex": false,
                        "encrypted": false,
                        "clearOnHide": true,
                        "validateOn": "change",
                        "unique": false,
                        "key": "role",
                        "tags": [],
                        "properties": {},
                        "conditional": {
                          "show": null,
                          "when": null,
                          "eq": "",
                          "json": ""
                        },
                        "customConditional": "show  = row.userRole == 2;",
                        "logic": [],
                        "attributes": {},
                        "type": "select",
                        "indexeddb": {
                          "filter": {}
                        },
                        "lazyLoad": true,
                        "selectValues": "data",
                        "selectFields": "",
                        "disableLimit": false,
                        "searchField": "",
                        "searchDebounce": 0.3,
                        "minSearch": 0,
                        "filter": "",
                        "authenticate": false,
                        "ignoreCache": true,
                        "redrawOn": "",
                        "input": true,
                        "addons": [],
                        "fuseOptions": {
                          "include": "score",
                          "threshold": 0.3
                        },
                        "sort": ""
                      }
                    ],
                    "width": 12,
                    "offset": 0,
                    "push": 0,
                    "pull": 0,
                    "size": "md",
                    "currentWidth": 12
                  },
                  {
                    "components": [],
                    "width": 6,
                    "offset": 0,
                    "push": 0,
                    "pull": 0,
                    "size": "md",
                    "currentWidth": 6
                  }
                ],

                "hideLabel": true,
                "dataGridLabel": false,
                "key": "userOrRoleColumn",
                "logic": [],
                "attributes": {},
                "type": "columns",
                "input": false,
                "tableView": false,
                "protected": false,
                "unique": false,
                "persistent": false,
                "clearOnHide": false,
                "refreshOn": "",
                "redrawOn": "",
                "labelPosition": "top",
                "tabindex": "",
                "disabled": false,
                "dbIndex": false,
                "widget": null,
                "validateOn": "change",
                "encrypted": false,
                "addons": [],
                "tree": false,
                "lazyLoad": false,

              }

            ],
           
          },
          {
            "weight": 3,
            "type": "textfield",
            "input": true,
            "inputFormat": "plain",
            "key": "label",
            "label": "Label",
            "placeholder": "Field Label",
            "defaultValue": "Workflow Stages",
            "tooltip": "The label for this field that will appear next to it.",
            "validate": {
              "required": true
            }
          },
          {
            "weight": 4,
            "type": "textarea",
            "input": true,
            "key": "description",
            "label": "Description",
            "placeholder": "Description for this field.",
            "tooltip": "The description is text that will appear below the input field.",
            "editor": "ace",
            "as": "html",
            "wysiwyg": {
              "minLines": 3,
              "isUseWorkerDisabled": true
            }
          },
          {
            "weight": 5,
            "type": "checkbox",
            "label": "Initial Focus",
            "tooltip": "Make this field the initially focused element on this form.",
            "key": "autofocus",
            "input": true
          },
          {
            "weight": 6,
            "type": "checkbox",
            "label": "Disabled",
            "tooltip": "Disable the form input.",
            "key": "disabled",
            "input": true
          },
        ],
        "label": "Display",
        "weight": 0,

      },


  
      {
        "label": "API",
        "key": "api",
        "weight": 30,
        "components": [
          {
            "weight": 0,
            "type": "textfield",
            "input": true,
            "key": "key",
            "label": "Property Name",
            "tooltip": "The name of this field in the API endpoint.",
            "validate": {
              "pattern": "(\\w|\\w[\\w-.]*\\w)",
              "patternMessage": "The property name must only contain alphanumeric characters, underscores, dots and dashes and should not be ended by dash or dot.",
              "required": true
            }
          },
          {
            "weight": 100,
            "type": "tags",
            "input": true,
            "label": "Field Tags",
            "storeas": "array",
            "tooltip": "Tag the field for use in custom logic.",
            "key": "tags"
          },
          {
            "weight": 200,
            "type": "datamap",
            "label": "Custom Properties",
            "tooltip": "This allows you to configure any custom properties for this component.",
            "key": "properties",
            "valueComponent": {
              "type": "textfield",
              "key": "value",
              "label": "Value",
              "placeholder": "Value",
              "input": true
            }
          }
        ]
      },
   
   
      {
        "label": "Layout",
        "key": "layout",
        "weight": 60,
        "components": [
          {
            "label": "HTML Attributes",
            "type": "datamap",
            "input": true,
            "key": "attributes",
            "keyLabel": "Attribute Name",
            "valueComponent": {
              "type": "textfield",
              "key": "value",
              "label": "Attribute Value",
              "input": true
            },
            "tooltip": "Provide a map of HTML attributes for component's input element (attributes provided by other component settings or other attributes generated by form.io take precedence over attributes in this grid)",
            "addAnother": "Add Attribute"
          },
          {
            "type": "panel",
            "legend": "PDF Overlay",
            "title": "PDF Overlay",
            "key": "overlay",
            "tooltip": "The settings inside apply only to the PDF forms.",
            "weight": 2000,
            "collapsible": true,
            "collapsed": true,
            "components": [
              {
                "type": "textfield",
                "input": true,
                "key": "overlay.style",
                "label": "Style",
                "placeholder": "",
                "tooltip": "Custom styles that should be applied to this component when rendered in PDF."
              },
              {
                "type": "textfield",
                "input": true,
                "key": "overlay.page",
                "label": "Page",
                "placeholder": "",
                "tooltip": "The PDF page to place this component."
              },
              {
                "type": "textfield",
                "input": true,
                "key": "overlay.left",
                "label": "Left",
                "placeholder": "",
                "tooltip": "The left margin within a page to place this component."
              },
              {
                "type": "textfield",
                "input": true,
                "key": "overlay.top",
                "label": "Top",
                "placeholder": "",
                "tooltip": "The top margin within a page to place this component."
              },
              {
                "type": "textfield",
                "input": true,
                "key": "overlay.width",
                "label": "Width",
                "placeholder": "",
                "tooltip": "The width of the component (in pixels)."
              },
              {
                "type": "textfield",
                "input": true,
                "key": "overlay.height",
                "label": "Height",
                "placeholder": "",
                "tooltip": "The height of the component (in pixels)."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "type": "hidden",
    "key": "type",
  }
];
