import { io, Socket } from 'socket.io-client'

export default class Client {
  private socket: Socket
  private static instance: Client
  private bank: string = ''
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
    })
    this.socket.on('relay', (payload) => {
      // do something
      console.log('Received payload from relay:', payload)
    })
  }
  public subscribe = (bank: string) => {
    if (this.bank) {
      throw new Error('You can only subscribe to one bank')
    }
    console.log(`Fetched keypair`)
    this.bank = bank
    console.log(`Subscribed to bank ${bank}`)
  }
  public transmit = (
    id: string,
    to: string,
    amount: string,
    proof: string,
    privateFor?: string
  ) => {
    if (!this.bank) {
      throw new Error('You must subscribe to a bank first')
    }
    this.socket.emit('transmit', {
      id,
      from: this.bank,
      to,
      amount,
      privateFor,
      proof,
    })
    console.log(`Payload transmitted to ${to}`)
  }
}

const client = Client.getInstance('http://localhost:80')
client.subscribe('Bank A')
client.transmit('0002', 'Bank B', '100', '0x01', 'Org2MSP')
