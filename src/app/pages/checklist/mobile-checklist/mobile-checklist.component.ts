import { OfflineService } from './../../../services/offline/offline.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from './../../../services/alert/alert.service';
import { HttpService } from './../../../services/http/http.service';
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
@Component({
  selector: 'app-mobile-checklist',
  templateUrl: './mobile-checklist.component.html',
  styleUrls: ['./mobile-checklist.component.scss']
})
export class MobileChecklistComponent implements OnInit {
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
  // userId!: number;
  // userEmail!: string;
  // userRole!: string;
  modelBody!: any;
  isComplete = false;
  isOnline = true;
  // statusSubscription!: Subscription;
  // statusSubscription2!: Subscription;
  // selectedCashedChecklist: any;
  role = Role;
  formType: string = 'form';
  formdefaultDisplayLanguage: any;
  currentLang: any;
  constructor(private route: ActivatedRoute,
    private http: HttpService,
    private router: Router,
    private fb: FormBuilder,
    // private offline: OfflineService,
    // private storage: Storage,
    private location: Location,
    private alert: AlertService,
    private helper: HelperService,
    private translate: TranslateService,
  ) {


  }
  ngOnInit(): void {
    // this.getOfflineRef();
    // this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    // this.userRole = JSON.parse(localStorage.getItem('userData') || '{}').userType;
    this.currentLang = localStorage.getItem('lang') ?? 'en';
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
    this.loadFromApi();
  }

  loadFromApi() {
    if (this.id && this.params.editMode == 'false') {
      this.getChecklistById();
    }
    if (this.id && this.params.editMode == 'true') {
      this.getRecordToEdit();
    }
  }
  buildForm() {
    this.recordForm = this.fb.group({
      form_Id: [+this.id],
      record_Id: [this.params.Record_Id ? +this.params.Record_Id : 0],
      formDataRef: ['', Validators.required],
      form_Record: [''],
      record_Status: [0],
      user_Id: [0],
      // user_Id: [this.userId],
      isNewRecord: [this.params.Record_Id && +this.params.Record_Id > 0 ? false : true],
      // isNewRecord: [this.params.editMode == 'true' ? false : true],
      location: [''],
      isSubmitted: [],
      offlineRef: ['']
    });
  }


  // back(): void {
  //   this.location.back();
  // };
  getChecklistById() {

    this.http.get('Checklist/GetChecklistById', { Id: this.id }).subscribe(async (value: any) => {
      if (value?.gpsRequired) {
        navigator?.geolocation?.getCurrentPosition((location) => {
          this.latitude = location.coords.latitude;
          this.longitude = location.coords.longitude;
          this.recordForm.get('location')?.setValue(`${this.latitude},${this.longitude}`);
        },
          (err) => {
            // this.location.back();
            this.alert.error('Please accept to share your location first !');
          });
      }

      if (value?.defaultDisplayLanguage) {
        this.formdefaultDisplayLanguage = value?.defaultDisplayLanguage;
        this.langChanged(value.defaultDisplayLanguage);
      }
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
    // let isQrCode = this.params.isQR;
    // if (isQrCode)
    //   apiUrl = 'ChecklistRecords/CheckIfRecordAssigned';
    this.http.get(apiUrl, { Form_Id: this.id, Record_Id: this.params.Record_Id }).subscribe((value: any) => {
      if (!value) {
        this.alert.error("Invalid Input Data");
        this.router.navigateByUrl("/page/home")
      }
      if (value?.gpsRequired) {
        navigator?.geolocation?.getCurrentPosition((location) => {
          this.latitude = location.coords.latitude;
          this.longitude = location.coords.longitude;
          this.recordForm.get('location')?.setValue(`${this.latitude},${this.longitude}`);
        },
          (err) => {
            // this.location.back();
            this.alert.error('Please accept to share your location first !');
          });
      }

      if (value?.defaultDisplayLanguage) {
        this.formdefaultDisplayLanguage = value?.defaultDisplayLanguage;
        this.langChanged(value.defaultDisplayLanguage);
      }

      this.data = value;
      // this.updateCashedRecord();
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
    // this.modelBody.formDataRef = this.params.formRef ? this.params.formRef : null;
    this.modelBody.formDataRef = this.recordForm.get('formDataRef')?.value ? this.recordForm.get('formDataRef')?.value : (this.params.formRef ? this.params.formRef : null);

    this.http.post('ChecklistRecords/SaveFormRecord', this.modelBody).subscribe((res: any) => {
      if (res.isPassed) {
        this.alert.success(this.helper.getTranslation('Form Submitted Successfully'));
        // this.location.back();
        // this.updateCashedPlanRecords();
      } else {
        console.log(res?.message);
        this.alert.error("Something Went Wrong !");
      }
    });
  }
  ngOnDestroy(): void {
    if (this.currentLang && this.formdefaultDisplayLanguage && this.formdefaultDisplayLanguage != this.currentLang) {

      this.langChanged(this.currentLang);
    }

    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    // this.statusSubscription.unsubscribe();

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