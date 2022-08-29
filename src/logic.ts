import fabricService from './fabric'
import fs from 'fs'
import path from 'path'
import { server } from '../app'
import zokrates from './zokrates'
import { ProvingKey, VerificationKey } from 'zokrates-js'

//define entry interfaces
interface Entry {
  id?: string
  from: string
  to: string
  amount: string
  proof: string
}

class Aml {
  //declare variables
  private config = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'config', 'config.json'),
      'utf-8'
    ) || '{}'
  )

  //initialize
  public initialize = async () => {
    const { vk } = await zokrates.genKey()
    await fabricService.invokeChaincode('setKey', [JSON.stringify(vk)])
  }

  //get self bank name
  public getMyBank = () => {
    return this.config.myBank
  }

  //get other org's bk from chaincode
  public getOrgVk = async (mspId: string) => {
    let tmpResult = await fabricService.invokeChaincode('getKey', [mspId])
    let invokeResult: string
    if (tmpResult) {
      invokeResult = tmpResult.invokeResult
    } else {
      invokeResult = '{}'
    }
    return <VerificationKey>JSON.parse(invokeResult)
  }

  //get entries from chaincode
  public getEntries = async (member: string) => {
    let tmpResult = await fabricService.invokeChaincode('getEntries', [member])
    let invokeResult: string
    if (tmpResult) {
      invokeResult = tmpResult.invokeResult
    } else {
      invokeResult = '[]'
    }
    return <Entry[]>JSON.parse(invokeResult)
  }

  //create new entry on chaincode
  public newEntry = async (data: {
    id: string
    from?: string
    to: string
    amount: string
    proof: string
  }) => {
    const privateFor = this.config.bankOrgMap[data.to] || ''
    console.log(`Submitting data private for ${privateFor}`)
    console.log(data)
    const from = Buffer.from(data.from ? data.from : this.config.myBank)
    const to = Buffer.from(data.to)
    const amount = Buffer.from(data.amount)
    const proof = Buffer.from(data.proof)
    await fabricService.invokeChaincode('newEntry', [data.id, privateFor], {
      from,
      to,
      amount,
      proof,
    })
  }

  //relay entry from chaincode
  public relayEntry = async (argsStr: string[]) => {
    if (argsStr[0] == 'newEntry') {
      const id = argsStr[1]
      let invokeResult = await fabricService.invokeChaincode('getEntry', [id])
      if (invokeResult) {
        const payload = JSON.parse(invokeResult.invokeResult)
        console.log('Payload received: ', payload)
        if (payload.to == (this.config.myBank || '')) {
          const verified = await zokrates.verify(
            JSON.parse(payload.proof || '{}'),
            await this.getOrgVk(this.config.bankOrgMap[payload.from])
          )
          payload.verified = verified
          console.log('Payload verified:', verified)
          server.to('broadcast').emit('relay', payload)
          console.log('Payload relayed')
        } else {
          console.log('Payload dropped')
        }
      }
    }
  }
}

const aml = new Aml()

export default aml
