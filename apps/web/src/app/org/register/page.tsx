"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useWallet } from "@/contexts/WalletContext";
import { pageHeadingStyle } from "@/lib/commonStyles";
import { useState } from "react";

export default function OrgRegisterPage() {
  const { activeAccount } = useWallet();

  const [orgName, setOrgName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [admin, setAdmin] = useState<string>(activeAccount || "");
  const [creators, setCreators] = useState<string[]>([]);
  const [currentCreator, setCurrentCreator] = useState<string>("");

  return (
    <>
      <p className={pageHeadingStyle}>
        {/* <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="fill-orange-600"
            d="M40.001 22.001V26.001H26.001V40.001H22.001V26.001H8.001V22.001H22.001V8.001H26.001V22.001H40.001ZM40.971 40.971C31.599 50.343 16.403 50.343 7.029 40.971C-2.343 31.599 -2.343 16.403 7.029 7.029C16.403 -2.343 31.597 -2.343 40.971 7.029C50.345 16.403 50.345 31.599 40.971 40.971ZM38.143 9.859C30.459 2.175 17.809 1.909 9.859 9.859C2.061 17.657 2.061 30.345 9.859 38.143C17.809 46.093 30.461 45.825 38.143 38.143C45.941 30.345 45.941 17.657 38.143 9.859Z"
          />
        </svg> */}
        <span>Register New Organisation</span>
      </p>
      <div className="absolute top-30 bottom-0 left-0 right-0 flex justify-center pb-5">
        <div className="flex flex-col gap-y-4 w-[50%] p-10 rounded-3xl border-2 border-orange-700/60 shadow-lg shadow-orange-500/50">
          <Input
            onChange={(e) => setOrgName(e.target.value)}
            value={orgName}
            label="Enter Organisation Name"
          />
          <Input
            onChange={(e) => setDesc(e.target.value)}
            value={desc}
            label="Description"
            className="min-h-30"
          />
          <span className="text-3xl text-orange-800">Roles</span>
          <div className="flex justify-between items-end gap-x-2 ">
            <Input
              onChange={(e) => setAdmin(e.target.value)}
              value={admin}
              className="rounded-r-none"
              placeholder="0x..."
              label="Enter Admin Address (Default Current Account)"
            />
            <Button
              onClick={() => setAdmin("")}
              className={`h-[64%] px-2 rounded-r-md bg-orange-50 border-2 border-orange-700 font-bold text-sm text-red-500 
        hover:bg-red-500 hover:text-white`}
            >
              X
            </Button>
          </div>

          <div className="flex justify-between items-end gap-x-2 ">
            <Input
              onChange={(e) => setCurrentCreator(e.target.value)}
              value={currentCreator}
              className="rounded-r-none"
              label="Enter Creators"
            />
            <Button
              onClick={() => {
                setCurrentCreator("");
                setCreators((prev) => {
                  const alreadyPresent = creators.some(
                    (a) => a === currentCreator,
                  );
                  if (alreadyPresent) return prev;
                  return [...prev, currentCreator];
                });
              }}
              variant="add"
              className={`h-[64%] text-3xl/5 text-center px-3`}
            >
              +
            </Button>
            <Button
              onClick={() => setCreators([])}
              className={`h-[64%] px-2 rounded-r-md bg-orange-50 border-2 border-orange-700 font-bold text-sm text-red-500 
        hover:bg-red-500 hover:text-white`}
            >
              X
            </Button>
          </div>
          <span className="text-3xl text-orange-800">
            Granting Creator Roles:
          </span>
          <div className="h-full overflow-y-scroll">
            {creators.length > 0 ? (
              <ul className="p-4 rounded-md border-2 border-orange-800 bg-orange-50">
                {creators.map((a, i) => (
                  <li
                    className="text-xl font-bold text-orange-800 border-b"
                    key={a}
                  >
                    {i + 1}. {a}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-3xl text-orange-600/60">
                X No Creator Role Granted
              </span>
            )}
          </div>
          <Button
            disabled={!admin || !orgName}
            className="py-4 rounded-md text-lg font-bold text-white border-2 border-orange-800 bg-orange-700/80 hover:bg-orange-800"
          >
            DEPLOY ELECTION FACTORY
          </Button>
        </div>
      </div>
    </>
  );
}
