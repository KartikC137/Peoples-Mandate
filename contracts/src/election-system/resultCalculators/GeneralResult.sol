// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Errors} from "./interface/Errors.sol";
import {Candidatecheck} from "./abstract/CandidateCheck.sol";
import {VoteWinnerCount} from "./abstract/VoteWinnerCount.sol";
import {WinnersArray} from "./abstract/WinnersArray.sol";

contract GeneralResult is Errors, Candidatecheck, VoteWinnerCount, WinnersArray {
    function calculateGeneralResult(bytes calldata returnData) public pure returns (uint256[] memory) {
        uint256[] memory candidateList = abi.decode(returnData, (uint256[]));
        uint256 candidatesLength = candidateList.length;

        if (candidatesLength < 2) {
            return checkEdgeCases(candidatesLength);
        }

        uint256 maxVotes = 0;
        uint256 winnerCount = 0;

        (maxVotes, winnerCount) = getVoteWinnerCount(candidateList);

        if (maxVotes == 0) {
            revert NoWinner();
        }

        // Second pass: collect all candidates with the maximum number of votes
        return getWinnersArray(winnerCount, maxVotes, candidateList);
    }
}
