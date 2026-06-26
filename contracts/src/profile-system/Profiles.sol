// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Profiles {
    address public immutable ORG_REGISTRY;
    address public immutable ORACLE;
    mapping(address => bytes32) public walletAddressToProfileId;

    event ProfileAdded(address indexed account, bytes32 indexed profileId, address indexed oracle, uint256 time);

    constructor(address orgRegistry, address oracle) {
        ORG_REGISTRY = orgRegistry;
        ORACLE = oracle;
    }

    modifier onlyOracle() {
        require(msg.sender == ORACLE, "unauthorized contract call");
        _;
    }

    function addProfile(address account, bytes32 profileId) external onlyOracle {
        emit ProfileAdded(account, profileId, ORACLE, block.timestamp);
        walletAddressToProfileId[account] = profileId;
    }
}
