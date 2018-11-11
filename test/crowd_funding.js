var CrowdFunding = artifacts.require("CrowdFunding");

contract('CrowdFunding', function(accounts) {
  let instance;

  beforeEach(async () => {
    instance = await CrowdFunding.deployed();
  });

  it('should set initial goalAmount as 100000', async () => {
    let goalAmount = await instance.goalAmount();
    assert.equal(goalAmount, 100000);
  });

  it('should not end a campaign in the initial state', async () => {
    let ended = await instance.ended();
    assert.equal(ended, false);
  });
});
