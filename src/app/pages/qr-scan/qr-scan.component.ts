import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-qr-scan',
  templateUrl: './qr-scan.component.html',
  styleUrls: ['./qr-scan.component.scss']
})
export class QrScanComponent implements OnInit {

  id!: number;
  categoryName: any;
  formId: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id;
    let params = this.route.snapshot.queryParams;
    this.categoryName = params?.categoryName;
    this.formId = params?.formId;
    this.routeToPages();
  }

  routeToPages() {
    console.log(this.id);
    console.log(this.categoryName);
    console.log(this.formId);
    
    if (this.categoryName && this.formId)
      this.router.navigateByUrl("/page/home/category/" + +this.id + "?name=" + this.categoryName + "&formId=" + +this.formId)
    else
      this.router.navigateByUrl("/page/home")

  }

}
