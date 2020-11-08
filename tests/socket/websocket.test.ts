import chai, { expect } from 'chai'
import * as http from 'http'
import * as socketIo from 'socket.io'
import { BlenderWebsocketClient } from '../../electron/socket/blender-websocket-client'
import { take } from 'rxjs/operators'

chai.should()

describe('Websocket test', function () {
  this.timeout(0)
  let ioServer!: SocketIO.Server
  const blenderWebsocketClient = new BlenderWebsocketClient()

  before((done) => {
    ioServer = socketIo.listen(
      http.createServer().listen('3008', () => {
        console.log(`Socket is listening on port 3008 !`)
      })
    )
    done()
  })
  after((done) => {
    ioServer.close()
    done()
  })

  beforeEach((done) => {
    blenderWebsocketClient.connect(3008)
    done()
  })

  afterEach((done) => {
    blenderWebsocketClient.disconnect()
    done()
  })

  it('connected', (done) => {
    blenderWebsocketClient.inData.pipe(
      take(1)
    ).subscribe(packet => {
      expect(packet.type).equals('control')
      expect(packet.data.action).equals('connected')
      done()
    })
  })

  it('disconnected', (done) => {
    blenderWebsocketClient.inData.pipe(
      take(2)
    ).subscribe((packet: any) => {
      if (packet.data.action !== 'connected') {
        expect(packet.type).equals('control')
        expect(packet.data.action).equals('disconnected')
        done()
      } else {
        blenderWebsocketClient.disconnect()
      }
    })
  })

  it('receive data', (done) => {
    blenderWebsocketClient.inData.pipe(
      take(4)
    ).subscribe((packet: any) => {
      if (packet.type === 'data') {
        expect(packet.data).equals('Ok')
        done()
      }
    })
    ioServer.on('connect',socket => {
      socket.emit('data','Ok')
    })
  })

  it('send data', (done) => {
    blenderWebsocketClient.outData.next({ event: 'test', data: 'Ok' })
    ioServer.on('connect',socket => {
      socket.on('test',data => {
        expect(data).equals('Ok')
        done()
      })
    })
  })

})
