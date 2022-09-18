import { OfflineService } from './../../services/offline/offline.service';
import { HttpService } from './../../services/http/http.service';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  items: category[] = [];
  isOnline = true;
  statusSubscription!: Subscription;
  userId: any;
  constructor(
    private http: HttpService,
    private storage: Storage,
    private offline: OfflineService,
  ) { }

  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    this.items = [];
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

    this.items = [];
    this.http.get('Category/GetUserCategories').subscribe(async (res: any) => {
      this.items = res;
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
}


interface category {
  category_Id: number;
  category_Name: string;
  checklists_Count: number;
  color: string;
}
