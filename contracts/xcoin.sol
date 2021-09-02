// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Uncomment the following lines to import Openzeppelin contract in remix.ethereum.org
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.1.0/contracts/utils/math/SafeMath.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.1.0/contracts/security/Pausable.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.1.0/contracts/token/ERC20/ERC20.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.1.0/contracts/access/AccessControlEnumerable.sol";

// Import OpenZeppelin contacts locally with truffle
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./roleAccess.sol";
import "./blacklistable.sol";

contract XCoin is RoleAccess, Blacklistable, Pausable, ERC20Burnable, ERC20Permit {
    using SafeMath for uint256;

    // variables
    uint256 internal _cap;
    mapping(address => uint256) internal minterAllowance;

    constructor(string memory name, string memory symbol, uint256 cap_)
      ERC20(name, symbol) ERC20Permit(name) {
         require(cap_ > 0, "ERC20: cap is 0");
        _cap = cap_;

        // owner has all roles
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BLACKLISTER_ROLE, _msgSender());
    }

    function cap() public view returns (uint256) {
        return _cap;
    }

    function setCap(uint256 cap_) public onlyMinter returns (uint256){
        require(cap_ > 0, "ERC20: cap is 0");
        require(cap_ > totalSupply(), "ERC20: new cap should be larger than total supply");
        _cap = cap_;
        return _cap;
    }

    // admin can assign minter role to another EOA or smart contract
    function GrantMinterLimit(address minter, uint256 allowance) public onlyAdmin returns (bool) {
        grantRole(MINTER_ROLE, minter);
        minterAllowance[minter] = allowance;
        return true;
    }

    function RevokeMinterLimit(address minter) public onlyAdmin returns (bool) {
        if (hasRole(MINTER_ROLE, minter)) {
            minterAllowance[minter] = 0;
            revokeRole(MINTER_ROLE, minter);
        }
        return true;
    }

    // list account with minter role
    function getMinters() public view returns (address[] memory) {
        uint256 count = getRoleMemberCount(MINTER_ROLE);
        address[] memory minters_ = new address[](count);
        for (uint index = 0; index < count; index++) {
            minters_[index] = getRoleMember(MINTER_ROLE, index);
        }
        return minters_;
    }

    function getMinterAllowance(address[] memory minters) public view returns (uint256[] memory) {
        uint256 count = minters.length;
        uint256[] memory minterAllowance_ = new uint256[](count);
        for (uint index = 0; index < count; index++) {
            minterAllowance_[index] = minterAllowance[minters[index]];
        }
        return minterAllowance_;
    }

    // only account with minter role can mint
    function mint(address account, uint256 amount)
        public
        whenNotPaused
        notBlacklisted(account)
        notBlacklisted(msg.sender)
        onlyMinter
    {
        _mint(account, amount);
    }

    // only account with minter role can burn
    function burn(uint256 amount)
        public
        override
        whenNotPaused
        notBlacklisted(msg.sender)
        onlyMinter
    {
        _burn(_msgSender(), amount);
    }

    // only account with minter role can burn
    function burnFrom(address account, uint256 amount)
        public
        override
        whenNotPaused
        notBlacklisted(account)
        notBlacklisted(msg.sender)
        onlyMinter
    {
        super.burnFrom(account, amount);
    }

    function approve(address spender, uint256 amount)
        public
        override
        whenNotPaused
        notBlacklisted(spender)
        notBlacklisted(msg.sender)
        returns (bool)
    {
        return super.approve(spender, amount);
    }

    function transfer(address recipient, uint256 amount)
        public
        override
        whenNotPaused
        notBlacklisted(recipient)
        notBlacklisted(msg.sender)
        returns (bool)
    {
      return super.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount)
        public
        override
        whenNotPaused
        notBlacklisted(sender)
        notBlacklisted(recipient)
        notBlacklisted(msg.sender)
        returns (bool)
    {
        return super.transferFrom(sender, recipient, amount);
    }

    // when paused, both mint() and transfer() will revert
    function pause() public onlyAdmin {
        _pause();
    }

    function unpause() public onlyAdmin {
        _unpause();
    }

    // this hook runs before any mint or transfer function
    // it checks for pause and token cap
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "ERC20 Pausable: token transfer while paused");
        require(ERC20.totalSupply() + amount <= cap(), "ERC20 Capped: cap exceeded");
    }
}
