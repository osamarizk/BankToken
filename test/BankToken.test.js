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
    let t0Deploy; // contract deployment time
    const tDeposit = '30' // // Deposit Period
    const rToken = '1000'; // Token reward Pool Amount
    const t2Dposit = tDeposit * 2 // 2T
    const t3Dposit = tDeposit * 3; // 3T
    const t4Dposit = tDeposit * 4; // 4T

    const r1Token = rToken * 20 / 100; // R1
    const r2Token = rToken * 30 / 100; // R2
    const r3Token = rToken * 50 / 100; // R3  

    beforeEach(async () => {

        bnktoken = await BankToken.deployed(tDeposit, { from: deployer, value: rToken });
        t0Deploy = await bnktoken.t0Deploy();
        // console.log(await bnktoken.balanceOf(deployer).toString());

    })

    describe('Deployment', () => {
        it('contract address', () => {
            const address = bnktoken.address;
            assert.notEqual(address, '');
        })

        it('tracks the time Period', async () => {
            const result = await bnktoken.tDposit()
            result.toString().should.equal(tDeposit.toString())
        })

        it('tracks the reward Tokens', async () => {
            const result = await bnktoken.rToken()
            result.toString().should.equal(rToken)
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
        let result;
        let amount;

        it('Rejects Invalid Deposite Value', async () => {
            const invalidAmount = '0';
            await bnktoken.deposite({ from: user1, value: invalidAmount }).should.be.rejectedWith(INVALID_VALUE);
        })
        it('User1 deposit 1000 Wei', async () => {
             amount='1000';
            result= await bnktoken.deposite({ from: user1, value: amount  })
            const balance = await bnktoken.Balance(user1);
            console.log(balance.toString());
        })
        it('emits user1 depositing 1000 Wei event', () => {
            const log = result.logs[0];
            log.event.should.eq('Deposite');
            const event = log.args;
            event.from.toString().should.equal(user1, 'from is correct');
            event.value.toString().should.equal(amount.toString(), 'value is correct');
          })

        it('User2 deposit 4000 Wei', async () => {
            amount='4000';
            result= await bnktoken.deposite({ from: user2, value: amount});
            const balance = await bnktoken.Balance(user2);
            console.log(balance.toString());
        })

        it('emits user2 depositing 4000 Wei event', () => {
            const log = result.logs[0];
            log.event.should.eq('Deposite');
            const event = log.args;
            event.from.toString().should.equal(user2, 'from is correct');
            event.value.toString().should.equal(amount.toString(), 'value is correct');
          })

       

        it('After T has passed , no more deposits are allowed', async () => {
            console.log("waiting 31 Second , then deposit");
            // await new Promise(resolve => setTimeout(resolve, 61000))
            ////During the first period of T time the users can deposit tokens. After T has passed, no more deposits are allowed.
            await waiteTime(31000);
            await bnktoken.deposite({ from: user1, value: '1000' }).should.be.rejectedWith('Deposit Period Locked');
        })
        // it('T Pass', async () => {

        //     await bnktoken.deposite({ from: deployer, value: tokens(0.1) });
        // })




    })











})
