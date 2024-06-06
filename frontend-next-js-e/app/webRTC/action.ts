"use client";

import { formData, roomNoVar } from "./globals";
import { v4 as uuid } from "uuid";

export var userAction = "";

export const handleOnJoin = () => {
  userAction = "joinRoom";
};

export const handleOnCreate = () => {
  userAction = "createRoom";
};

export const startingStep = async (type: string, socket: WebSocket,userName:String) => {
  const sendString = JSON.stringify({
    type: type,
    roomId: "room" + roomNoVar,
    userId: uuid(),
    userName: userName,
  });
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(sendString);
  } else {
    if (type === "createRoom") {
      window.location.replace("/");
    } else if (type === "joinRoom") {
      window.location.replace("/");
    }
  }
};

