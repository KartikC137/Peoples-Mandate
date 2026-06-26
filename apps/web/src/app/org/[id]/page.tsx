"use client";

import Input from "@/components/ui/Input";
import { pageHeadingStyle } from "@/lib/commonStyles";
import { useState } from "react";

export default function OrgHomePage() {
  const [searchString, setSearchString] = useState<string>("");
  return (
    <>
      {/* todo: change search bar ui */}
      <div className={`${pageHeadingStyle} text-6xl w-[30%] gap-y-4`}>
        <p>Election List</p>
        <Input
          label="Search for Election"
          labelStyle="text-white"
          className="rounded-lg"
          onChange={(e) => setSearchString(e.target.value)}
          value={searchString}
        />

        <div className="rounded-lg p-2 text-5xl text-orange-500 bg-orange-50">
          <p>Filters</p>
        </div>
      </div>

      <div className="absolute top-30 bottom-0 left-10 right-6 flex justify-end pb-5">
        <div className="flex flex-col gap-y-4 w-[69%] p-10 rounded-3xl border-2 border-orange-700/60 shadow-lg shadow-orange-500/50"></div>
      </div>
    </>
  );
}
