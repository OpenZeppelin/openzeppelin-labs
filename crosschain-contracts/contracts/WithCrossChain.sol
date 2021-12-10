// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./libs/LibCrossChain.sol";

abstract contract WithCrossChain {
    LibCrossChain.Bridge private _bridge;

    constructor(LibCrossChain.Bridge memory bridge) {
        _bridge = bridge;
    }

    function getBridge() internal view returns (LibCrossChain.Bridge memory) {
        return _bridge;
    }
}
