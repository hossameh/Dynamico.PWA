import { OfflineService } from './../../services/offline/offline.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from './../../services/alert/alert.service';
import { HttpService } from './../../services/http/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormioEditorOptions } from '@davebaol/angular-formio-editor';
import { Location } from '@angular/common';
import { RecordStatus } from 'src/app/core/enums/status.enum';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';

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
  isOnline = true;
  statusSubscription!: Subscription;
  statusSubscription2!: Subscription;

  constructor(private route: ActivatedRoute,
    private http: HttpService,
    private router: Router,
    private fb: FormBuilder,
    private offline: OfflineService,
    private storage: Storage,
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
          // readOnly: true,


        }
      }
    };
    this.id = this.route.snapshot.params.id;
    this.params = this.route.snapshot.queryParams;

    this.isComplete = this.params.Complete == 'true' ? true : false;
    this.buildForm();
    this.statusSubscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      if (!isOnline) {
        if (this.id && this.params.editMode == 'false') {
          this.loadFromCacheById();
        }
        if (this.id && this.params.editMode == 'true') {
          this.loadFromCacheByIdEdit();
        }
      } else {
        this.loadFromApi();
      }
    });

  }

  loadFromApi() {
    if (this.isOnline) {
      if (this.id && this.params.editMode == 'false') {
        this.getById();
      }
      if (this.id && this.params.editMode == 'true') {
        this.editChecklistRecord();
      }
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
    this.http.get('Checklist/GetChecklistById', { Id: this.id }).subscribe(async (value: any) => {
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
      let cacheChecklists = await this.storage.get('Checklists') || [];


      if (cacheChecklists) {
        // check if Checklists  id is in cahce
        let index = cacheChecklists.findIndex((el: any) => {
          return el.formId == +this.id;
        });
        // check if Checklists  id is in cahce update data in this index
        if (index >= 0) {
          cacheChecklists[index] = value;
        } else {
          //if not found id add a new record
          cacheChecklists.push(value);
        }
      } else {
        cacheChecklists.push(value);
      }
      await this.storage.set('Checklists', cacheChecklists);
      this.data = value;

      this.recordForm.get('record_Id')?.setValue(0);
      this.recordForm.get('formDataRef')?.setValue(value?.formDataRef);
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
    let apiUrl = 'ChecklistRecords/EditChecklistRecord';
    let isQrCode = this.params.isQR;
    if (isQrCode)
      apiUrl = 'ChecklistRecords/CheckIfRecordAssigned';
    this.http.get(apiUrl, { Form_Id: this.id, Record_Id: this.params.Record_Id }).subscribe((value: any) => {
      if (!value) {
        this.alert.error("Invalid Input Data");
        this.router.navigateByUrl("/page/home")
      }
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
      this.recordForm.get('formDataRef')?.setValue(value?.formDataRef);
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
            readOnly: !!this.params.Complete ? true : false,
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
    this.modelBody.record_Status = RecordStatus.Created;
    this.modelBody.isSubmitted = false;

    this.send();
  }
  submit() {
    this.modelBody.record_Status = RecordStatus.Completed;
    this.modelBody.isSubmitted = true;
    this.send();
  }

  send() {
    this.modelBody.formDataRef = this.params.formRef ? this.params.formRef : null;
    this.statusSubscription2 = this.offline.currentStatus.subscribe(async (isOnline) => {
      if (isOnline) {
        this.http.post('ChecklistRecords/SaveFormRecord', this.modelBody).subscribe((res: any) => {
          if (res.isPassed) {
            this.alert.success('Successfully');
            this.location.back();
          } else {
            this.alert.error(res?.message);
          }
        });
      } else {
        this.modelBody.creation_Date = new Date();

        let cacheRecords = await this.storage.get('Records') || [];
        if (this.params.offline) {
          let index = cacheRecords.findIndex((el: any) => {
            return el.offlineRef == this.params.offline;
          });
          this.modelBody.offlineRef = this.params.offline;
          if (index >= 0) {
            cacheRecords[index] = this.modelBody;
          } else {
            //if not found
            this.modelBody.offlineRef = 'offline#' + (cacheRecords.length + 1);
            cacheRecords.push(this.modelBody);
          }

        } else {
          if (cacheRecords.length > 0) {
            this.modelBody.offlineRef = 'offline#' + (cacheRecords.length + 1);
            cacheRecords.push(this.modelBody);
          } else {
            this.modelBody.offlineRef = 'offline#1';
            cacheRecords.push(this.modelBody);
          }
        }

        await this.storage.set('Records', cacheRecords);
        this.location.back();
      }
    });
    this.statusSubscription2.unsubscribe();
  }

  async loadFromCacheById() {
    let cacheChecklists = await this.storage.get('Checklists') || [];
    let value: any = {};
    if (cacheChecklists.length > 0) {
      value = cacheChecklists.filter((el: any) => el.formId == this.id)[0];
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
      if (value) {

        this.recordForm.get('record_Id')?.setValue(0);
        this.recordForm.get('formDataRef')?.setValue(value?.formDataRef);
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
      }
    }
  }

  async loadFromCacheByIdEdit() {

    let cacheChecklists = await this.storage.get('Checklists') || [];
    let cacheRecords = await this.storage.get('Records') || [];
    let valueChecklist: any = {};
    let valueRecord: any = {};
    if (cacheChecklists.length > 0 && cacheRecords.length > 0) {
      valueChecklist = cacheChecklists.filter((el: any) => el.formId == this.id)[0];
      valueRecord = cacheRecords.filter((el: any) => el.offlineRef == this.params.offline)[0];
      if (valueChecklist?.gpsRequired) {
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
      if (valueRecord) {
        this.recordForm.get('record_Id')?.setValue(+this.params.Record_Id);
        this.recordForm.get('formDataRef')?.setValue(this.params.offline);
        this.recordForm.get('formDataRef')?.disable();
        let recordJson = valueRecord.form_Record; // data
        let dataObject = this.deSerialize(recordJson);
        this.form.components = JSON.parse(valueChecklist.formControls);
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
              readOnly: !!this.params.Complete ? true : false,
              submission: {
                data: dataObject
              },
              hooks: {

              }


            }
          }
        };
      }

    }
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.statusSubscription.unsubscribe();

  }
}
