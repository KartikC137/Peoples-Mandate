// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library BallotAndResultTypesValidator {
    /**
     * @notice There are 8 types of Ballot and Result Types (0-7):
     *     0. General
     *     1. Ranked
     *     2. IRV
     *     3. Schulze
     *     4. Quadratic
     *     5. Score
     *     6. KemenyYoung
     *     7. Moore
     *
     * @dev General Ballot is used for: General (0) and Moore (7).
     * @dev General Result is used for: General (0), Ranked (1), Quadratic (4) and Score (5).
     * @dev For conveniece, ensure one to one type matching.
     */
    error ElectionFactory_InvalidBallotAndResultTypeCombination(uint8 ballotType, uint8 resultType);
    error BallotAndResultTypes_InvalidRange(uint8 value, string reason);

    function validateBallotAndResultTypes(uint8 _ballotType, uint8 _resultType) internal pure {
        if (_ballotType < 0 || _ballotType > 7) {
            revert BallotAndResultTypes_InvalidRange(_ballotType, "ballotType out of range");
        }
        if (_resultType < 0 || _resultType > 7) {
            revert BallotAndResultTypes_InvalidRange(_resultType, "resultType out of range");
        }

        if (_ballotType != _resultType) {
            revert ElectionFactory_InvalidBallotAndResultTypeCombination(_ballotType, _resultType);
        }
    }
}
