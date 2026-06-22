// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IBallot} from "./interface/IBallot.sol";

contract QuadraticBallot is IBallot {
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
        if (!checkCreditsQuadratic(voteArr)) revert IncorrectCredits();

        for (uint256 i = 0; i < totalCandidates; i++) {
            // voteArr[i] is the credits alloted per candidate
            candidateVotes[i] += voteArr[i];
        }
    }

    function getVotes() external view onlyOwner returns (uint256[] memory) {
        return candidateVotes;
    }

    function checkCreditsQuadratic(uint256[] memory voteArr) internal pure returns (bool) {
        uint256 totalCredits = 100;
        for (uint256 i = 0; i < voteArr.length; i++) {
            totalCredits = totalCredits - voteArr[i];
        }
        return totalCredits == 0;
    }
}
