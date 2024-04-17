import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  CimaDatetimePickerComponent
} from "../../projects/material-datetime-picker/src/lib/components/datetime-picker/datetime-picker.component";
import {
  CimaTimePickerComponent
} from "../../projects/material-datetime-picker/src/lib/components/time-picker/time-picker.component";
import {
  CimaTimePickerFormFieldComponent
} from "../../projects/material-datetime-picker/src/lib/components/time-picker-form-field/time-picker-form-field.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CimaTimePickerComponent, CimaDatetimePickerComponent, CimaTimePickerFormFieldComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cima-material-datetime-picker';
}
