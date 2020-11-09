import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'src/app/services/electron.service';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent implements OnInit {

  connected = false;
  connecting = false;

  constructor(private electronService: ElectronService) {
    electronService.socketDataBus.subscribe((packet) => {
      if (packet.data.type === 'control') {
        this.connecting = false;
        this.connected = packet.data.data.action === 'connected';
      }
    });
  }
  ngOnInit(): void {
  }
  onConnect() {
    if (!this.connected && !this.connecting) {
      this.electronService.socketDataBus.next({ direction: 0, data: { type: 'control', data: { action: 'connect' } } });
      this.connecting = true;
    } else {
      this.electronService.socketDataBus.next({ direction: 0, data: { type: 'control', data: { action: 'disconnect' } } });
    }
  }
}
