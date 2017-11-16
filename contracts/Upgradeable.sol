pragma solidity ^0.4.18;

import './Proxied.sol';

contract Upgradeable is Proxied {
    function initialize(address sender) public payable {
        require(msg.sender == address(registry));
    }

    function upgradeTo(string version) pure private {
        assert(false);
    }

}
