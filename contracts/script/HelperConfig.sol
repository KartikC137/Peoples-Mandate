// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {Script} from "lib/forge-std/src/Script.sol";

abstract contract CodeConstants {
    uint256 public constant ETH_SEPOLIA_CHAIN_ID = 11155111;
    uint256 public constant LOCAL_CHAIN_ID = 31337;
}

/**
 * @title HelperConfig v1.0: only sepolia eth is supported for now. IS_LIVE env. variable = True, deploys on sepolia testnet
 * @dev This script can automatically return World ID Router contract address based on chainId.
 * @dev World ID Router contract addresses: https://docs.world.org/world-id/reference/contract-deployments
 * @notice
 * 1. Supported Chains: ONLY ETH. SEPOLIA and SEPOLIA ANVIL FORK
 */
contract HelperConfig is Script, CodeConstants {
    error HelperConfig__InvalidChainId(uint256 chainId);

    struct NetworkConfig {
        address worldIdRouter;
        address account;
    }

    NetworkConfig public localNetworkConfig;
    mapping(uint256 chainId => NetworkConfig) public networkConfigs;

    constructor() {
        networkConfigs[ETH_SEPOLIA_CHAIN_ID] = getSepoliaEthConfig();
    }

    function getSepoliaEthConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({
            account: 0x8396ece8966be2Bff6882034c0d7C3c36656C44D, // MetaMask: ONE
            worldIdRouter: 0x469449f251692E0779667583026b5A1E99512157
        });
    }

    function getAnvilForkSepoliaEthConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({
            account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, // First Anvil account.
            worldIdRouter: 0x469449f251692E0779667583026b5A1E99512157
        });
    }

    function getConfig() public view returns (NetworkConfig memory) {
        uint256 chainId = block.chainid;
        bool isLive = vm.envOr("IS_LIVE", false);

        if (chainId == ETH_SEPOLIA_CHAIN_ID && isLive) {
            return getSepoliaEthConfig();
        } else if (chainId == ETH_SEPOLIA_CHAIN_ID && !isLive) {
            return getAnvilForkSepoliaEthConfig();
        } else if (chainId == LOCAL_CHAIN_ID) {
            return getAnvilForkSepoliaEthConfig();
        } else {
            revert HelperConfig__InvalidChainId(chainId);
        }
    }

    /**
     * @dev Local Anvil is not supported yet.
     * @notice Will implement later.
     */

    // function getOrCreateAnvilConfig() public returns (NetworkConfig memory) {
    //     if (localNetworkConfig.worldIdRouter != address(0)) {
    //         return localNetworkConfig;
    //     }

    //     //Deploy Mocks: checkout https://github.com/worldcoin/world-id-contracts
    //     vm.startBroadcast();

    //     vm.stopBroadcast();

    //     localNetworkConfig = NetworkConfig({
    //         worldIdRouter: 0x59b670e9fA9D0A427751Af201D676719a970857b
    //     });

    //     return localNetworkConfig;
    // }
}
