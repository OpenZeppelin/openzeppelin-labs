pragma solidity ^0.4.23;

import "../Initializable.sol";

contract ParentA is Initializable {
  uint256 public a;

  function initialize(uint256 _a) initializer public {
    a = _a;
  }
}

contract ParentB is Initializable {
  uint256 public b;

  function initialize(uint _b) initializer public {
    b = _b;
  }
}

contract Child is Initializable, ParentA, ParentB {
  uint256 public c;

  function initialize(uint _a, uint _b, uint _c) initializer public {
    ParentA.initialize(_a);
    ParentB.initialize(_b);
    c = _c;
  }
}
