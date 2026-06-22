// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract WinnersArray {
    function getWinnersArray(uint256 winnerCount, uint256 maxVotes, uint256[] memory candidateList)
        internal
        pure
        returns (uint256[] memory)
    {
        uint256[] memory winners = new uint256[](winnerCount);
        uint256 candidatesLength = candidateList.length;
        uint256 numWinners = 0;

        for (uint256 i = 0; i < candidatesLength; i++) {
            if (candidateList[i] == maxVotes) {
                winners[numWinners] = i;
                numWinners++;
            }
        }
        return winners;
    }
}
