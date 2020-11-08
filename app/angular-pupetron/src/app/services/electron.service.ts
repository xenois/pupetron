import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
let ipcRenderer = null;
try {
  ipcRenderer = ( window as any).require('electron').ipcRenderer;
} catch (err) {
}

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  socketDataBus = new Subject<SocketPacket>();
  constructor(private zone: NgZone) {
    if (ipcRenderer != null) {
      this.socketDataBus.subscribe((packet) => {
        if (packet.direction === 0) {
          ipcRenderer.send('onSocketDataBus', packet.data);
        }
      });

      ipcRenderer.on('onSocketDataBus', (event, data) => {
        this.zone.run(() => {
          // tslint:disable-next-line: object-literal-shorthand
          this.socketDataBus.next({ direction: 1, data: data });
        });
      });
    }

  }
}
export interface SocketPacket {
  direction: number;
  data: any;
}
