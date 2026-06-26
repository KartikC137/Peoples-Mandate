// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Clones} from "openzeppelin-contracts/contracts/proxy/Clones.sol";
import {ElectionFactory} from "./ElectionFactory.sol";

contract OrgRegistry {
    event OrgRegistered(address indexed electionFactory, address indexed orgAdmin, uint256 indexed time, string name);

    address public immutable ORG_GENERATOR;
    address public immutable PROFILES_REGISTRY;
    address public immutable CREATOR;

    mapping(address orgAdmin => address electionFactory) private orgAddressToElectionFactory;

    constructor(address profiles_registry) {
        ORG_GENERATOR = address(new ElectionFactory());
        PROFILES_REGISTRY = profiles_registry;
        CREATOR = msg.sender;
    }

    function registerNewOrg(string memory orgName, address admin) external {
        address orgAddress = Clones.clone(ORG_GENERATOR);
        ElectionFactory electionFactory = ElectionFactory(orgAddress);
        electionFactory.initialize(orgName, admin, address(this));

        emit OrgRegistered(orgAddress, admin, block.timestamp, orgName);

        orgAddressToElectionFactory[admin] = orgAddress;
    }

    function getProfileRegistryAddress() external view returns (address) {
        return PROFILES_REGISTRY;
    }
}
