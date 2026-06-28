"use client";

import {
  Address,
  electionFactoryAbi,
  OrgIdURLSchema,
  orgRegistryAbi,
  orgRegistryAddress,
  publicClient,
} from "@repo/shared";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { zeroAddress } from "viem";

interface OrgInfo {
  orgName: string | null;
  orgAddress: Address | null;
}

interface ElectionFactoryContextType extends OrgInfo {
  isCreator: boolean;
  isAdmin: boolean;
  publicElections: Address[];
  privateElections: Address[];
  error: string;
}

const ElectionFactoryContext = createContext<ElectionFactoryContextType | null>(
  null,
);

export function ElectionFactoryProvider({
  children,
  orgIdUrl,
}: {
  children: ReactNode;
  orgIdUrl: string;
}) {
  const [contextError, setContextError] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [elections, setElections] = useState<{
    public: Address[];
    private: Address[];
  }>({
    public: [],
    private: [],
  });
  const [orgInfo, setOrgInfo] = useState<OrgInfo>({
    orgName: null,
    orgAddress: null,
  });

  const orgIdParsed = useMemo(() => {
    const parsed = OrgIdURLSchema.safeParse(orgIdUrl);
    if (!parsed.success) {
      return null;
    }
    return { ...parsed.data };
  }, [orgIdUrl]);

  useEffect(() => {
    if (!orgIdParsed) {
      setContextError("Error: Invalid Ledger ID in Url");
      return;
    }

    const validateFactory = async () => {
      try {
        const factoryAddress = orgIdParsed.address;
        const _orgAdmin = await publicClient.readContract({
          abi: orgRegistryAbi,
          address: orgRegistryAddress,
          functionName: "getOrgAdmin",
          args: [factoryAddress],
        });
        const _orgName = await publicClient.readContract({
          abi: orgRegistryAbi,
          address: orgRegistryAddress,
          functionName: "getOrgName",
          args: [factoryAddress],
        });
        console.log("Factory context: orgname and admin", _orgName, _orgAdmin);
        if (
          !_orgAdmin ||
          _orgAdmin === zeroAddress
          // ||
          // _orgName !== orgIdParsed.orgName
        ) {
          setContextError("Election Factory Not found on chain");
          return;
        }

        setOrgInfo({
          orgName: orgIdParsed.orgName, //change this later
          orgAddress: orgIdParsed.address,
        });

        const publicElections = (await publicClient.readContract({
          address: factoryAddress,
          abi: electionFactoryAbi,
          functionName: "getPublicElections",
        })) as Address[];

        // check if the account is whitelisted, and keep only those ones
        const privateElections = (await publicClient.readContract({
          address: factoryAddress,
          abi: electionFactoryAbi,
          functionName: "getPrivateElections",
        })) as Address[];

        setElections({
          public: publicElections,
          private: privateElections,
        });
      } catch (err) {
        console.error("Election factory context error", err);
        setContextError("unknown error occured");
      }
    };

    validateFactory();
  }, [orgIdParsed]);

  const contextValues: ElectionFactoryContextType = {
    isCreator,
    isAdmin,
    publicElections: elections.public,
    privateElections: elections.private,
    error: contextError || "",
    orgName: orgInfo.orgName,
    orgAddress: orgInfo.orgAddress,
  };

  return (
    <ElectionFactoryContext.Provider value={contextValues}>
      {children}
    </ElectionFactoryContext.Provider>
  );
}

export function useFactory() {
  const context = useContext(ElectionFactoryContext);
  if (!context) {
    throw new Error("factory: context must be used within a provider");
  }
  return context;
}
