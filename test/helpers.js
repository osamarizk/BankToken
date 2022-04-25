export const INVALID_ADDRESS = '0x0000000000000000000000000000000000000000'

export const EVM_REVERT = 'VM Exception while processing transaction: revert'
export const INVALID_VALUE='VM Exception while processing transaction: revert Invalid Deposite Value -- Reason given: Invalid Deposite Value'

export const ether = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}

export const tokens = (n) => ether(n)