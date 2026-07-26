export const aiRoomCameraAuditEditForm = [
  {
    type: 'tabs',
    key: 'tabs',
    components: [
      {
        key: 'display',
        label: 'Display',
        weight: 0,
        components: [
          {
            weight: 0,
            type: 'textfield',
            input: true,
            key: 'label',
            label: 'Label',
            placeholder: 'Field Label',
            tooltip: 'The label for this field that will appear next to it.',
            validate: { required: true }
          },
          {
            weight: 200,
            type: 'textarea',
            input: true,
            key: 'description',
            label: 'Description',
            placeholder: 'Description for this field.',
            tooltip: 'The description is text that will appear below the input field.'
          },
          {
            weight: 300,
            type: 'textarea',
            input: true,
            key: 'tooltip',
            label: 'Tooltip',
            placeholder: 'To add a tooltip to this field, enter text here.',
            tooltip: 'Adds a tooltip to the side of this field.'
          },
          {
            weight: 1100,
            type: 'checkbox',
            label: 'Hidden',
            tooltip: 'A hidden field is still a part of the form, but is hidden from view.',
            key: 'hidden',
            input: true
          },
          {
            weight: 1200,
            type: 'checkbox',
            label: 'Hide Label',
            tooltip: 'Hide the label of this component when rendered.',
            key: 'hideLabel',
            input: true
          },
          {
            weight: 1400,
            type: 'checkbox',
            label: 'Disabled',
            tooltip: 'Disable the form input.',
            key: 'disabled',
            input: true
          },
          {
            weight: 1500,
            type: 'checkbox',
            label: 'Table View',
            tooltip: 'Shows this value within the table view of the submissions.',
            key: 'tableView',
            input: true
          }
        ]
      },
      {
        key: 'aiSettings',
        label: 'AI Audit Settings',
        weight: 5,
        components: [
          {
            type: 'textfield',
            input: true,
            key: 'roomsEndpoint',
            label: 'Rooms List Endpoint (GET)',
            defaultValue: '',
            placeholder: 'https://www.example.com/api/Rooms/GetList',
            tooltip: 'If set, enables room-driven audit: the component fetches rooms from this GET endpoint, the user picks Floor/Room Type/Room Number, then audits only the objects defined for the selected room. Leave empty to keep the legacy auto-detect-all behavior.',
            weight: 1
          },
          {
            type: 'textfield',
            input: true,
            key: 'roomFloorKey',
            label: 'Room Record Floor Key',
            defaultValue: 'floor',
            placeholder: 'floor',
            tooltip: 'Field name in the room record that holds the floor value. Used to populate the Floor filter.',
            weight: 2
          },
          {
            type: 'textfield',
            input: true,
            key: 'roomNumberKey',
            label: 'Room Record Number Key',
            defaultValue: 'roomNumber',
            placeholder: 'roomNumber',
            tooltip: 'Field name in the room record that holds the room number. Used to populate the Room Number filter.',
            weight: 3
          },
          {
            type: 'textfield',
            input: true,
            key: 'roomTypeKey',
            label: 'Room Record Type Key',
            defaultValue: 'roomType',
            placeholder: 'roomType',
            tooltip: 'Field name in the room record that holds the room type. Used to populate the Room Type filter.',
            weight: 4
          },
          {
            type: 'textfield',
            input: true,
            key: 'roomActiveKey',
            label: 'Room Record Active Flag Key',
            defaultValue: 'isActive',
            placeholder: 'isActive',
            tooltip: 'Field name in the room record that indicates whether the room is active. Only active rooms are listed.',
            weight: 5
          },
          {
            type: 'textfield',
            input: true,
            key: 'roomAuditObjectsKey',
            label: 'Room Record Audit Objects Key',
            defaultValue: 'auditObjects',
            placeholder: 'auditObjects',
            tooltip: 'Field name in the room record that holds the stringified JSON array of objects to audit (e.g. [{"cocoLabel":"bed","quantity":2}]).',
            weight: 6
          },
          {
            type: 'textfield',
            input: true,
            key: 'auditEndpoint',
            label: 'AI Audit Endpoint',
            defaultValue: 'https://dummy-ai-api.dynamico.local/api/room-audit/area',
            placeholder: 'https://dummy-ai-api.dynamico.local/api/room-audit/area',
            tooltip: 'The proxy/backend endpoint that will receive the audit frame payload.',
            weight: 10
          },
          {
            type: 'number',
            input: true,
            key: 'confidenceThreshold',
            label: 'Confidence Threshold',
            defaultValue: 0.70,
            placeholder: '0.70',
            tooltip: 'Minimum threshold confidence required to map COCO-SSD prediction.',
            weight: 20
          },
          {
            type: 'number',
            input: true,
            key: 'stableFramesRequired',
            label: 'Stable Frames Required',
            defaultValue: 4,
            placeholder: '4',
            tooltip: 'Number of consecutive frames the object must be detected to trigger audit.',
            weight: 30
          },
          {
            type: 'number',
            input: true,
            key: 'cooldownSecondsPerArea',
            label: 'Cooldown Seconds Per Area',
            defaultValue: 30,
            placeholder: '30',
            tooltip: 'Number of seconds to wait before auditing the same area again.',
            weight: 40
          },
          {
            type: 'number',
            input: true,
            key: 'globalMinSecondsBetweenAuditCalls',
            label: 'Global Minimum Seconds Between Audit Calls',
            defaultValue: 3,
            placeholder: '3',
            tooltip: 'Global throttle in seconds between any two audit backend calls.',
            weight: 50
          },
          {
            type: 'number',
            input: true,
            key: 'maxAuditsPerSession',
            label: 'Max Audits Per Session',
            defaultValue: 10,
            placeholder: '10',
            tooltip: 'Maximum number of AI audit calls allowed per camera session.',
            weight: 60
          },
          {
            type: 'checkbox',
            input: true,
            key: 'autoCapture',
            label: 'Auto Capture Enabled',
            defaultValue: true,
            tooltip: 'Automatically capture and send when a stable target is confirmed.',
            weight: 70
          },
          {
            type: 'checkbox',
            input: true,
            key: 'showBoundingBoxes',
            label: 'Show Bounding Boxes',
            defaultValue: true,
            tooltip: 'Draw real-time bounding boxes over detected objects.',
            weight: 80
          },
          {
            type: 'checkbox',
            input: true,
            key: 'showAuditOverlay',
            label: 'Show Live Audit Overlay',
            defaultValue: true,
            tooltip: 'Show detailed audit status and messages over the video stream.',
            weight: 90
          },
          {
            type: 'number',
            input: true,
            key: 'cameraWidth',
            label: 'Camera Frame Width (px)',
            defaultValue: 720,
            placeholder: '720',
            tooltip: 'Visual width of the camera container on screen in pixels (use 0 or leave empty for responsive width).',
            weight: 100
          },
          {
            type: 'number',
            input: true,
            key: 'cameraHeight',
            label: 'Camera Frame Height (px)',
            defaultValue: 405,
            placeholder: '405',
            tooltip: 'Visual height of the camera container on screen in pixels (use 0 or leave empty for responsive height).',
            weight: 110
          },
          {
            type: 'number',
            input: true,
            key: 'cameraZoom',
            label: 'Camera Zoom Level',
            defaultValue: 1,
            placeholder: '1',
            tooltip: 'Requested camera zoom level (e.g. 1, 2, etc. depends on hardware support).',
            weight: 120
          }
        ]
      },
      {
        label: 'API',
        key: 'api',
        weight: 30,
        components: [
          {
            weight: 0,
            type: 'textfield',
            input: true,
            key: 'key',
            label: 'Property Name',
            tooltip: 'The name of this field in the API endpoint.',
            validate: {
              pattern: '(\\w|\\w[\\w-.]*\\w)',
              patternMessage: 'The property name must only contain alphanumeric characters, underscores, dots and dashes.',
              required: true
            }
          },
          {
            weight: 100,
            type: 'tags',
            input: true,
            label: 'Field Tags',
            storeas: 'array',
            tooltip: 'Tag the field for use in custom logic.',
            key: 'tags'
          },
          {
            weight: 200,
            type: 'datamap',
            label: 'Custom Properties',
            tooltip: 'This allows you to configure any custom properties for this component.',
            key: 'properties',
            valueComponent: {
              type: 'textfield',
              key: 'value',
              label: 'Value',
              placeholder: 'Value',
              input: true
            }
          }
        ]
      },
      {
        label: 'Conditional',
        key: 'conditional',
        weight: 40,
        components: [
          {
            type: 'panel',
            title: 'Simple',
            key: 'simple-conditional',
            theme: 'default',
            components: [
              {
                type: 'select',
                input: true,
                label: 'This component should Display:',
                key: 'conditional.show',
                dataSrc: 'values',
                data: {
                  values: [
                    { label: 'True', value: 'true' },
                    { label: 'False', value: 'false' }
                  ]
                }
              },
              {
                type: 'select',
                input: true,
                label: 'When the form component:',
                key: 'conditional.when',
                dataSrc: 'custom',
                valueProperty: 'value',
                data: {}
              },
              {
                type: 'textfield',
                input: true,
                label: 'Has the value:',
                key: 'conditional.eq'
              }
            ]
          },
          {
            type: 'panel',
            title: 'Advanced Conditions',
            theme: 'default',
            collapsible: true,
            collapsed: true,
            key: 'customConditionalPanel',
            weight: 110,
            components: [
              {
                type: 'textarea',
                key: 'customConditional',
                rows: 5,
                editor: 'ace',
                hideLabel: true,
                as: 'javascript',
                input: true
              },
              {
                type: 'htmlelement',
                tag: 'div',
                content: '<p><strong>Example:</strong> <code>show = data.myField === \'yes\';</code></p>'
              }
            ]
          }
        ]
      }
    ]
  }
];
