import { AlertService } from './../../../services/alert/alert.service';
import { FormioEditorOptions } from '@davebaol/angular-formio-editor';
import { HttpService } from './../../../services/http/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { Location } from '@angular/common';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { environment } from 'src/environments/environment';
import { NgxQrcodeElementTypes } from '@techiediaries/ngx-qrcode';
import { Storage } from '@ionic/storage-angular';
import { OfflineService } from 'src/app/services/offline/offline.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-details-workflow',
  templateUrl: './details-workflow.component.html',
  styleUrls: ['./details-workflow.component.scss']
})
export class DetailsWorkflowComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  step = 1;
  isLoading = false;
  params: any;
  printPdf: any;
  hasWorkFlow: any;
  form: any;
  options!: FormioEditorOptions;
  data: any;
  userData!: any
  workflowProcess: IWorkflowProcessList[] = [];
  body: any
  comment = '';
  currentDate: any;
  elementType = NgxQrcodeElementTypes.URL;
  qrLink!: string;
  appUrl!: string;
  isOnline = true;
  $subscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    private alert: AlertService,
    private location: Location,
    private router: Router,
    private loadingService: LoadingService,
    private storage: Storage,
    private offline: OfflineService,
  ) { }
  ngOnInit(): void {
    this.currentDate = new Date();
    this.appUrl = environment.APP_URL;
    this.$subscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
    });
    this.loadingService.isLoading.subscribe(isLoading => {
      setTimeout(() => {
        this.isLoading = isLoading;
      });
    });
    this.userData = JSON.parse(localStorage.getItem('userData') || '{}')
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

    this.params = this.route.snapshot.queryParams;
    this.printPdf = this.params.printPdf;
    this.hasWorkFlow = this.params.hasWorkflow;
    if (this.params) {
      this.getRecord();
      this.getWorkflowProcess();
    }
  }

  change(step: number) {
    this.step = step;
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.$subscription.unsubscribe();
  }
  getWorkflowProcess() {
    let body = {
      FormDataId: this.params.Record_Id
    };
    if (this.isOnline)
      this.http.get2('Workflow/GetWorkflowProcessByFormData', body).subscribe((res: any) => {
        this.workflowProcess = res;
        this.cashRecordWorkflowProcess();
      });
    else
      this.getCashedRecordWorkflowProcess();
  }
  getRecord() {
    let body = {
      Form_Id: this.params.Form_Id,
      Record_Id: this.params.Record_Id
    };
    if (this.isOnline) {
      let apiUrl = 'ChecklistRecords/EditChecklistRecord';
      let isQrCode = this.params.isQR;
      if (isQrCode)
        apiUrl = 'ChecklistRecords/CheckIfRecordAssigned';
      this.http.get(apiUrl, body).subscribe((value: any) => {

        if (!value) {
          this.alert.error("Invalid Input Data");
          this.router.navigateByUrl("/page/home")
        }
        this.data = value;
        this.cashRecord();
        this.continueWithData();
      });
    }
    else {
      this.getRecordFromCashe();
    }
  }
  continueWithData() {
    let recordJson = this.data?.record_Json; // data
    let dataObject = this.deSerialize(JSON.parse(recordJson));
    this.form.components = JSON.parse(this.data.form_Layout);
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
          // submit: this.onFormSubmitted.bind(this, event),
        },
        input: {
          readOnly: true,
          submission: {
            data: dataObject
          },
          hooks: {
          }
        }
      }
    };
    if (this.hasWorkFlow == "true")
      this.qrLink = this.appUrl + 'page/qr-scan/' + this.data?.form_Id + '?recordId=' + this.data?.record_Id +
        '&hasWorkFlow=true';
    if (this.hasWorkFlow == "false")
      this.qrLink = this.appUrl + 'page/qr-scan/' + this.data?.form_Id + '?recordId=' + this.data?.record_Id +
        '&hasWorkFlow=false';

    if (this.data && this.printPdf == "true") {
      setTimeout(() => {
        this.printWindow()
      }, 2000)
    }
  }
  async cashRecord() {
    let cashedCheckListRecords = await this.storage.get('CheckListRecords') || [];
    if (cashedCheckListRecords) {
      // check if Record is in cahce
      let index = cashedCheckListRecords.findIndex((el: any) => {
        return el.form_Id == this.params.Form_Id && el.record_Id == this.params.Record_Id;
      });
      // check if Record  is in cahce update data in this index
      if (index >= 0) {
        cashedCheckListRecords[index] = this.data;
      } else {
        //if not found id add a new record
        cashedCheckListRecords.push(this.data);
      }
    } else {
      cashedCheckListRecords.push(this.data);
    }
    await this.storage.set('CheckListRecords', cashedCheckListRecords);
  }
  async getRecordFromCashe() {
    let cashedCheckListRecords = await this.storage.get('CheckListRecords') || [];
    if (cashedCheckListRecords) {
      // check if Record is in cahce
      let index = cashedCheckListRecords.findIndex((el: any) => {
        return el.form_Id == this.params.Form_Id && el.record_Id == this.params.Record_Id;
      });
      // check if Record  is in cahce update data in this index
      if (index >= 0) {
        this.data = cashedCheckListRecords[index];
        this.continueWithData();
      }
    }
  }
  async cashRecordWorkflowProcess() {
    let cashedRecordsWorkflowProcess = await this.storage.get('RecordsWorkflowProcess') || [];
    if (cashedRecordsWorkflowProcess) {
      // check if Category  id is in cahce
      let oldList = cashedRecordsWorkflowProcess.filter((el: any) => el.formDataId == +this.params.Record_Id);
      //remove old info
      cashedRecordsWorkflowProcess = cashedRecordsWorkflowProcess.filter((el: any) => !oldList.includes(el));
      //push new list
      cashedRecordsWorkflowProcess.push(...this.workflowProcess);
    } else {
      cashedRecordsWorkflowProcess.push(...this.workflowProcess);
    }
    await this.storage.set('RecordsWorkflowProcess', cashedRecordsWorkflowProcess);
  }
  async getCashedRecordWorkflowProcess() {
    let cashedList = await this.storage.get('RecordsWorkflowProcess') || [];
    if (cashedList)
      this.workflowProcess = cashedList.filter((el: any) => el.formDataId == +this.params.Record_Id);
  }
  deSerialize(recordDataArray: any) {
    let data: any = {};
    recordDataArray.forEach((item: any) => {
      data[item?.name] = item?.value;
    });
    return data;
  }
  back(): void {
    this.location.back();
  };
  showActionButton(row: IWorkflowProcessList): any {
    if (row?.assignationGroupName && row?.assignationGroupName.length > 0) {
      return (row?.isCurrent && this.userData.userType == row?.assignationGroupName)
    }
    else if (row?.agentId && row?.agentId > 0) {
      return (row.isCurrent && this.userData.userId == row?.agentId);
    }
    return false;
  }

  saveAction(isApproved: boolean, item: IWorkflowProcessList) {
    this.body = {
      isApproved: isApproved,
      agentId: this.userData.userId,
      comment: this.comment,
      id: item.id,
      returnBackToWorkflowProcessId: null
    }
  }

  submit() {
    this.body.comment = this.comment;
    this.http.post('Workflow/UpdateWorkflowProcess', this.body).subscribe(res => {
      this.alert.success('Successfully');
      this.closeModal.nativeElement.click();
      this.comment = '';
      this.getWorkflowProcess();
    })
  }
  checkLarger(start: any, end: any) {
    if (start == null) {
      start = new Date().toLocaleString();
    }
    if (start && end) {
      let date1: Date;
      let date2: Date;
      if (start.length > 5 || end.length > 5) {
        date1 = new Date(start);
        date2 = new Date(end);
      }
      else {
        date1 = new Date("02/14/2022");
        date2 = new Date("02/14/2022");
        date1.setHours(0, 0, 0, 0);
        date2.setHours(0, 0, 0, 0);
        let arr1 = start.toString().split(':');
        let arr2 = end.toString().split(':');
        date1.setHours(arr1[0], arr1[1]);
        date2.setHours(arr2[0], arr2[1]);
      }
      if (date1 > date2)
        return true;
    }
    return false;
  }
  timeDiff(start: any, end: any) {
    // if (end == null) {
    //   end = new Date().toLocaleString();
    // }
    if (start) {
      let date1: Date;
      let date2: Date;
      if (start.length > 5 || end.length > 5) {
        date1 = new Date(start);
        if (end == null)
          date2 = new Date();
        else
          date2 = new Date(end);
      }
      else {
        date1 = new Date("02/14/2022");
        date1.setHours(0, 0, 0, 0);
        let arr1 = start.toString().split(':');
        date1.setHours(arr1[0], arr1[1]);
        if (end == null) {
          date2 = new Date();
        }
        else {
          date2 = new Date("02/14/2022");
          date2.setHours(0, 0, 0, 0);
          let arr2 = end.toString().split(':');
          date2.setHours(arr2[0], arr2[1]);
        }
      }
      return this.calcDiff(date1, date2)
    }
    return {
      days: 0,
      hours: 0,
      minutes: 0,
    }
  }
  calcDiff(d1: any, d2: any) {
    // console.log(d1);
    // console.log(d2);

    var delta = Math.abs(d1.getTime() - d2.getTime()) / 1000;
    if (delta < 0)
      delta = - delta;
    // calculate (and subtract) whole days
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    return {
      days: days,
      hours: hours,
      minutes: minutes,
    }
  }

  printWindow() {
    window.print();
  }
  print(): void {
    let printContents, popupWin;
    printContents = document.getElementById('print-section')?.innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto')
    popupWin?.document.open()
    popupWin?.document.write(`
    <html>
      <head>
        <title>Print tab</title>
        <style>

        .row {
          display: flex;
          flex-wrap: wrap;

      }
        .col-6{
          flex: 0 0 50%;
  max-width: 50%;
        }
        .col-1 {
          flex: 0 0 8.3333333333%;
          max-width: 8.3333333333%;
      }
      .col-2 {
        flex: 0 0 16.6666666667%;
        max-width: 16.6666666667%;
    }
    .col-3 {
      flex: 0 0 25%;
      max-width: 25%;
  }
  .col-4 {
    flex: 0 0 33.3333333333%;
    max-width: 33.3333333333%;
}
.col-5 {
  flex: 0 0 41.6666666667%;
  max-width: 41.6666666667%;
}
button{
display:none
}
.card{
border: 1px solid #000;
border-radius:10px;
padding: 20px;
margin:10px 0;
}
.mat-content p {
font-weight:bold;
padding:10px;
border:1px dashed #000
}
        </style>
      </head>
  <body onload="window.print();window.close()">${printContents}</body>
    </html>`
    )
    popupWin?.document.close()
  }

}
interface IWorkflowProcessList {
  id: number;
  workflowStagesId: number;
  workflowStagesName: string;
  agentId?: number;
  userName: string;
  documentId?: number;
  approveDate?: Date;
  rejectDate?: Date;
  dueDate?: Date;
  comment: string;
  isCurrent?: boolean;
  processOrder?: number;
  isCompleted?: boolean;
  workflowId: number;
  assignationGroupId?: number;
  assignationGroupName: string;
}



