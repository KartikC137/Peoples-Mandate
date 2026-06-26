"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | undefined;

export const getSocket = () => {
  if (!socket) {
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("siwe_session")
        : null;

    socket = io("http://localhost:4000", {
      transports: ["websocket"],
      autoConnect: true,
      auth: { token },
    });
  }

  return socket;
};
