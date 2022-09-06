import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Subscription } from 'rxjs/internal/Subscription';
import { IPageInfo } from 'src/app/core/interface/page-info.interface';
import { HelperService } from 'src/app/services/helper.service';
import { HttpService } from 'src/app/services/http/http.service';
import { OfflineService } from 'src/app/services/offline/offline.service';

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.scss']
})
export class AssetsListComponent implements OnInit {

  @HostListener("window:scroll", [])
  onScroll(): void {
    if (this.bottomReached() && this.isOnline && this.loaded && this.pager.page <= (this.pager.pages - 1)) {
      // Load Your Data Here
      this.pager.page += 1;
      this.getAssets();
    }
  }

  isOnline = true;
  assets: any = [];
  $subscription!: Subscription;
  searchKeyWord!: '';

  pager!: IPageInfo;
  loaded = true;
  isLoading = false;

  constructor(private http: HttpService,
    private helper: HelperService,
    private offline: OfflineService,
    private storage: Storage,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.resetPager();
    this.$subscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      // if (isOnline) {
      this.getAssets();
      // }
    });
  }
  resetPager() {
    this.pager = {
      page: 1,
      pages: 0,
      pageSize: 10,
      total: 0,
    };
  }
  async getAssets() {
    this.loaded = false;
    this.isLoading = true;
    let params = {
      search: this.searchKeyWord ? this.searchKeyWord : '',
      pageIndex: this.pager.page,
      pageSize: this.pager.pageSize
    };
    let cashedAssets = await this.storage.get("UserAssets") || [];
    if (this.isOnline)
      this.http.get(`Assets/GetUserAssets`, params).subscribe(async (res: any) => {
        this.assets = [];
        res?.list.map((el: any) => {
          this.assets.push(el);
        });
        this.pager.total = res?.total;
        this.pager.pages = res?.pages;
        this.loaded = true;
        if (!this.searchKeyWord)
          await this.storage.set("UserAssets", this.assets);
      })
    else {
      this.assets = cashedAssets;
      if (this.searchKeyWord) {
        this.assets = this.assets.filter((el: any) =>
          el.name?.toString().toLowerCase().includes(this.searchKeyWord.toLowerCase())
          || el.code?.toString().toLowerCase().includes(this.searchKeyWord.toLowerCase())
        );
      }
    }
    this.isLoading = false;
  }
  resetSearch() {
    this.assets = [];
    this.resetPager();
    this.getAssets();
  }
  bottomReached(): boolean {
    return ((document.documentElement.offsetHeight + document.documentElement.scrollTop + 100) >= document.documentElement.scrollHeight);
    // return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 0.5);
  }
  scrollToTop() {
    window.scroll(0, 0);
  }

}
