import chai, { expect } from 'chai'
import { BlenderWebsocketClient } from '../../electron/socket/blender-websocket-client'
import { take } from 'rxjs/operators'

chai.should()

describe('Blender realtime test', function () {
  this.timeout(8000)
  const blenderWebsocketClient = new BlenderWebsocketClient()
  let selections: string[] = []
  before((done) => {
    done()
  })

  after((done) => {
    done()
  })

  beforeEach((done) => {
    blenderWebsocketClient.connect()
    done()
  })

  afterEach((done) => {
    blenderWebsocketClient.disconnect()
    done()
  })

  it('get selected objects', (done) => {
    blenderWebsocketClient.inData.pipe(
      take(2)
    ).subscribe((packet: any) => {
      if (packet.type === 'data') {
        expect(packet.data.event).equals('getSelected')
        selections = packet.data.selections
        done()
      }
    })
    blenderWebsocketClient.outData.next({ event: 'getSelected' })
  })

  it('move object', async () => {
    blenderWebsocketClient.outData.next({ event: 'move', data: { obj: selections[0], pos: { x: 0.1, y: 0, z: -0.1 } } })
    await delay(1000)
    blenderWebsocketClient.outData.next({ event: 'move', data: { obj: selections[0], pos: { x: 0.1, y: 0, z: -0.1 } } })
    await delay(1000)
    blenderWebsocketClient.outData.next({ event: 'move', data: { obj: selections[0], pos: { x: 0.1, y: 0, z: -0.1 } } })
    await delay(1000)
    blenderWebsocketClient.outData.next({ event: 'move', data: { obj: selections[0], pos: { x: 0.1, y: 0, z: 0 } } })
  })
  function delay (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
})
