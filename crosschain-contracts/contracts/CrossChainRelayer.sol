// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CrossChainEmitter.sol";
import "./CrossChainReceiver.sol";

abstract contract CrossChainRelayer is CrossChainEmitter, CrossChainReceiver, AccessControl {
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    address private _pair;

    event PairUpdated(address oldPair, address newPair);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function sendCrossChainTx(address target, uint256 value, bytes calldata data, uint32 gasLimit)
        public
        virtual
        override
        onlyRole(RELAYER_ROLE)
    {
        super.sendCrossChainTx(target, value, data, gasLimit);
    }

    function pair()
        public
        view
        virtual
        override(CrossChainEmitter, CrossChainReceiver)
        returns (address)
    {
        return _pair;
    }

    function setPair(address newPair)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        emit PairUpdated(_pair, newPair);
        _pair = newPair;
    }
}