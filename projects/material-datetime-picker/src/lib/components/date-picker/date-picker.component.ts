import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatCard} from "@angular/material/card";
import {MatCalendar} from "@angular/material/datepicker";
import {provideNativeDateAdapter} from "@angular/material/core";

@Component({
  selector: 'cima-date-picker',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatCard,
    MatCalendar
  ],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class CimaDatetimePickerComponent {

  @Input() selected?: Date = new Date();

  @Output() date = new EventEmitter<Date>();

  selectDay(event: Date){
    this.date.emit(event);
    console.log(event);
  }

}
