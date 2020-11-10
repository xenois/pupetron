import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'src/app/services/electron.service';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent implements OnInit {
  connState = 0;

  constructor(private electronService: ElectronService) {
    electronService.socketDataBus.subscribe((packet) => {
      if (packet.direction === 0) {
        return;
      }
      if (packet.data.type === 'control') {
        this.connState = 0;
        if (packet.data.data.action === 'connected') {
          this.connState = 2;
        } else {
          this.connState = 0;
        }
      }
    });
  }
  ngOnInit(): void {
  }
  onConnect() {
    if (this.connState === 0) {
      this.electronService.socketDataBus.next({ direction: 0, data: { type: 'control', data: { action: 'connect' } } });
      this.connState = 1;
    } else {
      this.electronService.socketDataBus.next({ direction: 0, data: { type: 'control', data: { action: 'disconnect' } } });
    }
  }
}
