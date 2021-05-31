// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "./IPriceOracle.sol";
import "./roleAccess.sol";

contract TokenFee is RoleAccess {
    using Address for address;

    // events
    event TipRateChanged(address indexed sender, uint256 newTipRate);
    event TipAccountChanged(address indexed sender, address newTipAccount);
    event FeeAccountChanged(address indexed sender, address newFeeAccount);
    event FiatCurrencyChanged(address indexed sender, string newFiatCurrency);
    event FiatFeeAmountChanged(address indexed sender, uint256 newFiatFeeAmount);
    event PriceOracleChanged(address indexed sender, address newPriceOracle);
    event StagingAccountChanged(address indexed sender, address newStagingAccount);

    // variables
    address internal stagingAccount; // temporarily hold receiver's token before withdraw
    address internal tipAccount;
    address internal feeAccount;
    address internal priceOracle;
    uint256 internal tipRate; // 5 means 5/10,000
    string internal fiatCurrency; // fiat currency
    uint256 internal fiatFeeAmount; // 5 means 5 cents

    function setTipRate(uint256 newTipRate) external onlyAdmin {
        require(newTipRate <= 10000);
        tipRate = newTipRate;
        emit TipRateChanged(msg.sender, tipRate);
    }

    function setTipAccount(address newTipAccount) external onlyAdmin {
        require(newTipAccount != address(0));
        tipAccount = newTipAccount;
        emit TipAccountChanged(msg.sender, tipAccount);
    }

    function setFeeAccount(address newFeeAccount) external onlyAdmin {
        require(newFeeAccount != address(0));
        feeAccount = newFeeAccount;
        emit FeeAccountChanged(msg.sender, newFeeAccount);
    }

    function setFiatCurrency(string memory newFiatCurrency) external onlyAdmin {
        fiatCurrency = newFiatCurrency;
        emit FiatCurrencyChanged(msg.sender, newFiatCurrency);
    }

    function setFiatFeeAmount(uint256 amount) external onlyAdmin {
        require(amount >=0, "negative fiat fee amount");
        fiatFeeAmount = amount;
        emit FiatFeeAmountChanged(msg.sender, fiatFeeAmount);
    }

    function setPriceOracle(address newPriceoracle) external onlyAdmin {
        require(newPriceoracle.isContract(), "price oracle is not a contract");
        priceOracle = newPriceoracle;
        emit PriceOracleChanged(msg.sender, priceOracle);
    }

    function setStagingAccount(address newStagingAccount) external onlyAdmin {
        require(newStagingAccount != address(0));
        stagingAccount = newStagingAccount;
        emit StagingAccountChanged(msg.sender, stagingAccount);
    }

        // calculate tip
    function getTip(uint256 amount) internal view returns(uint256) {
        if (tipAccount == address(0)) {
            return 0;
        }
        return amount*tipRate/10000;
    }

    // calculate fee
    function getFee() internal view returns(uint256) {
        if (feeAccount == address(0)) {
          return 0;
        }
        return IPriceOracle(priceOracle).convertNativeToken(fiatCurrency, fiatFeeAmount);
    }
}
