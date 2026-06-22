// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IBallot} from "./interface/IBallot.sol";

contract GeneralBallot is IBallot {
    error GeneralBallot_InvalidVoteArrayLength();
    error GeneralBallot_InvalidVoteDistribution();

    address public electionContract;

    uint256 private totalCandidate;
    uint256[] private candidateVotes;

    modifier onlyOwner() {
        if (msg.sender != electionContract) revert UnathourizedBallot();
        _;
    }

    constructor(address _electionAddress) {
        electionContract = _electionAddress;
    }

    function init(uint256 _totalCandidate) external onlyOwner {
        totalCandidate = _totalCandidate;
        candidateVotes = new uint256[](_totalCandidate);
    }

    function vote(uint256[] memory _votes) external onlyOwner {
        if (_votes.length != 1) revert GeneralBallot_InvalidVoteArrayLength();
        checkValidVotes(_votes[0]);
        candidateVotes[_votes[0]]++;
    }

    function getVotes() external view onlyOwner returns (uint256[] memory) {
        return candidateVotes;
    }

    function checkValidVotes(uint256 _vote) internal view {
        if (_vote >= totalCandidate) revert GeneralBallot_InvalidVoteDistribution();
    }
}
