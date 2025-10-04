import { io } from "socket.io-client";
import { getToken } from "./auth";

export const socket = io("http://localhost:4000", {
  auth: { token: getToken() || "" }
});

