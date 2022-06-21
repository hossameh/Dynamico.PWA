import { dates } from './../../../core/interface/api.interface';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss']
})
export class CardViewComponent implements OnInit {
  @Input() items:dates[] = []
  @Output() showCompleted = new EventEmitter();
  isChecked = false
  constructor() { }

  ngOnInit(): void {
  }

  toggle(){
     setTimeout(() => {
      this.showCompleted.emit(this.isChecked);
     },50)
  }
}
