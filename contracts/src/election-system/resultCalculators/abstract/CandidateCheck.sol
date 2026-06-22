// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Errors} from "../interface/Errors.sol";

abstract contract Candidatecheck is Errors {
    function checkEdgeCases(uint256 candidatesLength) internal pure returns (uint256[] memory) {
        if (candidatesLength == 0) {
            revert NoWinner();
        } else {
            uint256[] memory singleWinner = new uint256[](1);
            singleWinner[0] = 0;
            return singleWinner;
        }
    }
}
