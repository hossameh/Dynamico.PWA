import { Storage } from '@ionic/storage';
import { OfflineService } from './../../services/offline/offline.service';
import { HttpService } from './../../services/http/http.service';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit, AfterViewInit {
  @ViewChild('openModal') openModal!: ElementRef;
  items: any = [];
  category_Id!: number;
  name!: string;
  formId!: string;
  isOnline = true;
  statusSubscription!: Subscription;
  selectedItem: any = {}
  formRef = ''

  constructor(
    private route: ActivatedRoute,
    private offline: OfflineService,
    private storage: Storage,
    private http: HttpService,
    private router: Router,
    private alert: AlertService,
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
    this.category_Id = this.route.snapshot.params.id;
    this.name = this.route.snapshot.queryParams.name;
    this.formId = this.route.snapshot.queryParams.formId;
  }

  loadFromApi() {
    this.isOnline ? this.getCategoryChecklists() : ''
  }
  getCategoryChecklists() {
    this.http.get('Categories/GetCategoryChecklists', { categoryId: this.category_Id, userId: JSON.parse(localStorage.getItem('userData') || '{}').userId }).subscribe(async (res) => {
      this.items = res;
      let CategoryChecklist = {
        categoryId: +this.category_Id,
        list: res
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
            setTimeout(() => {
              this.openModal.nativeElement.click();
            }, 500);
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
          return el.categoryId == this.category_Id;
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
    let cacheCatgoryChecklists = await this.storage.get('CategoryChecklists') || [];
    this.items = [];
    if (cacheCatgoryChecklists.length > 0) {
      this.items = cacheCatgoryChecklists.filter((el: any) => el.categoryId == this.category_Id)[0].list;
    }

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.statusSubscription.unsubscribe();
  }

}
