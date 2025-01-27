import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-assets-checklist',
  templateUrl: './assets-checklist.component.html',
  styleUrls: ['./assets-checklist.component.scss']
})
export class AssetsChecklistComponent implements OnInit {
  @ViewChild('executeFormModal') newRecord!: TemplateRef<any>;
  @Input() items: any = [];
  selectedItem: any = {}
  formRef = '';
  name!: '';
  assetId!: any;
  params: any;

  enableRecordRef = false;

  mandatoryRecordRef = false;

  constructor(private route: ActivatedRoute,
    private modalService: NgbModal,
     private router: Router,

  ) { }

  ngOnInit(): void {
    this.params = this.route.snapshot.queryParams;
    this.assetId = +this.params.assetId;
    this.enableRecordRef = JSON.parse(localStorage.getItem('userData') || '{}').enableRecordRef;
    this.mandatoryRecordRef = JSON.parse(localStorage.getItem('userData') || '{}').mandatoryRecordRef;
  }

  openRecordRefModal(item:any,category:any){
    this.selectedItem = item ;
    this.name = category?.category_Name;

    if(this.enableRecordRef)
      this.openNewModal(this.newRecord, "md");
    else
    this.router.navigate(['/page/checklist/'+this.selectedItem.formId] , {queryParams :{
      editMode: false ,
      formRef:'',
      Record_Id:this.selectedItem.record_Id,
      categoryName: this.name,
      listName:this.selectedItem.formTitle,
      categoryId:this.selectedItem.categoryId 
 }});
 
  }

  openNewModal(modalName: any, size = 'lg') {
    this.modalService.open(
      modalName,
      {
        windowClass: 'modal-holder',
        backdropClass: 'light-blue-backdrop',
        centered: true, keyboard: false,
        backdrop: 'static',
        size: size
      });
  }
  startExecute(){

    this.modalService.dismissAll();
    this.router.navigate(['/page/checklist/'+this.selectedItem.formId] , {queryParams :{
         editMode: false ,
         formRef:this.formRef,
         Record_Id:this.selectedItem.record_Id,
         categoryName: this.name,
         listName:this.selectedItem.formTitle,
         categoryId:this.selectedItem.categoryId 
    }});
  }
}
