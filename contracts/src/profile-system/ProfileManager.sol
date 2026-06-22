// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OrgProfile} from "./Org/OrgProfile.sol";

/**
 * This contract deploys a organisation contract which represents an organisation profile.
 * @dev currently, one admin and signer can have only one related profile strictly, previous profile gets overwritten.
 * @dev havent decided about appid generation/checks
 */
contract ProfileManager {
    error ProfileManager_UnauthorizedAdmin(address account, address required);

    event OrgProfileCreated(address indexed admin, address indexed signer, string indexed name);

    OrgProfile private orgProfile;

    address public immutable OWNER;
    uint256 private immutable APP_ID;
    mapping(address orgSigner => address) public orgSignerToProfile;
    mapping(address orgAdmin => address) public orgAdminToProfile;

    constructor(uint256 _appId) {
        OWNER = msg.sender;
        APP_ID = _appId;
    }

    // for now only use org name
    // assuming admin signs the profile creation
    function createOrgProfile(string memory name, address orgSigner, address orgAdmin) external {
        orgProfile = new OrgProfile(name, orgAdmin, orgSigner, address(this));
        orgSignerToProfile[orgSigner] = address(orgProfile);
        orgAdminToProfile[orgAdmin] = address(orgProfile);
    }
}
