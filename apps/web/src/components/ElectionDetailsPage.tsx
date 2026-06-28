"use client";

import useFetchSingleElection from "@/contexts/useSingleElection";
import {
  Address,
  AddressSchema,
  defaultChain,
  electionAbi,
  publicClient,
} from "@repo/shared";
import Input from "./ui/Input";
import { useState } from "react";
import Button from "./ui/Button";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { decodeEventLog } from "viem";
import { bigintToDateWithTimeStamp } from "@/lib/util/helpers";
import ElectionClock from "./ElectionClock";

export default function ElectionDetails({
  electionAddress,
}: {
  electionAddress: Address;
}) {
  const parsed = AddressSchema.safeParse(electionAddress);
  if (!parsed.success) return <div>Invalid</div>;
  const address = parsed.data;
  const {
    electionDetails,
    isLoadingElection,
    error: hookError,
    fetchElectionData,
  } = useFetchSingleElection(address);
  const { activeAccount, walletClient } = useWallet();
  const { isSiweAuth, profileId } = useAuth();
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(
    null,
  );
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoadingElection) {
    return (
      <div className="text-5xl text-orange-600 animate-pulse">
        Loading Election...
      </div>
    );
  }
  if (electionDetails === null) {
    return (
      <div className="text-5xl text-orange-600 animate-pulse">
        Election Not Found On chain. {hookError || ""}
      </div>
    );
  }
  const isElectionInactive =
    electionDetails.endTime < new Date() ||
    electionDetails.startTime > new Date();

  const isAdmin = activeAccount === electionDetails.owner.toLowerCase();

  async function handleUserVote() {
    setIsVoting(true);
    setError(null);

    if (!publicClient || !walletClient || !activeAccount || !isSiweAuth) {
      setError("Wallet Disconnected");
      setIsVoting(false);
      return;
    }

    if (!profileId) {
      setError("Complete Account Registration");
      setIsVoting(false);
      return;
    }

    if (selectedCandidateId === null) {
      setError("Must Select at least 1 candidate");
      setIsVoting(false);
      return;
    }

    if (!electionDetails) {
      setError("election not found");
      setIsVoting(false);
      return;
    }
    if (electionDetails.startTime > new Date()) {
      setError("Election has not yet started");
      setIsVoting(false);
      return;
    }

    if (electionDetails.endTime < new Date()) {
      setError("Election Has Ended");
      setIsVoting(false);
      return;
    }

    if (electionDetails.isResultDeclared) {
      setError("Results Already declared");
      setIsVoting(false);
      return;
    }

    if (electionDetails.isPrivate && !electionDetails.isAccountInWhiteList) {
      setError("Private Election");
      setIsVoting(false);
      return;
    }

    try {
      const vote = [BigInt(selectedCandidateId)];
      const txHash = await walletClient.writeContract({
        abi: electionAbi,
        address: electionAddress,
        functionName: "userVote",
        args: [vote],
        account: activeAccount,
        chain: defaultChain,
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      console.log("vote receipt", receipt);
      for (const log of receipt.logs) {
        try {
          const decodedLog = decodeEventLog({
            abi: electionAbi,
            data: log.data,
            topics: log.topics,
          });

          if (decodedLog.eventName === "CastVote") {
            // @ts-ignore - mapping viem inferred types
            const voterAddress = decodedLog.args.voter;
            console.log("user vote success", voterAddress);
            break;
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error("user vote error", err);
    } finally {
      setIsVoting(false);
      setSelectedCandidateId(null);
      await fetchElectionData(electionAddress);
    }
  }

  async function calculateResult() {
    if (!walletClient) return;

    try {
      const txHash = await walletClient.writeContract({
        abi: electionAbi,
        address: electionAddress,
        functionName: "calculateFinalResult",
        account: activeAccount,
        chain: defaultChain,
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      console.log("result receipt", receipt);
      for (const log of receipt.logs) {
        try {
          const decodedLog = decodeEventLog({
            abi: electionAbi,
            data: log.data,
            topics: log.topics,
          });

          if (decodedLog.eventName === "CalculateFinalResult") {
            // @ts-ignore - mapping viem inferred types
            console.log("calcultate success, see  winner list");
            break;
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error("calc result ", err);
    } finally {
      await fetchElectionData(electionAddress);
    }
  }

  return (
    <div className=" p-4 absolute top-30 bottom-6 left-6 right-6 flex flex-col gap-y-3">
      <div className="grid grid-cols-[4fr_1fr] gap-x-2">
        <div>
          <p className="flex flex-rows items-center gap-x-4 text-orange-600 text-6xl">
            {electionDetails.name}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="47px"
              viewBox="0 -960 960 960"
              width="47px"
              className="rounded-full p-1 bg-orange-500 "
            >
              <path
                className="fill-white"
                d="M684.78-73.3q-50.79 0-86.45-35.61-35.67-35.61-35.67-86.29 0-7.26 4.09-30.14l-286.14-167.3q-16.9 16.49-38.5 25.75-21.6 9.27-46.67 9.27-50.89 0-86.51-35.52-35.63-35.53-35.63-86.84 0-51.32 35.63-86.86 35.62-35.54 86.51-35.54 24.48 0 46.02 9.03 21.55 9.04 38.37 24.97l286.68-165.45q-1.76-7.35-2.8-14.99-1.05-7.63-1.05-15.74 0-50.78 35.68-86.54 35.68-35.76 86.47-35.76t86.46 35.77q35.66 35.76 35.66 86.55t-35.64 86.45q-35.65 35.67-86.57 35.67-24.32 0-45.65-9.07-21.33-9.08-38.13-24.39L313.06-513.89q2.66 7.89 3.83 16.59t1.17 17.12q0 8.42-.88 15.98-.87 7.57-3.03 15.32l287.14 164.66q16.8-15.57 38.06-24.47 21.26-8.89 45.56-8.89 51.16 0 86.59 35.66 35.43 35.65 35.43 86.59 0 50.93-35.68 86.48-35.68 35.55-86.47 35.55Zm-.11-73.84q20.57 0 34.5-13.89 13.92-13.88 13.92-34.41 0-20.52-13.91-34.41-13.92-13.89-34.65-13.89-20.52 0-34.28 13.95-13.75 13.95-13.75 34.37 0 20.42 13.8 34.35 13.81 13.93 34.37 13.93ZM195.44-431.46q20.52 0 34.65-13.9 14.13-13.9 14.13-34.61t-14.14-34.64q-14.13-13.93-34.7-13.93-20.58 0-34.41 13.9-13.83 13.9-13.83 34.61t13.89 34.64q13.88 13.93 34.41 13.93Zm523.69-298.7q13.88-13.89 13.88-34.43 0-20.48-13.9-34.45-13.9-13.97-34.45-13.97-20.54 0-34.47 13.98t-13.93 34.65q0 20.47 14.07 34.3 14.07 13.82 34.49 13.82t34.31-13.9Zm-34.09 534.72ZM195.68-480ZM684.8-764.56Z"
              />
            </svg>
          </p>
          <p className="max-h-20 overflow-y-scroll p-1 text-orange-800 text-3xl">
            {electionDetails.desc}
          </p>
          <div className="mt-2 *:mx-1">
            <span className="border-2 w-50 text-center rounded-full bg-orange-500 font-bold py-2 px-4 text-lg text-white">
              Type: General
            </span>
            <span className="border-2 w-50 text-center rounded-full bg-orange-50 font-bold py-2 px-4 text-lg  text-orange-600">
              BY {electionDetails.owner}
            </span>
            <span className="border-2 w-50 text-center rounded-full bg-orange-50 font-bold py-2 px-4 text-lg  text-orange-600">
              CREATED ON {electionDetails.createdAt.toLocaleString()}
            </span>
          </div>
        </div>

        <ElectionClock
          startTime={electionDetails.startTime}
          endTime={electionDetails.endTime}
        />
      </div>
      <div className="flex items-center mt-3 text-5xl text-orange-700">
        Candidates ({electionDetails.candidateList.length})
        {electionDetails.hasVoted ? (
          <span className="ml-2 text-2xl font-bold text-orange-50 bg-orange-500 rounded-full px-4 py-2 border-2">
            VOTED
          </span>
        ) : (
          isElectionInactive ||
          (electionDetails.isResultDeclared && (
            <Button
              isLoading={isVoting}
              loadingText="Voting"
              onClick={() => handleUserVote()}
              className="shadow-lg shadow-green-700/40 hover:shadow-sm border-green-700 border-4 hover:border-green-500 text-2xl font-bold ml-2 text-green-50 bg-green-700 px-4 py-2 rounded-full"
            >
              {selectedCandidateId !== null ? "VOTE" : "SELECT CANDIDATE"}
            </Button>
          ))
        )}
        {error && (
          <span className="ml-2 text-2xl font-bold text-orange-50 bg-red-600 px-4 rounded-full py-2">
            Error: {error}
          </span>
        )}
        {isAdmin &&
          electionDetails.endTime < new Date() &&
          !electionDetails.isResultDeclared && (
            <Button
              onClick={() => calculateResult()}
              className="shadow-lg shadow-green-700/40 hover:shadow-sm border-green-700 border-2 hover:border-green-500 text-2xl font-bold ml-2 text-green-50 bg-green-700 px-4 py-2 rounded-full"
            >
              CALCULATE RESULTS
            </Button>
          )}
      </div>
      <div
        className={`h-full overflow-scroll rounded-lg border border-orange-600/40 shadow-sm shadow-orange-500/60  `}
      >
        <div className=" flex flex-col gap-y-5 p-5">
          {electionDetails.candidateList.map((c) => (
            <div key={c.candidateId}>
              <div
                className={` flex justify-between flex-row gap-x-5 p-2 pr-5 border-2 rounded-lg text-4xl transition-colors ${!electionDetails.hasVoted && !isElectionInactive && " cursor-pointer hover:bg-orange-100 hover:border-orange-500 hover:border-2"} ${
                  electionDetails.isResultDeclared &&
                  (electionDetails.winnersList as bigint[])[0] === c.candidateId
                    ? "bg-green-500 text-white font-bold"
                    : selectedCandidateId === Number(c.candidateId)
                      ? "bg-orange-200 border-orange-500 text-orange-800"
                      : "bg-orange-50 border-transparent text-orange-700"
                }`}
                onClick={() =>
                  !isElectionInactive &&
                  !electionDetails.hasVoted &&
                  setSelectedCandidateId(Number(c.candidateId))
                }
              >
                <div className="flex flex-row">
                  <p className="w-20">{c.candidateId}</p>
                  <div>
                    <p className="font-bold">{c.name}</p>
                    <p className="text-xl">{c.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
