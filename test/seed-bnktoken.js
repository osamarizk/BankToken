// Contract
const BankToken = artifacts.require("BankToken")
//eth value
const ether = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}
module.exports = async function (callback) {
  try {
    // Fetch accounts from wallet - these are unlocked
    const accounts = await web3.eth.getAccounts()
    // Fetch the deployed ETHPool Token
    const ethpool = await BankToken.deployed()
    console.log('ETHPool Address fetched', ethpool.address)
    // Give ETHER to account[1]
    const sender = accounts[0]
    console.log(accounts)
    // //const receiver =accounts[1]
    // const receiver = '0x6DA1618e6Beb4160cb6BEebc38603AC53f2cD08D'
    // console.log('Reciever Address fetched', receiver)
    // let amount = web3.utils.toWei('2', 'ether') 
    // // deposit 2 token
    // await ethpool.deposit(receiver, amount, { from: sender })
    // console.log(`Transferred ${amount} ether from ${sender} to ${receiver}`)
    // // get Total ETHPool
    // let totalEth = await ethpool.totalEth()
    // console.log(`Total ETH at the Pool ${totalEth} `)

  }
  catch (error) {
    console.log(error)
  }

  callback()
}
