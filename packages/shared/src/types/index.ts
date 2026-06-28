import { z } from "zod";

// org id
// Matches URL-encoded format (e.g., "my-org%3A0x123...abc")
export const ORG_ID_URL_REGEX = /^[a-zA-Z0-9_-]+%3A0x[a-fA-F0-9]{40}$/i;

export const ORG_ID_REGEX = /^[a-zA-Z0-9_-]+:0x[a-fA-F0-9]{40}$/i;

export const OrgIdURLSchema = z
  .string()
  .regex(ORG_ID_URL_REGEX, {
    message: "Invalid ORG_ID format. Expected: <orgName>:<address>",
  })
  .transform((_orgId) => {
    const parts = _orgId.split("%3A");
    return {
      raw: _orgId.replaceAll("%3A", ":"),
      orgName: parts[0],
      address: parts[1]?.toLowerCase() as Address,
    };
  });

export type OrgId = z.output<typeof OrgIdURLSchema>;

// solidity/ web3 types
export const EMPTY_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const AddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "invalid EVM address")
  .transform((address) => address.toLowerCase() as `0x${string}`);

export const Bytes32Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "invalid bytes32 value")
  .transform((value) => value.toLowerCase() as `0x${string}`);

export type Bytes32 = z.infer<typeof Bytes32Schema>;
export type Address = z.infer<typeof AddressSchema>;

// auth response

export type AuthStatusResponse =
  | {
      success: false;
      error:
        | "missing_account"
        | "missing_token" // Session token not found in server map
        | "expired_token" // Session token expired
        | "missing_payload" // Missing signature or message in payload
        | "nonce_mismatch" // Nonce missing or didn't match socket context
        | "invalid_signature" // Cryptographic signature verification failed
        | "server_error"; // Catch-all for code crashes
    }
  | {
      success: true;
      token?: string;
      walletAddress: Address;
      profileId: Bytes32 | null;
    };

export type NonceResponseType =
  | {
      success: true;
      nonce: string;
    }
  | {
      success: false;
      error: "missing_account";
    };

// Election Types:

export type ElectionInfo = [
  startTime: bigint,
  endTime: bigint,
  electionId: bigint,
  name: string,
  description: string,
];

export interface Candidate {
  candidateId: bigint;
  name: string;
  description: string;
}

export type ElectionDetails = {
  hasVoted: boolean;
  owner: Address;
  createdAt: Date;
  isResultDeclared: boolean;
  isAccountInWhiteList: boolean;
  winnersList: bigint[] | null;
  isPrivate: boolean;
  id: number;
  startTime: Date;
  endTime: Date;
  name: string;
  desc: string;
  address: Address;
  candidateList: Candidate[];
};
