// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IWorldID} from "./interface/IWorldID.sol";
import {Election} from "./Election.sol";
import {BallotGenerator} from "./ballots/BallotGenerator.sol";
import {ResultCalculator} from "./resultCalculators/ResultCalculator.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {BallotAndResultTypesValidator} from "./helpers/BallotAndResultTypesValidator.sol";

/**
 * @title Election Factory Contract v1.0
 * @author Kartik Kumbhar
 * This Contract Handles Creation of Elections.
 *
 * @dev World ID Router contract addresses: https://docs.world.org/world-id/reference/contract-deployments
 * @notice
 *   1. Check BallotAndResultTypesValidator library for Valid Ballot and Result Type Numbers.
 *   2. Feature: Cross - chain voting is not yet implemented
 *   3. Security: Anonymous Candidate Voting is not yet implemented, votes can be tracked back to caller.
 */
contract ElectionFactory {
    ////////////////////////////
    // Types Declarations    ///
    ////////////////////////////

    /**
     * @dev This is to avoid custom electionIds.
     * @dev And stack too deep error on initialize function.
     */
    struct ElectionCreationInfo {
        uint64 startTime;
        uint64 endTime;
        string name;
        string description;
    }

    //////////////////
    // Errors      ///
    //////////////////

    error ElectionFactory_FactoryOwnerRestricted();
    error ElectionFactory_InvalidCandidatesLength(uint256 candidateLength);

    ////////////////////////
    // State Variables   ///
    ////////////////////////

    uint256 public electionCount = 0;

    address[] public publicElections;

    mapping(uint256 electionId => address owner) public electionIdToOwner;
    mapping(address owner => address[] electionAddresses) public ownerToElections;

    address private immutable FACTORY_OWNER;
    address private immutable RESULT_CALCULATOR;
    address private immutable ELECTION_GENERATOR;
    BallotGenerator private immutable BALLOT_GENERATOR;
    IWorldID private immutable WORLD_ID_ROUTER;

    //////////////
    // Events  ///
    //////////////

    event ElectionCreatedInfo(
        address indexed electionAddress,
        Election.ElectionInfo indexed electionInfo,
        Election.Candidate[] indexed candidates
    );
    event ElectionCreatedBallotAndResultType(uint8 indexed ballotType, uint8 indexed resultType);
    event ElectionCreatedAddress(address indexed electionAddress);

    //////////////////
    // Functions   ///
    //////////////////

    /**
     * @dev World ID Router contract addresses: https://docs.world.org/world-id/reference/contract-deployments
     */
    constructor(address _worldIdRouter) {
        FACTORY_OWNER = msg.sender;
        ELECTION_GENERATOR = address(new Election());
        BALLOT_GENERATOR = new BallotGenerator();
        RESULT_CALCULATOR = address(new ResultCalculator());
        WORLD_ID_ROUTER = IWorldID(_worldIdRouter);
    }

    ///////////////////////////
    // External Functions   ///
    ///////////////////////////

    /**
     * @dev electionCount is necessary to mantain consistent and verifiable electionIds
     */
    function createElection(
        string memory _appId,
        string memory _action,
        ElectionCreationInfo memory _electionCreationInfo,
        Election.Candidate[] memory _candidates,
        uint8 _ballotType,
        uint8 _resultType
    ) external returns (address) {
        if (_candidates.length < 2) {
            revert ElectionFactory_InvalidCandidatesLength(_candidates.length);
        }

        Election.ElectionInfo memory _electionInfo = Election.ElectionInfo({
            startTime: _electionCreationInfo.startTime,
            endTime: _electionCreationInfo.endTime,
            electionId: electionCount,
            name: _electionCreationInfo.name,
            description: _electionCreationInfo.description
        });
        BallotAndResultTypesValidator.validateBallotAndResultTypes(_ballotType, _resultType);

        address electionAddress = Clones.clone(ELECTION_GENERATOR);
        address _ballot = BALLOT_GENERATOR.generateBallot(_ballotType, electionAddress);

        Election election = Election(electionAddress);

        election.initialize(
            WORLD_ID_ROUTER,
            _appId,
            _action,
            address(this),
            msg.sender,
            _electionInfo,
            _candidates,
            _resultType,
            _ballot,
            RESULT_CALCULATOR
        );

        emit ElectionCreatedInfo(msg.sender, _electionInfo, _candidates);
        emit ElectionCreatedBallotAndResultType(_ballotType, _resultType);
        emit ElectionCreatedAddress(electionAddress);

        electionIdToOwner[electionCount] = msg.sender;
        publicElections.push(electionAddress);
        ownerToElections[msg.sender].push(electionAddress);
        electionCount++;

        return electionAddress;
    }

    ////////////////////////////////////////
    // Public & External View Functions  ///
    ////////////////////////////////////////

    function getFactoryOwner() external view returns (address) {
        return FACTORY_OWNER;
    }

    function getResultCalculatorAddress() external view returns (address) {
        return RESULT_CALCULATOR;
    }

    function getElectionContractGeneratorAddress() external view returns (address) {
        return ELECTION_GENERATOR;
    }

    function getWorldIdAddress() external view returns (address) {
        return address(WORLD_ID_ROUTER);
    }
}
