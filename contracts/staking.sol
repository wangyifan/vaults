// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Staking {
    using SafeMath for uint256;

    enum StakeStatus { ADDED, REMOVED }

    // staking struture
    struct Stake {
        uint256 amount;
        StakeStatus status;
    }

    // variables
    mapping(uint256 => Stake) internal _stakes;
    mapping(address => uint256[]) internal _stakers;
    mapping(uint256 => uint256) internal _stakeAdded;
    mapping(uint256 => uint256) internal _stakeRemoved;
    mapping(uint256 => uint256) internal _totalStakes;
    uint256 internal _stakeId;
    uint256 internal _lastUpdateEpoch;
    uint256 internal _currentEpochSize;
    uint256 internal _nextEpochSize;
    uint256 internal _nextEpochPivot;

    // events
    event StakeAdded(
        address indexed from,
        uint256 indexed epoch,
        uint256 amount
    );

    event StakeRemoved(
        address indexed from,
        uint256 indexed epoch,
        uint256 amount
    );

    constructor(uint256 epochSize_) {
        _currentEpochSize = epochSize_;
    }

    function _updateEpochSize(uint256 epochSize_) internal {
        _nextEpochSize = epochSize_;
        _nextEpochPivot = block.number * _currentEpochSize / _currentEpochSize + _currentEpochSize;
    }

    function _updateOnReadEpochSize() internal {
      // if next epoch pivot is set and current block number has passed it
      //if (_nextEpochPivot != 0 && block.number >= _nextEpochPivot ) {
      _currentEpochSize = _nextEpochSize;
      _nextEpochSize = 0;
      _nextEpochPivot = 0;
      //}
    }

    function _addStaking(address from, uint256 amount) internal returns(uint256){
        _updateOnReadEpochSize();
        uint256 epoch = block.number / _currentEpochSize;
        Stake memory stake = Stake(amount, StakeStatus.ADDED);
        _stakes[_stakeId] = stake;
        _stakers[from].push(_stakeId);
        _stakeId += 1;
        // time delay to next epoch
        _stakeAdded[epoch+1] += stake.amount;

        // emit event
        emit StakeAdded(from, epoch+1, amount);

        return _stakeId - 1;
    }

    function _removeStaking(address from, uint256 stakeId_) internal returns(bool){
        _updateOnReadEpochSize();
        uint256 epoch = block.number / _currentEpochSize;
        Stake memory stake = _stakes[stakeId_];
        // time delay to next epoch
        require(stake.amount != 0, "stake can not be found");
        _stakeRemoved[epoch+1] += stake.amount;
        stake.status = StakeStatus.REMOVED;

        // emit event
        emit StakeRemoved(from, epoch+1, stake.amount);
        return true;
    }

    function _getStakes(address from) internal view returns(uint256[] memory) {
        uint256[] memory stakeIds = _stakers[from];
        uint256 size = 0;
        for(uint256 i=0;i<stakeIds.length;i++) {
            if (_stakes[stakeIds[i]].status == StakeStatus.ADDED) {
                size += 1;
            }
        }

        uint256[] memory result = new uint[](size);
        uint256 j = 0;
        for(uint256 i=0;i<stakeIds.length;i++) {
            if (_stakes[stakeIds[i]].status == StakeStatus.ADDED) {
                result[j] = _stakes[stakeIds[i]].amount;
                j += 1;
            }
        }

        return result;
    }

    function _epochStake(uint256 epoch) internal returns(uint256){
        if (epoch == _lastUpdateEpoch) {
            return _totalStakes[epoch];
        } else {
            for(uint256 i = _lastUpdateEpoch + 1;i <=epoch; i++) {
                _totalStakes[i] = _totalStakes[i-1] + _stakeAdded[i] - _stakeRemoved[i];
            }
            _lastUpdateEpoch = epoch;
            return _totalStakes[epoch];
        }
    }
}
