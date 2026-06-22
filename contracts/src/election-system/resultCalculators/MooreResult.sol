// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Errors} from "./interface/Errors.sol";
import {Candidatecheck} from "./abstract/CandidateCheck.sol";
import {WinnersArray} from "./abstract/WinnersArray.sol";

contract MooreResult is Errors, Candidatecheck, WinnersArray {
    function calculateMooreResult(bytes calldata returnData) public pure returns (uint256[] memory) {
        uint256[] memory candidateList = abi.decode(returnData, (uint256[]));
        uint256 candidatesLength = candidateList.length;

        if (candidatesLength < 2) {
            return checkEdgeCases(candidatesLength);
        }

        uint256 maxVotes = 0;
        uint256 winnerCount = 0;
        uint256[] memory winners;
        for (uint256 i = 0; i < candidatesLength; i++) {
            uint256 votes = candidateList[i];
            if (votes > candidatesLength / 2) {
                winners = new uint256[](1);
                winners[0] = i;
                return winners;
            } else if (votes > maxVotes) {
                maxVotes = votes;
                winnerCount = 1;
            } else if (votes == maxVotes) {
                winnerCount++;
            }
        }

        return getWinnersArray(winnerCount, maxVotes, candidateList);
    }
}
