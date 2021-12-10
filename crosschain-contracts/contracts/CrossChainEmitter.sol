// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ICrossChainReceiver.sol";
import "./ICrossChainEmitter.sol";
import "./WithCrossChain.sol";

abstract contract CrossChainEmitter is ICrossChainEmitter, WithCrossChain {
    using LibCrossChain for LibCrossChain.Bridge;

    function sendCrossChainTx(address target, uint256 value, bytes calldata data, uint32 gasLimit)
        public
        virtual
        override
    {
        getBridge().sendMessage(
            pair(),
            abi.encodeWithSelector(ICrossChainReceiver.receiveCrossChainTx.selector, target, value, data),
            gasLimit
        );

        emit CrossChainTxSent(target, value, data);
    }

    function pair() public view virtual override returns (address);
}
