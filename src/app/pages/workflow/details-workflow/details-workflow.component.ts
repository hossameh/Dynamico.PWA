import { AlertService } from './../../../services/alert/alert.service';
import { FormioEditorOptions } from '@davebaol/angular-formio-editor';
import { HttpService } from './../../../services/http/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-details-workflow',
  templateUrl: './details-workflow.component.html',
  styleUrls: ['./details-workflow.component.scss']
})
export class DetailsWorkflowComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  step = 1;

  params: any;
  form: any;
  options!: FormioEditorOptions;
  data: any;
  userData!: any
  workflowProcess: IWorkflowProcessList[] = [];
  body: any
  comment = ''
  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    private alert: AlertService,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit(): void {

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
    if (this.params) {
      this.getRecord();
      this.getWorkflowProcess();
    }
  }

  change(step: number) {
    this.step = step;
  }

  getRecord() {
    let body = {
      Form_Id: this.params.Form_Id,
      Record_Id: this.params.Record_Id
    };
    let apiUrl = 'ChecklistRecords/EditChecklistRecord';
    let isQrCode = this.params.isQR;
    if (isQrCode)
      apiUrl = 'ChecklistRecords/CheckIfRecordAssigned';
    this.http.get(apiUrl, body).subscribe((value: any) => {
      console.log('res', value);

      if (!value) {
        this.alert.error("Invalid Input Data");
        this.router.navigateByUrl("/page/home")
      }

      this.data = value;

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

    });
  }


  deSerialize(recordDataArray: any) {
    let data: any = {};
    recordDataArray.forEach((item: any) => {
      data[item?.name] = item?.value;
    });
    return data;
  }
  getWorkflowProcess() {
    let body = {
      FormDataId: this.params.Record_Id
    };
    this.http.get2('Workflow/GetWorkflowProcessByFormData', body).subscribe((res: any) => {
      this.workflowProcess = res
    });
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
