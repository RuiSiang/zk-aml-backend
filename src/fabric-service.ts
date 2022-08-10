import * as fs from 'fs'
import {
  Wallets,
  Gateway,
  GatewayOptions,
  TransientMap,
  BlockEvent,
} from 'fabric-network'
import Entry from '../src/entry-service'

const mspid = process.env.MSPID || 'Org1MSP'

interface invokeChaincodeResponse {
  invokeResult: string
}

async function listen() {
  console.log('Listener attached')
  console.log(`MSPID: ${mspid}`)
  const connectionProfileJson = fs
    .readFileSync('./config/connectionprofile.json')
    .toString()
  const connectionProfile = JSON.parse(connectionProfileJson)
  const wallet = await Wallets.newFileSystemWallet('./config/wallets')
  const gatewayOptions: GatewayOptions = {
    identity: mspid,
    wallet,
    discovery: { enabled: false, asLocalhost: false },
  }
  const gateway = new Gateway()
  try {
    await gateway.connect(connectionProfile, gatewayOptions)
    const network = await gateway.getNetwork('myc')
    // const contract = network.getContract('aml')
    const listener = async (event: BlockEvent) => {
      const blockData: any = event.blockData
      if (blockData !== undefined) {
        for (const i in blockData.data.data) {
          if (blockData.data.data[i].payload.data.actions !== undefined) {
            for (const j in blockData.data.data[i].payload.data.actions) {
              const args =
                blockData.data.data[i].payload.data.actions[j].payload
                  .chaincode_proposal_payload.input.chaincode_spec.input.args
              const argsStr = args.map((item: Buffer) => item.toString('utf-8'))
              Entry.relayEntry(argsStr)
              //trigger something here
            }
          }
        }
      }
    }
    await network.addBlockListener(listener, {
      type: 'full',
      startBlock: 1,
    })
  } catch (error) {
    console.error('Listener malfunctioned')
  }
}
listen()

async function invokeChaincode(
  transaction: string,
  args: string[],
  transient: TransientMap = {}
) {
  const connectionProfileJson = fs
    .readFileSync('./config/connectionprofile.json')
    .toString()
  const connectionProfile = JSON.parse(connectionProfileJson)
  const wallet = await Wallets.newFileSystemWallet('./config/wallets')
  const gatewayOptions: GatewayOptions = {
    identity: mspid,
    wallet,
    discovery: { enabled: false, asLocalhost: false },
  }
  const gateway = new Gateway()
  try {
    await gateway.connect(connectionProfile, gatewayOptions)
    const network = await gateway.getNetwork('myc')
    const contract = network.getContract('aml')
    const invokeResult = await contract
      .createTransaction(transaction)
      .setTransient(transient)
      .submit(...args)
    var result = '[]'
    if (invokeResult) {
      result = invokeResult.toString()
    }
    return <invokeChaincodeResponse>{ invokeResult: result }
  } catch (error) {
    console.error(
      `Failed to submit transaction: "${transaction}" with arguments: "${args}", transient: "${transient}",  error: "${error}"`
    )
  } finally {
    gateway.disconnect()
  }
}

export default { invokeChaincode, mspid }
