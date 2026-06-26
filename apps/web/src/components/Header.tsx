"use client";

import Link from "next/link";
import ConnectWalletButton from "./ConnectWalletButton";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isRegisterPage = pathname === "/org/register";
  let orgName = null;

  if (!isRegisterPage && pathname.startsWith("/org/")) {
    const rawId = pathname.replace("/org/", "");
    const decodedId = decodeURIComponent(rawId);
    orgName = decodedId.split(":")[0];
  }

  return (
    <div className="px-6 py-2">
      <div className="min-h-[95px] px-4 flex flex-row justify-between items-center bg-green-100 backdrop-blur-lg shadow-xl shadow-orange-500/20 rounded-xl border-2 border-green-700">
        <div className="flex flex-row items-center gap-x-2">
          <span className="text-4xl/6 font-[600] text-green-800/90">
            People's Mandate
          </span>
          <span className="text-5xl/6 text-green-700">|</span>
          {orgName && (
            <>
              <span className="text-4xl/6 font-[600] text-orange-700/90">
                ORG: {orgName}
              </span>
              <span className="text-5xl/6 text-green-700">|</span>
            </>
          )}
          <Link
            className="p-1 cursor-pointer border-2 border-green-800 fill-green-800 rounded-full hover:fill-orange-50 bg-orange-50 hover:bg-green-800"
            href="/"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="35px"
              viewBox="0 -960 960 960"
              width="35px"
            >
              <path d="M160-186.67v-380q0-15.83 7.08-30 7.09-14.16 19.59-23.33L440-810q17.45-13.33 39.89-13.33T520-810l253.33 190q12.5 9.17 19.59 23.33 7.08 14.17 7.08 30v380q0 27.5-19.58 47.09Q760.83-120 733.33-120h-140q-14.16 0-23.75-9.58-9.58-9.59-9.58-23.75v-213.34q0-14.16-9.58-23.75-9.59-9.58-23.75-9.58h-93.34q-14.16 0-23.75 9.58-9.58 9.59-9.58 23.75v213.34q0 14.16-9.58 23.75-9.59 9.58-23.75 9.58h-140q-27.5 0-47.09-19.58Q160-159.17 160-186.67Z" />
            </svg>
          </Link>
        </div>
        <ConnectWalletButton />
      </div>
    </div>
  );
}
