import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  CimaDatetimePickerComponent
} from "../../projects/material-datetime-picker/src/lib/components/datetime-picker/datetime-picker.component";
import {
  CimaTimePickerComponent
} from "../../projects/material-datetime-picker/src/lib/components/time-picker/time-picker.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CimaTimePickerComponent, CimaDatetimePickerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cima-material-datetime-picker';
}
