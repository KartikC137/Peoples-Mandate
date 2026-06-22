// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {HelperConfig} from "../HelperConfig.sol";
import {ElectionFactory} from "../../src/election-system/ElectionFactory.sol";

/**
 * @title DeployElectionFactory
 * @notice This script deploys the empty ElectionFactory contract (no elections), selected account and worldId router address.
 */
contract DeployElectionFactory is Script {
    function run() public {
        deployContract();
    }

    function deployContract() public returns (ElectionFactory, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();

        vm.startBroadcast(config.account);
        ElectionFactory electionFactory = new ElectionFactory(config.worldIdRouter);
        vm.stopBroadcast();

        return (electionFactory, helperConfig);
    }
}
