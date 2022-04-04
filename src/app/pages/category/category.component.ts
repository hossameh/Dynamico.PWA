import { Storage } from '@ionic/storage';
import { OfflineService } from './../../services/offline/offline.service';
import { HttpService } from './../../services/http/http.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  items: any = [];
  category_Id!: number;
  name!: string;
  constructor(
    private route: ActivatedRoute,
    private offline: OfflineService,
    private storage: Storage,
    private http: HttpService
  ) { }

  ngOnInit(): void {
    this.category_Id = this.route.snapshot.params.id;
    this.name = this.route.snapshot.queryParams.name;

    if (this.category_Id) {
      this.offline.currentStatus.subscribe(isOnline => {
        if (isOnline) {
          this.getCategoryChecklists();
        } else {
          this.loadFromCache();
        }
      });
    }


  }

  getCategoryChecklists() {
    this.http.get('Categories/GetCategoryChecklists', { categoryId: this.category_Id }).subscribe(async (res) => {
      this.items = res;
      let CategoryChecklist = {
        categoryId: +this.category_Id,
        list: res
      };

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
    if (cacheCatgoryChecklists.length == 0) {
      this.items = cacheCatgoryChecklists.filter((el: any) => el.categoryId == this.category_Id)[0].list;
    }

  }

}
