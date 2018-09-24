pragma solidity 0.4.24;


import '../RepoPackage.sol';
import '@aragon/os/contracts/apps/AragonApp.sol';

contract NewAragonRepo is AragonApp, RepoPackage {
  // bytes32 public constant CREATE_VERSION_ROLE = keccak256("CREATE_VERSION_ROLE");
  bytes32 public constant CREATE_VERSION_ROLE = 0x1f56cfecd3595a2e6cc1a7e6cb0b20df84cdbd92eff2fee554e70e4e45a9a7d8;

  function initialize() public onlyInit {
    initialized();
  }

  function newVersion(uint16[3] _newSemanticVersion, address _contractAddress, bytes _contentURI) public auth(CREATE_VERSION_ROLE) {
    super.newVersion(_newSemanticVersion, _contractAddress, _contentURI);
  }
}
