"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Toggle from "@/components/ui/Toggle";
import { useFactory } from "@/contexts/ElectionFactoryContext";
import { nothingToShowStyle } from "@/lib/commonStyles";
import { useState } from "react";

export interface ElectionInfo {
  creator: string;
  startTime: Date;
  endTime: Date;
  electionId: number;
  name: string;
  description: string;
}

// placeholder
export const mockElections: ElectionInfo[] = [
  {
    electionId: 1,
    creator: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    name: "Board of Directors Q3 2026",
    description:
      "Annual election to appoint the new executive board of directors for the organization's next fiscal cycle.",
    startTime: new Date("2026-06-25T00:00:00Z"),
    endTime: new Date("2026-06-30T23:59:59Z"),
  },
  {
    electionId: 2,
    creator: "0xF5C158eA14392477c7F83a9F4b09C81a5fcdA221",
    name: "Protocol Upgrade Proposal v2.4",
    description:
      "Community vote on whether to implement the proposed changes to the tokenomics emission schedule.",
    startTime: new Date("2026-07-01T09:00:00Z"),
    endTime: new Date("2026-07-07T17:00:00Z"),
  },
  {
    electionId: 3,
    creator: "0x3D9A1F67cb15949d05E44A154948a3070C55b8A2",
    name: "Community Moderator Selection",
    description:
      "Vote to select three new community moderators for the official Discord and governance forums.",
    startTime: new Date("2026-06-26T12:00:00Z"),
    endTime: new Date("2026-06-28T12:00:00Z"),
  },
  {
    electionId: 4,
    creator: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
    name: "Treasury Grant Allocation - Batch 5",
    description:
      "Deciding which of the top 5 open-source projects will receive the 50 ETH ecosystem development grant.",
    startTime: new Date("2026-08-15T00:00:00Z"),
    endTime: new Date("2026-08-20T00:00:00Z"),
  },
  {
    electionId: 5,
    creator: "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF",
    name: "Q1 Marketing Budget Approval",
    description:
      "Retrospective logging of the vote to approve the $150k marketing budget for the Q1 2026 campaign.",
    startTime: new Date("2026-05-01T08:00:00Z"),
    endTime: new Date("2026-05-07T20:00:00Z"),
  },
];

