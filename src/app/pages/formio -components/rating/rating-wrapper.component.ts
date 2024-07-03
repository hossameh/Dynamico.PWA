import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormioCustomComponent } from 'angular-formio';

@Component({
  selector: 'app-rating-wrapper',
  templateUrl: './rating-wrapper.component.html',
  styleUrls: ['./rating-wrapper.component.scss']
})
export class RatingWrapperComponent implements FormioCustomComponent<number>, OnInit, OnChanges {

  // the value of rating element prrovided by formio
  @Input()
  value!: number;

  // the default event emit value to formio
  @Output()
  valueChange = new EventEmitter<number>();

  @Input()
  disabled!: boolean;

  // custom property
  @Input()
  rateLimit!: number;

  @Input()
  fillColor!: string;

  @Input()
  customFillColor!: string;

  @Input()
  iconSize!: string;

  @Input()
  rateIcon!: string;

  @Input()
  customRateIcon!: string;

  // component inner param
  maxLimit = 10;
  innerValue = 0;
  showRating = true;


  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.rateLimit && this.rateLimit >= 5 && this.rateLimit <= 20) // min max of rate total value
    {
      if (this.rateLimit !== this.maxLimit)
        this.updateRateLimit(this.rateLimit);
    }

    if (this.customRateIcon && this.customRateIcon.length > 0) {
      this.rateIcon = this.customRateIcon;
    }
    if (this.customFillColor && this.customFillColor.length === 7) { // length of hex color value
      this.fillColor = this.customFillColor;
    }

    if (changes.value && changes.value.currentValue) {
      this.setValue(changes.value.currentValue);
    }


  }
  setValue(value: any) {
    if (value) {
      if (!isNaN(value)) {
        this.innerValue = value;
      }
      else {
        this.innerValue = 0;
      }
    }

  }

  onValueChanged(event:any) {

    if (event && !isNaN(event)) {
      this.value = event;
      this.valueChange.emit(event);
    }
  }


  updateRateLimit(value:any) {
    this.maxLimit = value;
    this.showRating = false;
    setTimeout(() => { this.showRating = true }, 10);
  }
}
