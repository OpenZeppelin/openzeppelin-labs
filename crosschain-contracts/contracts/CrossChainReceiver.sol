// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";

import "./ICrossChainReceiver.sol";
import "./WithCrossChain.sol";

abstract contract CrossChainReceiver is ICrossChainReceiver, WithCrossChain {
    using LibCrossChain for LibCrossChain.Bridge;

    function receiveCrossChainTx(address target, uint256 value, bytes calldata data)
        public
        virtual
        override
    {
        require(getBridge().msgSender() == pair(), "TODO");

        Address.functionCallWithValue(target, data, value);

        emit CrossChainTxReceived(target, value, data);
    }

    function pair() public view virtual override returns (address);
}
