import * as socketClient from 'socket.io-client'
import { Subject, Subscription } from 'rxjs'
export class BlenderWebsocketClient {
  private port: number = 3001
  private clientSocket?: SocketIOClient.Socket
  private subscription?: Subscription
  connecting = false
  inData = new Subject<any>()
  outData = new Subject<any>()

  connect (port: number = this.port) {
    if (this.connecting) {
      throw new Error('Already connected.')
    }
    this.connecting = true
    this.clientSocket = socketClient.connect(`http://localhost:${port}`, {
      'reconnectionDelay': 0,
      'forceNew': true,
      transports: ['websocket']
    })
    this.initSubscriptions()
  }
  private initSubscriptions () {
    this.subscription = this.outData.subscribe((packet) => {
      this.clientSocket?.emit(packet.event, packet.data)
    })
    this.clientSocket?.on('connect', () => {
      this.inData.next({ type: 'control', data: { action: 'connected' } })
    })
    this.clientSocket?.on('disconnect', () => {
      this.inData.next({ type: 'control', data: { action: 'disconnected' } })
    })
    this.clientSocket?.on('data', (data: any) => {
      this.inData.next({ type: 'data', data: data })
    })
  }
  disconnect () {
    this.subscription?.unsubscribe()
    this.clientSocket?.disconnect()
    this.clientSocket?.close()
    this.connecting = false
  }
}
