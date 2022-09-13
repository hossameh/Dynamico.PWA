import { Storage } from '@ionic/storage';
import { OfflineService } from './../../services/offline/offline.service';
import { HttpService } from './../../services/http/http.service';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert/alert.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AccessTypes } from 'src/app/core/enums/access.enum';
import { IPageInfo } from 'src/app/core/interface/page-info.interface';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit, AfterViewInit {

  @HostListener("window:scroll", [])
  onScroll(): void {
    if (this.bottomReached() && this.isOnline && this.loaded && this.pager.page <= (this.pager.pages - 1)) {
      // Load Your Data Here
      this.pager.page += 1;
      this.loadFromApi()
    }
  }


  @ViewChild('openModal') openModal!: ElementRef;
  @ViewChild('newRecord') newRecord!: TemplateRef<any>;
  items: any = [];
  category_Id!: number;
  name!: string;
  formId!: string;
  isOnline = true;
  statusSubscription!: Subscription;
  selectedItem: any = {}
  formRef = '';
  accessTypes = AccessTypes;

  pager!: IPageInfo;
  loaded = true;
  isLoading = false;
  userId: any;

  constructor(
    private route: ActivatedRoute,
    private offline: OfflineService,
    private storage: Storage,
    private http: HttpService,
    private router: Router,
    private alert: AlertService,
    private modalService: NgbModal
  ) { }
  ngAfterViewInit(): void {
    if (this.category_Id) {
      this.statusSubscription = this.offline.currentStatus.subscribe(isOnline => {
        this.isOnline = isOnline
        if (!isOnline) {
          this.loadFromCache();
        } else {
          this.loadFromApi()
        }
      });
    }
  }

  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    this.resetPager();
    this.category_Id = this.route.snapshot.params.id;
    this.name = this.route.snapshot.queryParams.name;
    this.formId = this.route.snapshot.queryParams.formId;
  }
  resetPager() {
    this.pager = {
      page: 1,
      pages: 0,
      pageSize: 10,
      total: 0,
    };
  }
  loadFromApi() {
    this.isOnline ? this.getCategoryChecklists() : ''
  }
  getCategoryChecklists() {
    if (this.pager.page == 1)
      this.items = [];
    this.loaded = false;
    this.isLoading = true;
    let params = {
      categoryId: this.category_Id,
      userId: JSON.parse(localStorage.getItem('userData') || '{}').userId,
      formId: this.formId ? this.formId : '',
      pageIndex: this.pager.page,
      pageSize: this.pager.pageSize
    }
    this.http.get('Category/GetCategoryChecklists', params).subscribe(async (res: any) => {
      res?.list.map((el: any) => {
        this.items.push(el);
      });
      this.pager.total = res?.total;
      this.pager.pages = res?.pages;
      this.loaded = true;
      this.isLoading = false;
      // this.items = res;
      let CategoryChecklist = {
        userId: this.userId,
        categoryId: +this.category_Id,
        list: this.items
      };

      if (this.formId && res) {
        if (this.items.length == 0) {
          this.alert.error("Invalid Input Data");
          this.router.navigateByUrl('/page/home');
        }
        else {
          let index = this.items.findIndex((ww: any) => ww.formId == +this.formId);
          if (index >= 0) {
            this.selectedItem = this.items[index];
            // setTimeout(() => {
            //   this.openModal.nativeElement.click();
            // }, 500);
            this.openNewModal(this.newRecord, "md");
          }
          else {
            this.alert.error("Invalid Input Data");
            this.router.navigateByUrl('/page/home');
          }
        }
      }

      let cacheCatgoryChecklists = await this.storage.get('CategoryChecklists') || [];

      if (cacheCatgoryChecklists) {
        // check if Category  id is in cahce
        let index = cacheCatgoryChecklists.findIndex((el: any) => {
          return el.userId == this.userId && el.categoryId == this.category_Id;
        });
        // check if Category  id is in cahce update data in this index
        if (index >= 0) {
          cacheCatgoryChecklists[index] = CategoryChecklist;
        } else {
          //if not found id add a new record
          cacheCatgoryChecklists.push(CategoryChecklist);
        }
      } else {
        cacheCatgoryChecklists.push(CategoryChecklist);
      }
      await this.storage.set('CategoryChecklists', cacheCatgoryChecklists);

    });
  }

  async loadFromCache() {
    let cachedPendingRecords = await this.storage.get('Records') || [];
    let cacheCatgoryChecklists = await this.storage.get('CategoryChecklists') || [];
    this.items = [];
    if (cacheCatgoryChecklists.length > 0) {
      this.items = cacheCatgoryChecklists.filter((el: any) => el.userId == this.userId && el.categoryId == this.category_Id)[0].list;
      this.items.map((el: any) => {
        let records = [];
        records = cachedPendingRecords.filter((element: any) => element.userId == this.userId && element.form_Id == el.formId);        
        el.totalRecords = records.length;
        return el;
      })
    }

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.statusSubscription.unsubscribe();
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
  bottomReached(): boolean {
    return ((document.documentElement.offsetHeight + document.documentElement.scrollTop + 100) >= document.documentElement.scrollHeight);
    // return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 0.5);
  }
  scrollToTop() {
    window.scroll(0, 0);
  }

}
