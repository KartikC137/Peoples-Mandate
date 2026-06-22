// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "lib/forge-std/src/Test.sol";
import {DeployElectionFactory} from "../../../script/elections/DeployElectionFactory.s.sol";
import {HelperConfig} from "../../../script/HelperConfig.sol";
import {ElectionFactory} from "../../../src/election-system/ElectionFactory.sol";
import {Election} from "../../../src/election-system/Election.sol";

/**
 * @dev Unit tests for election factory.
 * @dev Only supports Sepolia and its anvil fork. set IS_LIVE=True for live sepolia test
 * @dev sepolia anvil fork: (recommended for faster test runtimes)
 * 1. anvil -f https://eth-sepolia.g.alchemy.com/v2/$ALCHEMY_KEY
 * 2. forge test --fork-url http://127.0.0.1:8545 -vv
 */
contract ElectionFactoryTest is Test {
    ElectionFactory factory;
    HelperConfig helperConfig;

    address public factoryOwner;

    function setUp() public {
        DeployElectionFactory factoryDeployer = new DeployElectionFactory();
        (factory, helperConfig) = factoryDeployer.deployContract();
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
        factoryOwner = config.account;
        console.log("Unit Tests: 1. Election Factory Unit Tests");
    }

    function testFactoryOwnerIsConfigured() public view {
        assertEq(factory.getFactoryOwner(), factoryOwner, "factoryOwner mismatch with helper config");
    }

    function testCreateElectionRevertsIfCandidateLengthIsLessThanTwo() public {
        ElectionFactory.ElectionCreationInfo memory info = ElectionFactory.ElectionCreationInfo({
            startTime: uint64(block.timestamp + 100),
            endTime: uint64(block.timestamp + 1000),
            name: "Bad Election",
            description: "Should revert"
        });

        console.log("Election info set correctly");

        Election.Candidate[] memory candidates = new Election.Candidate[](1);
        candidates[0] = Election.Candidate({candidateId: 0, name: "Solo", description: "Only one"});

        bytes memory expected =
            abi.encodeWithSelector(bytes4(keccak256("ElectionFactory_InvalidCandidatesLength(uint256)")), uint256(1));

        vm.expectRevert(expected);
        factory.createElection("appId", "action", info, candidates, 0, 0);
    }
}
