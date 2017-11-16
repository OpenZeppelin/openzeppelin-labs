pragma solidity ^0.4.18;

import './IRegistry.sol';

contract Proxied {
    IRegistry registry;
    address impl;
}
