import fabricService from './fabric-service'
import fs from 'fs'
import path from 'path'
import { server } from '../app'

const config = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'config', 'config.json'), 'utf-8') ||
    '{}'
)
//checklist function
function checkList(candidate: string) {
  for (let i = 0; i < config.orgList.length; i++) {
    if (config.orgList[i] == candidate) {
      return true
    }
  }
  return false
}

//define entry interfaces
export interface Entry {
  id?: string
  from: string
  to: string
  amount: string
  proof: string
}

async function getEntries(member: string) {
  let tmpResult = await fabricService.invokeChaincode('getEntries', [member])
  let invokeResult: string
  if (tmpResult) {
    invokeResult = tmpResult.invokeResult
  } else {
    invokeResult = '[]'
  }
  return <Entry[]>JSON.parse(invokeResult)
}

async function newEntry(data: {
  id: string
  from: string
  to: string
  amount: string
  proof: string
  privateFor?: string
}) {
  if (!data.privateFor) {
    data.privateFor = config.myOrg || ''
  }
  if (!checkList(data.privateFor || '')) {
    data.privateFor = ''
  }
  // const id = await saltedSha256(JSON.stringify(data), moment(), true)
  const from = Buffer.from(data.from)
  const to = Buffer.from(data.to)
  const amount = Buffer.from(data.amount)
  const proof = Buffer.from(data.proof)
  await fabricService.invokeChaincode(
    'newEntry',
    [data.id, data.privateFor || ''],
    {
      from,
      to,
      amount,
      proof,
    }
  )
}

async function relayEntry(argsStr: string[]) {
  if (argsStr[0] == 'newEntry') {
    const id = argsStr[1]
    let invokeResult = await fabricService.invokeChaincode('getEntry', [id])
    if (invokeResult) {
      const payload = JSON.parse(invokeResult.invokeResult)
      console.log('Payload received: ', payload)
      if (payload.to == (config.myBank || '')) {
        server.to('broadcast').emit('relay', payload)
        console.log('Payload relayed')
      } else {
        console.log('Payload dropped')
      }
    }
  }
}

export default { getEntries, newEntry, relayEntry }
