// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICrossChainReceiver {
    event CrossChainTxReceived(address indexed target, uint256 value, bytes data);

    function pair() external view returns (address);
    function receiveCrossChainTx(address target, uint256 value, bytes calldata data) external;
}
