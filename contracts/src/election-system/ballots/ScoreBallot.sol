// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IBallot} from "./interface/IBallot.sol";

contract ScoreBallot is IBallot {
    error InvalidScore(uint256 score);

    address public electionContract;

    uint256[] private candidateScores;
    uint256 public constant MAX_SCORE = 10;

    modifier onlyOwner() {
        if (msg.sender != electionContract) revert UnathourizedBallot();
        _;
    }

    constructor(address _electionAddress) {
        electionContract = _electionAddress;
    }

    function init(uint256 totalCandidate) external onlyOwner {
        candidateScores = new uint256[](totalCandidate);
    }

    // Assign scores on index
    function vote(uint256[] memory voteArr) external onlyOwner {
        uint256 totalCandidates = candidateScores.length;
        if (voteArr.length != totalCandidates) revert VoteInputLength();

        for (uint256 i = 0; i < totalCandidates; i++) {
            uint256 preference = voteArr[i];
            if (preference > MAX_SCORE) {
                revert InvalidScore(preference);
            }
            candidateScores[i] += preference;
        }
    }

    function getVotes() external view onlyOwner returns (uint256[] memory) {
        return candidateScores;
    }
}
