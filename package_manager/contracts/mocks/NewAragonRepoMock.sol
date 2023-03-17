pragma solidity 0.4.24;


import '../PR/aragon/NewAragonRepo.sol';
import '@aragon/os/contracts/apps/UnsafeAragonApp.sol';

// Allows Repo to be used without a proxy or access controls
contract NewAragonRepoMock is NewAragonRepo, UnsafeAragonApp {
  // Protected actions are always performable
  function canPerform(address, bytes32, uint256[]) public view returns (bool) {
    return true;
  }
}
