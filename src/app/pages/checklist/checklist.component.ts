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
import { Role } from 'src/app/core/enums/role.enum';
import { HelperService } from 'src/app/services/helper.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { SubmittionState } from './../../core/enums/submittionState';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss']
})
export class ChecklistComponent implements OnInit {
  @ViewChild('openModal') openModal!: ElementRef;
  @ViewChild('closeModal') closeModal!: ElementRef;

  SubmittionState = SubmittionState;
  submitionState = SubmittionState.SaveAndSubmit;
  form: any;
  options!: FormioEditorOptions;
  data: any;
  id!: number;
  editMode = '';
  customerId: any = null;
  recordForm!: FormGroup;
  params: any;
  latitude!: number;
  longitude!: number;
  userId!: number;
  userEmail!: string;
  userRole!: string;
  modelBody!: any;
  isComplete = false;
  isOnline = true;
  statusSubscription!: Subscription;
  statusSubscription2!: Subscription;
  selectedCashedChecklist: any;
  role = Role;
  formType: string = 'form';
  formdefaultDisplayLanguage: any;
  currentLang: any;

  showSaveButton = environment.showSaveButton;
  constructor(private route: ActivatedRoute,
    private http: HttpService,
    private router: Router,
    private fb: FormBuilder,
    private offline: OfflineService,
    private storage: Storage,
    private location: Location,
    private alert: AlertService,
    private helper: HelperService,
    private translate: TranslateService,
  ) {


  }
  ngOnInit(): void {
    this.getOfflineRef();
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    this.userEmail = JSON.parse(localStorage.getItem('userData') || '{}').userEmail;
    this.userRole = JSON.parse(localStorage.getItem('userData') || '{}').userType;
    this.currentLang = localStorage.getItem('lang');
    this.form = {
      display: this.formType,
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
          submission: {
            data: {}
          },
          renderOptions: {
            buttonSettings: {
              showCancel: true,
              showNext: true,
              showPrevious: true,
              showSubmit: false
            }
          }

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
        this.loadFromCashe();
      } else {
        this.loadFromApi();
      }
    });

  }

  loadFromApi() {
    if (this.isOnline) {
      if (this.id && this.params.editMode == 'false') {
        this.getChecklistById();
      }
      if (this.id && this.params.editMode == 'true') {
        this.getRecordToEdit();
      }
    }
  }
  loadFromCashe() {
    if (this.id && this.params.editMode == 'false') {
      this.loadChecklistFromCacheById();
    }
    if (this.id && this.params.editMode == 'true') {
      this.loadRecordFromCacheToEdit();
    }
  }

  buildForm() {
    this.recordForm = this.fb.group({
      form_Id: [+this.id],
      record_Id: [this.params.Record_Id ? +this.params.Record_Id : 0],
      formDataRef: ['', Validators.required],
      customerId: [this.params.customerId ? +this.params.customerId : (this.customerId ? +this.customerId : null)],
      form_Record: [''],
      record_Status: [0],
      user_Id: [this.userId],
      isNewRecord: [this.params.Record_Id && +this.params.Record_Id > 0 ? false : true],
      // isNewRecord: [this.params.editMode == 'true' ? false : true],
      location: [''],
      isSubmitted: [],
      offlineRef: ['']
    });
  }


  back(): void {
    this.location.back();
  };
  getChecklistById() {
    
    this.http.get('Checklist/GetChecklistById', { Id: this.id }).subscribe(async (value: any) => {
      if (value?.gpsRequired) {
        navigator.geolocation.getCurrentPosition((location) => {
          this.latitude = location.coords.latitude;
          this.longitude = location.coords.longitude;
          this.recordForm.get('location')?.setValue(`${this.latitude},${this.longitude}`);
          if (value?.customerId) {
            this.customerId = value?.customerId;
            this.recordForm.get('customerId')?.setValue(value?.customerId);

          }

        },
          (err) => {
            this.location.back();
            this.alert.error('Please accept to share your location first !');
          });
      }

      if (value?.defaultDisplayLanguage) {
        this.formdefaultDisplayLanguage = value?.defaultDisplayLanguage;
        this.langChanged(value.defaultDisplayLanguage);
      }



      let cacheChecklists = await this.storage.get('Checklists') || [];


      if (cacheChecklists) {
        value.userId = this.userId;
        // check if Checklists  id is in cahce
        let index = cacheChecklists.findIndex((el: any) => {
          return el.userId == this.userId && el.formId == +this.id;
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
      this.data.submitionState = value?.submitionState ?? SubmittionState.SaveAndSubmit;
      this.submitionState = this.data.submitionState;
      this.recordForm.get('record_Id')?.setValue(0);
      this.recordForm.get('formDataRef')?.setValue(value?.formDataRef);
      this.recordForm.get('formDataRef')?.disable();
      this.form.display = value?.formType ?? this.formType;
      this.form.components = JSON.parse(value.formControls);
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
              data: {}
            },
            renderOptions: {
              buttonSettings: {
                showCancel: true,
                showNext: true,
                showPrevious: true,
                showSubmit: false
              }
            }

          }
        }
      };

    });
  }

  getRecordToEdit() {
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
      if (value?.customerId) { 
        this.customerId = value?.customerId;
        this.recordForm.get('customerId')?.setValue(value?.customerId);
      }
      if (value?.defaultDisplayLanguage) {
        this.formdefaultDisplayLanguage = value?.defaultDisplayLanguage;
        this.langChanged(value.defaultDisplayLanguage);
      }

      this.data = value;
      this.data.submitionState = value?.submitionState ?? SubmittionState.SaveAndSubmit;
      this.submitionState = this.data.submitionState;
      this.updateCashedRecord();
      this.recordForm.get('record_Id')?.setValue(+this.params.Record_Id);
      this.recordForm.get('formDataRef')?.setValue(value?.formDataRef);
      this.recordForm.get('formDataRef')?.disable();
      let recordJson = value.record_Json; // data
      let dataObject = this.deSerialize(JSON.parse(recordJson));
      this.form.display = value?.formType ?? this.formType;
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
              data: dataObject ?? {}
            },
            renderOptions: {
              buttonSettings: {
                showCancel: true,
                showNext: true,
                showPrevious: true,
                showSubmit: false
              }
            }


          }
        }
      };
    });
  }
  async updateCashedRecord() {
    let cashedRecords = await this.storage.get('Records') || [];
    if (cashedRecords) {
      // check if Record is in cahce
      let index = cashedRecords.findIndex((el: any) => {
        return el.userId == this.userId && el.form_Id == this.id && el.record_Id == this.params.Record_Id;
      });
      // check if Record  is in cahce update data in this index
      if (index >= 0) {

        cashedRecords[index].record_Json = this.data?.record_Json;
      }
      else {
        cashedRecords.unshift({
          record_Id: this.params.Record_Id,
          customerId: this.params.customerId ? +this.params.customerId : (this.customerId ? this.customerId : null),
          form_Id: this.id,
          assigned_Date: null,
          createdBy: null,
          form_Title: this.data?.formTitle,
          record_Status_Id: this.data?.recordStatusId,
          gpS_Required: this.data?.gpsRequired,
          location: this.data?.location,
          formDataRef: this.data?.formDataRef,
          userId: this.userId,
          record_Json: this.data?.record_Json,
          creation_Date: this.data?.creationDate,
          workflowId: this.data?.workflowId,
          form_Layout: this.data?.form_Layout
        });
      }
    }
    await this.storage.set('Records', cashedRecords);
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
    serializedData = this.helper.adaptFormIoDateTimeValue(serializedData, this.form.components);

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
    debugger
    // this.modelBody.formDataRef = this.params.formRef ? this.params.formRef : null;    
    this.modelBody.formDataRef = this.recordForm.get('formDataRef')?.value ? this.recordForm.get('formDataRef')?.value : (this.params.formRef ? this.params.formRef : null);
    this.statusSubscription2 = this.offline.currentStatus.subscribe(async (isOnline) => {
      if (isOnline) {
        this.http.post('ChecklistRecords/SaveFormRecord', this.modelBody).subscribe((res: any) => {
          if (res.isPassed) {
            this.alert.success(this.helper.getTranslation('Form Submitted Successfully'));
            this.location.back();
            this.updateCashedPlanRecords();
          } else {
            console.log(res?.message);
            this.alert.alertError(this.helper.getTranslation('Something Went Wrong'));
            this.alert.alertError(this.helper.getTranslation(res?.message));
            this.alert.alertError(this.helper.getTranslation(this.modelBody));

          }
        });
      } else {
        this.modelBody.creation_Date = new Date();
        this.modelBody.userId = this.userId;
        let cacheRecords = await this.storage.get('Records') || [];
        let cacheCompletedRecords:any[] = await this.storage.get('CompletedRecords') || [];
        let recordsWillBeUpserted = await this.storage.get('RecordsWillBeUpserted') || [];

        if (this.params.offline) {
          let index = cacheRecords.findIndex((el: any) => {
            return el.userId == this.userId && el.offlineRef == this.params.offline;
          });
          this.modelBody.offlineRef = this.params.offline;
          this.modelBody.formDataRef = cacheRecords[index]?.formDataRef;
          if (index >= 0) {
            cacheRecords.splice(index, 1);
            let obj = {
              userId: this.userId,
              assigned_Date: null,
              createdBy: this.userEmail,
              creation_Date: this.modelBody.creation_Date,
              formDataRef: this.modelBody.formDataRef ? this.modelBody.formDataRef : this.params.formRef,
              form_Id: +this.id,
              form_Title: this.selectedCashedChecklist?.formTitle,
              gpS_Required: this.selectedCashedChecklist?.gpsRequired,
              location: null,
              record: this.modelBody.form_Record,
              record_Id: this.params.Record_Id ? +this.params.Record_Id : 0,
              customerId: this.params.customerId ? +this.params.customerId : (this.customerId ? +this.customerId : null),
              record_Status_Id: this.modelBody.record_Status == RecordStatus.Created ? RecordStatus.Created :
                (this.selectedCashedChecklist?.workflowId ? RecordStatus.PendingApproval : RecordStatus.Completed),
              workflowId: this.selectedCashedChecklist?.workflowId,
              offlineRef: this.modelBody.offlineRef,
            }
            if (this.modelBody.record_Status == RecordStatus.Completed && !this.selectedCashedChecklist?.workflowId)
              cacheCompletedRecords.unshift(obj);
            else
              cacheRecords.unshift(obj);

          } else {
            //if not found
            this.modelBody.offlineRef = this.getOfflineRef();
            // this.modelBody.offlineRef = 'offline' + (cacheRecords.length + 1);
            let obj = {
              userId: this.userId,
              assigned_Date: null,
              createdBy: this.userEmail,
              creation_Date: this.modelBody.creation_Date,
              formDataRef: this.modelBody.formDataRef ? this.modelBody.formDataRef : this.params.formRef,
              form_Id: +this.id,
              form_Title: this.selectedCashedChecklist?.formTitle,
              gpS_Required: this.selectedCashedChecklist?.gpsRequired,
              location: null,
              record: this.modelBody.form_Record,
              record_Id: this.params.Record_Id ? +this.params.Record_Id : 0,
              customerId: this.params.customerId ? +this.params.customerId : (this.customerId ? +this.customerId : null),
              record_Status_Id: this.modelBody.record_Status == RecordStatus.Created ? RecordStatus.Created :
                (this.selectedCashedChecklist?.workflowId ? RecordStatus.PendingApproval : RecordStatus.Completed),
              workflowId: this.selectedCashedChecklist?.workflowId,
              offlineRef: this.modelBody.offlineRef,
            }
            if (this.modelBody.record_Status == RecordStatus.Completed && !this.selectedCashedChecklist?.workflowId)
              cacheCompletedRecords.unshift(obj);
            else
              cacheRecords.unshift(obj);
          }
          let savedIndex = recordsWillBeUpserted.findIndex((el: any) => {
            return el.userId == this.userId && el.offlineRef == this.params.offline;
          });
          if (savedIndex >= 0) {
            recordsWillBeUpserted[savedIndex] = this.modelBody;
          } else {
            //if not saved before to be upserted
            recordsWillBeUpserted.push(this.modelBody);
          }

        } else {
          this.modelBody.offlineRef = this.getOfflineRef();
          // if (cacheRecords.length > 0)
          //   this.modelBody.offlineRef = 'offline' + (cacheRecords.length + 1);
          // else
          //   this.modelBody.offlineRef = 'offline1';
          if (this.params.editMode == 'true') {
            let index = cacheRecords.findIndex((el: any) => {
              return el.userId == this.userId && el.record_Id == this.params.Record_Id;
            });
            this.modelBody.formDataRef = cacheRecords[index]?.formDataRef;
            if (index >= 0) {
              cacheRecords.splice(index, 1);
              let obj = {
                userId: this.userId,
                assigned_Date: null,
                createdBy: this.userEmail,
                creation_Date: this.modelBody.creation_Date,
                formDataRef: this.modelBody.formDataRef ? this.modelBody.formDataRef : this.params.formRef,
                form_Id: +this.id,
                form_Title: this.selectedCashedChecklist?.formTitle,
                gpS_Required: this.selectedCashedChecklist?.gpsRequired,
                location: null,
                record: this.modelBody.form_Record,
                record_Id: this.params.Record_Id ? +this.params.Record_Id : 0,
                customerId: this.params.customerId ? +this.params.customerId : (this.customerId ?+this.customerId : null),
                record_Status_Id: this.modelBody.record_Status == RecordStatus.Created ? RecordStatus.Created :
                  (this.selectedCashedChecklist?.workflowId ? RecordStatus.PendingApproval : RecordStatus.Completed),
                workflowId: this.selectedCashedChecklist?.workflowId,
                offlineRef: this.modelBody.offlineRef ?? '',
              }
              if (this.modelBody.record_Status == RecordStatus.Completed && !this.selectedCashedChecklist?.workflowId)
                cacheCompletedRecords.unshift(obj);
              else
                cacheRecords.unshift(obj);
            }
            else {
              let obj = {
                userId: this.userId,
                assigned_Date: null,
                createdBy: this.userEmail,
                creation_Date: this.modelBody.creation_Date,
                formDataRef: this.modelBody.formDataRef ? this.modelBody.formDataRef : this.params.formRef,
                form_Id: +this.id,
                form_Title: this.selectedCashedChecklist?.formTitle,
                gpS_Required: this.selectedCashedChecklist?.gpsRequired,
                location: null,
                record: this.modelBody.form_Record,
                record_Id: this.params.Record_Id ? +this.params.Record_Id : 0,
                customerId: this.params.customerId ? +this.params.customerId : (this.customerId ? +this.customerId : null),
                record_Status_Id: this.modelBody.record_Status == RecordStatus.Created ? RecordStatus.Created :
                  (this.selectedCashedChecklist?.workflowId ? RecordStatus.PendingApproval : RecordStatus.Completed),
                workflowId: this.selectedCashedChecklist?.workflowId,
                offlineRef: this.modelBody.offlineRef ?? '',
              }
              if (this.modelBody.record_Status == RecordStatus.Completed && !this.selectedCashedChecklist?.workflowId)
                cacheCompletedRecords.unshift(obj);
              else
                cacheRecords.unshift(obj);
            }
          }
          else {
            let obj = {
              userId: this.userId,
              assigned_Date: null,
              createdBy: this.userEmail,
              creation_Date: this.modelBody.creation_Date,
              formDataRef: this.modelBody.formDataRef ? this.modelBody.formDataRef : this.params.formRef,
              form_Id: +this.id,
              form_Title: this.selectedCashedChecklist?.formTitle,
              gpS_Required: this.selectedCashedChecklist?.gpsRequired,
              location: null,
              record: this.modelBody.form_Record,
              customerId: this.params.customerId ? +this.params.customerId : (this.customerId ? +this.customerId : null),

              record_Id: this.params.Record_Id ? +this.params.Record_Id : 0,
              record_Status_Id: this.modelBody.record_Status == RecordStatus.Created ? RecordStatus.Created :
                (this.selectedCashedChecklist?.workflowId ? RecordStatus.PendingApproval : RecordStatus.Completed),
              workflowId: this.selectedCashedChecklist?.workflowId,
              offlineRef: this.modelBody.offlineRef ?? '',
            }
            if (this.modelBody.record_Status == RecordStatus.Completed && !this.selectedCashedChecklist?.workflowId)
              cacheCompletedRecords.unshift(obj);
            else
              cacheRecords.unshift(obj);
          }

          recordsWillBeUpserted.push(this.modelBody);
        }

        await this.storage.set('RecordsWillBeUpserted', recordsWillBeUpserted);
        await this.storage.set('Records', cacheRecords);
        await this.storage.set('CompletedRecords', cacheCompletedRecords);
        this.updateCashedPlanRecords();
        this.location.back();
      }
    });
    this.statusSubscription2.unsubscribe();
  }

  async loadChecklistFromCacheById() {
    let cacheChecklists = await this.storage.get('Checklists') || [];
    let value: any = {};
    if (cacheChecklists.length > 0) {
      value = cacheChecklists.filter((el: any) => el.userId == this.userId && el.formId == this.id)[0];
      this.selectedCashedChecklist = value;
      if (value?.gpsRequired) {
        navigator.geolocation.getCurrentPosition((location) => {
          this.latitude = location.coords.latitude;
          this.longitude = location.coords.longitude;
          this.recordForm.get('location')?.setValue(`${this.latitude},${this.longitude}`);
        }
          // ,(err) => {
          //     this.location.back();
          //     this.alert.error('Please accept to share your location first !');
          //   }
        );
      }
      if (value) {

        this.recordForm.get('record_Id')?.setValue(0);
        this.recordForm.get('formDataRef')?.setValue(value?.formDataRef);
        this.recordForm.get('formDataRef')?.disable();

        this.form.display = value?.formType ?? this.formType;
        this.form.components = JSON.parse(value.formControls);
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
                data: {}
              },
              renderOptions: {
                buttonSettings: {
                  showCancel: true,
                  showNext: true,
                  showPrevious: true,
                  showSubmit: false
                }
              }

            }
          }
        };
      }
    }
  }

  async loadRecordFromCacheToEdit() {

    let cacheChecklists = await this.storage.get('Checklists') || [];
    let cacheRecords = await this.storage.get('Records') || [];
    let valueChecklist: any = {};
    let valueRecord: any = {};
    if (cacheRecords.length > 0) {

      valueChecklist = cacheChecklists.filter((el: any) => el.userId == this.userId && el.formId == this.id)[0];
      this.selectedCashedChecklist = valueChecklist;
      this.selectedCashedChecklist.submitionState = valueChecklist?.submitionState ?? SubmittionState.SaveAndSubmit;
      this.submitionState = this.selectedCashedChecklist.submitionState;
      valueRecord = cacheRecords.filter((el: any) => el.userId == this.userId && el.record_Id == this.params.Record_Id)[0];

      let requireGps = valueChecklist?.gpsRequired ? valueChecklist?.gpsRequired : valueRecord?.gpS_Required;
      if (requireGps) {
        navigator.geolocation.getCurrentPosition((location) => {
          this.latitude = location.coords.latitude;
          this.longitude = location.coords.longitude;
          this.recordForm.get('location')?.setValue(`${this.latitude},${this.longitude}`);
        }
          // ,
          //   (err) => {
          //     this.location.back();
          //     this.alert.error('Please accept to share your location first !');
          //   }
        );
      }
      //  console.log(valueRecord);
      //  console.log(valueChecklist);
      if (valueRecord) {

        this.recordForm.get('record_Id')?.setValue(+this.params.Record_Id);
        this.recordForm.get('formDataRef')?.setValue(this.params.offline);
        this.recordForm.get('formDataRef')?.disable();

        let recordJson = valueRecord.record ? valueRecord.record : valueRecord.record_Json; // data

        let dataObject = (this.modelBody?.offlineRef || this.params?.offline) ?
          this.deSerialize(recordJson) :
          this.deSerialize(JSON.parse(recordJson));

        this.form.display = valueChecklist?.formType ?? this.formType;
        this.form.components = JSON.parse(valueChecklist?.formControls ? valueChecklist?.formControls : valueRecord.form_Layout);
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
                data: dataObject ?? {}
              },
              renderOptions: {
                buttonSettings: {
                  showCancel: true,
                  showNext: true,
                  showPrevious: true,
                  showSubmit: false
                }
              }


            }
          }
        };
      }
      else {
        this.alert.info("No Internet Connection");
        this.location.back();
      }

    }
  }
  ngOnDestroy(): void {
    if (this.currentLang && this.formdefaultDisplayLanguage && this.formdefaultDisplayLanguage != this.currentLang) {
        this.langChanged(this.currentLang);
    }

    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.statusSubscription.unsubscribe();

  }
  async updateCashedPlanRecords() {
    let cashedListPlans = await this.storage.get("ListPlans") || [];
    cashedListPlans.forEach((day: any) => {
      day.list.forEach((element: any) => {
        if (element.isCreateFormData == true && element.plannerFormsData && element.plannerFormsData[0].formsData) {
          let record = element.plannerFormsData[0].formsData;
          if (record.formDataId == +this.params.Record_Id && record.userId == this.userId) {
            element.plannerFormsData[0].formsData.recordStatusId = this.modelBody.record_Status;
          }
        }
      });
    });
    await this.storage.set("ListPlans", cashedListPlans)
  }
  getOfflineRef() {
    let date = new Date().toISOString();
    return "offline-" + date;
  }


  langChanged(lang: any) {
    const elEn = document.querySelector('#bootstrap-en');
    const elAr = document.querySelector('#bootstrap-ar');
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    if (lang === 'ar') {
      // add bootstrap ar
      elEn && elEn.remove();
      if (!elAr) {
        this.generateLinkElement({
          id: 'bootstrap-ar',
          href: 'assets/vendor/bootstrap/bootstrap.rtl.min.css',
          dir: 'rtl',
          lang: 'ar',
        });
      }
    } else {
      // en
      elAr && elAr.remove();
      if (!elEn) {
        this.generateLinkElement({
          id: 'bootstrap-en',
          href: 'assets/vendor/bootstrap/bootstrap.min.css',
          dir: 'ltr',
          lang: 'en',
        });
      }
    }
  }
  generateLinkElement(props: any) {
    const el = document.createElement('link');
    const htmlEl = document.getElementsByTagName('html')[0];
    el.rel = 'stylesheet';
    el.href = props.href;
    el.id = props.id;
    document.head.prepend(el);
    htmlEl.setAttribute('dir', props.dir);
    htmlEl.setAttribute('lang', props.lang);

  }
}
