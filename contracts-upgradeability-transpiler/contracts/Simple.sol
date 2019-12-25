pragma solidity ^0.5.0;

contract Simple {
    uint256 private count;
    uint256 private local = 564;
    string private hello = "hello";
    bool public test = true;
    uint256 constant const = 32**22 + 8;

    constructor(uint256 num) public {
        count = num;
    }

    function getHello() public view returns (string memory) {
        return hello;
    }
}

contract SimpleInheritanceA {
    uint256 private foo = 42;
    constructor() public {}
}

contract SimpleInheritanceB is SimpleInheritanceA {
    bool private bar = false;
    constructor() public {}
}

contract SimpleInheritanceC is SimpleInheritanceB {
    bool private foo;

}

contract DiamondA {
    uint256 private foo = 42;
    constructor() public {}
}

contract DiamondB1 is DiamondA {}

contract DiamondB2 is DiamondA {}

contract DiamondC is DiamondB2, DiamondB1 {}

contract InheritanceWithParamsParent {
    constructor(bool foo, uint256 bar) public {}
}

contract InheritanceWithParamsConstructorChild is InheritanceWithParamsParent {
    constructor() public InheritanceWithParamsParent(true, 564) {}
}

contract InheritanceWithParamsClassChild is
    /* solium-disable-next-line */
    InheritanceWithParamsParent(false, 87)
{
    constructor() public {}
}
