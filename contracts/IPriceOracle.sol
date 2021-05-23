// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IPriceOracle {
    /**
     * @dev Converts fiat currency amount to chain native token amount
     */
    function convertNativeToken(string memory fiatCurrency, uint256 amount) external view returns (uint256);
}
