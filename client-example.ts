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
    this.socket.on('keypair', (payload) => {
      this.pk = payload.pk
      this.vk = payload.vk
      console.log('Fetched keypair')
      console.log('Proving key: ', this.pk)
      console.log('Verification key: ', this.vk)
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
test()
