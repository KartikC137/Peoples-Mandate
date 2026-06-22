// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IBallot} from "./interface/IBallot.sol";

contract KemenyYoungBallot is IBallot {
    address public electionContract;

    uint256[][] private votes;

    modifier onlyOwner() {
        if (msg.sender != electionContract) revert UnathourizedBallot();
        _;
    }

    constructor(address _electionAddress) {
        electionContract = _electionAddress;
    }

    function init(uint256 totalCandidates) external onlyOwner {
        // Initialize the votes array for the number of candidates
        votes = new uint256[][](totalCandidates);
        for (uint256 i = 0; i < totalCandidates; i++) {
            votes[i] = new uint256[](totalCandidates);
        }
    }

    function vote(uint256[] memory voteArr) external onlyOwner {
        uint256 totalCandidates = votes.length;
        if (voteArr.length != totalCandidates) revert VoteInputLength();

        // Store the ranking for this voter
        for (uint256 i = 0; i < totalCandidates; i++) {
            for (uint256 j = i + 1; j < totalCandidates; j++) {
                votes[voteArr[i]][voteArr[j]] += 1;
            }
        }
    }

    function getVotes() external view onlyOwner returns (uint256[][] memory) {
        return votes;
    }
}
