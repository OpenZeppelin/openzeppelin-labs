pragma solidity ^0.4.23;

import "../Initializable.sol";

contract ParentA is Initializable {
  uint256 public a;

  function initialize(uint256 _a) initializer public {
    onInitialize(_a);
  }

  function onInitialize(uint256 _a) internal {
    a = _a;
  }
}

contract ParentB is Initializable {
  uint256 public b;

  function initialize(uint _b) initializer public {
    onInitialize(_b);
  }

  function onInitialize(uint256 _b) internal {
    b = _b;
  }
}

contract Child is Initializable, ParentA, ParentB {
  uint256 public c;

  function initialize(uint _a, uint _b, uint _c) initializer public {
    onInitialize(_a, _b, _c);
  }

  function onInitialize(uint _a, uint _b, uint _c) internal {
    ParentA.onInitialize(_a);
    ParentB.onInitialize(_b);
    c = _c;
  }
}