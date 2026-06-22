// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract OrgProfile is Ownable {
    address public immutable PROFILE_MANAGER;
    bool public isActive;
    string public name;
    address public immutable ORG_SIGNER;
    address public immutable ORG_ADMIN;
    address[] public owners;

    //////////////////
    // Errors      ///
    //////////////////

    error OnlyOwnerCanCreateElection();
    error OnlySignerCanCreateProfiles();

    //////////////
    // Events  ///
    //////////////

    event ProfileBurned(address);
    event RenouncingFrom(address);

    //////////////////
    // Modifiers   ///
    //////////////////

    modifier onlyAdmin() {
        if (msg.sender != ORG_ADMIN) revert OnlyAdminCanPerfomTransferOwnership();
        _;
    }

    modifier onlySigner() {
        if (msg.sender != ORG_SIGNER) revert OnlySignerCanCreateProfiles();
        _;
    }

    constructor(string memory _name, address _admin, address _signer, address _profileManagerAddress)
        Ownable(msg.sender)
    {
        PROFILE_MANAGER = _profileManagerAddress;
        _transferOwnership(_admin);
        ORG_SIGNER = _signer;
        ORG_ADMIN = _admin;
        name = _name;
        isActive = true;
    }

    /*
    * @dev only admin can renounce and transfer owneships
    */

    function renounceOwnership() public override onlyAdmin {
        _transferOwnership(address(0));
        isActive = false;
        emit ProfileBurned(ORG_ADMIN);
    }

    function transferOwnership(address newOwner) public override onlyAdmin {
        _transferOwnership(newOwner);
        owners.push(newOwner);
    }

    function createProfile(string memory _profileId, bytes memory _signature) external onlySigner {}

    function createElection() external onlyOwner {}
}
