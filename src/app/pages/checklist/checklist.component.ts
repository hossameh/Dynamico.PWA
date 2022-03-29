import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from './../../services/alert/alert.service';
import { HttpService } from './../../services/http/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormioEditorOptions } from '@davebaol/angular-formio-editor';
import { Location } from '@angular/common';
import { RecordStatus } from 'src/app/core/enums/status.enum';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss']
})
export class ChecklistComponent implements OnInit {
  @ViewChild('openModal') openModal!: ElementRef;
  @ViewChild('closeModal') closeModal!: ElementRef;


  form: any;
  options!: FormioEditorOptions;
  data: any;
  id!: number;
  editMode = '';
  recordForm!: FormGroup;
  params: any;
  latitude!: number;
  longitude!: number;
  userId!: number;
  modelBody!: any;
  isComplete = false;
  constructor(private route: ActivatedRoute,
    private http: HttpService,
    private router: Router,
    private fb: FormBuilder,
    private location: Location,
    private alert: AlertService
  ) {


  }
  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    this.form = {
      display: "form",
      components: []
    };
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
          submit: (event) => { },
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
    this.id = this.route.snapshot.params.id;
    this.params = this.route.snapshot.queryParams;

    this.isComplete = this.params.Complete == 'true' ? true : false;
    this.buildForm();
    if (this.id && this.params.editMode == 'false') {
      this.getById();
    }
    if (this.id && this.params.editMode == 'true') {
      this.editChecklistRecord();
    }
  }

  buildForm() {
    this.recordForm = this.fb.group({
      form_Id: [+this.id],
      record_Id: [this.params.Record_Id ? +this.params.Record_Id : 0],
      formDataRef: ['', Validators.required],
      form_Record: [''],
      record_Status: [0],
      user_Id: [this.userId],
      isNewRecord: [this.params.editMode == 'true' ? false : true],
      location: [''],
      isSubmitted: [],
      offlineRef: ['']
    });
  }


  back(): void {
    this.location.back();
  };
  getById() {
    this.http.get('Checklist/GetChecklistById', { Id: this.id }).subscribe((value: any) => {
      if (value?.gpsRequired) {
        navigator.geolocation.getCurrentPosition((location) => {
          this.latitude = location.coords.latitude;
          this.longitude = location.coords.longitude;
          this.recordForm.get('location')?.setValue(`${this.latitude},${this.longitude}`);
        },
          (err) => {
            this.location.back();
            this.alert.error('Please accept to share your location first !');
          });
      }
      this.data = value;
      this.recordForm.get('record_Id')?.setValue(0);
      this.recordForm.get('formDataRef')?.setValue(value.formDataRef);
      this.recordForm.get('formDataRef')?.disable();
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
              enabled: false,
              input: {},
              output: {}
            }
          },

          output: {
            submit: this.onFormSubmitted.bind(this, event),
          },
          input: {
            submission: {

            },
            hooks: {

            }
          }
        }
      };
      this.form.components = JSON.parse(value.formControls);
    });
  }

  editChecklistRecord() {
    this.http.get('ChecklistRecords/EditChecklistRecord', { Form_Id: this.id, Record_Id: this.params.Record_Id }).subscribe((value: any) => {
      if (value?.gpsRequired) {
        navigator.geolocation.getCurrentPosition((location) => {
          this.latitude = location.coords.latitude;
          this.longitude = location.coords.longitude;
          this.recordForm.get('location')?.setValue(`${this.latitude},${this.longitude}`);
        },
          (err) => {
            this.location.back();
            this.alert.error('Please accept to share your location first !');
          });
      }
      this.data = value;

      this.recordForm.get('record_Id')?.setValue(+this.params.Record_Id);
      this.recordForm.get('formDataRef')?.setValue(value.formDataRef);
      this.recordForm.get('formDataRef')?.disable();
      let recordJson = value.record_Json; // data
      let dataObject = this.deSerialize(JSON.parse(recordJson));
      this.form.components = JSON.parse(value.form_Layout);
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
              enabled: false,
              input: {},
              output: {}
            }
          },

          output: {
            submit: this.onFormSubmitted.bind(this, event),
          },
          input: {
            // readOnly: this.printed,
            submission: {
              data: dataObject
            },
            hooks: {

            }


          }
        }
      };
    });
  }

  deSerialize(recordDataArray: any) {
    let data: any = {};
    recordDataArray.forEach((item: any) => {
      data[item?.name] = item?.value;
    });
    return data;
  }

  serializeObj(obj: any) {
    let result = [];
    for (var property in obj) {
      result.push({ name: property, value: obj[property] });
    }
    return result;
  }

  onFormSubmitted(sender: any, eventData: any) {

    let recordData = eventData.data;
    let serializedData = this.serializeObj(recordData);
    let formDataStr = JSON.stringify(serializedData);

    this.modelBody = { ...this.recordForm.value };
    this.modelBody.form_Record = serializedData;

    this.openModal.nativeElement.click();


  }

  save() {
    this.modelBody.record_Status = RecordStatus.Pendding;
    this.modelBody.isSubmitted = false;
    this.send()
  }
  submit() {
    this.modelBody.record_Status = RecordStatus.Complete;
    this.modelBody.isSubmitted = true;
    this.modelBody.isNewRecord = false;
    this.send()
  }

  send() {
    console.log('modelBody',this.modelBody);
    this.http.post('Records/SaveFormRecord', this.modelBody).subscribe((res: any) => {
      console.log('res', res);
      if (res.isPassed) {
        this.alert.success(res?.message);
        this.location.back();
      } else {
        this.alert.error(res?.message);
      }
    });
  }
}
