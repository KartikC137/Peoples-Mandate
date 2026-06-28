"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { type Address, zeroAddress } from "viem";
import {
  Candidate,
  electionAbi,
  ElectionDetails,
  ElectionInfo,
} from "@repo/shared";
import { electionFactoryAbi } from "@repo/shared";
import { useWallet } from "./WalletContext";
import { useFactory } from "./ElectionFactoryContext";
import { publicClient } from "@repo/shared";
import { bigintToDateWithTimeStamp } from "@/lib/util/helpers";

/**
 * @notice Primarily fetches data from DB but chain of custody requires , fallback is rpc calls to the contract.
 * @dev fix
 */
export default function useFetchSingleElection(address: Address) {
  const { activeAccount } = useWallet();
  const { orgAddress } = useFactory();

  const [isLoadingElection, setIsLoadingElection] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [electionDetails, setElectionDetails] =
    useState<ElectionDetails | null>(null);
  const [dataSource, setDataSource] = useState<"DB" | "BLOCKCHAIN">("DB");

  const fetchInFlightRef = useRef<string | null>(null);

  const fetchElectionData = useCallback(
    async (electionAddress: Address) => {
      if (electionAddress && fetchInFlightRef.current === electionAddress) {
        return;
      }

      if (electionAddress) fetchInFlightRef.current = electionAddress;

      setIsLoadingElection(true);
      setError(null);
      setElectionDetails(null);

      if (!activeAccount || !publicClient) {
        fetchInFlightRef.current = null;
        return;
      }

      try {
        const [
          hasVoted,
          owner,
          isInWhitelist,
          candidatesRaw,
          isResultDeclared,
          electionInfoRaw,
          isPrivate,
          createdAt,
        ] = await Promise.all([
          publicClient.readContract({
            address,
            abi: electionAbi,
            functionName: "hasVoted",
            args: [activeAccount],
          }) as Promise<boolean>,
          publicClient.readContract({
            address,
            abi: electionAbi,
            functionName: "owner",
          }) as Promise<Address>,
          publicClient.readContract({
            address,
            abi: electionAbi,
            functionName: "isWhitelisted",
            args: [activeAccount],
          }) as Promise<boolean>,
          publicClient.readContract({
            address,
            abi: electionAbi,
            functionName: "getCandidateList",
          }) as Promise<Candidate[]>,
          publicClient.readContract({
            address,
            abi: electionAbi,
            functionName: "getIsResultsDeclared",
          }) as Promise<boolean>,
          publicClient.readContract({
            address,
            abi: electionAbi,
            functionName: "electionInfo",
          }) as Promise<ElectionInfo>,
          publicClient.readContract({
            address,
            abi: electionAbi,
            functionName: "isPrivate",
          }) as Promise<boolean>,
          publicClient.readContract({
            address,
            abi: electionAbi,
            functionName: "createdAt",
          }) as Promise<bigint>,
        ]);

        let winnersList: bigint[] | null = null;
        if (isResultDeclared) {
          winnersList = (await publicClient.readContract({
            address,
            abi: electionAbi,
            functionName: "getWinnersList",
          })) as bigint[];
        }

        setElectionDetails({
          hasVoted,
          owner: owner,
          createdAt: bigintToDateWithTimeStamp(createdAt),
          isResultDeclared: isResultDeclared,
          isAccountInWhiteList: isInWhitelist,
          winnersList: winnersList,
          isPrivate: isPrivate,
          id: Number(electionInfoRaw[2]),
          startTime: bigintToDateWithTimeStamp(electionInfoRaw[0]),
          endTime: bigintToDateWithTimeStamp(electionInfoRaw[1]),
          name: electionInfoRaw[3],
          desc: electionInfoRaw[4],
          address: electionAddress,
          candidateList: candidatesRaw,
        });
        setDataSource("BLOCKCHAIN");
      } catch (err) {
        console.error("Failed to fetch evidence details:", err);
        setError("Error: Unknown Error occured.");
      } finally {
        setIsLoadingElection(false);
        if (fetchInFlightRef.current === electionAddress)
          fetchInFlightRef.current = null;
      }
    },
    [publicClient, activeAccount],
  );
  useEffect(() => {
    if (address && publicClient) {
      fetchElectionData(address);
    } else if (!publicClient) {
      setError("Connect your wallet to view election.");
      setIsLoadingElection(false);
    }
  }, [publicClient, address, fetchElectionData, activeAccount]);

  return {
    dataSource,
    isLoadingElection,
    error,
    electionDetails,
    fetchElectionData,
  };
}
