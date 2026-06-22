// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IBallot} from "./interface/IBallot.sol";

contract RankedBallot is IBallot {
    address public electionContract;

    uint256[] private candidateVotes;

    modifier onlyOwner() {
        if (msg.sender != electionContract) revert UnathourizedBallot();
        _;
    }

    constructor(address _electionAddress) {
        electionContract = _electionAddress;
    }

    function init(uint256 totalCandidate) external onlyOwner {
        candidateVotes = new uint256[](totalCandidate);
    }

    // voting as preference candidate
    function vote(uint256[] memory voteArr) external onlyOwner {
        uint256 totalCandidates = candidateVotes.length;
        if (voteArr.length != totalCandidates) revert VoteInputLength();

        for (uint256 i = 0; i < totalCandidates; i++) {
            // voteArr[i] is the candidate ID, i is the rank (0-based)
            candidateVotes[voteArr[i]] += totalCandidates - i;
        }
    }

    function getVotes() external view onlyOwner returns (uint256[] memory) {
        return candidateVotes;
    }
}
