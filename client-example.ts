import { io, Socket } from 'socket.io-client'

export default class Client {
  private socket: Socket
  private static instance: Client
  private pk: string = ''
  private vk: string = ''

  public static getInstance(url: string) {
    if (!Client.instance) {
      try {
        Client.instance = new Client(url)
      } catch (err) {
        console.log('Socket init error')
      }
    }
    return Client.instance
  }

  constructor(url: string) {
    this.socket = io(url, {
      reconnectionDelayMax: 10000,
    })
    this.socket.on('connect', () => {
      console.log('Connected to relay server')
    })
    this.socket.on('disconnect', () => {
      console.log('Disconnected from relay server')
    })
    this.socket.on('bank', (payload) => {
      // do something
      console.log('System using identity of:', payload)
    })
    this.socket.on('relay', (payload) => {
      // do something
      console.log('Received payload from relay:', payload)
    })
  }

  public prove = (payload: {
    id: string
    to: string
    amount: string
    answerList: string[]
  }) => {
    this.socket.emit('prove', payload)
    console.log(`Payload transmitted to ${payload.to}`)
  }
}

const test = async () => {
  const client = Client.getInstance('http://localhost:80')
  client.prove({
    id: '91fbe1d1-7867-4115-b7fe-d4e082d07d70',
    to: 'Bank B',
    amount: '100',
    answerList: ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
  })
}

//payload on relay event
// {
//   "id": "81fbe1d1-7867-4115-b7fe-d4e082d07d70",
//   "from": "Bank B",
//   "to": "Bank A",
//   "amount": "200",
//   "proof": "{\"curve\":\"bn128\",\"scheme\":\"g16\",\"inputs\":[\"0x0000000000000000000000000000000000000000000000000000000000000001\",\"0x0000000000000000000000000000000000000000000000000000000000000001\",\"0x0000000000000000000000000000000000000000000000000000000000000001\",\"0x0000000000000000000000000000000000000000000000000000000000000001\",\"0x0000000000000000000000000000000000000000000000000000000000000001\",\"0x0000000000000000000000000000000000000000000000000000000000000001\",\"0x0000000000000000000000000000000000000000000000000000000000000001\",\"0x0000000000000000000000000000000000000000000000000000000000000001\",\"0x0000000000000000000000000000000000000000000000000000000000000001\",\"0x0000000000000000000000000000000000000000000000000000000000000001\",\"0x0000000000000000000000000000000000000000000000000000000000000001\"],\"proof\":{\"a\":[\"0x1decd26cc7656916d864927ade8f39cf2f72853472d14cc942f499a786b79651\",\"0x25384bed61f127a6a6930bb750a137db8beb28fee5ab645b20796990793742c0\"],\"b\":[[\"0x080dfba70429fdb6fbb0c11beec57b3532c82f326fdfc8a9aafcd06647e3e97d\",\"0x1e2ab198de2e2eb5523d3ceda0141b4292924b29bca63f0b690c0715e0bf877f\"],[\"0x09c770853ebdfbe9a6c19f76b0aa9e3731acbf4a1dc4e1ef581cbac154b9e6ab\",\"0x144fa894c3633d25fa3f718e0f4437367e7123543be920485a76d09c66c4a607\"]],\"c\":[\"0x03a6295c8d4a7a6d7e1d0d2225146237d19894aa5ea3618fa0e50e24d4a22b7c\",\"0x2f9d248602ca6fd0c5ac98d0b461f8ffbe7c228cf0b62a43a3d7e14e7d72b920\"]}}",
//   "verified": false
// }
test()
