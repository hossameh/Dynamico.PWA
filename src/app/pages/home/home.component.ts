import { OfflineService } from './../../services/offline/offline.service';
import { HttpService } from './../../services/http/http.service';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  items: category[] = [];
  constructor(
    private http: HttpService,
    private storage: Storage,
    private offline: OfflineService,
  ) { }

  ngOnInit(): void {
    this.items = [];
    this.offline.currentStatus.subscribe(isOnline => {
      if (isOnline) {
        this.getCategories();
      } else {
        this.loadFromCache();
      }
    });
  }

  getCategories() {
    this.http.get('Categories/GetUserCategories').subscribe(async (res: any) => {
      this.items = res;
      await this.storage.set('Categories', res);
    });
  }

  async loadFromCache() {
    this.items = [];
    this.items = await this.storage.get('Categories');
  }

}


interface category {
  category_Id: number;
  category_Name: string;
  checklists_Count: number;
  color: string;
}
