const BankToken = artifacts.require("BankToken");

module.exports = async function (deployer) {

  const accounts = await web3.eth.getAccounts();
  //t0 = block.timestamp+ tDeposite ---60
  // bank owner is account[0];
  // TokenReward Pool Amount=1000 wei

  await deployer.deploy(BankToken, 60, { from: accounts[0], value: '1000000000000000000' });

};
