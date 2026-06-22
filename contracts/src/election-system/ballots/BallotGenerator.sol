// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {GeneralBallot} from "./GeneralBallot.sol";
import {IRV} from "./IRV.sol";
import {RankedBallot} from "./RankedBallot.sol";
import {QuadraticBallot} from "./QuadraticBallot.sol";
import {ScoreBallot} from "./ScoreBallot.sol";
import {KemenyYoungBallot} from "./KemenyYoungBallot.sol";
import {SchulzeBallot} from "./SchulzeBallot.sol";

contract BallotGenerator {
    function generateBallot(uint8 _ballotType, address _electionAddress) public returns (address) {
        if (_ballotType == 0) {
            // General Ballot
            return address(new GeneralBallot(_electionAddress));
        }
        if (_ballotType == 1) {
            // Ranked Ballot
            return address(new RankedBallot(_electionAddress));
        }
        if (_ballotType == 2) {
            // IRV Ballot
            return address(new IRV(_electionAddress));
        }
        if (_ballotType == 3) {
            // Schulze Ballot
            return address(new SchulzeBallot(_electionAddress));
        }
        if (_ballotType == 4) {
            // Quadratic Ballot
            return address(new QuadraticBallot(_electionAddress));
        }
        if (_ballotType == 5) {
            // Score Ballot
            return address(new ScoreBallot(_electionAddress));
        }
        if (_ballotType == 6) {
            // KemenyYoung Ballot
            return address(new KemenyYoungBallot(_electionAddress));
        }
        if (_ballotType == 7) {
            // Moore's Ballot
            return address(new GeneralBallot(_electionAddress));
        }
        return address(new GeneralBallot(_electionAddress));
    }
}
