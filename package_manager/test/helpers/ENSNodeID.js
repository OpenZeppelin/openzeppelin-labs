import { soliditySHA3 } from 'ethereumjs-abi'

export default function ENSNodeID() {
  const labels = [...arguments]
  const types = labels.map(() => 'bytes32')
  const rawID = soliditySHA3(types, labels)
  return `0x${rawID.toString('hex')}`
}