export default function OrgHomePage() {
  const [searchString, setSearchString] = useState<string>("");
  const [sortBy, setSortBy] = useState<"CREATED" | "UPDATED">("UPDATED");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { publicElections, privateElections } = useFactory();
  const [filtersIsPrivate, setFiltersIsPrivate] = useState<boolean>(false);

  return (
    <div className="absolute top-30 bottom-0 left-5 right-5 flex justify-between pb-5">
      <div
        className={`flex flex-col px-3 py-5 w-[30%] gap-y-4 bg-orange-600/80 rounded-lg  text-4xl text-white text-6xl `}
      >
        <p>Election List</p>
        <Input
          label="Search for Election"
          labelStyle="text-white"
          className="z-50 rounded-lg"
          placeholder="0x..."
          onChange={(e) => setSearchString(e.target.value)}
          value={searchString}
        />

        <div className="z-50 flex flex-col gap-y-3 rounded-lg p-2 text-5xl text-orange-500 bg-orange-50">
          <p className="border-b ">Filters</p>
          <Toggle
            onValue="Private"
            offValue="Public"
            isValue={filtersIsPrivate}
            onSetIsValue={setFiltersIsPrivate}
          />
        </div>
      </div>
      <div className="max-h-full flex flex-col w-[69%]">
        {mockElections.length === 0 ? (
          <div className="pt-10 flex flex-row gap-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="52px"
              viewBox="0 -960 960 960"
              width="52px"
              className="fill-orange-700/80"
            >
              <path d="M324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5ZM677-227q16-12 30-26t26-30L283-733q-16 12-30 26t-26 30l450 450Z" />
            </svg>

            <p className={`${nothingToShowStyle} text-5xl`}>
              No Elections Found
            </p>
          </div>
        ) : (
          <>
            <div className=" flex flex-row gap-x-2 justify-start h-12 p-2 ">
              <nav
                className="grid grid-cols-[1fr_1fr] rounded-l-sm border-2 border-orange-700 bg-orange-50 font-mono font-[500] text-orange-700 *:px-2"
                aria-label="Tabs"
              >
                <button
                  onClick={() => {
                    if (sortBy !== "UPDATED") {
                      setSortBy("UPDATED");
                    }
                  }}
                  type="button"
                  className={
                    sortBy === "UPDATED"
                      ? "bg-orange-500 font-[600] text-white"
                      : "hover:rounded-sm hover:font-[600] hover:bg-orange-200"
                  }
                >
                  UPDATED
                </button>
                <button
                  onClick={() => {
                    if (sortBy !== "CREATED") {
                      setSortBy("CREATED");
                    }
                  }}
                  type="button"
                  className={
                    sortBy === "CREATED"
                      ? "bg-orange-500 font-[600] text-white"
                      : "hover:font-[600] hover:bg-orange-200"
                  }
                >
                  CREATED
                </button>
              </nav>
              <button
                id="sortOrder-select"
                onClick={() => {
                  if (sortOrder === "asc") {
                    setSortOrder("desc");
                  } else {
                    setSortOrder("asc");
                  }
                }}
                type="button"
                className={`px-2 font-mono font-[600] text-white bg-orange-500 rounded-r-sm border-2 border-orange-700`}
              >
                {sortOrder === "desc" ? (
                  <p>
                    LATEST <span className="text-xl">⭫</span>
                  </p>
                ) : (
                  <p>
                    OLDEST <span className="text-xl">⭭</span>
                  </p>
                )}
              </button>
            </div>
            <div className="overflow-y-scroll">
              {mockElections.map((e, i) => (
                <div
                  className="h-50 flex flex-row justify-between gap-x-2 px-4 py-2 mx-2 mb-2 hover:shadow-lg hover:border-2 hover:border-orange-500
                    border-3 border-orange-600/20 rounded-lg  shadow-sm shadow-orange-700/60"
                  key={e.electionId}
                >
                  <div className="flex flex-col justify-between">
                    <p className="text-orange-600 font-bold text-5xl">
                      {e.name}
                    </p>
                    <p className="text-xl">{e.description}</p>
                    <div className="flex flex-row gap-x-4">
                      <p className="flex flex-row gap-x-2 text-orange-600">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          className="*:fill-orange-700"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 4.75C11.0479 4.75 10.1052 4.93753 9.22554 5.30187C8.34593 5.66622 7.5467 6.20025 6.87348 6.87348C6.20025 7.5467 5.66622 8.34593 5.30187 9.22554C4.93753 10.1052 4.75 11.0479 4.75 12C4.75 12.9521 4.93753 13.8948 5.30187 14.7745C5.66622 15.6541 6.20025 16.4533 6.87348 17.1265C7.5467 17.7997 8.34593 18.3338 9.22554 18.6981C10.1052 19.0625 11.0479 19.25 12 19.25C13.9228 19.25 15.7669 18.4862 17.1265 17.1265C18.4862 15.7669 19.25 13.9228 19.25 12C19.25 10.0772 18.4862 8.23311 17.1265 6.87348C15.7669 5.51384 13.9228 4.75 12 4.75ZM3.25 12C3.25 9.67936 4.17187 7.45376 5.81282 5.81282C7.45376 4.17187 9.67936 3.25 12 3.25C14.3206 3.25 16.5462 4.17187 18.1872 5.81282C19.8281 7.45376 20.75 9.67936 20.75 12C20.75 14.3206 19.8281 16.5462 18.1872 18.1872C16.5462 19.8281 14.3206 20.75 12 20.75C9.67936 20.75 7.45376 19.8281 5.81282 18.1872C4.17187 16.5462 3.25 14.3206 3.25 12Z" />
                          <path
                            opacity="0.5"
                            d="M12 7.25C12.1989 7.25 12.3897 7.32902 12.5303 7.46967C12.671 7.61032 12.75 7.80109 12.75 8V11.69L14.53 13.47C14.6037 13.5387 14.6628 13.6215 14.7038 13.7135C14.7448 13.8055 14.7668 13.9048 14.7686 14.0055C14.7704 14.1062 14.7518 14.2062 14.7141 14.2996C14.6764 14.393 14.6203 14.4778 14.549 14.549C14.4778 14.6203 14.393 14.6764 14.2996 14.7141C14.2062 14.7518 14.1062 14.7704 14.0055 14.7686C13.9048 14.7668 13.8055 14.7448 13.7135 14.7038C13.6215 14.6628 13.5387 14.6037 13.47 14.53L11.47 12.53C11.3293 12.3895 11.2502 12.1988 11.25 12V8C11.25 7.80109 11.329 7.61032 11.4697 7.46967C11.6103 7.32902 11.8011 7.25 12 7.25Z"
                          />
                        </svg>
                        <span className="">ENDS ON</span>
                        <span className="font-bold">
                          {e.endTime.toDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between gap-y-2">
                    <span className="bg-gray-200 px-2 py-1 rounded-full text-gray-800">
                      ENDED
                    </span>
                    <Button variant="primary">Open</Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
