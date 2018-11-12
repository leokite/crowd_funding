import { increaseTime, duration } from './helpers/increaseTime';
import { getTransactionGasCost } from './helpers/getGasCost';

const BigNumber = web3.BigNumber

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

var CrowdFunding = artifacts.require("CrowdFunding");

contract('CrowdFunding', ([owner, investor1, investor2]) => {
  const DURATION = 30 * 60; // 30 munites
  const GOAL_AMOUNT = new web3.BigNumber(web3.toWei(1, 'ether'));

  let instance;

  beforeEach(async () => {
    instance = await CrowdFunding.new(
        DURATION, GOAL_AMOUNT, { from: owner })
  });

  it('should be Funding state and not end the campaign initially', async () => {
    (await instance.status()).should.equal('Funding');
    (await instance.ended()).should.be.false;
  });

  it('should fail checkGoalReaced is called before campaign end', async() => {
    instance.checkGoalReached({ from: owner }).should.be.rejectedWith('revert');
  });

  it('should fail checkGoalReaced is called by other than owner', async() => {
    let amount1 = new web3.BigNumber(web3.toWei(0.1, 'ether'));
    await instance.fund({ from: investor1, value: amount1 });
    instance.checkGoalReached({ from: investor1 }).should.be.rejectedWith('revert');
  });

  it('should fail to fund after the campaign end', async () => {
    let amount1 = new web3.BigNumber(web3.toWei(1, 'ether'));
    await instance.fund({ from: investor1, value: amount1 });
    await increaseTime(duration.hours(1));
    await instance.checkGoalReached({ from: owner });
    instance.fund({ from: investor1, value: amount1 }).should.be.rejectedWith('revert');
  });

  it('should fund is called by investors', async () => {
    let amount1 = new web3.BigNumber(web3.toWei(0.1, 'ether'));
    let amount2 = new web3.BigNumber(web3.toWei(0.1, 'ether'));
    await instance.fund({ from: investor1, value: amount1 });
    await instance.fund({ from: investor2, value: amount2 });
    (await instance.investors(0))[1].should.bignumber.equal(amount1);
    (await instance.investors(1))[1].should.bignumber.equal(amount2);
    (await instance.totalAmount()).should.bignumber.equal(amount1.plus(amount2));
    (await web3.eth.getBalance(instance.address)).should.bignumber.equal(amount1.plus(amount2));
  });

  it('should success the campaign if totalAmount is reached by deadline, then send balance to owner', async () => {
    let amount1 = new web3.BigNumber(web3.toWei(1, 'ether'));
    await instance.fund({ from: investor1, value: amount1 });
    await increaseTime(duration.hours(1));
    await instance.checkGoalReached({ from: owner });
    (await instance.status()).should.be.equal("Campaign Succeeded");
    (await instance.ended()).should.be.true;
    (await web3.eth.getBalance(instance.address)).should.bignumber.equal(0);
  });

  it('should fail the campaign if totalAmount is NOT reached by deadline, then refund balance to investors', async () => {
    const amount1 = new web3.BigNumber(web3.toWei(0.1, 'ether'));
    const pre = web3.eth.getBalance(investor1);
    const res = await instance.fund({ from: investor1, value: amount1 });
    const gasCost = getTransactionGasCost(res['tx']);
    await increaseTime(duration.hours(1));
    await instance.checkGoalReached({ from: owner });
    const post = web3.eth.getBalance(investor1);
    post.minus(pre).plus(gasCost).should.be.bignumber.equal(0);
    (await instance.status()).should.be.equal("Campaign Failed");
    (await instance.ended()).should.be.true;
  });


});

