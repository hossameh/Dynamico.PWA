import { HttpService } from './../../services/http/http.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  items:any = [];
  category_Id!:number;
  name!:string
  constructor(
    private route: ActivatedRoute,
    private  http:HttpService
  ) { }

  ngOnInit(): void {
    this.category_Id = this.route.snapshot.params.id;
    this.name = this.route.snapshot.queryParams.name
    if(this.category_Id){
      this.getCategoryChecklists()
    }


  }

  getCategoryChecklists(){
      this.http.get('Categories/GetCategoryChecklists',{categoryId: this.category_Id}).subscribe(res=>{
        this.items = res;
      })
  }

}
