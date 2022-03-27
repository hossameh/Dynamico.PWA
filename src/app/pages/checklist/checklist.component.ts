import { AlertService } from './../../services/alert/alert.service';
import { HttpService } from './../../services/http/http.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormioEditorOptions } from '@davebaol/angular-formio-editor';
import { Location } from '@angular/common'

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss']
})
export class ChecklistComponent implements OnInit {
  form: any;
  options!: FormioEditorOptions;
  data:any
  id!:number;
  constructor(private route:ActivatedRoute,
    private http: HttpService,
    private location: Location,
    private alert:AlertService
    ) {


  }
  ngOnInit(): void {
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
          submit: (event) => { this.submission(event) },
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
    if(this.id){
      this.getById();
    }
  }


  submission(event:any){
console.log('event',event);
  }

  back(): void {
    this.location.back()
  }
  getById(){
    this.http.get('Checklist/GetChecklistById',{Id:this.id}).subscribe((res:any) =>{
        this.data = res;
        this.form.components = JSON.parse(res.formControls);
    });
  }
}
