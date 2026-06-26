"use client";

import { getSocket } from "@/configs/socket";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
  useRef,
} from "react";
import { useWallet } from "./WalletContext";
import {
  Address,
  AuthStatusResponse,
  Bytes32,
  FRONTEND_DOMAIN,
  NonceResponseType,
} from "@repo/shared";
import { SiweMessage } from "siwe";
import {
  createWalletClient,
  custom,
  getAddress,
  type WalletClient,
} from "viem";

interface AuthContext {
  walletClient: WalletClient | null;
  siwe: () => Promise<void>;
  progress: string | null;
  isSiweAuth: boolean;
  profileId: Bytes32 | null;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<string | null>(null);
  const [isSiweAuth, setIsSiweAuth] = useState<boolean>(false);
  const [profileId, setProfileId] = useState<Bytes32 | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const { activeAccount, providerNotFound } = useWallet();

  const isSigningIn = useRef(false);
  const socket = getSocket();

  const fetchNonceOverSocket = useCallback(
    (account: Address): Promise<string> => {
      return new Promise((resolve, reject) => {
        const handleNonceResponse = (response: NonceResponseType) => {
          console.log("Nonce response recieved");
          clearTimeout(timeout);
          if (!response.success) {
            reject(new Error(response.error));
          } else {
            resolve(response.nonce);
          }
        };
        const timeout = setTimeout(() => {
          socket.off("siwe:provide_nonce", handleNonceResponse);
          reject(new Error("Nonce request timed out"));
        }, 5000);
        socket.once("siwe:provide_nonce", handleNonceResponse);
        socket.emit("siwe:request_nonce", { account });
      });
    },
    [socket],
  );

  const createSiweMessage = useCallback(
    async (address: Address, statement: string) => {
      if (providerNotFound) {
        throw new Error("Ethereum provider not found");
      }

      const nonce = await fetchNonceOverSocket(address);
      const origin = window.location.origin;
      const scheme = window.location.protocol.slice(0, -1);
      const checksummedAddress = getAddress(address);

      const message = new SiweMessage({
        scheme,
        domain: FRONTEND_DOMAIN,
        address: checksummedAddress,
        statement,
        uri: origin,
        version: "1",
        chainId: 31337,
        nonce,
      });
      return message;
    },
    [fetchNonceOverSocket, providerNotFound],
  );

  const siwe = useCallback(async () => {
    if (!activeAccount) {
      throw new Error("Wallet must be connected before signing in.");
    }

    if (isSiweAuth) {
      console.log("Already authenticated. Ignoring duplicate login request.");
      return;
    }
    const hasPendingToken = !!sessionStorage.getItem("siwe_session");
    if (hasPendingToken) {
      console.log("Existing token found. Waiting for server validation.");
      return;
    }

    if (isSigningIn.current) {
      console.log("Sign in already in progress, ignoring duplicate call.");
      return;
    }

    isSigningIn.current = true;

    try {
      setProgress("Requesting challenge from server...");
      const siweMessageObject = await createSiweMessage(
        activeAccount,
        "Sign in with Ethereum Wallet.",
      );
      const preparedMessage = siweMessageObject.prepareMessage();

      setProgress("Awaiting wallet signature...");
      const walletClient = createWalletClient({
        account: activeAccount,
        transport: custom(window.ethereum!),
      });

      const signature = await walletClient.signMessage({
        account: activeAccount,
        message: preparedMessage,
      });
      setWalletClient(walletClient);
      setProgress("Verifying signature with server...");
      socket.emit("siwe:verify", {
        message: preparedMessage,
        signature,
      });
    } catch (error) {
      setWalletClient(null);
      setProgress(null);
      console.error("SIWE flow execution aborted:", error);
    } finally {
      isSigningIn.current = false;
    }
  }, [activeAccount, createSiweMessage, socket]);

  useEffect(() => {
    const handleAuthResponse = (response: AuthStatusResponse) => {
      console.log("Auth status received:", response);

      if (response.success) {
        if (response.token) {
          sessionStorage.setItem("siwe_session", response.token);
          setIsSiweAuth(true);
        }

        if (response.profileId) {
          setProfileId(response.profileId);
          setProgress(null);
        }
      } else {
        setWalletClient(null);

        if (
          response.error === "missing_token" ||
          response.error === "expired_token"
        ) {
          sessionStorage.removeItem("siwe_session");
          if (isSiweAuth) setIsSiweAuth(false);
        }
      }

      isSigningIn.current = false;
    };
    socket.on("auth:status", handleAuthResponse);
    return () => {
      socket.off("auth:status", handleAuthResponse);
    };
  }, [socket]);

  useEffect(() => {
    if (!activeAccount) return;
    siwe();
  }, [activeAccount]);

  const contextValues: AuthContext = {
    walletClient,
    siwe,
    progress,
    isSiweAuth,
    profileId,
  };

  return (
    <AuthContext.Provider value={contextValues}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}
