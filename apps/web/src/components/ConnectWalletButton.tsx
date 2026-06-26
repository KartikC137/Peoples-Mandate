"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import { defaultChain } from "@repo/shared";
import HashBadge from "./ui/HashBadge";
import Link from "next/link";

export default function ConnectWalletButton() {
  const { isSiweAuth, profileId, siwe, progress } = useAuth();
  const { activeAccount, connectWallet, isConnecting, providerNotFound } =
    useWallet();

  const buttonStyle = `h-17 px-5 py-4 rounded-full bg-orange-700 text-xl text-orange-50 font-mono font-bold`;

  const handleLoginClick = async () => {
    try {
      if (!activeAccount) {
        await connectWallet();
      }
      await siwe();
    } catch (error) {
      console.error("Login sequence failed:", error);
    }
  };

  return providerNotFound ? (
    <Button className={buttonStyle}>
      <Link href={"get-started"}>Get Started ⇾</Link>
    </Button>
  ) : !activeAccount ? (
    <Button
      className={buttonStyle}
      onClick={() => connectWallet()}
      isLoading={isConnecting}
      loadingText="Connecting..."
    >
      Connect Wallet
    </Button>
  ) : (
    <div className="flex flex-row gap-x-2 *:px-2 *:border-orange-700/80">
      <div className="h-full w-full flex flex-row gap-x-2 items-center py-2 border-2 rounded-l-lg bg-orange-50 font-sans font-bold text-lg text-orange-700">
        <div className="px-2">
          <p>
            {isSiweAuth && !progress ? (
              <>
                <span className="text-green-800">Connected:</span>
                {defaultChain.name}({defaultChain.id})
              </>
            ) : (
              <>{progress}</>
            )}
          </p>
          <p>
            <HashBadge
              hash={activeAccount}
              custom={15}
              style="font-sans text-xl"
            />
          </p>
        </div>
        {!profileId && !progress && (
          <>
            <div className="border rounded-full h-17"></div>
            <Button className={buttonStyle}>Complete Log In</Button>
          </>
        )}
      </div>
      <Button
        className={`rounded-r-lg bg-orange-50 border-2 border-orange-700 font-bold text-sm text-red-500
        hover:bg-red-500 hover:text-white`}
      >
        X
      </Button>
    </div>
  );
}
