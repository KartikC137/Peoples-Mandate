"use client";

import { Address, OrgIdURLSchema } from "@repo/shared";
import { createContext, ReactNode, useMemo, useState } from "react";

interface OrgInfo {
  orgName: string | null;
  orgAddress: Address | null;
}

interface EvidenceFactoryContextType extends OrgInfo {}

const EvidenceFactoryContext = createContext<EvidenceFactoryContextType | null>(
  null,
);

export function ElectionFactoryProvider({
  children,
  orgIdUrl,
}: {
  children: ReactNode;
  orgIdUrl: string;
}) {
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [orgInfo, setOrgInfo] = useState<OrgInfo>({
    orgName: null,
    orgAddress: null,
  });

  const orgIdParsed = useMemo(() => {
    const parsed = OrgIdURLSchema.safeParse(orgIdUrl);
    if (!parsed.success) {
      setLedgerError("Error: Invalid Ledger ID");
      return null;
    }
    return { ...parsed.data };
  }, [orgIdUrl]);

  if (!orgIdParsed) {
    return <div>Invalid Org Id</div>;
  }
  const contextValues: EvidenceFactoryContextType = {
    orgName: orgIdParsed.orgName,
    orgAddress: orgIdParsed.address,
  };

  return (
    <EvidenceFactoryContext.Provider value={contextValues}>
      {children}
    </EvidenceFactoryContext.Provider>
  );
}
