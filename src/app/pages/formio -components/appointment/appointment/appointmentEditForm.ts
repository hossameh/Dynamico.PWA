export const maxSlotDuration = 720;
export const minSlotDuration = 1;
export const appointmentEditForm = [
  {
    "type": "tabs",
    "key": "tabs",
    "components": [
      {
        "key": "display",
        "components": [
          {
            "weight": 0,
            "type": "textfield",
            "input": true,
            "key": "label",
            "label": "Label",
            "placeholder": "Field Label",
            "tooltip": "The label for this field that will appear next to it.",
            "validate": {
              "required": true
            }
            
          },
          {
            "weight": 1,
            "type": "radio",
            "input": true,
            "key": "popupView",
            "label": "Select View",
            "values": [{
              "label": "Inline",
              "value": false
            },
              {
                "label": "Popup",
                "value": true
              }
            ],
            "inline": true,
            "defaultValue": false,
          },

          {
            "weight": 300,
            "type": "textarea",
            "input": true,
            "key": "tooltip",
            "label": "Tooltip",
            "placeholder": "To add a tooltip to this field, enter text here.",
            "tooltip": "Adds a tooltip to the side of this field.",
            "editor": "ace",
            "as": "html",
            "wysiwyg": {
              "minLines": 3,
              "isUseWorkerDisabled": true
            }
          },

          {
            "weight": 1100,
            "type": "checkbox",
            "label": "Hidden",
            "tooltip": "A hidden field is still a part of the form, but is hidden from view.",
            "key": "hidden",
            "input": true
          },
          {
            "weight": 1200,
            "type": "checkbox",
            "label": "Hide Label",
            "tooltip": "Hide the label (title, if no label) of this component. This allows you to show the label in the form builder, but not when it is rendered.",
            "key": "hideLabel",
            "input": true
          },

          {
            "weight": 1350,
            "type": "checkbox",
            "label": "Initial Focus",
            "tooltip": "Make this field the initially focused element on this form.",
            "key": "autofocus",
            "input": true
          },

          {
            "weight": 1400,
            "type": "checkbox",
            "label": "Disabled",
            "tooltip": "Disable the form input.",
            "key": "disabled",
            "input": true
          },
          {
            "weight": 1500,
            "type": "checkbox",
            "label": "Table View",
            "tooltip": "Shows this value within the table view of the submissions.",
            "key": "tableView",
            "input": true
          }
  
        ],
        "label": "Display",
        "weight": 0
      },

      {
        "key": "availability",
        "components": [
          {
            "type": "select",
            "label": "Appointment Slot Duration Per Minutes",
            "key": "slotDuration",
            "weight": 0,
            "placeholder": "choose appointment slot duration",
            "tooltip": "the duration of each appointment in minutes",
            "template": `<span>{{ item.label }}</span>`,
            "data": {
              "values": [
                {
                  "value": "15",
                  "label": "15 mins"
                },
                {
                  "value": "30",
                  "label": "30 mins"
                }, {
                  "value": "45",
                  "label": "45 mins"
                },
                {
                  "value": "60",
                  "label": "60 mins"
                },
                {
                  "value": "custom",
                  "label": "Custom"
                },
              ]
            },
            "defaultValue": 60,
            "input": true,
            "validate": {
              "required": true
            }
          },
          {
            "weight": 1,
            "type": "number",
            "input": true,
            "key": "customSlotDuration",
            "label": "Custom Slot Duration Per Minutes",
            "tooltip": "the duration of each appointment in minutes should be greater than 0",
            "validate": {
              "min": minSlotDuration,
              "required": true,
              "max": maxSlotDuration // 12 hours
            },
            "clearOnHide":true,
            "conditional": {
              "show": true,
              "when": "slotDuration",
              "eq": "custom",
              "json": ""
            },
          },
          {
            "type": "datagrid",
            "input": true,
            "label": "Intervals",
            "key": "intervals",
            "tooltip": "Select the days and times you will accept appointments",
            "weight": 2,
            "addAnotherPosition": "top",
            "addAnother": " ",
            "defaultValue": [
              {
                "timeIntervals": [
                  {
                    "intervalFrom": "09:00:00",
                    "intervalTo": "17:00:00",
                  }
                ],
                "weekDays": [7, 1, 2, 3, 4] // from sunday  to  Thursday
              }
            ],
            "components": [
              {
                "type": "datagrid",
                "input": true,
                "key": "timeIntervals",
                "addAnotherPosition": "top",
                "addAnother":" ",
                "components": [
                  {
                    "label": "From",
                    "key": "intervalFrom",
                    "input": true,
                    "type": "time",
                    "defaultValue": "09:00:00",
                    "validate": {
                      "required": true
                    }
                  },
                  {
                    "label": "To",
                    "key": "intervalTo",
                    "input": true,
                    "type": "time",
                    "defaultValue": "17:00:00",
                    "validate": {
                      "required": true,
                      "custom": "if(row.intervalFrom &&row.intervalTo )\n{\nconst fromTime = new Date(`2000-01-01T${row.intervalFrom}`);\nconst toTime = new Date(`2000-01-01T${row.intervalTo}`);\nvalid = toTime > fromTime ? true : 'End time must be greater than start time'\n}\n\n\nif(data.slotDuration &&\ntypeof(data.slotDuration) === \"number\")\n{\nconst fromTime = new Date(`2000-01-01T${row.intervalFrom}`);\nconst toTime = new Date(`2000-01-01T${row.intervalTo}`);\nconst miliSecondDiff = toTime.getTime() - fromTime.getTime();\nconst durationMiliScond = data.slotDuration * 60 * 1000;\nvalid =  miliSecondDiff >= durationMiliScond ? true :'Interval time must be greater than slot duration';\n}\n",
                    }
                  },
                ],
                "defaultValue": [
                  {
                    "intervalFrom": "09:00:00",
                    "intervalTo": "17:00:00",
                  }
                ]
              },
              {
                "type": "select",
                "input": true,
                "label": "Week Days",
              //  "hideLabel":true,
                "key": "weekDays",
                "multiple":true,
                "dataSrc": "values",
                "template": "{{ item.label }}",
                "placeholder":"Week Days",
                "data": {
                  "values": [
                    {
                      "value": 7,
                      "label": "Sun"
                    },
                    {
                      "value": 1,
                      "label": "Mon"
                    }, {
                      "value": 2,
                      "label": "Tues"
                    },
                    {
                      "value": 3,
                      "label": "Wednes"
                    },
                    {
                      "value": 4,
                      "label": "Thurs"
                    },
                    {
                      "value": 5,
                      "label": "Fri"
                    }, {
                      "value": 6,
                      "label": "Satur"
                    },
                  ]
                },
                "validate": {
                  "required": true
                },
                "defaultValue": [7, 1, 2, 3, 4],
              }
            ]
          },
          {
            "weight": 3,
            "type": "checkbox",
            "label": "LunchTime",
            "tooltip": "Enable lunchtime, Appointments can't be scheduled during this time.",
            "key": "lunchTime",
            "input": true
          }, 
          {
            "weight": 4,
            "type": "table",
            "numRows": 1,
            "numCols": 2,
            "hideLabel": true,
            "key": "lunchTimeDuration",
            "input": true,
            "conditional": {
              "show": true,
              "when": "lunchTime",
              "eq": true,
              "json": ""
            },
            "defaultValue": null,
            "rows": [
              [
                {
                  "components": [
                    {
                      "label": "From",
                      "key": "lunchTimeFrom",
                      "input": true,
                      "type": "time",
                      "defaultValue": "14:00:00",
                      "validate": {
                        "required": true
                      }
                    }
                  ]
                },
                {
                  "components": [
                    {
                      "label": "To",
                      "key": "lunchTimeTo",
                      "input": true,
                      "type": "time",
                      "defaultValue": "15:00:00",
                      "validate": {
                        "required": true,
                        "custom": "if(data.lunchTimeFrom && data.lunchTimeTo)\n{\n\nconst from = new Date(`2000-01-01T${data.lunchTimeFrom}`);\nconst to = new Date(`2000-01-01T${data.lunchTimeTo}`);\n\nvalid = to > from ? true : 'End time must be greater than start time'\n\n}\nelse\nvalid = true;",
                      }
                    }
                  ]
                }
              ]
            ]
          }

        ],
        "label": "Availability",
        "weight": 1
      },
      {
        "key": "appointmentLimitsTab",
        "components": [
          {
            "weight": 1,
            "type": "table",
            "numRows": 1,
            "numCols": 2,
            "hideLabel": true,
            "key": "appointmentLimit",
            "input": true,
            "rows": [
              [
                {
                  "components": [
                    {
                      "label": "Start Date",
                      "key": "startDate",
                      "input": true,
                      "type": "datetime",
                      "format": "yyyy-MM-dd",
                      "tooltip": "interval start Date",
                      "enableDate": true,
                      "enableTime": false,
                      "datePicker": {
                        "disableFunction": "date < (new Date().setDate(new Date().getDate() - 1))",
                      }
                    }
                  ]
                },
                {
                  "components": [
                    {
                      "label": "End Date",
                      "key": "endDate",
                      "input": true,
                      "type": "datetime",
                      "format": "yyyy-MM-dd",
                      "tooltip": "interval end Date",
                      "enableDate": true,
                      "enableTime": false,
                      "datePicker": {
                        "disableFunction": "date < (new Date().setDate(new Date().getDate() - 1))",
                      },
                      "validate": {
                        "custom": "\nif(data.startDate && data.endDate)\n{\nconst fromDate = new Date(data.startDate);\nconst toDate = new Date(data.endDate);\nvalid = toDate > fromDate ? true :'End Date must be greater than start Date.' ;\n}\nelse\nvalid =true;",
                      },
                    }
                  ]
                }
              ]
            ]
          },
          {
            "type": "datagrid",
            "label":"Vacations and Holidays",
            "input": true,
            "key": "vacations",
            "addAnotherPosition": "top",
            "addAnother": " ",
            "components": [
              {
                "label": "Start Date",
                "key": "vacationStartDate",
                "input": true,
                "type": "datetime",
                "format": "yyyy-MM-dd",
                "enableDate": true,
                "enableTime": false,
                "datePicker": {
                  "disableFunction": "date < (new Date().setDate(new Date().getDate() - 1))",
                }
              },
              {
                "label": "End Date",
                "key": "vacationEndDate",
                "input": true,
                "type": "datetime",
                "format": "yyyy-MM-dd",
                "enableDate": true,
                "enableTime": false,
                "datePicker": {
                  "disableFunction": "date < (new Date().setDate(new Date().getDate() - 1))",
                },
                "validate": {
                  "custom": "if(row.vacationStartDate && row.vacationEndDate)\n{\n  const fromDate = new Date(row.vacationStartDate);\n  const toDate = new Date(row.vacationEndDate);\n  valid = toDate >= fromDate ? true :'End Date must be greater than start Date';\n}\nelse\nvalid = true ;\n\n",
                }
              }
            ],
   
          }

        ],
        "label": "Limits",
        "weight": 2
      },
      {
        "key": "data",
        "components": [
          {
            "type": "textfield",
            "label": "Default Value",
            "key": "defaultValue",
            "weight": 5,
            "placeholder": "Default Value",
            "tooltip": "The will be the value for this field, before user interaction. Having a default value will override the placeholder text.",
            "input": true
          },

     
          {
            "weight": 150,
            "type": "checkbox",
            "label": "Protected",
            "tooltip": "A protected field will not be returned when queried via API.",
            "key": "protected",
            "input": true
          },
          {
            "type": "checkbox",
            "input": true,
            "weight": 200,
            "key": "dbIndex",
            "label": "Database Index",
            "tooltip": "Set this field as an index within the database. Increases performance for submission queries."
          },

          {
            "type": "select",
            "input": true,
            "key": "redrawOn",
            "label": "Redraw On",
            "weight": 600,
            "tooltip": "Redraw this component if another component changes. This is useful if interpolating parts of the component like the label.",
            "dataSrc": "custom",
            "valueProperty": "value",
            "data": {},
            "conditional": {
              "json": {
                "!": [
                  {
                    "var": "data.dataSrc"
                  }
                ]
              }
            }
          },
          {
            "weight": 700,
            "type": "checkbox",
            "label": "Clear Value When Hidden",
            "key": "clearOnHide",
            "defaultValue": true,
            "tooltip": "When a field is hidden, clear the value.",
            "input": true,
            "clearOnHide": false,
            "calculateValue": "value = data.hidden ? false : value",
            "conditional": {
              "json": {
                "!": [
                  {
                    "var": "data.hidden"
                  }
                ]
              }
            }
          },
          {
            "type": "panel",
            "title": "Custom Default Value",
            "theme": "default",
            "collapsible": true,
            "collapsed": true,
            "key": "customDefaultValuePanel",
            "weight": 1000,
            "components": [
              {
                "type": "htmlelement",
                "tag": "div",
                "content": "<p>The following variables are available in all scripts.</p><table class=\"table table-bordered table-condensed table-striped\"><tr><th>form</th><td>The complete form JSON object</td></tr><tr><th>submission</th><td>The complete submission object.</td></tr><tr><th>data</th><td>The complete submission data object.</td></tr><tr><th>row</th><td>Contextual \"row\" data, used within DataGrid, EditGrid, and Container components</td></tr><tr><th>component</th><td>The current component JSON</td></tr><tr><th>instance</th><td>The current component instance.</td></tr><tr><th>value</th><td>The current value of the component.</td></tr><tr><th>moment</th><td>The moment.js library for date manipulation.</td></tr><tr><th>_</th><td>An instance of <a href=\"https://lodash.com/docs/\" target=\"_blank\">Lodash</a>.</td></tr><tr><th>utils</th><td>An instance of the <a href=\"http://formio.github.io/formio.js/docs/identifiers.html#utils\" target=\"_blank\">FormioUtils</a> object.</td></tr><tr><th>util</th><td>An alias for \"utils\".</td></tr></table><br/>"
              },
              {
                "type": "panel",
                "title": "JavaScript",
                "collapsible": true,
                "collapsed": false,
                "style": {
                  "margin-bottom": "10px"
                },
                "key": "customDefaultValue-js",
                "components": [
                  {
                    "type": "textarea",
                    "key": "customDefaultValue",
                    "rows": 5,
                    "editor": "ace",
                    "hideLabel": true,
                    "as": "javascript",
                    "input": true
                  },
                  {
                    "type": "htmlelement",
                    "tag": "div",
                    "content": "<p>Enter custom javascript code.</p><p><h4>Example:</h4><pre>value = data.firstName + \" \" + data.lastName;</pre></p>"
                  }
                ]
              },
              {
                "type": "panel",
                "title": "JSONLogic",
                "collapsible": true,
                "collapsed": true,
                "key": "customDefaultValue-json",
                "components": [
                  {
                    "type": "htmlelement",
                    "tag": "div",
                    "content": "<p>Execute custom logic using <a href=\"http://jsonlogic.com/\" target=\"_blank\">JSONLogic</a>.</p><p>Full <a href=\"https://lodash.com/docs\" target=\"_blank\">Lodash</a> support is provided using an \"_\" before each operation, such as <code>{\"_sum\": {var: \"data.a\"}}</code></p><p><h4>Example:</h4><pre>{\"cat\": [{\"var\": \"data.firstName\"}, \" \", {\"var\": \"data.lastName\"}]}</pre>"
                  },
                  {
                    "type": "textarea",
                    "key": "customDefaultValue",
                    "rows": 5,
                    "editor": "ace",
                    "hideLabel": true,
                    "as": "json",
                    "input": true
                  }
                ]
              }
            ]
          },
          {
            "type": "panel",
            "title": "Calculated Value",
            "theme": "default",
            "collapsible": true,
            "collapsed": true,
            "key": "calculateValuePanel",
            "weight": 1100,
            "components": [
              {
                "type": "htmlelement",
                "tag": "div",
                "content": "<p>The following variables are available in all scripts.</p><table class=\"table table-bordered table-condensed table-striped\"><tr><th>token</th><td>The decoded JWT token for the authenticated user.</td></tr><tr><th>form</th><td>The complete form JSON object</td></tr><tr><th>submission</th><td>The complete submission object.</td></tr><tr><th>data</th><td>The complete submission data object.</td></tr><tr><th>row</th><td>Contextual \"row\" data, used within DataGrid, EditGrid, and Container components</td></tr><tr><th>component</th><td>The current component JSON</td></tr><tr><th>instance</th><td>The current component instance.</td></tr><tr><th>value</th><td>The current value of the component.</td></tr><tr><th>moment</th><td>The moment.js library for date manipulation.</td></tr><tr><th>_</th><td>An instance of <a href=\"https://lodash.com/docs/\" target=\"_blank\">Lodash</a>.</td></tr><tr><th>utils</th><td>An instance of the <a href=\"http://formio.github.io/formio.js/docs/identifiers.html#utils\" target=\"_blank\">FormioUtils</a> object.</td></tr><tr><th>util</th><td>An alias for \"utils\".</td></tr></table><br/>"
              },
              {
                "type": "panel",
                "title": "JavaScript",
                "collapsible": true,
                "collapsed": false,
                "style": {
                  "margin-bottom": "10px"
                },
                "key": "calculateValue-js",
                "components": [
                  {
                    "type": "textarea",
                    "key": "calculateValue",
                    "rows": 5,
                    "editor": "ace",
                    "hideLabel": true,
                    "as": "javascript",
                    "input": true
                  },
                  {
                    "type": "htmlelement",
                    "tag": "div",
                    "content": "<p>Enter custom javascript code.</p><p><h4>Example:</h4><pre>value = data.a + data.b + data.c;</pre></p>"
                  }
                ]
              },
              {
                "type": "panel",
                "title": "JSONLogic",
                "collapsible": true,
                "collapsed": true,
                "key": "calculateValue-json",
                "components": [
                  {
                    "type": "htmlelement",
                    "tag": "div",
                    "content": "<p>Execute custom logic using <a href=\"http://jsonlogic.com/\" target=\"_blank\">JSONLogic</a>.</p><p>Full <a href=\"https://lodash.com/docs\" target=\"_blank\">Lodash</a> support is provided using an \"_\" before each operation, such as <code>{\"_sum\": {var: \"data.a\"}}</code></p><p><h4>Example:</h4><pre>{\"+\": [{\"var\": \"data.a\"}, {\"var\": \"data.b\"}, {\"var\": \"data.c\"}]}</pre><p><a target=\"_blank\" href=\"http://formio.github.io/formio.js/app/examples/calculated.html\">Click here for an example</a></p>"
                  },
                  {
                    "type": "textarea",
                    "key": "calculateValue",
                    "rows": 5,
                    "editor": "ace",
                    "hideLabel": true,
                    "as": "json",
                    "input": true
                  }
                ]
              }
            ]
          },
          {
            "type": "checkbox",
            "input": true,
            "weight": 1100,
            "key": "calculateServer",
            "label": "Calculate Value on server",
            "tooltip": "Checking this will run the calculation on the server. This is useful if you wish to override the values submitted with the calculations performed on the server."
          },
          {
            "type": "checkbox",
            "input": true,
            "weight": 1200,
            "key": "allowCalculateOverride",
            "label": "Allow Manual Override of Calculated Value",
            "tooltip": "When checked, this will allow the user to manually override the calculated value."
          }
        ],
        "label": "Data",
        "weight": 10
      },
      {
        "key": "validation",
        "components": [
          {
            "weight": 0,
            "type": "select",
            "key": "validateOn",
            "defaultValue": "change",
            "input": true,
            "label": "Validate On",
            "tooltip": "Determines when this component should trigger front-end validation.",
            "dataSrc": "values",
            "data": {
              "values": [
                {
                  "label": "Change",
                  "value": "change"
                },
                {
                  "label": "Blur",
                  "value": "blur"
                }
              ]
            }
          },
          {
            "weight": 10,
            "type": "checkbox",
            "label": "Required",
            "tooltip": "A required field must be filled in before the form can be submitted.",
            "key": "validate.required",
            "input": true
          },

          {
            "weight": 190,
            "type": "textfield",
            "input": true,
            "key": "errorLabel",
            "label": "Error Label",
            "placeholder": "Error Label",
            "tooltip": "The label for this field when an error occurs."
          },
          {
            "weight": 200,
            "key": "validate.customMessage",
            "label": "Custom Error Message",
            "placeholder": "Custom Error Message",
            "type": "textfield",
            "tooltip": "Error message displayed if any error occurred.",
            "input": true
          },
          {
            "type": "panel",
            "title": "Custom Validation",
            "collapsible": true,
            "collapsed": true,
            "style": {
              "margin-bottom": "10px"
            },
            "key": "custom-validation-js",
            "weight": 300,
            "components": [
              {
                "type": "htmlelement",
                "tag": "div",
                "content": "<p>The following variables are available in all scripts.</p><table class=\"table table-bordered table-condensed table-striped\"><tr><th>input</th><td>The value that was input into this component</td></tr><tr><th>form</th><td>The complete form JSON object</td></tr><tr><th>submission</th><td>The complete submission object.</td></tr><tr><th>data</th><td>The complete submission data object.</td></tr><tr><th>row</th><td>Contextual \"row\" data, used within DataGrid, EditGrid, and Container components</td></tr><tr><th>component</th><td>The current component JSON</td></tr><tr><th>instance</th><td>The current component instance.</td></tr><tr><th>value</th><td>The current value of the component.</td></tr><tr><th>moment</th><td>The moment.js library for date manipulation.</td></tr><tr><th>_</th><td>An instance of <a href=\"https://lodash.com/docs/\" target=\"_blank\">Lodash</a>.</td></tr><tr><th>utils</th><td>An instance of the <a href=\"http://formio.github.io/formio.js/docs/identifiers.html#utils\" target=\"_blank\">FormioUtils</a> object.</td></tr><tr><th>util</th><td>An alias for \"utils\".</td></tr></table><br/>"
              },
              {
                "type": "textarea",
                "key": "validate.custom",
                "rows": 5,
                "editor": "ace",
                "hideLabel": true,
                "as": "javascript",
                "input": true
              },
              {
                "type": "htmlelement",
                "tag": "div",
                "content": "\n          <small>\n            <p>Enter custom validation code.</p>\n            <p>You must assign the <strong>valid</strong> variable as either <strong>true</strong> or an error message if validation fails.</p>\n            <h5>Example:</h5>\n            <pre>valid = (input === 'Joe') ? true : 'Your name must be \"Joe\"';</pre>\n          </small>"
              },
              {
                "type": "well",
                "components": [
                  {
                    "weight": 100,
                    "type": "checkbox",
                    "label": "Secret Validation",
                    "tooltip": "Check this if you wish to perform the validation ONLY on the server side. This keeps your validation logic private and secret.",
                    "description": "Check this if you wish to perform the validation ONLY on the server side. This keeps your validation logic private and secret.",
                    "key": "validate.customPrivate",
                    "input": true
                  }
                ]
              }
            ]
          },
          {
            "type": "panel",
            "title": "JSONLogic Validation",
            "collapsible": true,
            "collapsed": true,
            "key": "json-validation-json",
            "weight": 400,
            "components": [
              {
                "type": "htmlelement",
                "tag": "div",
                "content": "<p>Execute custom logic using <a href=\"http://jsonlogic.com/\" target=\"_blank\">JSONLogic</a>.</p><h5>Example:</h5><pre>{\n  \"if\": [\n    {\n      \"===\": [\n        {\n          \"var\": \"input\"\n        },\n        \"Bob\"\n      ]\n    },\n    true,\n    \"Your name must be 'Bob'!\"\n  ]\n}</pre>"
              },
              {
                "type": "textarea",
                "key": "validate.json",
                "hideLabel": true,
                "rows": 5,
                "editor": "ace",
                "as": "json",
                "input": true
              }
            ]
          },
          {
            "type": "panel",
            "title": "Custom Errors",
            "collapsible": true,
            "collapsed": true,
            "key": "errors",
            "weight": 400,
            "components": [
              {
                "type": "textarea",
                "key": "errors",
                "hideLabel": true,
                "rows": 5,
                "editor": "ace",
                "as": "json",
                "input": true
              },
              {
                "type": "htmlelement",
                "tag": "div",
                "content": "\n          <p>This allows you to set different custom error messages for different errors\n          (in contrast to “Custom Error Message”, which only allows you to set one\n          error message for all errors). E.g.</p>\n\n<pre>{\n  \"required\": \"{<span/>{ field }} is required. Try again.\",\n  \"maxLength\": \"{<span/>{ field }} is too long. Try again.\"\n}</pre>\n\n          <p>You can set the following keys (among others):</p>\n          <ul>\n            <li>r<span/>equired</li>\n            <li>m<span/>in</li>\n            <li>m<span/>ax</li>\n            <li>m<span/>inLength</li>\n            <li>m<span/>axLength</li>\n            <li>m<span/>inWords</li>\n            <li>m<span/>axWords</li>\n            <li>i<span/>nvalid_email</li>\n            <li>i<span/>nvalid_date</li>\n            <li>i<span/>nvalid_day</li>\n            <li>i<span/>nvalid_regex</li>\n            <li>m<span/>ask</li>\n            <li>p<span/>attern</li>\n            <li>c<span/>ustom</li>\n          </ul>\n\n          <p>Depending on the error message some of the following template variables can be used in the script:</p>\n          <ul>\n           <li><code>{<span/>{ f<span/>ield }}</code> is replaced with the label of the field.</li>\n           <li><code>{<span/>{ m<span/>in }}</code></li>\n           <li><code>{<span/>{ m<span/>ax }}</code></li>\n           <li><code>{<span/>{ l<span/>ength }}</code></li>\n           <li><code>{<span/>{ p<span/>attern }}</code></li>\n           <li><code>{<span/>{ m<span/>inDate }}</code></li>\n           <li><code>{<span/>{ m<span/>axDate }}</code></li>\n           <li><code>{<span/>{ m<span/>inYear }}</code></li>\n           <li><code>{<span/>{ m<span/>axYear }}</code></li>\n           <li><code>{<span/>{ r<span/>egex }}</code></li>\n          </ul>\n        "
              }
            ]
          }
        ],
        "label": "Validation",
        "weight": 20
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
        "label": "Conditional",
        "key": "conditional",
        "weight": 40,
        "components": [
          {
            "type": "panel",
            "title": "Simple",
            "key": "simple-conditional",
            "theme": "default",
            "components": [
              {
                "type": "select",
                "input": true,
                "label": "This component should Display:",
                "key": "conditional.show",
                "dataSrc": "values",
                "data": {
                  "values": [
                    {
                      "label": "True",
                      "value": "true"
                    },
                    {
                      "label": "False",
                      "value": "false"
                    }
                  ]
                }
              },
              {
                "type": "select",
                "input": true,
                "label": "When the form component:",
                "key": "conditional.when",
                "dataSrc": "custom",
                "valueProperty": "value",
                "data": {}
              },
              {
                "type": "textfield",
                "input": true,
                "label": "Has the value:",
                "key": "conditional.eq"
              }
            ]
          },
          {
            "type": "panel",
            "title": "Advanced Conditions",
            "theme": "default",
            "collapsible": true,
            "collapsed": true,
            "key": "customConditionalPanel",
            "weight": 110,
            "components": [
              {
                "type": "htmlelement",
                "tag": "div",
                "content": "<p>The following variables are available in all scripts.</p><table class=\"table table-bordered table-condensed table-striped\"><tr><th>form</th><td>The complete form JSON object</td></tr><tr><th>submission</th><td>The complete submission object.</td></tr><tr><th>data</th><td>The complete submission data object.</td></tr><tr><th>row</th><td>Contextual \"row\" data, used within DataGrid, EditGrid, and Container components</td></tr><tr><th>component</th><td>The current component JSON</td></tr><tr><th>instance</th><td>The current component instance.</td></tr><tr><th>value</th><td>The current value of the component.</td></tr><tr><th>moment</th><td>The moment.js library for date manipulation.</td></tr><tr><th>_</th><td>An instance of <a href=\"https://lodash.com/docs/\" target=\"_blank\">Lodash</a>.</td></tr><tr><th>utils</th><td>An instance of the <a href=\"http://formio.github.io/formio.js/docs/identifiers.html#utils\" target=\"_blank\">FormioUtils</a> object.</td></tr><tr><th>util</th><td>An alias for \"utils\".</td></tr></table><br/>"
              },
              {
                "type": "panel",
                "title": "JavaScript",
                "collapsible": true,
                "collapsed": false,
                "style": {
                  "margin-bottom": "10px"
                },
                "key": "customConditional-js",
                "components": [
                  {
                    "type": "textarea",
                    "key": "customConditional",
                    "rows": 5,
                    "editor": "ace",
                    "hideLabel": true,
                    "as": "javascript",
                    "input": true
                  },
                  {
                    "type": "htmlelement",
                    "tag": "div",
                    "content": "<p>Enter custom javascript code.</p><p>You must assign the <strong>show</strong> variable a boolean result.</p><p><strong>Note: Advanced Conditional logic will override the results of the Simple Conditional logic.</strong></p><h5>Example</h5><pre>show = !!data.showMe;</pre>"
                  }
                ]
              },
              {
                "type": "panel",
                "title": "JSONLogic",
                "collapsible": true,
                "collapsed": true,
                "key": "customConditional-json",
                "components": [
                  {
                    "type": "htmlelement",
                    "tag": "div",
                    "content": "<p>Execute custom logic using <a href=\"http://jsonlogic.com/\" target=\"_blank\">JSONLogic</a>.</p><p>Full <a href=\"https://lodash.com/docs\" target=\"_blank\">Lodash</a> support is provided using an \"_\" before each operation, such as <code>{\"_sum\": {var: \"data.a\"}}</code></p><p><a href=\"http://formio.github.io/formio.js/app/examples/conditions.html\" target=\"_blank\">Click here for an example</a></p>"
                  },
                  {
                    "type": "textarea",
                    "key": "conditional.json",
                    "rows": 5,
                    "editor": "ace",
                    "hideLabel": true,
                    "as": "json",
                    "input": true
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "label": "Logic",
        "key": "logic",
        "weight": 50,
        "components": [
          {
            "weight": 0,
            "input": true,
            "label": "Advanced Logic",
            "key": "logic",
            "templates": {
              "header": "<div class=\"row\"> \n  <div class=\"col-sm-6\">\n    <strong>{{ value.length }} {{ ctx.t(\"Advanced Logic Configured\") }}</strong>\n  </div>\n</div>",
              "row": "<div class=\"row\"> \n  <div class=\"col-sm-6\">\n    <div>{{ row.name }} </div>\n  </div>\n  <div class=\"col-sm-2\"> \n    <div class=\"btn-group pull-right\"> \n      <button class=\"btn btn-default editRow\">{{ ctx.t(\"Edit\") }}</button> \n      <button class=\"btn btn-danger removeRow\">{{ ctx.t(\"Delete\") }}</button> \n    </div> \n  </div> \n</div>",
              "footer": ""
            },
            "type": "editgrid",
            "addAnother": "Add Logic",
            "saveRow": "Save Logic",
            "components": [
              {
                "weight": 0,
                "input": true,
                "inputType": "text",
                "label": "Logic Name",
                "key": "name",
                "validate": {
                  "required": true
                },
                "type": "textfield"
              },
              {
                "weight": 10,
                "key": "triggerPanel",
                "input": false,
                "title": "Trigger",
                "tableView": false,
                "components": [
                  {
                    "weight": 0,
                    "input": true,
                    "tableView": false,
                    "components": [
                      {
                        "weight": 0,
                        "input": true,
                        "label": "Type",
                        "key": "type",
                        "tableView": false,
                        "data": {
                          "values": [
                            {
                              "value": "simple",
                              "label": "Simple"
                            },
                            {
                              "value": "javascript",
                              "label": "Javascript"
                            },
                            {
                              "value": "json",
                              "label": "JSON Logic"
                            },
                            {
                              "value": "event",
                              "label": "Event"
                            }
                          ]
                        },
                        "dataSrc": "values",
                        "template": "<span>{{ item.label }}</span>",
                        "type": "select"
                      },
                      {
                        "weight": 10,
                        "label": "",
                        "key": "simple",
                        "type": "container",
                        "tableView": false,
                        "components": [
                          {
                            "input": true,
                            "key": "show",
                            "label": "Show",
                            "type": "hidden",
                            "tableView": false
                          },
                          {
                            "type": "select",
                            "input": true,
                            "label": "When the form component:",
                            "key": "when",
                            "dataSrc": "custom",
                            "valueProperty": "value",
                            "tableView": false,
                            "data": {}
                          },
                          {
                            "type": "textfield",
                            "input": true,
                            "label": "Has the value:",
                            "key": "eq",
                            "tableView": false
                          }
                        ]
                      },
                      {
                        "weight": 10,
                        "type": "textarea",
                        "key": "javascript",
                        "rows": 5,
                        "editor": "ace",
                        "as": "javascript",
                        "input": true,
                        "tableView": false,
                        "placeholder": "result = (data['mykey'] > 1);",
                        "description": "\"row\", \"data\", and \"component\" variables are available. Return \"result\"."
                      },
                      {
                        "weight": 10,
                        "type": "textarea",
                        "key": "json",
                        "rows": 5,
                        "editor": "ace",
                        "label": "JSON Logic",
                        "as": "json",
                        "input": true,
                        "tableView": false,
                        "placeholder": "{ ... }",
                        "description": "\"row\", \"data\", \"component\" and \"_\" variables are available. Return the result to be passed to the action if truthy."
                      },
                      {
                        "weight": 10,
                        "type": "textfield",
                        "key": "event",
                        "label": "Event Name",
                        "placeholder": "event",
                        "description": "The event that will trigger this logic. You can trigger events externally or via a button.",
                        "tableView": false
                      }
                    ],
                    "key": "trigger",
                    "type": "container"
                  }
                ],
                "type": "panel"
              },
              {
                "weight": 20,
                "input": true,
                "label": "Actions",
                "key": "actions",
                "tableView": false,
                "templates": {
                  "header": "<div class=\"row\"> \n  <div class=\"col-sm-6\"><strong>{{ value.length }} {{ ctx.t(\"actions\") }}</strong></div>\n</div>",
                  "row": "<div class=\"row\"> \n  <div class=\"col-sm-6\">\n    <div>{{ row.name }} </div>\n  </div>\n  <div class=\"col-sm-2\"> \n    <div class=\"btn-group pull-right\"> \n      <button class=\"btn btn-default editRow\">{{ ctx.t(\"Edit\") }}</button> \n      <button class=\"btn btn-danger removeRow\">{{ ctx.t(\"Delete\") }}</button> \n    </div> \n  </div> \n</div>",
                  "footer": ""
                },
                "type": "editgrid",
                "addAnother": "Add Action",
                "saveRow": "Save Action",
                "components": [
                  {
                    "weight": 0,
                    "title": "Action",
                    "input": false,
                    "key": "actionPanel",
                    "type": "panel",
                    "components": [
                      {
                        "weight": 0,
                        "input": true,
                        "inputType": "text",
                        "label": "Action Name",
                        "key": "name",
                        "validate": {
                          "required": true
                        },
                        "type": "textfield"
                      },
                      {
                        "weight": 10,
                        "input": true,
                        "label": "Type",
                        "key": "type",
                        "data": {
                          "values": [
                            {
                              "value": "property",
                              "label": "Property"
                            },
                            {
                              "value": "value",
                              "label": "Value"
                            },
                            {
                              "label": "Merge Component Schema",
                              "value": "mergeComponentSchema"
                            },
                            {
                              "label": "Custom Action",
                              "value": "customAction"
                            }
                          ]
                        },
                        "dataSrc": "values",
                        "template": "<span>{{ item.label }}</span>",
                        "type": "select"
                      },
                      {
                        "weight": 20,
                        "type": "select",
                        "template": "<span>{{ item.label }}</span>",
                        "dataSrc": "json",
                        "tableView": false,
                        "data": {
                          "json": [
                            {
                              "label": "Hidden",
                              "value": "hidden",
                              "type": "boolean"
                            },
                            {
                              "label": "Required",
                              "value": "validate.required",
                              "type": "boolean"
                            },
                            {
                              "label": "Disabled",
                              "value": "disabled",
                              "type": "boolean"
                            },
                            {
                              "label": "Label",
                              "value": "label",
                              "type": "string"
                            },
                            {
                              "label": "Title",
                              "value": "title",
                              "type": "string"
                            },
                            {
                              "label": "Prefix",
                              "value": "prefix",
                              "type": "string"
                            },
                            {
                              "label": "Suffix",
                              "value": "suffix",
                              "type": "string"
                            },
                            {
                              "label": "Tooltip",
                              "value": "tooltip",
                              "type": "string"
                            },
                            {
                              "label": "Description",
                              "value": "description",
                              "type": "string"
                            },
                            {
                              "label": "Placeholder",
                              "value": "placeholder",
                              "type": "string"
                            },
                            {
                              "label": "Input Mask",
                              "value": "inputMask",
                              "type": "string"
                            },
                            {
                              "label": "CSS Class",
                              "value": "className",
                              "type": "string"
                            },
                            {
                              "label": "Container Custom Class",
                              "value": "customClass",
                              "type": "string"
                            }
                          ]
                        },
                        "key": "property",
                        "label": "Component Property",
                        "input": true
                      },
                      {
                        "weight": 30,
                        "input": true,
                        "label": "Set State",
                        "key": "state",
                        "tableView": false,
                        "data": {
                          "values": [
                            {
                              "label": "True",
                              "value": "true"
                            },
                            {
                              "label": "False",
                              "value": "false"
                            }
                          ]
                        },
                        "dataSrc": "values",
                        "template": "<span>{{ item.label }}</span>",
                        "type": "select"
                      },
                      {
                        "weight": 30,
                        "type": "textfield",
                        "key": "text",
                        "label": "Text",
                        "inputType": "text",
                        "input": true,
                        "tableView": false,
                        "description": "Can use templating with {{ data.myfield }}. \"data\", \"row\", \"component\" and \"result\" variables are available."
                      },
                      {
                        "weight": 20,
                        "input": true,
                        "label": "Value (Javascript)",
                        "key": "value",
                        "editor": "ace",
                        "as": "javascript",
                        "rows": 5,
                        "placeholder": "value = data.myfield;",
                        "type": "textarea",
                        "tableView": false,
                        "description": "\"row\", \"data\", \"component\", and \"result\" variables are available. Return the value."
                      },
                      {
                        "weight": 20,
                        "input": true,
                        "label": "Schema Defenition",
                        "key": "schemaDefinition",
                        "editor": "ace",
                        "as": "javascript",
                        "rows": 5,
                        "placeholder": "schema = { label: 'Updated' };",
                        "type": "textarea",
                        "tableView": false,
                        "description": "\"row\", \"data\", \"component\", and \"result\" variables are available. Return the schema."
                      },
                      {
                        "type": "htmlelement",
                        "tag": "div",
                        "content": "<p>The following variables are available in all scripts.</p><table class=\"table table-bordered table-condensed table-striped\"><tr><th>input</th><td>The value that was input into this component</td></tr><tr><th>form</th><td>The complete form JSON object</td></tr><tr><th>submission</th><td>The complete submission object.</td></tr><tr><th>data</th><td>The complete submission data object.</td></tr><tr><th>row</th><td>Contextual \"row\" data, used within DataGrid, EditGrid, and Container components</td></tr><tr><th>component</th><td>The current component JSON</td></tr><tr><th>instance</th><td>The current component instance.</td></tr><tr><th>value</th><td>The current value of the component.</td></tr><tr><th>moment</th><td>The moment.js library for date manipulation.</td></tr><tr><th>_</th><td>An instance of <a href=\"https://lodash.com/docs/\" target=\"_blank\">Lodash</a>.</td></tr><tr><th>utils</th><td>An instance of the <a href=\"http://formio.github.io/formio.js/docs/identifiers.html#utils\" target=\"_blank\">FormioUtils</a> object.</td></tr><tr><th>util</th><td>An alias for \"utils\".</td></tr></table><br/>"
                      },
                      {
                        "weight": 20,
                        "input": true,
                        "label": "Custom Action (Javascript)",
                        "key": "customAction",
                        "editor": "ace",
                        "rows": 5,
                        "placeholder": "value = data.myfield;",
                        "type": "textarea",
                        "tableView": false
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
  
    ]
  },
  {
    "type": "hidden",
    "key": "type"
  }
];
