// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Errors} from "./Errors.sol";

interface IResultCalculator is Errors {
    function getResults(bytes calldata returnData, uint8 _resultType) external returns (uint256[] memory);
}
