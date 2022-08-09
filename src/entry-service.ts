const saltedSha256 = require('salted-sha256')
const moment = require('moment')
import fabricService from './fabric-service'

const orgList: string[] = ['', 'Org1MSP', 'Org2MSP', 'Org3MSP']
//checklist function
function checkList(candidate: string) {
  for (let i = 0; i < orgList.length; i++) {
    if (orgList[i] == candidate) {
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

interface INewEntryParams {
  id: string
  from: string
  to: string
  amount: string
  proof: string
  privateFor: string
}

async function newEntry(data: INewEntryParams) {
  if (!checkList(data.privateFor)) {
    data.privateFor = ''
  }
  // const id = await saltedSha256(JSON.stringify(data), moment(), true)
  const from = Buffer.from(data.from)
  const to = Buffer.from(data.to)
  const amount = Buffer.from(data.amount)
  const proof = Buffer.from(data.proof)
  await fabricService.invokeChaincode('newEntry', [data.id, data.privateFor], {
    from,
    to,
    amount,
    proof,
  })
}

export default { getEntries, newEntry }
