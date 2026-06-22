// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract VoteWinnerCount {
    function getVoteWinnerCount(uint256[] memory candidateList) internal pure returns (uint256, uint256) {
        uint256 maxVotes = 0;
        uint256 winnerCount = 0;
        uint256 candidatesLength = candidateList.length;
        // First pass: find the maximum number of votes and the count of candidates with that maximum
        for (uint256 i = 0; i < candidatesLength; i++) {
            uint256 votes = candidateList[i];
            if (votes > maxVotes) {
                maxVotes = votes;
                winnerCount = 1;
            } else if (votes == maxVotes) {
                winnerCount++;
            }
        }
        return (maxVotes, winnerCount);
    }
}
