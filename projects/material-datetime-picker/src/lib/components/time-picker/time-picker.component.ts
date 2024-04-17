import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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
  @Output() time = new EventEmitter<string>();

  //localization
  @Input() separator: string = ':';
  @Input() amLabel: string = 'AM';
  @Input() pmLabel: string = 'PM';

  @Input() hour: number = 12;
  @Input() minute: number = 55;
  @Input() meridianTime: string = 'AM';

  @Input() format: string | '12' | '24'= '12';

  ngOnInit() {
    this.setTime();
  }

  setMeridianTime(time: string){
this.meridianTime = time;
    this.setTime();
  }

  setTime(){
    //TODO: convert to 24 hour time if format is 12 e rimuovere il meridianTime
    // oppure valutare se gestire entrambi i formati - input di tipo type ha come output solo valore 24h
    this.time.emit(this.hour.toString() + this.separator + this.minute.toString() + ' ' + this.meridianTime);
  }


}
