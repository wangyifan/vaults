// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./staking.sol";

contract StakingTest is Staking {
    constructor(uint256 epochSize_) Staking(epochSize_){
    }

    function addStaking(address from, uint256 amount) external returns(uint256){
        return _addStaking(from, amount);
    }

    function removeStaking(address from, uint256 stakeId_) internal returns(bool){
        return _removeStaking(from, stakeId_);
    }

    function updateEpochSize(uint256 epochSize_) external {
        _updateEpochSize(epochSize_);
    }

    function getEpochSize() external view returns(uint256) {
        return _currentEpochSize;
    }

    function getStakes(address from) external view returns(uint256[] memory){
        return _getStakes(from);
    }

    function epochStake(uint256 epoch) external returns(uint256) {
        return _epochStake(epoch);
    }

    function updateOnReadEpochSize() external {
        _updateOnReadEpochSize();
    }

    function getNextEpochPivot() external view returns(uint256) {
        return _nextEpochPivot;
    }

    function getNextEpochSize() external view returns(uint256) {
        return _nextEpochSize;
    }

    function getBlockNumber() external view returns(uint256) {
        return block.number;
    }
}
