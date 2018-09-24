pragma solidity ^0.4.24;

import '../RepoPackage.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zos-lib/contracts/application/versioning/ImplementationProvider.sol';
import 'zos-lib/contracts/application/versioning/ImplementationDirectory.sol';

/**
 * @title NewZosPackage
 * @dev Collection of contracts grouped into versions.
 * Contracts with the same name can have different implementation addresses in different versions.
 */
contract NewZosPackage is Ownable, RepoPackage {
  /**
   * @dev Emitted when a version is added to the package.
   * XXX The version is not indexed due to truffle testing constraints.
   * @param version Name of the added version.
   * @param provider ImplementationProvider associated with the version.
   */
  event VersionAdded(uint16[3] version, ImplementationProvider indexed provider);

  /**
   * @dev Returns the implementation provider of a version.
   * @param version Name of the version.
   * @return The implementation provider of the version.
   */
  function getVersion(uint16[3] version) public view returns (ImplementationProvider) {
    address contractAddress = getContractByVersionId(versionId(version));
    return ImplementationProvider(contractAddress);
  }

  function newVersion(uint16[3] _newSemanticVersion, address _contractAddress, bytes _contentURI) public onlyOwner {
    super.newVersion(_newSemanticVersion, _contractAddress, _contentURI);
    emit VersionAdded(_newSemanticVersion, ImplementationProvider(_contractAddress));
  }

  /**
   * @dev Adds the implementation provider of a new version to the package.
   * @param version Name of the version.
   * @param provider ImplementationProvider associated with the version.
   */
  function addVersion(uint16[3] version, ImplementationProvider provider) public onlyOwner {
    bytes memory emptyURI = "";
    newVersion(version, address(provider), emptyURI);
  }

  /**
   * @dev Checks whether a version is present in the package.
   * @param version Name of the version.
   * @return true if the version is already in the package, false otherwise.
   */
  function hasVersion(uint16[3] version) public view returns (bool) {
    return versionId(version) != 0;
  }

  /**
   * @dev Returns the implementation address for a given version and contract name.
   * @param version Name of the version.
   * @param contractName Name of the contract.
   * @return Address where the contract is implemented.
   */
  function getImplementation(uint16[3] version, string contractName) public view returns (address) {
    ImplementationProvider provider = getVersion(version);
    return provider.getImplementation(contractName);
  }
}
