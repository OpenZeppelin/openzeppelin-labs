// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICrossChainEmitter {
    event CrossChainTxSent(address indexed target, uint256 value, bytes data);

    function pair() external view returns (address);
    function sendCrossChainTx(address target, uint256 value, bytes calldata data, uint32 gasLimit) external;
}
