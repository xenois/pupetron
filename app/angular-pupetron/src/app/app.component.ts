import { Component } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { ElectronService } from './services/electron.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private electronService: ElectronService) {
   electronService.socketDataBus.next({direction: 0, data: {type: 'control', data: {action: 'connect'} }});
  }
title = 'angular-pupetron';
}
