import {
  CompilationArtifacts,
  initialize,
  Proof,
  ProvingKey,
  VerificationKey,
  ZoKratesProvider,
} from 'zokrates-js'

const privateInputLength = 10

class Zokrates {
  //declare variables
  private initialized: boolean = false
  private pk: ProvingKey = new Uint8Array()
  private vk: VerificationKey = {}
  private zokratesProvider: ZoKratesProvider = <any>{}
  private artifacts: CompilationArtifacts = <any>{}
  private source = `def main(field[10] a) -> field {
  field mut count = 0;
  field mut flag = 0;
  for u32 i in 0..${privateInputLength} {
      count = a[i] == 1 ? count + 1 : count;
  }
  flag = count == ${privateInputLength} ? 1 : 0;
  return flag;
}`

  //initialize zokrates
  public initialize = async () => {
    if (!this.initialized) {
      this.zokratesProvider = await initialize()
      this.artifacts = this.zokratesProvider.compile(this.source)
      this.initialized = true
      console.log('Zokrates initialized')
    }
  }

  //generate keypair
  public genKey = async () => {
    const keypair = this.zokratesProvider.setup(this.artifacts.program)
    this.pk = keypair.pk
    this.vk = keypair.vk
    console.log('Key pair generated')
    return keypair
  }

  //generate proof
  public prove = async (answerList: string[]) => {
    const { witness, output } = this.zokratesProvider.computeWitness(
      this.artifacts,
      [answerList]
    )
    let proof: any = this.zokratesProvider.generateProof(
      this.artifacts.program,
      witness,
      this.pk
    )
    return {
      curve: proof.curve,
      scheme: proof.scheme,
      inputs: Array(privateInputLength + 1).fill(
        '0x0000000000000000000000000000000000000000000000000000000000000001'
      ),
      proof: proof.proof,
    }
  }

  //verify proof
  public verify = async (proof: Proof, vk: VerificationKey) => {
    console.log(proof)
    return this.zokratesProvider.verify(vk, proof)
  }
}

const zokrates = new Zokrates()

export default zokrates
