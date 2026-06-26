# Peoples Mandate Smart Contracts

## Contracts:

1. Election Factory:
   Handles Creation of all the elections and acts as a ledger storing their metadata.

- Create Election
  - Deploys Election Clone via Election Generator Address
  - Generates a ballot using ballot generator
  - passes the result calculator address to election contract
- Current state storage: (debatable)
  - i. electionIdToOwner[electionCount] = msg.sender; // store owner of each election
  - ii. ownerToElections[msg.sender].push(electionAddress); // all the elections by a particular owner
  - iii. publicElections.push(electionAddress); // array of all the elections created

TODO: <br>
<br>i. optimize state storage
<br>ii. better election id
<br>iii. remove world id integration and add custom validator

2. Election:

- Handles Intializing the Clone, Adding and Removing Candidates, User Vote, and ending/calculating final results.
- Currently Implements World ID identity proof verification

TODO:
<br>i. Remove World ID, custom identity Manager Implementation
<br>ii. Unpredictable, yet verifiable voting mechanism IMP
<br>iii. Optimize errors and events

3. Ballots and Result Calculator

- Ballot is Unique to each election i.e bound to the contract address
- Result Calculator is Unified Calculator for each type of ballot
