import * as fs from 'fs'
import {
  Wallets,
  Gateway,
  GatewayOptions,
  Network,
  TransientMap,
} from 'fabric-network'

// const mspid = "Org1MSP";
const mspid = process.env.MSPID || 'Org1MSP'

interface invokeChaincodeResponse {
  invokeResult: string
}

async function invokeChaincode(
  transaction: string,
  args: string[],
  transient: TransientMap = {}
) {
  const connectionProfileJson = (
    await fs.readFileSync('./config/connectionprofile.json')
  ).toString()
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
      result = await invokeResult.toString()
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
