import { tokens, INVALID_VALUE, INVALID_ADDRESS } from './helpers';
import { BN, ether, expectEvent, expectRevert, time } from 'openzeppelin-test-helpers';

const BankToken = artifacts.require('BankToken');

require('chai')
    .use(require('chai-as-promised'))
    .should()

// Wait Time configuration
const waiteTime = t => new Promise(resolve => setTimeout(resolve, t));

contract('BankToken', ([deployer, user1, user2]) => {

    let bnktoken; // instant of contract
    let bnkBalance;
    let t0Deploy; // contract deployment time
    let totalDeposit; // total Deposits
    const tDeposit = '30' // // Deposit Period
    let rewardT23;
    let rewardT34;
    let rewardT4;
    let r1Rem; // R1 Remaining
    let result;
    let amount1;
    let amount2;
    let amount3;
    let amount4;
    let totalDps;

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

        it('contract address', () => {
            const address = bnktoken.address;
            assert.notEqual(address, '');
        })
        //an additional token reward pool of R XYZ tokens, deposited to the contract by the contract owner (bank owner)
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


        it('calculate Reward of period [Pass 4T]', async () => {
            const balance = await bnktoken.Balance(user2);
            const result = await bnktoken.rewardT4();
            rewardT4 = (rToken * balance.toNumber()) / (totalDps);
            console.log(rewardT4.toString(), balance.toString(), totalDps.toString())

        })


        //If the user withdraws tokens after 4T has passed since contract deployment
        it('User2 withdraw 4000 Wei', async () => {
            console.log("waiting 61 Second [4T hass passesT] , then Withdraws");

            await waiteTime(91000);

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
            amount4 = amount4 + rewardT4;
            //console.log(event.value.toString(),rewardT4.toString(),amount4.toString());
            event.value.toString().should.equal(amount4.toString(), 'value is correct');
        })

        it('Total Deposit after user2 withdraw his amount', async () => {
            const result = await bnktoken.totalDeposit();
            result.toString().should.equal(totalDps.toString());
        })




    })

    describe('withdraw Remaining Rwrd', () => {

        it('remaining reward', async () => {
            const result = await bnktoken.rToken();
            console.log(result.toString());
        })

        it('withdraw Remaining Rwrd', async () => {
            console.log("Waiting 31 sec")
            await bnktoken.withdrawRemainRwrd();

        })



    })













})
