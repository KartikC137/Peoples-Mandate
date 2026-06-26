// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IBallot} from "./ballots/interface/IBallot.sol";
import {IResultCalculator} from "./resultCalculators/interface/IResultCalculator.sol";
import {Initializable} from "openzeppelin-contracts/contracts/proxy/utils/Initializable.sol";
import {ByteHasher} from "./helpers/ByteHasher.sol";

/**
 * @title Election Contract
 * @author KartikC137
 * V 1.0
 * This Contract Manages each Election created by the ElectionFactory.
 * It handles the voting process, candidate management, and result calculation.
 *
 * @notice Cross - chain voting is not yet implemented
 */
contract Election is Initializable {
    // errors
    error Election_UnauthorizedDeployment(address factoryAddress);
    error Election_NotOwner();
    error Election_InvalidVoteArrayLength();
    error Election_UserHasAlreadyVoted();
    error Election_VotesUnavailable();
    error Election_BallotIsNotIntialized();
    error Election_ElectionInactive();
    error Election_ElectionActive();
    error Election_ElectionEnded();
    error Election_InvalidCandidateID();
    error Election_InvalidCandidatesLengthAfterRemoval();
    error Election_CandidateAlreadyRemoved(uint256 candidateId);
    error Election_ResultsHaveAlreadyBeenDeclared(uint256[] winners);

    // events
    event AddCandidate(string indexed name, string indexed description);
    event RemoveCandidate(uint256 indexed candidateId);
    event CastVote(address indexed voter);
    event CalculateFinalResult();
    event EndElection();

    // types
    using ByteHasher for bytes;

    struct ElectionInfo {
        uint64 startTime;
        uint64 endTime;
        uint256 electionId;
        string name;
        string description;
    }

    struct Candidate {
        uint256 candidateId;
        string name;
        string description;
    }

    // state variables

    mapping(uint256 => bool) internal nullifierHashes;
    mapping(address => bool) public isWhitelisted;

    IBallot private ballot;
    IResultCalculator private resultCalculator;

    ElectionInfo public electionInfo;
    Candidate[] private candidates;

    address public factoryContractAddress;
    address public owner;

    uint256[] private winners;
    uint256 public electionId;
    uint8 public resultType;
    uint256 public totalVoters;

    bool private isPrivate;
    bool private isElectionEnded;
    bool private isResultsDeclared;
    bool private isBallotInitialized;

    // modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) revert Election_NotOwner();
        _;
    }

    modifier electionInactiveCheck() {
        if (block.timestamp < electionInfo.startTime) {
            revert Election_ElectionInactive();
        }
        _;
    }

    modifier electionStartedCheck() {
        if (block.timestamp > electionInfo.startTime) revert Election_ElectionActive();
        _;
    }

    modifier electionEndedCheck() {
        if ((block.timestamp > electionInfo.endTime) || isElectionEnded) {
            revert Election_ElectionEnded();
        }
        _;
    }

    // intializer
    function initialize(
        bool _isPrivate,
        address _factoryAddress,
        address _owner,
        ElectionInfo memory _electionInfo,
        Candidate[] memory _candidates,
        uint8 _resultType,
        address _ballot,
        address _resultCalculator
    ) external initializer {
        if (_factoryAddress != msg.sender) revert Election_UnauthorizedDeployment(_factoryAddress);

        isPrivate = _isPrivate;
        electionInfo = _electionInfo;

        for (uint256 i = 0; i < _candidates.length; i++) {
            candidates.push(Candidate(i, _candidates[i].name, _candidates[i].description));
        }
        resultType = _resultType;
        electionId = _electionInfo.electionId;
        owner = _owner;
        factoryContractAddress = _factoryAddress;
        ballot = IBallot(_ballot);
        resultCalculator = IResultCalculator(_resultCalculator);
    }

    // core functions
    function userVote(uint256[] memory voteArr, uint256 nullifierHash)
        external
        electionInactiveCheck
        electionEndedCheck
    {
        if (voteArr.length > candidates.length) revert Election_InvalidVoteArrayLength();
        if (nullifierHashes[nullifierHash]) {
            revert Election_UserHasAlreadyVoted();
        }

        nullifierHashes[nullifierHash] = true;

        if (isBallotInitialized == false) {
            ballot.init(candidates.length);
            isBallotInitialized = true;
        }

        totalVoters++;

        emit CastVote(msg.sender);

        ballot.vote(voteArr);
    }

    function addCandidate(string calldata _name, string calldata _description)
        external
        onlyOwner
        electionStartedCheck
        electionEndedCheck
    {
        emit AddCandidate(_name, _description);

        Candidate memory newCandidate = Candidate(candidates.length, _name, _description);
        candidates.push(newCandidate);
    }

    function removeCandidate(uint256 _id) external onlyOwner electionStartedCheck electionEndedCheck {
        uint256 totalCandidates = candidates.length;

        if (_id >= totalCandidates) revert Election_InvalidCandidateID();
        if (totalCandidates <= 2) revert Election_InvalidCandidatesLengthAfterRemoval();

        emit RemoveCandidate(_id);

        for (uint256 i = _id; i < totalCandidates - 1; i++) {
            candidates[i] = candidates[i + 1];
            candidates[i].candidateId = i;
        }

        candidates.pop();
    }

    function endElection() external onlyOwner {
        emit EndElection();
        _calculateResult();
        _endElection();
    }

    function calculateFinalResult() external electionEndedCheck {
        emit CalculateFinalResult();
        _calculateResult();
    }

    function addToWhiteList(address[] calldata toAccounts) external {
        require(isPrivate == true, "The election is not private");

        uint256 length = toAccounts.length;
        require(length > 0, "Array cannot be empty");
        require(length <= 100, "Batch too large");

        for (uint256 i = 0; i < length;) {
            isWhitelisted[toAccounts[i]] = true;
            unchecked {
                ++i;
            }
        }
    }

    // internal functions
    function _getTotalVotes() internal view returns (bytes memory) {
        bytes memory payload = abi.encodeWithSignature("getVotes()");

        (bool success, bytes memory totalVotes) = address(ballot).staticcall(payload);
        if (!success) revert Election_VotesUnavailable();

        return totalVotes;
    }

    function _calculateResult() internal {
        if (isResultsDeclared) revert Election_ResultsHaveAlreadyBeenDeclared(winners);
        bytes memory totalVotes = _getTotalVotes();
        uint256[] memory _winners = resultCalculator.getResults(totalVotes, resultType);
        winners = _winners;
        isResultsDeclared = true;
    }

    function _endElection() internal {
        isElectionEnded = true;
    }

    // getter functions
    function getCandidateList() external view returns (Candidate[] memory) {
        return candidates;
    }

    function getWinnersList() external view returns (uint256[] memory) {
        return winners;
    }

    function getBallotAddress() external view returns (address) {
        if (isBallotInitialized == false) revert Election_BallotIsNotIntialized();
        else return address(ballot);
    }

    function getIsElectionManuallyEnded() external view returns (bool) {
        return isElectionEnded;
    }

    function getIsResultsDeclared() external view returns (bool) {
        return isResultsDeclared;
    }
}
