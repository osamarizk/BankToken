const BankToken = artifacts.require("BankToken");
module.exports = async function (deployer) {

  const accounts = await web3.eth.getAccounts();
  await deployer.deploy(BankToken, 30, { from: accounts[0], value: '1000' });

};
