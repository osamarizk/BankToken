import {tokens} from './helpers'
const BankToken = artifacts.require('BankToken');

require('chai')
    .use(require('chai-as-promised'))
    .should()

// Wait Time configuration
const waiteTime = t => new Promise(resolve => setTimeout(resolve, t));

contract('BankToken', ([deployer, user1, user2]) => {
    const name = 'ATRAC';
    const symbol = 'MTK';
    const decimals = '18';
    const totalSupply = tokens(10000).toString();

    let bnktoken; // instant of contract
    let bnkBalance; // Bank Balance
    let totalDeposit; // total Deposits
    const tDeposit = '30' // Deposit Period
    let rewardT23; // Reward for Period t2 to t3
    let rewardT34; // Reward for Period t3 to t4
    let r1Rem; // R1 Remaining
    let result;
    let amount1;
    let amount2;
    let amount3;
    let amount4;
    let totalDps;
    // Setup Calculation
    const rToken = 1000; // Token reward Pool Amount
    const t2Dposit = tDeposit * 2 // 2T
    const t3Dposit = tDeposit * 3; // 3T
    const t4Dposit = tDeposit * 4; // 4T

    let r1Token = (rToken * 20) / 100; // R1
    let r2Token = (rToken * 30) / 100; // R2
    let r3Token = (rToken * 50) / 100; // R3  

    beforeEach(async () => {
        bnktoken = await BankToken.deployed(tDeposit, { from: deployer, value: rToken.toString() });
    })

    describe('Deployment', () => {
        it('tracks the name', async () => {
            const result = await bnktoken.name()
            result.should.equal(name)
          })
      
          it('tracks the symbol', async ()  => {
            const result = await bnktoken.symbol()
            result.should.equal(symbol)
          })
      
          it('tracks the decimals', async ()  => {
            const result = await bnktoken.decimals()
            result.toString().should.equal(decimals)
          })
      
          it('tracks the total supply', async ()  => {
            const result = await bnktoken.totalSupply()
            result.toString().should.equal(totalSupply)
          })
      
          it('assigns the total supply to the deployer', async ()  => {
            const result = await bnktoken.balanceOf(deployer)
            result.toString().should.equal(totalSupply)
          })

        it('contract address', () => {
            const address = bnktoken.address;
            assert.notEqual(address, '');
        })

        it('additional token reward pool,deposited to the contract', async () => {
            bnkBalance = await bnktoken.getBankBanlance();
            bnkBalance.toString().should.equal(rToken.toString())
        })

        it('tracks the time Period', async () => {
            const result = await bnktoken.tDposit()
            result.toString().should.equal(tDeposit.toString())
        })

        it('tracks the reward Tokens', async () => {
            const result = await bnktoken.rToken();
            result.toString().should.equal(rToken.toString());
        })

    })

    describe('Periods Calculation', () => {

        it('Period 2T', async () => {
            const result = await bnktoken.t2Dposit();
            result.toString().should.equal(t2Dposit.toString());
        })

        it('Period 3T', async () => {
            const result = await bnktoken.t3Dposit();
            result.toString().should.equal(t3Dposit.toString());
        })

        it('Period 4T', async () => {
            const result = await bnktoken.t4Dposit();
            result.toString().should.equal(t4Dposit.toString());
        })
    })

    describe('Reward Ratio calculation', () => {

        it('R1=20%', async () => {
            const result = await bnktoken.rToken();
            (result * 20 / 100).toString().should.equal(r1Token.toString());
        })

        it('R2=30%', async () => {
            const result = await bnktoken.rToken();
            (result * 30 / 100).toString().should.equal(r2Token.toString());
        })

        it('R3=50%', async () => {
            const result = await bnktoken.rToken();
            (result * 50 / 100).toString().should.equal(r3Token.toString());
        })

    })

    describe('Depositing Token', () => {

        it('Rejects Invalid Deposite Value', async () => {
            const invalidAmount = '0';
            await bnktoken.deposite({ from: user1, value: invalidAmount }).should.be.rejectedWith('Invalid Deposite Value');
        })

        it('User1 deposit 1000 Wei', async () => {
            amount1 = 1000;
            result = await bnktoken.deposite({ from: user1, value: amount1.toString() })
            const balance = await bnktoken.Balance(user1);
            console.log(balance.toString());
        })

        it('emits user1 depositing 1000 Wei event', () => {
            const log = result.logs[0];
            log.event.should.eq('Deposite');
            const event = log.args;
            event.from.toString().should.equal(user1, 'from is correct');
            event.value.toString().should.equal(amount1.toString(), 'value is correct');
        })

        it('User2 deposit 4000 Wei', async () => {
            amount2 = 4000;
            result = await bnktoken.deposite({ from: user2, value: amount2.toString() });
            const balance = await bnktoken.Balance(user2);
            console.log(balance.toString());
        })

        it('emits user2 depositing 4000 Wei event', () => {
            const log = result.logs[0];
            log.event.should.eq('Deposite');
            const event = log.args;
            event.from.toString().should.equal(user2, 'from is correct');
            event.value.toString().should.equal(amount2.toString(), 'value is correct');
        })

        it('Total Deposits', async () => {
            totalDps = amount1 + amount2;
            totalDeposit = await bnktoken.totalDeposit();
            totalDeposit.toString().should.equal(totalDps.toString());
        })

        it('After T has passed , no more deposits are allowed', async () => {
            console.log("waiting 31 Second[ After T has passed] , then deposit");
            // await new Promise(resolve => setTimeout(resolve, 61000))
            ////During the first period of T time the users can deposit tokens. After T has passed, no more deposits are allowed.
            await waiteTime(31000);
            await bnktoken.deposite({ from: user1, value: '1000' }).should.be.rejectedWith('Deposit Period Locked');
        })

    })

    describe('Withdraws Token', () => {
        let result;
        let amount;

        //user1 withdraw 2000 Wei 
        it('Insufficient funds', async () => {
            await bnktoken.withdrawal('2000', { from: user1 }).should.be.rejectedWith('Insufficient funds');
        })

        it('Owner withdraw', async () => {
            await bnktoken.withdrawal('1000', { from: deployer }).should.be.rejectedWith('Owner can not withdraws');
        })

        //T2(60 Second) has not passed since contract deployment, the users can withdraw their tokens.
        it('Locked Period status', async () => {
            await bnktoken.withdrawal('1000', { from: user1 }).should.be.rejectedWith('Locked Period status');
        })

        it('calculate Reward of period t0+2T to t0+3T', async () => {
            const balance = await bnktoken.Balance(user1);
            const result = await bnktoken.rewardT23();
            rewardT23 = (r1Token * balance.toNumber()) / (totalDps);
            console.log(rewardT23.toString(), balance.toString(), totalDps.toString())
        })


        //If a user withdraws tokens during the period t0+2T to t0+3T
        it('User1 withdraw 1000 Wei', async () => {
            console.log("waiting 31 Second [the period t0+2T to t0+3T],then Withdraws");
            await waiteTime(31000);

            amount3 = 1000;
            result = await bnktoken.withdrawal(amount3.toString(), { from: user1 });
            totalDps = totalDps - amount3;

        })

        it('calculate Reward of period t0+3T to t0+4T', async () => {
            const balance = await bnktoken.Balance(user2);
            const result = await bnktoken.rewardT34();
            rewardT34 = (r2Token * balance.toNumber()) / (totalDps);
            console.log(rewardT34.toString(), balance.toString(), totalDps.toString())
        })

        it('emits user1 Withdrawing 1000 Wei event', () => {
            const log = result.logs[0];
            log.event.should.eq('Withdrawal');
            const event = log.args;
            event.to.toString().should.equal(user1, 'to is correct');
            // calculate totalwithdraw amount(amount+RewardT23)
            amount3 = amount3 + rewardT23;
            event.value.toString().should.equal(amount3.toString(), 'value is correct');
        })

        it('Total Deposit after user1 withdraw his amount', async () => {
            const result = await bnktoken.totalDeposit();
            result.toString().should.equal(totalDps.toString());
        })

        it('Reward R1 Remaining', async () => {
            r1Rem = r1Token - rewardT23;
            const result = await bnktoken.reward1Rem();
            result.toString().should.equal(r1Rem.toString());
            console.log(r1Rem.toString());
        })

        //If a user2 withdraws tokens during the period t0+3T to t0+4T
        it('User2 withdraw 4000 Wei', async () => {
            console.log("waiting 31 Second [the period t0+3T to t0+4T] , then Withdraws");

            await waiteTime(31000);

            amount4 = 4000;
            result = await bnktoken.withdrawal(amount4.toString(), { from: user2 });
            totalDps = totalDps - amount4;
        })

        it('emits user2 Withdrawing 4000 Wei event', () => {
            const log = result.logs[0];
            log.event.should.eq('Withdrawal');
            const event = log.args;
            event.to.toString().should.equal(user2, 'to is correct');
            // calculate totalwithdraw amount(amount+RewardT23)
            amount4 = amount4 + rewardT34 + r1Rem;
            event.value.toString().should.equal(amount4.toString(), 'value is correct');
        })

        it('Total Deposit after user2 withdraw his amount', async () => {
            const result = await bnktoken.totalDeposit();
            result.toString().should.equal(totalDps.toString());
        })

    })

    describe('withdraw Remaining Rwrd', () => {

        it('Last Period status', async () => {
            await bnktoken.withdrawRemainRwrd().should.rejectedWith('Last Period status');
        })

        it('remaining reward', async () => {
            const result = await bnktoken.rToken();
            console.log(result.toString());
        })

        it('withdraw Remaining Rwrd', async () => {
            console.log("Waiting 31 sec")
            await waiteTime(31000);
            const result = await bnktoken.withdrawRemainRwrd();
        })



    })













})
