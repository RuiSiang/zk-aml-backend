import { createServer } from 'http'
import { Server } from 'socket.io'
import Entry from './src/entry-service'

const httpServer = createServer()
export const server = new Server(httpServer, {
  path: '/',
})

server.on('connection', async (client) => {
  console.log(`Client ${client.id} connected`)
  client.join('broadcast')
  client.emit('keypair', await Entry.getKeypair())
  client.on(
    'transmit',
    async (payload: {
      id: string
      from: string
      to: string
      amount: string
      proof: string
    }) => {
      console.log(`AML data submitted to the blockchain by ${client.id}`)
      await Entry.newEntry(payload)
    }
  )
  // server.to('broadcast').emit('relay', payload)
  server.on('disconnect', () => {
    console.log(`Client ${client.id} disconnected`)
  })
})

httpServer.listen(parseInt(process.env.PORT || '3000'))
