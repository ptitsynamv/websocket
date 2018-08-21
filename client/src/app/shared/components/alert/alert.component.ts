import {Component, Input, AfterContentChecked} from '@angular/core';
import {IError, IErrorModal} from "../../interfaces";

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent{
  type = 'warning';

  @Input('errorModal') errorModal: IErrorModal;

  constructor() {
  }
}
