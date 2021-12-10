// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@eth-optimism/contracts/L1/messaging/L1CrossDomainMessenger.sol";
import "@eth-optimism/contracts/L2/messaging/L2CrossDomainMessenger.sol";
import "@eth-optimism/contracts/L1/rollup/CanonicalTransactionChain.sol";
import "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";

library LibCrossChain {
    struct Bridge {
        function(Bridge memory, address, bytes memory, uint32) internal _send;
        function(Bridge memory) internal view returns (bool) _call;
        function(Bridge memory) internal view returns (address) _callSender;
        bytes _data;
    }

    function sendMessage(Bridge memory self, address target, bytes memory message, uint32 gasLimit) internal {
        return self._send(self, target, message, gasLimit);
    }

    function isCall(Bridge memory self) internal view returns (bool) {
        return self._call(self);
    }

    function msgSender(Bridge memory self) internal view returns (address) {
        require(self._call(self), "Not a cross domain call");
        return self._callSender(self);
    }


    /// Optimism
    function Optimism(address crossdomainmessenger) internal pure returns (Bridge memory result) {
        result._send       = _optimismSend;
        result._call       = _optimismCall;
        result._callSender = _optimismCallSender;
        result._data       = abi.encode(crossdomainmessenger);
    }

    function _optimismSend(Bridge memory self, address target, bytes memory message, uint32 gasLimit) private {
        address crossdomainmessenger = abi.decode(self._data, (address));
        ICrossDomainMessenger(crossdomainmessenger).sendMessage(
            target,
            message,
            gasLimit
        );
    }

    function _optimismCall(Bridge memory self) private view returns (bool) {
        return msg.sender == abi.decode(self._data, (address));
    }

    function _optimismCallSender(Bridge memory self) private view returns (address) {
        address crossdomainmessenger = abi.decode(self._data, (address));
        return ICrossDomainMessenger(crossdomainmessenger).xDomainMessageSender();
    }
}
