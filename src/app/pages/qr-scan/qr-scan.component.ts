import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessTypes } from 'src/app/core/enums/access.enum';
import { AlertService } from 'src/app/services/alert/alert.service';
import { HttpService } from 'src/app/services/http/http.service';

@Component({
  selector: 'app-qr-scan',
  templateUrl: './qr-scan.component.html',
  styleUrls: ['./qr-scan.component.scss']
})
export class QrScanComponent implements OnInit {

  id!: number;
  categoryName: any;
  formId: any;
  Record_Id: any;
  hasWorkFlow: any;
  form: any;
  access: any;
  accessTypes = AccessTypes;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alert: AlertService,
    private http: HttpService,
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id;
    let params = this.route.snapshot.queryParams;
    this.categoryName = params?.categoryName;
    this.formId = params?.formId;
    this.Record_Id = params?.recordId;
    this.hasWorkFlow = params?.hasWorkFlow;

    this.routeToPages();
  }

  routeToPages() {
    if (this.id && this.categoryName && this.formId) {
      this.http.get('Checklist/GetChecklistUserAccess', { formId: +this.formId, userId: JSON.parse(localStorage.getItem('userData') || '{}').userId })
        .subscribe((res) => {
          this.form = res;
          this.access = this.form.access;
          if (this.access && this.access.includes(this.accessTypes.Create))
            this.router.navigateByUrl("/page/home/category/" + +this.id + "?name=" + this.categoryName + "&formId=" + +this.formId);
          else {
            this.alert.error("You have No Access")
            this.router.navigateByUrl("/page/home")
          }
        })
    }
    else if (this.id && this.Record_Id && this.hasWorkFlow && this.hasWorkFlow == 'true') {
      this.GetChecklistUserAccess(+this.id, true);
    }
    else if (this.id && this.Record_Id && this.hasWorkFlow && this.hasWorkFlow == 'false') {
      this.GetChecklistUserAccess(+this.id, false);
    }
    else if (this.id)
      this.router.navigateByUrl("/page/assets/details?assetId=" + +this.id)
    else {
      this.alert.error("Invalid Input Data")
      this.router.navigateByUrl("/page/home")
    }
  }

  GetChecklistUserAccess(formId: any, hasWorkflow: boolean) {
    this.http.get('Checklist/GetChecklistUserAccess', { formId: +formId, userId: JSON.parse(localStorage.getItem('userData') || '{}').userId })
      .subscribe((res) => {
        this.form = res;
        this.access = this.form.access;
        if (hasWorkflow)
          this.routeWithWorkFlow();
        else
          this.routeWithNoWorkFlow();
      })
  }
  routeWithWorkFlow() {
    if (this.access && (this.access.includes(this.accessTypes.Read) || this.access.includes(this.accessTypes.Update)))
      this.router.navigateByUrl("/page/workflow/details?Form_Id=" + this.id + "&isQR=true&Record_Id=" + +this.Record_Id);
    else {
      this.alert.error("You have No Access")
      this.router.navigateByUrl("/page/home")
    }
  }
  routeWithNoWorkFlow() {
    if (this.access && (this.access.includes(this.accessTypes.Read) || this.access.includes(this.accessTypes.Update)))
      this.router.navigateByUrl("/page/checklist/" + +this.id + "?editMode=true&Complete=true&isQR=true&Record_Id=" + +this.Record_Id);
    else {
      this.alert.error("You have No Access")
      this.router.navigateByUrl("/page/home")
    }
  }

}
