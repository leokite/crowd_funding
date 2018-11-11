import { increaseTime, duration } from './helpers/increaseTime';

const BigNumber = web3.BigNumber

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

var CrowdFunding = artifacts.require("CrowdFunding");

contract('CrowdFunding', ([owner, investor1, investor2]) => {
  let instance;

  beforeEach(async () => {
    let duration = 300;
    let goalAmount = 100000;
    instance = await CrowdFunding.new(duration, goalAmount, { from: owner })
  });
  6

  it('should set goalAmount', async () => {
    (await instance.goalAmount()).should.bignumber.equal(100000);
  });

  it('should not end a campaign in the initial state', async () => {
    (await instance.ended()).should.be.false;
  });

  it('should fund from investor', async () => {
    let amount1 = new web3.BigNumber(web3.toWei(0.007, 'ether'));
    let amount2 = new web3.BigNumber(web3.toWei(0.003, 'ether'));
    let totalAmount = new web3.BigNumber(web3.toWei(0.01, 'ether'));
    instance.fund({ from: investor1, value: amount1 });
    instance.fund({ from: investor1, value: amount2 });
    (await instance.investors(0))[1].should.bignumber.equal(amount1);
    (await instance.investors(1))[1].should.bignumber.equal(amount2);
    (await instance.totalAmount()).should.bignumber.equal(totalAmount);
    (await web3.eth.getBalance(instance.address)).should.bignumber.equal(totalAmount);
  });


});
6
