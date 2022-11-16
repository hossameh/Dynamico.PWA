import { OfflineService } from './../../services/offline/offline.service';
import { HttpService } from './../../services/http/http.service';
import { Component, HostListener, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { IPageInfo } from 'src/app/core/interface/page-info.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @HostListener("window:scroll", [])
  onScroll(): void {
    if (this.bottomReached() && this.isOnline && this.loaded && this.pager.page <= (this.pager.pages - 1)) {
      // Load Your Data Here
      this.pager.page += 1;
      this.loadFromApi()
    }
  }

  items: category[] = [];
  isOnline = true;
  statusSubscription!: Subscription;
  userId: any;
  pager!: IPageInfo;
  loaded = true;
  isLoading = false;

  constructor(
    private http: HttpService,
    private storage: Storage,
    private offline: OfflineService,
  ) { }

  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    this.items = [];
    this.resetPager();
    this.statusSubscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      if (!this.isOnline) {
        this.loadFromCache();
      } else {
        this.loadFromApi();
      }
    });
  }

  loadFromApi() {
    this.isOnline ? this.getCategories() : '';
  }
  async getCategories() {
    let cashedList = await this.storage.get('Categories') || [];
    if (cashedList)
      cashedList = cashedList.filter((el: any) => el.userId !== this.userId);

    if (this.pager.page == 1)
      this.items = [];
    this.loaded = false;
    this.isLoading = true;
    let params = {
      pageIndex: this.pager.page,
      pageSize: this.pager.pageSize
    }
    this.http.get('Category/GetUserCategories', params).subscribe(async (res: any) => {
      res?.list.map((el: any) => {
        this.items.push(el);
      });
      this.pager.total = res?.total;
      this.pager.pages = res?.pages;
      this.loaded = true;
      this.isLoading = false;
      this.items.map((el: any) => { el.userId = this.userId });
      cashedList.push(...this.items);
      await this.storage.set('Categories', cashedList);
    });
  }

  async loadFromCache() {
    this.items = [];
    this.items = await this.storage.get('Categories') || [];
    this.items = this.items.filter((el: any) => el.userId == this.userId);
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.statusSubscription.unsubscribe();
  }
  resetPager() {
    this.pager = {
      page: 1,
      pages: 0,
      pageSize: 10,
      total: 0,
    };
  }
  bottomReached(): boolean {
    return ((document.documentElement.offsetHeight + document.documentElement.scrollTop + 100) >= document.documentElement.scrollHeight);
    // return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 0.5);
  }
  scrollToTop() {
    window.scroll(0, 0);
  }
}


interface category {
  category_Id: number;
  category_Name: string;
  checklists_Count: number;
  color: string;
}
