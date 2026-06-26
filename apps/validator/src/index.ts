import { createServer } from "node:http";
import { generateNonce, SiweMessage } from "siwe";
import { type Address } from "viem";
import { initSocket } from "./configs/socket";
import type { Socket } from "socket.io";
import {
  FRONTEND_DOMAIN,
  BACKEND_PORT,
  type Bytes32,
  EMPTY_BYTES32,
} from "@repo/shared";
import { fetchProfileId } from "./contractCallers/profileIdUtil";

interface SessionData {
  walletAddress: Address;
  profileId: Bytes32 | null;
  expiresAt: number;
}

const sessions = new Map<string, SessionData>();
const SESSION_TTL = 24 * 60 * 60 * 1000;

declare module "socket.io" {
  interface Socket {
    nonce?: string;
    walletAddress?: Address;
    isSiweAuth?: boolean;
    profileId?: Bytes32;
  }
}

const httpServer = createServer();
const io = initSocket(httpServer);

io.on("connection", (socket: Socket) => {
  const token = socket.handshake.auth?.token;
  console.log(`Socket connected: ${socket.id}`, token);

  if (token) {
    const activeSession = sessions.get(token);

    if (activeSession) {
      if (Date.now() < activeSession.expiresAt) {
        socket.walletAddress = activeSession.walletAddress;
        socket.isSiweAuth = true;
        socket.profileId = activeSession.profileId || undefined;
        socket.emit("auth:status", {
          token: token,
          success: true,
          walletAddress: activeSession.walletAddress,
          profileId: activeSession.profileId,
        });
      } else {
        sessions.delete(token);
        socket.emit("auth:status", { success: false, error: "expired_token" });
      }
    } else {
      socket.emit("auth:status", {
        success: false,
        error: "missing_token",
      });
    }
  }

  socket.on("siwe:request_nonce", (account: Address) => {
    try {
      if (!account) {
        socket.emit("provide_nonce", {
          success: false,
          error: "missing_account",
        });
        return;
      }
      const nonce = generateNonce();
      socket.nonce = nonce;
      socket.emit("siwe:provide_nonce", {
        success: true,
        nonce,
      });
    } catch (error) {
      console.error("Nonce generation failed:", error);
      socket.emit("auth:status", {
        success: false,
        error: "server_error",
      });
    }
  });

  socket.on(
    "siwe:verify",
    async (data: { message: string; signature: string }) => {
      try {
        const { message, signature } = data;

        if (!message || !signature) {
          socket.isSiweAuth = false;
          socket.emit("auth:status", {
            success: false,
            error: "missing_payload",
          });
          return;
        }

        const siweMessage = new SiweMessage(message);
        const expectedNonce = socket.nonce;

        if (!expectedNonce || siweMessage.nonce !== expectedNonce) {
          socket.isSiweAuth = false;

          socket.emit("auth:status", {
            success: false,
            error: "nonce_mismatch",
          });
          return;
        }

        const validation = await siweMessage.verify({
          signature,
          nonce: expectedNonce,
          domain: FRONTEND_DOMAIN,
        });

        if (!validation.success) {
          socket.isSiweAuth = false;

          socket.emit("auth:status", {
            success: false,
            error: "invalid_signature",
          });
          return;
        }

        socket.nonce = undefined;
        const verifiedAddress = siweMessage.address as Address;
        socket.walletAddress = verifiedAddress;
        socket.isSiweAuth = true;

        for (const [existingToken, sessionData] of sessions.entries()) {
          if (sessionData.walletAddress === verifiedAddress) {
            sessions.delete(existingToken);
            console.log(`Cleaned up orphaned session for ${verifiedAddress}`);
          }
        }

        const sessionToken = crypto.randomUUID();

        const onChainProfileId = await fetchProfileId(verifiedAddress);
        console.log("on chain profile id fetched", onChainProfileId);
        const profileId =
          onChainProfileId === EMPTY_BYTES32 ? null : onChainProfileId;

        socket.profileId = profileId || undefined;

        sessions.set(sessionToken, {
          walletAddress: verifiedAddress,
          profileId: profileId,
          expiresAt: Date.now() + SESSION_TTL,
        });
        socket.emit("auth:status", {
          token: sessionToken,
          success: true,
          walletAddress: verifiedAddress,
          profileId: profileId,
        });
      } catch (error) {
        console.error("SIWE signature parsing crash:", error);
        socket.emit("auth:status", {
          success: false,
          error: "server_error",
        });
      }
    },
  );
  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
  });
});

httpServer.listen(BACKEND_PORT, () => {
  console.log(
    `Bun Validator Server running on http://localhost:${BACKEND_PORT}`,
  );
});
