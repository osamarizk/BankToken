# Bank smart contract task
---
### Description
create a bank smart contract which will enable anyone to deposit an amount X of XYZ
ERC20 tokens to their savings (staking) account. The bank smart contract also contains an additional
token reward pool of R XYZ tokens, deposited to the contract by the contract owner (bank owner) at
contract deployment. At deployment the bank owner sets a time period constant T, to be used for reward
calculation.

---
## Instructions on how to run your project together with the code. 

### Steps
```
1-	Please visit GitHub repo (https://github.com/osamarizk/BankToken).
2-	Download Project
3-	Open it with Editor like Vscode.
4-	Open Vscode terminal
5-	Run the below command, in order to install project decencies.
npm i
6-	 Open Ganache blockchain.
7-	Run the below commands in order to test bank Token Smart Contract (run one by one)
Truffle test test/BankToken.test.js 
Truffle test test/BankToken.test.t4.js
```
### Note:
```
•	BankToken.test.js used to test all smart contract business logic without the below Point
If the user withdraws tokens after 4T has passed since contract deployment, they can receive the full reward of R (R1+R2+R3) proportionally to their ratio of tokens in the total pool
```
```
•	BankToken.test.t4.js used to test the above point of contract business logic.
```
```
•	Configuration setup: ()
Default values:
	time period constant T =30 sec.
	token reward pool = 1000 Wei.
	Deployer = accounts [0]

You can change these values at the below places:
1- migrations > 1_bank_token_migration.js
Line 5 (await deployer.deploy(BankToken, 30, { from: accounts[0], value: '1000' });)

2- test > BankToken.test.js, BankToken.test.t4.js
Line 20 const tDeposit = '30' // // Deposit Period
Line31 const rToken = 1000; // Token reward Pool Amount
