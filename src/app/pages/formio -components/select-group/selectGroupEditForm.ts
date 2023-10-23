
export const selectGroupFormEdit = [
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
            "type": "select",
            "input": true,
            "key": "labelPosition",
            "label": "Label Position",
            "tooltip": "Position for the label for this field.",
            "weight": 20,
            "defaultValue": "top",
            "dataSrc": "values",
            "data": {
              "values": [
                {
                  "label": "Top",
                  "value": "top"
                },
                {
                  "label": "Left (Left-aligned)",
                  "value": "left-left"
                },
                {
                  "label": "Left (Right-aligned)",
                  "value": "left-right"
                },
                {
                  "label": "Right (Left-aligned)",
                  "value": "right-left"
                },
                {
                  "label": "Right (Right-aligned)",
                  "value": "right-right"
                },
                {
                  "label": "Bottom",
                  "value": "bottom"
                }
              ]
            }
          },
          {
            "type": "select",
            "input": true,
            "weight": 20,
            "tooltip": "Select the type of widget you'd like to use.",
            "key": "widget",
            "defaultValue": "choicesjs",
            "label": "Widget Type",
            "dataSrc": "values",
            "data": {
              "values": [
                {
                  "label": "ChoicesJS",
                  "value": "choicesjs"
                },
                {
                  "label": "HTML 5",
                  "value": "html5"
                }
              ]
            }
          },
          {
            "type": "number",
            "input": true,
            "key": "labelWidth",
            "label": "Label Width",
            "tooltip": "The width of label on line in percentages.",
            "clearOnHide": false,
            "weight": 30,
            "placeholder": "30",
            "suffix": "%",
            "validate": {
              "min": 0,
              "max": 100
            },
            "conditional": {
              "json": {
                "and": [
                  {
                    "!==": [
                      {
                        "var": "data.labelPosition"
                      },
                      "top"
                    ]
                  },
                  {
                    "!==": [
                      {
                        "var": "data.labelPosition"
                      },
                      "bottom"
                    ]
                  }
                ]
              }
            }
          },
          {
            "type": "number",
            "input": true,
            "key": "labelMargin",
            "label": "Label Margin",
            "tooltip": "The width of label margin on line in percentages.",
            "clearOnHide": false,
            "weight": 30,
            "placeholder": "3",
            "suffix": "%",
            "validate": {
              "min": 0,
              "max": 100
            },
            "conditional": {
              "json": {
                "and": [
                  {
                    "!==": [
                      {
                        "var": "data.labelPosition"
                      },
                      "top"
                    ]
                  },
                  {
                    "!==": [
                      {
                        "var": "data.labelPosition"
                      },
                      "bottom"
                    ]
                  }
                ]
              }
            }
          },
          {
            "weight": 100,
            "type": "textfield",
            "input": true,
            "key": "placeholder",
            "label": "Placeholder",
            "placeholder": "Placeholder",
            "tooltip": "The placeholder text that will appear when this field is empty."
          },
          {
            "weight": 200,
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
            "weight": 500,
            "type": "textfield",
            "input": true,
            "key": "customClass",
            "label": "Custom CSS Class",
            "placeholder": "Custom CSS Class",
            "tooltip": "Custom CSS class to add to this component."
          },
          {
            "weight": 600,
            "type": "textfield",
            "input": true,
            "key": "tabindex",
            "label": "Tab Index",
            "placeholder": "0",
            "tooltip": "Sets the tabindex attribute of this component to override the tab order of the form. See the <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex'>MDN documentation</a> on tabindex for more information."
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
            "weight": 1230,
            "type": "checkbox",
            "label": "Unique Options",
            "tooltip": "Display only unique dropdown options.",
            "key": "uniqueOptions",
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
            "weight": 1370,
            "type": "checkbox",
            "label": "Show Label in DataGrid",
            "tooltip": "Show the label when in a Datagrid.",
            "key": "dataGridLabel",
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
          },
          {
            "weight": 1600,
            "type": "checkbox",
            "label": "Modal Edit",
            "tooltip": "Opens up a modal to edit the value of this component.",
            "key": "modalEdit",
            "input": true
          }
        ],
        "label": "Display",
        "weight": 0
      },
      {
        "key": "data",
        "components": [
          //{
          //  "weight": 0,
          //  "type": "checkbox",
          //  "label": "Multiple Values",
          //  "tooltip": "Allows multiple values to be entered for this field.",
          //  "key": "multiple",
          //  "input": true
          //},
       

          {
            "type": "select",
            "input": true,
            "weight": 0,
            "tooltip": "The source to use for the select data. Values lets you provide your own values and labels. JSON lets you provide raw JSON data. URL lets you provide a URL to retrieve the JSON data from.",
            "key": "dataSrc",
            "defaultValue": "values",
            "label": "Data Source Type",
            "dataSrc": "values",
            "disabled":true,
            "data": {
              "values": [
                {
                  "label": "Values",
                  "value": "values"
                }
                //{
                //  "label": "URL",
                //  "value": "url"
                //},
                //{
                //  "label": "Resource",
                //  "value": "resource"
                //},
                //{
                //  "label": "Custom",
                //  "value": "custom"
                //},
                //{
                //  "label": "Raw JSON",
                //  "value": "json"
                //}
              ]
            }
          },
          {
            "type": "textfield",
            "label": "Default Value",
            "key": "defaultValue",
            "weight": 5,
            "placeholder": "Default Value",
            "tooltip": "The will be the value for this field, before user interaction. Having a default value will override the placeholder text.",
            "input": true
          },
          //{
          //  "type": "textfield",
          //  "weight": 10,
          //  "input": true,
          //  "key": "indexeddb.database",
          //  "label": "Database name",
          //  "tooltip": "The name of the indexeddb database.",
          //  "conditional": {
          //    "json": {
          //      "===": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        "indexeddb"
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "textarea",
          //  "as": "json",
          //  "editor": "ace",
          //  "weight": 10,
          //  "input": true,
          //  "key": "data.json",
          //  "label": "Data Source Raw JSON",
          //  "tooltip": "A valid JSON array to use as a data source.",
          //  "description": "<div>Example: <pre>[\"apple\", \"banana\", \"orange\"].</pre></div> <div>Example 2: <pre>[{\"name\": \"John\", \"email\": \"john.doe@test.com\"}, {\"name\": \"Jane\", \"email\": \"jane.doe@test.com\"}].</pre></div>",
          //  "conditional": {
          //    "json": {
          //      "===": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        "json"
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "textfield",
          //  "input": true,
          //  "key": "data.url",
          //  "weight": 10,
          //  "label": "Data Source URL",
          //  "placeholder": "Data Source URL",
          //  "tooltip": "A URL that returns a JSON array to use as the data source.",
          //  "conditional": {
          //    "json": {
          //      "===": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        "url"
          //      ]
          //    }
          //  }
          //},
          {
            "type": "datagrid",
            "input": true,
            "label": "Data Source Values",
            "key": "data.values",
            "tooltip": "Values to use as the data source. Labels are shown in the select field. Values are the corresponding values saved with the submission.",
            "weight": 10,
            "reorder": true,
            "defaultValue": [
              {
                "label": "",
                "value": ""
              }
            ],
            "components": [
              {
                "label": "Label",
                "key": "label",
                "input": true,
                "type": "textfield"
              },
              {
                "label": "Value",
                "key": "value",
                "input": true,
                "type": "textfield",
                "allowCalculateOverride": true,
                "calculateValue": "value = _.camelCase(row.label);"
              },
              {
                "label": "Group Name",
                "key": "itemsGroupProperty",
                "input": true,
                "type": "textfield"
              },
            ],
           
          },
          //{
          //  "type": "select",
          //  "input": true,
          //  "dataSrc": "url",
          //  "data": {
          //    "url": "/form?type=resource&limit=4294967295&select=_id,title"
          //  },
          //  "authenticate": true,
          //  "template": "<span>{{ item.title }}</span>",
          //  "valueProperty": "_id",
          //  "clearOnHide": false,
          //  "label": "Resource",
          //  "key": "data.resource",
          //  "lazyLoad": false,
          //  "weight": 10,
          //  "tooltip": "The resource to be used with this field.",
          //  "conditional": {
          //    "json": {
          //      "===": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        "resource"
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "checkbox",
          //  "input": true,
          //  "label": "Lazy Load Data",
          //  "key": "lazyLoad",
          //  "tooltip": "When set, this will not fire off the request to the URL until this control is within focus. This can improve performance if you have many Select dropdowns on your form where the API's will only fire when the control is activated.",
          //  "weight": 11,
          //  "conditional": {
          //    "json": {
          //      "and": [
          //        {
          //          "in": [
          //            {
          //              "var": "data.dataSrc"
          //            },
          //            [
          //              "resource",
          //              "url"
          //            ]
          //          ]
          //        },
          //        {
          //          "!==": [
          //            {
          //              "var": "data.widget"
          //            },
          //            "html5"
          //          ]
          //        }
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "datagrid",
          //  "input": true,
          //  "label": "Request Headers",
          //  "key": "data.headers",
          //  "tooltip": "Set any headers that should be sent along with the request to the url. This is useful for authentication.",
          //  "weight": 11,
          //  "components": [
          //    {
          //      "label": "Key",
          //      "key": "key",
          //      "input": true,
          //      "type": "textfield"
          //    },
          //    {
          //      "label": "Value",
          //      "key": "value",
          //      "input": true,
          //      "type": "textfield"
          //    }
          //  ],
          //  "conditional": {
          //    "json": {
          //      "===": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        "url"
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "select",
          //  "input": true,
          //  "label": "Value Property",
          //  "key": "valueProperty",
          //  "skipMerge": true,
          //  "clearOnHide": true,
          //  "tooltip": "The field to use as the value.",
          //  "weight": 11,
          //  "refreshOn": "data.resource",
          //  "template": "<span>{{ item.label }}</span>",
          //  "valueProperty": "key",
          //  "dataSrc": "url",
          //  "lazyLoad": false,
          //  "data": {
          //    "url": "/form/{{ data.data.resource }}"
          //  },
          //  "conditional": {
          //    "json": {
          //      "and": [
          //        {
          //          "===": [
          //            {
          //              "var": "data.dataSrc"
          //            },
          //            "resource"
          //          ]
          //        },
          //        {
          //          "!==": [
          //            {
          //              "var": "data.reference"
          //            },
          //            true
          //          ]
          //        },
          //        {
          //          "var": "data.data.resource"
          //        }
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "textfield",
          //  "input": true,
          //  "label": "Data Path",
          //  "key": "selectValues",
          //  "weight": 12,
          //  "description": "The object path to the iterable items.",
          //  "tooltip": "The property within the source data, where iterable items reside. For example: results.items or results[0].items",
          //  "conditional": {
          //    "json": {
          //      "===": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        "url"
          //      ]
          //    }
          //  }
          //},
          {
            "type": "select",
            "input": true,
            "label": "Storage Type",
            "key": "dataType",
            "clearOnHide": true,
            "tooltip": "The type to store the data. If you select something other than autotype, it will force it to that type.",
            "weight": 12,
            "template": "<span>{{ item.label }}</span>",
            "dataSrc": "values",
            "data": {
              "values": [
                {
                  "label": "Autotype",
                  "value": "auto"
                },
                {
                  "label": "String",
                  "value": "string"
                },
                {
                  "label": "Number",
                  "value": "number"
                },
                {
                  "label": "Boolean",
                  "value": "boolean"
                },
                {
                  "label": "Object",
                  "value": "object"
                }
              ]
            }
          },
          //{
          //  "type": "textfield",
          //  "input": true,
          //  "key": "idPath",
          //  "weight": 12,
          //  "label": "ID Path",
          //  "placeholder": "id",
          //  "tooltip": "Path to the select option id."
          //},
          //{
          //  "type": "textfield",
          //  "input": true,
          //  "label": "Value Property",
          //  "key": "valueProperty",
          //  "skipMerge": true,
          //  "clearOnHide": false,
          //  "weight": 13,
          //  "description": "The selected item's property to save.",
          //  "tooltip": "The property of each item in the data source to use as the select value. If not specified, the item itself will be used.",
          //  "conditional": {
          //    "json": {
          //      "in": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        [
          //          "json",
          //          "url",
          //          "custom"
          //        ]
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "textfield",
          //  "input": true,
          //  "label": "Select Fields",
          //  "key": "selectFields",
          //  "tooltip": "The properties on the resource to return as part of the options. Separate property names by commas. If left blank, all properties will be returned.",
          //  "placeholder": "Comma separated list of fields to select.",
          //  "weight": 14,
          //  "conditional": {
          //    "json": {
          //      "and": [
          //        {
          //          "===": [
          //            {
          //              "var": "data.dataSrc"
          //            },
          //            "resource"
          //          ]
          //        },
          //        {
          //          "===": [
          //            {
          //              "var": "data.valueProperty"
          //            },
          //            ""
          //          ]
          //        }
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "textarea",
          //  "input": true,
          //  "key": "data.custom",
          //  "label": "Custom Values",
          //  "editor": "ace",
          //  "rows": 10,
          //  "weight": 14,
          //  "placeholder": "values = data['mykey'] or values = Promise.resolve(['myValue'])",
          //  "tooltip": "Write custom code to return the value options or a promise with value options. The form data object is available.",
          //  "conditional": {
          //    "json": {
          //      "===": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        "custom"
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "checkbox",
          //  "input": true,
          //  "key": "disableLimit",
          //  "label": "Disable limiting response",
          //  "tooltip": "When enabled the request will not include the limit and skip options in the query string",
          //  "weight": 15,
          //  "conditional": {
          //    "json": {
          //      "===": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        "url"
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "textfield",
          //  "input": true,
          //  "key": "indexeddb.table",
          //  "label": "Table name",
          //  "weight": 16,
          //  "tooltip": "The name of table in the indexeddb database.",
          //  "conditional": {
          //    "json": {
          //      "===": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        "indexeddb"
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "textfield",
          //  "input": true,
          //  "key": "searchField",
          //  "label": "Search Query Name",
          //  "weight": 16,
          //  "description": "Name of URL query parameter",
          //  "tooltip": "The name of the search querystring parameter used when sending a request to filter results with. The server at the URL must handle this query parameter.",
          //  "conditional": {
          //    "json": {
          //      "in": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        [
          //          "url",
          //          "resource"
          //        ]
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "number",
          //  "input": true,
          //  "key": "searchDebounce",
          //  "label": "Search request delay",
          //  "weight": 16,
          //  "description": "The delay (in seconds) before the search request is sent.",
          //  "tooltip": "The delay in seconds before the search request is sent, measured from the last character input in the search field.",
          //  "validate": {
          //    "min": 0,
          //    "customMessage": "",
          //    "json": "",
          //    "max": 1
          //  },
          //  "delimiter": false,
          //  "requireDecimal": false,
          //  "encrypted": false,
          //  "defaultValue": 0.3,
          //  "conditional": {
          //    "json": {
          //      "in": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        [
          //          "url",
          //          "resource"
          //        ]
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "number",
          //  "input": true,
          //  "key": "minSearch",
          //  "weight": 17,
          //  "label": "Minimum Search Length",
          //  "tooltip": "The minimum amount of characters they must type before a search is made.",
          //  "defaultValue": 0,
          //  "conditional": {
          //    "json": {
          //      "and": [
          //        {
          //          "===": [
          //            {
          //              "var": "data.dataSrc"
          //            },
          //            "url"
          //          ]
          //        },
          //        {
          //          "!=": [
          //            {
          //              "var": "data.searchField"
          //            },
          //            ""
          //          ]
          //        }
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "textarea",
          //  "as": "json",
          //  "editor": "ace",
          //  "weight": 18,
          //  "input": true,
          //  "key": "indexeddb.filter",
          //  "label": "Row Filter",
          //  "tooltip": "Filter table items that match the object.",
          //  "defaultValue": {},
          //  "conditional": {
          //    "json": {
          //      "===": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        "indexeddb"
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "textfield",
          //  "input": true,
          //  "key": "filter",
          //  "label": "Filter Query",
          //  "weight": 18,
          //  "description": "The filter query for results.",
          //  "tooltip": "Use this to provide additional filtering using query parameters.",
          //  "conditional": {
          //    "json": {
          //      "in": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        [
          //          "url",
          //          "resource"
          //        ]
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "textfield",
          //  "input": true,
          //  "key": "sort",
          //  "label": "Sort Query",
          //  "weight": 18,
          //  "description": "The sort query for results",
          //  "tooltip": "Use this to provide additional sorting using query parameters",
          //  "conditional": {
          //    "json": {
          //      "in": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        [
          //          "url",
          //          "resource"
          //        ]
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "number",
          //  "input": true,
          //  "key": "limit",
          //  "label": "Limit",
          //  "weight": 18,
          //  "description": "Maximum number of items to view per page of results.",
          //  "tooltip": "Use this to limit the number of items to request or view.",
          //  "clearOnHide": false,
          //  "conditional": {
          //    "json": {
          //      "and": [
          //        {
          //          "in": [
          //            {
          //              "var": "data.dataSrc"
          //            },
          //            [
          //              "url",
          //              "resource"
          //            ]
          //          ]
          //        },
          //        {
          //          "!==": [
          //            {
          //              "var": "data.disableLimit"
          //            },
          //            true
          //          ]
          //        }
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "textarea",
          //  "input": true,
          //  "key": "template",
          //  "label": "Item Template",
          //  "editor": "ace",
          //  "as": "html",
          //  "rows": 3,
          //  "weight": 18,
          //  "tooltip": "The HTML template for the result data items.",
          //  "allowCalculateOverride": true
          //},
          //{
          //  "type": "select",
          //  "input": true,
          //  "key": "refreshOn",
          //  "label": "Refresh Options On",
          //  "weight": 19,
          //  "tooltip": "Refresh data when another field changes.",
          //  "dataSrc": "custom",
          //  "valueProperty": "value",
          //  "data": {},
          //  "conditional": {
          //    "json": {
          //      "in": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        [
          //          "url",
          //          "resource",
          //          "values",
          //          "custom"
          //        ]
          //      ]
          //    }
          //  }
          //},
          {
            "type": "select",
            "input": true,
            "key": "refreshOnBlur",
            "label": "Refresh Options On Blur",
            "weight": 19,
            "tooltip": "Refresh data when another field is blured.",
            "dataSrc": "custom",
            "valueProperty": "value",
            "data": {},
            "conditional": {
              "json": {
                "in": [
                  {
                    "var": "data.dataSrc"
                  },
                  [
                    "url",
                    "resource",
                    "values"
                  ]
                ]
              }
            }
          },
          {
            "type": "checkbox",
            "input": true,
            "weight": 20,
            "key": "clearOnRefresh",
            "label": "Clear Value On Refresh Options",
            "defaultValue": false,
            "tooltip": "When the Refresh On field is changed, clear this components value.",
            "conditional": {
              "json": {
                "in": [
                  {
                    "var": "data.dataSrc"
                  },
                  [
                    "url",
                    "resource",
                    "values",
                    "custom"
                  ]
                ]
              }
            }
          },
          {
            "type": "checkbox",
            "input": true,
            "weight": 21,
            "key": "searchEnabled",
            "label": "Enable Static Search",
            "defaultValue": true,
            "tooltip": "When checked, the select dropdown will allow for searching within the static list of items provided."
          },
          {
            "label": "Search Threshold",
            "mask": false,
            "tableView": true,
            "alwaysEnabled": false,
            "type": "number",
            "input": true,
            "key": "selectThreshold",
            "validate": {
              "min": 0,
              "customMessage": "",
              "json": "",
              "max": 1
            },
            "delimiter": false,
            "requireDecimal": false,
            "encrypted": false,
            "defaultValue": 0.3,
            "weight": 22,
            "tooltip": "At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match, a threshold of 1.0 would match anything."
          },
          //{
          //  "type": "checkbox",
          //  "input": true,
          //  "weight": 23,
          //  "key": "addResource",
          //  "label": "Add Resource",
          //  "tooltip": "Allows to create a new resource while entering a submission.",
          //  "conditional": {
          //    "json": {
          //      "===": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        "resource"
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "textfield",
          //  "label": "Add Resource Label",
          //  "key": "addResourceLabel",
          //  "tooltip": "Set the text of the Add Resource button.",
          //  "placeholder": "Add Resource",
          //  "weight": 24,
          //  "input": true,
          //  "conditional": {
          //    "json": {
          //      "and": [
          //        {
          //          "===": [
          //            {
          //              "var": "data.dataSrc"
          //            },
          //            "resource"
          //          ]
          //        },
          //        {
          //          "!!": {
          //            "var": "data.addResource"
          //          }
          //        }
          //      ]
          //    }
          //  }
          //},
          //{
          //  "type": "checkbox",
          //  "input": true,
          //  "weight": 25,
          //  "key": "reference",
          //  "label": "Save as reference",
          //  "tooltip": "Using this option will save this field as a reference and link its value to the value of the origin record.",
          //  "conditional": {
          //    "json": {
          //      "===": [
          //        {
          //          "var": "data.dataSrc"
          //        },
          //        "resource"
          //      ]
          //    }
          //  }
          //},
          {
            "type": "checkbox",
            "input": true,
            "weight": 26,
            "key": "authenticate",
            "label": "Formio Authenticate",
            "tooltip": "Check this if you would like to use Formio Authentication with the request.",
            "conditional": {
              "json": {
                "===": [
                  {
                    "var": "data.dataSrc"
                  },
                  "url"
                ]
              }
            }
          },
          {
            "type": "checkbox",
            "input": true,
            "weight": 27,
            "key": "readOnlyValue",
            "label": "Read Only Value",
            "tooltip": "Check this if you would like to show just the value when in Read Only mode."
          },
          {
            "type": "textarea",
            "as": "json",
            "editor": "ace",
            "weight": 28,
            "input": true,
            "key": "customOptions",
            "label": "Choices.js options",
            "tooltip": "A raw JSON object to use as options for the Select component (Choices JS).",
            "defaultValue": {}
          },
          {
            "type": "checkbox",
            "input": true,
            "weight": 29,
            "key": "useExactSearch",
            "label": "Use exact search",
            "tooltip": "Disables search algorithm threshold."
          },
          //{
          //  "type": "checkbox",
          //  "input": true,
          //  "weight": 29,
          //  "key": "ignoreCache",
          //  "label": "Disables Storing Request Result in the Cache",
          //  "tooltip": "Check it if you don't want the requests and its results to be stored in the cache. By default, it is stored and if the Select tries to make the request to the same URL with the same paremetrs, the cached data will be returned. It allows to increase performance, but if the remote source's data is changing quite often and you always need to keep it up-to-date, uncheck this option.",
          //  "conditional": {
          //    "json": {
          //      "or": [
          //        {
          //          "===": [
          //            {
          //              "var": "data.dataSrc"
          //            },
          //            "url"
          //          ]
          //        },
          //        {
          //          "===": [
          //            {
          //              "var": "data.dataSrc"
          //            },
          //            "resource"
          //          ]
          //        }
          //      ]
          //    }
          //  }
          //},
          {
            "weight": 30,
            "type": "radio",
            "label": "Persistent",
            "tooltip": "A persistent field will be stored in database when the form is submitted.",
            "key": "persistent",
            "input": true,
            "inline": true,
            "defaultValue": true,
            "values": [
              {
                "label": "None",
                "value": false
              },
              {
                "label": "Server",
                "value": true
              },
              {
                "label": "Client",
                "value": "client-only"
              }
            ]
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
            "weight": 400,
            "type": "checkbox",
            "label": "Encrypted (Enterprise Only)",
            "tooltip": "Encrypt this field on the server. This is two way encryption which is not suitable for passwords.",
            "key": "encrypted",
            "input": true
          },
          //{
          //  "type": "select",
          //  "input": true,
          //  "key": "redrawOn",
          //  "label": "Redraw On",
          //  "weight": 600,
          //  "tooltip": "Redraw this component if another component changes. This is useful if interpolating parts of the component like the label.",
          //  "dataSrc": "custom",
          //  "valueProperty": "value",
          //  "data": {},
          //  "conditional": {
          //    "json": {
          //      "!": [
          //        {
          //          "var": "data.dataSrc"
          //        }
          //      ]
          //    }
          //  }
          //},
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
            "weight": 50,
            "type": "checkbox",
            "label": "Perform server validation of remote value",
            "tooltip": "Check this if you would like for the server to perform a validation check to ensure the selected value is an available option. This requires a Search query to ensure a record is found.",
            "key": "validate.select",
            "input": true,
            "conditional": {
              "json": {
                "var": "data.searchField"
              }
            }
          },
          {
            "weight": 52,
            "type": "checkbox",
            "label": "Allow only available values",
            "tooltip": "Check this if you would like to perform a validation check to ensure the selected value is an available option (only for synchronous values).",
            "key": "validate.onlyAvailableItems",
            "input": true,
            "conditional": {
              "json": {
                "in": [
                  {
                    "var": "data.dataSrc"
                  },
                  [
                    "values",
                    "json",
                    "custom"
                  ]
                ]
              }
            }
          },
          {
            "weight": 100,
            "type": "checkbox",
            "label": "Unique",
            "tooltip": "Makes sure the data submitted for this field is unique, and has not been submitted before.",
            "key": "unique",
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
    "key": "type"
  }
]
