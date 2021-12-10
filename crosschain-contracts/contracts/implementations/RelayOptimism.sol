// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../CrossChainRelayer.sol";

contract RelayOptimism is CrossChainRelayer {
    constructor(address crossdomainmessenger)
    WithCrossChain(LibCrossChain.Optimism(crossdomainmessenger))
    {}
}
