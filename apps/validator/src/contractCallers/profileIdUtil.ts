import {
  type Bytes32,
  type Address,
  publicClient,
  profilesAbi,
  profilesContractAddress,
} from "@repo/shared";

export async function fetchProfileId(account: Address): Promise<Bytes32> {
  const profileId = (await publicClient.readContract({
    address: profilesContractAddress,
    abi: profilesAbi,
    functionName: "walletAddressToProfileId",
    args: [account],
  })) as Promise<Bytes32>;

  return profileId;
}
