import { AlertService } from './../../services/alert/alert.service';
import { HttpService } from './../../services/http/http.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  items:category[] = []
  constructor(private http:HttpService,private alert:AlertService) { }

  ngOnInit(): void {
    this.getCategories()
  }

  getCategories(){
    this.http.get('Categories/GetUserCategories').subscribe((res:any) =>{
        this.items = res
    })
  }

}


interface category{
  category_Id: number
  category_Name: string
  checklists_Count: number
  color: string
}
