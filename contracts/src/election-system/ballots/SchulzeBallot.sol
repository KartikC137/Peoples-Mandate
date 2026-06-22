// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IBallot} from "./interface/IBallot.sol";

contract SchulzeBallot is IBallot {
    address public electionContract;
    uint256[][] private preferences;

    modifier onlyOwner() {
        if (msg.sender != electionContract) revert UnathourizedBallot();
        _;
    }

    constructor(address _electionAddress) {
        electionContract = _electionAddress;
    }

    function init(uint256 totalCandidates) external onlyOwner {
        preferences = new uint256[][](totalCandidates);
        for (uint256 i = 0; i < totalCandidates; i++) {
            preferences[i] = new uint256[](totalCandidates);
        }
    }

    function vote(uint256[] memory voteArr) external onlyOwner {
        uint256 totalCandidates = preferences.length;
        if (voteArr.length != totalCandidates) revert VoteInputLength();
        for (uint256 i = 0; i < totalCandidates; i++) {
            for (uint256 j = i + 1; j < totalCandidates; j++) {
                preferences[voteArr[i]][voteArr[j]] += 1;
            }
        }
    }

    function getVotes() external view onlyOwner returns (uint256[][] memory) {
        return preferences;
    }
}
