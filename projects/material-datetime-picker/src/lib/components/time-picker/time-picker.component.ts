import {Component, OnInit} from '@angular/core';
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatIcon} from "@angular/material/icon";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";

@Component({
  selector: 'cima-time-picker',
  standalone: true,
  imports: [
    MatSuffix,
    MatIconButton,
    MatInput,
    FormsModule,
    MatLabel,
    MatFormField,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    MatButton,
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss'
})
export class CimaTimePickerComponent implements OnInit {
  time: string = '';

  //localization
  separator: string = ':';
  cancelLabel: string = 'Cancel';
  confirmLabel: string = 'OK';
  amLabel: string = 'AM';
  pmLabel: string = 'PM';

  hour: number = 12;
  minute: number = 55;
  meridianTime: string = 'AM';

  ngOnInit() {
    this.setTime();
  }

  setTime(){
    this.time = this.hour.toString() + this.separator + this.minute.toString();
  }


}
