import { Socket } from "socket.io";
import http from "http";

import express from "express";
import { Server } from "socket.io";
import { UserManager } from "./managers/UserManger";
import { RoomManager } from "./managers/RoomManager";

const app = express();
const server = http.createServer(http);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const userManager = new UserManager();
const roomManager = new RoomManager();

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  userManager.addUser("randomName", socket);

  // Listen for chat messages
  socket.on("chat-message", ({ message }) => {
    const roomId = roomManager.getRoomIdForSocket(socket.id);
    if (roomId) {
      const otherUserSockets = roomManager.getOtherUserSocketsInRoom(
        roomId,
        socket.id
      );
      otherUserSockets.forEach((otherSocket: Socket) => {
        otherSocket.emit("chat-message", { message });
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    userManager.removeUser(socket.id);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
