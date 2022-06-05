import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert/alert.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alert : AlertService
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

    console.log(this.categoryName);
    
    if (this.id && this.categoryName && this.formId)
      this.router.navigateByUrl("/page/home/category/" + +this.id + "?name=" + this.categoryName + "&formId=" + +this.formId)
    else if (this.id && this.Record_Id && this.hasWorkFlow && this.hasWorkFlow == 'true')
      this.router.navigateByUrl("/page/workflow/details?Form_Id=" + this.id + "&isQR=true&Record_Id=" + +this.Record_Id)
    else if (this.id && this.Record_Id && this.hasWorkFlow && this.hasWorkFlow == 'false')
      this.router.navigateByUrl("/page/checklist/" + +this.id + "?editMode=true&Complete=true&isQR=true&Record_Id=" + +this.Record_Id)
    else{
      this.alert.error("Invalid Input Data")
      this.router.navigateByUrl("/page/home")
    }

  }

}
