pragma solidity ^0.4.24;


/**
 * @title RepoPackage
 */
contract RepoPackage {
  event NewVersion(uint256 versionId, uint16[3] semanticVersion);

  struct Version {
    uint16[3] semanticVersion;
    address contractAddress;
    bytes contentURI;
  }

  Version[] public versions;
  mapping (bytes32 => uint256) internal versionIdForSemantic;
  mapping (address => uint256) internal latestVersionIdForContract;

  function newVersion(uint16[3] _newSemanticVersion, address _contractAddress, bytes _contentURI) public {
    address contractAddress = _contractAddress;
    if (versions.length > 0) {
      Version storage lastVersion = versions[versions.length - 1];
      require(isValidBump(lastVersion.semanticVersion, _newSemanticVersion));
      if (contractAddress == 0) {
        contractAddress = lastVersion.contractAddress;
      }
      // Only allows smart contract change on major version bumps
      require(lastVersion.contractAddress == contractAddress || _newSemanticVersion[0] > lastVersion.semanticVersion[0]);
    } else {
      versions.length += 1;
      uint16[3] memory zeroVersion;
      require(isValidBump(zeroVersion, _newSemanticVersion));
    }

    uint256 versionId = versions.push(Version(_newSemanticVersion, contractAddress, _contentURI)) - 1;
    versionIdForSemantic[semanticVersionHash(_newSemanticVersion)] = versionId;
    latestVersionIdForContract[contractAddress] = versionId;

    emit NewVersion(versionId, _newSemanticVersion);
  }

  function getLatest() public view returns (uint16[3], address, bytes) {
    return getByVersionId(versions.length - 1);
  }

  function getLatestForContractAddress(address _contractAddress) public view returns (uint16[3], address, bytes) {
    return getByVersionId(latestVersionIdForContract[_contractAddress]);
  }

  function getBySemanticVersion(uint16[3] _semanticVersion) public view returns (uint16[3], address, bytes) {
    return getByVersionId(versionId(_semanticVersion));
  }

  function getByVersionId(uint256 _versionId) public view returns (uint16[3], address, bytes) {
    require(_versionId > 0);
    Version storage version = versions[_versionId];
    return (version.semanticVersion, version.contractAddress, version.contentURI);
  }

  function getContractByVersionId(uint256 _versionId) public view returns (address) {
    if(_versionId == 0) return address(0);
    Version storage version = versions[_versionId];
    return version.contractAddress;
  }

  function getVersionsCount() public view returns (uint256) {
    uint256 len = versions.length;
    return len > 0 ? len - 1 : 0;
  }

  function isValidBump(uint16[3] _oldVersion, uint16[3] _newVersion) public pure returns (bool) {
    bool hasBumped;
    uint256 i = 0;
    while (i < 3) {
      if (hasBumped) {
        if (_newVersion[i] != 0) {
          return false;
        }
      } else if (_newVersion[i] != _oldVersion[i]) {
        if (_oldVersion[i] > _newVersion[i] || _newVersion[i] - _oldVersion[i] != 1) {
          return false;
        }
        hasBumped = true;
      }
      i++;
    }
    return hasBumped;
  }

  function versionId(uint16[3] version) internal view returns (uint256) {
    return versionIdForSemantic[semanticVersionHash(version)];
  }

  function semanticVersionHash(uint16[3] version) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(version[0], version[1], version[2]));
  }
}
