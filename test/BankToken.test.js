import { tokens, INVALID_ADDRESS } from './helpers';
const BankToken = artifacts.require('BankToken');

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('BankToken', ([deployer, user1, user2]) => {
    let bnktoken;
    const tDeposit = '60' // // Deposit Period
    const rToken = tokens(1).toString(); // Token reward Pool Amount
    let t0Deploy= Date.now()/ 1000;
    const t2Dposit= tDeposit*2
    const t3Dposit= tDeposit*3;
    const t4Dposit= tDeposit*4;

    const r1Token=rToken*20/100;
    const r2Token=rToken*30/100;
    const r3Token=rToken*50/100;



    beforeEach(async () => {
        // Deploy Bank Token
        // Bank owner time period constant T, Token Reward
        bnktoken = await BankToken.deployed(60, { from: deployer, value: '1000000000000000000' });
    })

    describe('deployment', () => {
        it('contract address', async () => {
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


        describe('Reward Ratio calculation', () => {
       
            it('R1=20%', async () => {
                const result = await bnktoken.rToken();
                
                (result*20/100).toString().should.equal(r1Token.toString());
            })
    
            it('R2=30%', async () => {
                const result = await bnktoken.rToken();
                (result*30/100).toString().should.equal(r2Token.toString());
            })

            it('R3=50%', async () => {
                const result = await bnktoken.rToken();
                (result*50/100).toString().should.equal(r3Token.toString());
            })
    
           
            })

    })






})
