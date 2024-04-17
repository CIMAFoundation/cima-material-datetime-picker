import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {CimaTimePickerComponent} from "../time-picker/time-picker.component";

@Component({
  selector: 'cima-time-picker-form-field',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatMenu,
    MatSuffix,
    MatButton,
    MatMenuTrigger,
    CimaTimePickerComponent
  ],
  templateUrl: './time-picker-form-field.component.html',
  styleUrl: './time-picker-form-field.component.scss'
})
export class TimePickerFormFieldComponent {
  cancelLabel: string = 'Cancel';
  confirmLabel: string = 'OK';

  time: string = '12:00 AM';

  newTime: string = '';

  getTime(time: string){
    this.newTime = time;
  }

  setTime(){
    this.time = this.newTime;
  }
}
