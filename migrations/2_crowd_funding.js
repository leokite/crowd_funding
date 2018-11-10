var CrowdFunding = artifacts.require("CrowdFunding");

module.exports = function(deployer) {
  var _duration = 300;
  var _goalAmount = 100000;
  deployer.deploy(CrowdFunding, _duration, _goalAmount);
};
