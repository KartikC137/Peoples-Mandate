"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type Address, type EIP1193Provider } from "viem";
import { defaultChain } from "@repo/shared";

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

interface WalletContextType {
  activeAccount: Address | null;
  isConnecting: boolean;
  providerNotFound: boolean;
  isUnsupportedChain: boolean;
  connectWallet: (_chainId?: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [activeAccount, setActiveAccount] = useState<Address | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [isUnsupportedChain, setIsUnsupportedChain] = useState<boolean>(false);
  const [providerNotFound, setProviderNotFound] = useState<boolean>(false);

  const getProvider = useCallback((): EIP1193Provider | undefined => {
    return typeof window !== "undefined" ? window.ethereum : undefined;
  }, []);

  const connectWallet = useCallback(
    async (_chainId?: string) => {
      const provider = getProvider();
      if (!provider) {
        setProviderNotFound(true);
        setIsConnecting(false);
        return;
      }

      localStorage.setItem("walletAutoConnect", "true");
      let chainId;
      if (!_chainId) {
        const hexChainId = await provider.request({ method: "eth_chainId" });
        chainId = parseInt(hexChainId);
      } else {
        chainId = parseInt(_chainId);
      }
      if (chainId !== defaultChain.id) {
        setIsUnsupportedChain(true);
        setIsConnecting(false);
        return;
      }

      const _accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      setActiveAccount(_accounts[0]);
      setIsUnsupportedChain(false);
      setIsConnecting(false);
    },
    [getProvider],
  );

  useEffect(() => {
    const checkInitialState = async () => {
      const autoConnect = localStorage.getItem("walletAutoConnect") === "true";
      const provider = getProvider();
      if (autoConnect && provider) {
        await connectWallet();
      }
    };
    checkInitialState();
  }, [connectWallet, getProvider]);

  useEffect(() => {
    const provider = getProvider();

    if (provider?.on) {
      provider.on("chainChanged", connectWallet);
    }

    return () => {
      if (provider?.removeListener) {
        provider.removeListener("chainChanged", connectWallet);
      }
    };
  }, [connectWallet, getProvider]);

  if (isUnsupportedChain) {
    return (
      <div className="font-sans text-red-600 text-5xl text-center">
        Unsupported chain
      </div>
    );
  }

  const contextValues: WalletContextType = {
    activeAccount: activeAccount,
    isConnecting,
    isUnsupportedChain,
    providerNotFound,
    connectWallet,
  };

  return (
    <WalletContext.Provider value={contextValues}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
