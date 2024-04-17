import { Component } from '@angular/core';
import {CimaTimePickerComponent} from "../time-picker/time-picker.component";
import {FormsModule} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {CimaDatetimePickerComponent} from "../date-picker/date-picker.component";

@Component({
  selector: 'cima-datetime-picker-form-field',
  standalone: true,
  imports: [
    CimaTimePickerComponent,
    FormsModule,
    MatButton,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatMenu,
    MatSuffix,
    MatMenuTrigger,
    CimaDatetimePickerComponent
  ],
  templateUrl: './datetime-picker-form-field.component.html',
  styleUrl: './datetime-picker-form-field.component.scss'
})
export class CimaDatetimePickerFormFieldComponent {
  cancelLabel: string = 'Cancel';
  confirmLabel: string = 'OK';

  dateTime: string = '';

  newTime: string = '';
  newDate: Date | null = new Date();

  getTime(time: string){
    this.newTime = time;
  }

  getDate(date: Date | null){
    this.newDate = date;
  }

  setDateTime(){}
}
