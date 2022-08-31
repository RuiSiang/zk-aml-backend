import { createServer } from 'http'
import { Server } from 'socket.io'
import zokrates from './src/zokrates'
import aml from './src/logic'
import fabric from './src/fabric'

const httpServer = createServer()
export const server = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
  },
})

server.on('connection', async (client) => {
  console.log(`Client ${client.id} connected`)
  client.join('broadcast')
  client.emit('bank', aml.getMyBank())
  client.on(
    'prove',
    async (payload: {
      id: string
      from?: string
      to: string
      amount: string
      answerList: string[]
    }) => {
      console.log(`AML data submitted to the blockchain by ${client.id}`)
      console.log(payload)
      const proof = JSON.stringify(await zokrates.prove(payload.answerList))
      await aml.newEntry({
        id: payload.id,
        from: payload.from,
        to: payload.to,
        amount: payload.amount,
        proof,
      })
    }
  )
  // server.to('broadcast').emit('relay', payload)
  server.on('disconnect', () => {
    console.log(`Client ${client.id} disconnected`)
  })
})

fabric.listen().then(zokrates.initialize).then(aml.initialize)

httpServer.listen(parseInt(process.env.PORT || '3000'))
