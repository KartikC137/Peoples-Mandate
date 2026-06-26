pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../../src/profile-system/Profiles.sol";

contract DeployProfiles is Script {
    function run() external {
        uint256 oraclePrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address oracleAddress = vm.addr(oraclePrivateKey);

        address mockElectionFactory = address(0x1234);

        address[5] memory targetAccounts = [
            0x70997970C51812dc3A010C7d01b50e0d17dc79C8,
            0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,
            0x90F79bf6EB2c4f870365E785982E1f101E93b906,
            0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65,
            0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
        ];

        string[5] memory mockAadhaars = ["111122223333", "444455556666", "777788889999", "101010101010", "121212121212"];

        string memory backendSalt = "digilocker_zkp_mock_salt_2026";

        vm.startBroadcast(oraclePrivateKey);

        Profiles profileContract = new Profiles(mockElectionFactory, oracleAddress);

        for (uint256 i = 0; i < targetAccounts.length; i++) {
            bytes32 generatedProfileId = keccak256(abi.encodePacked(backendSalt, mockAadhaars[i]));

            profileContract.addProfile(targetAccounts[i], generatedProfileId);

            console.log("Registered Account:", targetAccounts[i]);
            console.logBytes32(generatedProfileId);
        }

        vm.stopBroadcast();

        console.log("Deployment & Population Complete. Contract Address:", address(profileContract));
    }
}
