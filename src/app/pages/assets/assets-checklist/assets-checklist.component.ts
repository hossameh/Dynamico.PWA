import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-assets-checklist',
  templateUrl: './assets-checklist.component.html',
  styleUrls: ['./assets-checklist.component.scss']
})
export class AssetsChecklistComponent implements OnInit {

  @Input() items: any = [];
  selectedItem: any = {}
  formRef = '';
  name!: '';
  assetId!: any;
  params: any;

  constructor(private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.params = this.route.snapshot.queryParams;
    this.assetId = +this.params.assetId;
  }

}
