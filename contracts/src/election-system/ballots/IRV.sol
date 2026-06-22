// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IBallot} from "./interface/IBallot.sol";

contract IRV is IBallot {
    address public electionContract;

    uint256 private totalCandidates;
    uint256[][] private votes;

    modifier onlyOwner() {
        if (msg.sender != electionContract) revert UnathourizedBallot();
        _;
    }

    constructor(address _electionAddress) {
        electionContract = _electionAddress;
    }

    function init(uint256 _totalCandidates) external onlyOwner {
        totalCandidates = _totalCandidates;
    }

    // voting as preference candidate
    function vote(uint256[] memory voteArr) external onlyOwner {
        if (totalCandidates != voteArr.length) revert VoteInputLength();
        votes.push(voteArr);
    }

    function getVotes() external view returns (uint256[][] memory) {
        return votes;
    }
}
