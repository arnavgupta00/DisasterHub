const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

app.get("/", (req, res) => {
  res.send("Server is running.");
});

const rooms = {};
const rooomClients = {};
const roomList = [
  "roomRoom1",
  "roomRoom2",
  "roomRoom3",
  "roomRoom4",
  "roomRoom5",
  "roomRoom6",
  "roomRoom7",
  "roomRoom8",
  "roomRoom9",
  "roomRoom10",
  "roomRoom11",
  "roomRoom12",
  "roomRoom13",
  "roomRoom14",
  "roomRoom15",
];

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    switch (data.type) {
      case "joinRoom":
        handleJoinRoom(ws, data);
        break;
      case "createRoom":
        handleCreateRoom(ws, data);
        break;
      case "offer":
        handleOffer(ws, data);
        break;
      case "answer":
        handleAnswer(ws, data);
        break;
      case "iceCandidate":
        handleIceCandidate(ws, data);
        break;
      case "disconnect":
        handleDisconnect(ws);
        break;
      case "clientList":
        handleClientList(ws);
        break;
      case "chat":
        handleChat(ws, data);
        break;
      case "getCanvas":
        sendCanvasData(ws);
        break;
      case "draw":
        handleDraw(ws, data);
        break;
      case "storeCanvas":
        handleStoreCanvas(ws, data);
        break;
      case "clearBoard":
        handleClearBoard(ws.roomId);
        break;
      case "disconnectUser":
        handleDisconnectUser(ws, data);
      default:
        console.log(message);
    }
  });
  ws.on("close", () => {
    handleDisconnect(ws);
  });
});

const handleDisconnectUser = (ws, data) => {
  const clientsArray = Array.from(wss.clients);
  const roomId = ws.roomId;
  const client = clientsArray.find((client) => client.id === data.target);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(
      JSON.stringify({
        type: "disconnectUser",
        target: data.target,
      })
    );
  }
  const index = rooms[roomId].findIndex((user) => user.id === data.target);
  if (index > -1) {
    rooms[roomId].splice(index, 1);
  }
};

const generateClientId = () => {
  return Math.random().toString(36).substring(7);
};

const handleJoinRoom = (ws, data) => {
  const { roomId, userId, userName } = data;
  console.log(roomId);//
  if (roomList.includes(roomId)) {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
      rooomClients[roomId] = [];
    }
  }

  if (!rooms[roomId]) {
    ws.send(
      JSON.stringify({
        type: "error",
        payload: "roomDNE",
      })
    );
  } else {
    const clientId = generateClientId();
    ws.roomId = roomId;
    rooms[roomId].push({ id: clientId, userId });
    ws.id = clientId;
    ws.userName = userName;

    const clientsArray = Array.from(wss.clients);

    rooms[roomId].forEach((user) => {
      rooomClients[roomId].push(user.id);
      const client = clientsArray.find((client) => client.id === user.id);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "userJoined",
            payload: { userId, socketId: clientId, allUsers: rooms[roomId] },
          })
        );
      }
    });
  }
};

const handleClientList = (ws) => {
  const roomId = ws.roomId;
  const clientsArray = Array.from(wss.clients);

  rooms[roomId].forEach((user) => {
    rooomClients[roomId].push(user.id);
  });

  const listClientsSet = new Set(rooomClients[roomId]);
  const listClients = Array.from(listClientsSet);

  const listCPY = listClients.filter((id) => id !== ws.id);

  rooms[roomId].forEach((user) => {
    const client = clientsArray.find((client) => client.id === user.id);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "clientList",
          list: listCPY,
        })
      );
    }
  });
};

const handleCreateRoom = (ws, data) => {
  const { roomId, userId, userName } = data;

  if (!rooms[roomId]) {
    rooms[roomId] = [];
    rooomClients[roomId] = [];
  }
  const clientId = generateClientId();
  ws.roomId = roomId;
  ws.id = clientId;
  ws.userName = userName;

  rooms[roomId].push({ id: ws.id, userId });
  rooomClients[roomId].push(ws.id);

  ws.send(
    JSON.stringify({
      type: "allUsers",
      payload: rooms[roomId],
    })
  );
};

const handleOffer = (ws, data) => {
  const clientsArray = Array.from(wss.clients);
  rooms[ws.roomId].forEach((user) => {
    const client = clientsArray.find((client) => client.id === user.id);
    if (client.id === data.target && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "offer",
          payloadOffer: data.offer,
          senderID: ws.id,
          senderName: ws.userName,
          negotiation: data.negotiation,
        })
      );
    }
  });
};

const handleAnswer = (ws, data) => {
  const clientsArray = Array.from(wss.clients);
  rooms[ws.roomId].forEach((user) => {
    const client = clientsArray.find((client) => client.id === user.id);
    if (client.id === data.target && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "answer",
          answer: data.answer,
          senderID: ws.id,
          senderName: ws.userName,
          negotiation: data.negotiation,
        })
      );
    }
  });
};

const handleIceCandidate = (ws, data) => {
  const clientsArray = Array.from(wss.clients);

  rooms[ws.roomId].forEach((user) => {
    const client = clientsArray.find((client) => client.id === user.id);
    if (client.id === data.target && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "candidate",
          candidate: data.candidate,
          senderID: ws.id,
          senderName: ws.userName,
        })
      );
    }
  });
};

const handleChat = (ws, data) => {
  const clientsArray = Array.from(wss.clients);
  rooms[ws.roomId].forEach((user) => {
    const client = clientsArray.find((client) => client.id === user.id);
    if (client.id !== ws.id && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "chat",
          message: data.message,
          senderID: ws.id,
          senderName: data.senderName,
          date: data.date,
        })
      );
    }
  });
};

const handleDisconnect = (ws) => {
  const roomId = ws.roomId;
  if (rooms[roomId]) {
    const index = rooms[roomId].findIndex((user) => user.id === ws.id);
    if (index > -1) {
      rooms[roomId].splice(index, 1);
    }

    if (rooms[roomId].length === 0) {
      delete rooms[roomId];
    } else {
      const clientsArray = Array.from(wss.clients);
      rooms[roomId].forEach((user) => {
        const client = clientsArray.find((client) => client.id === user.id);
        if (client && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "userLeft",
              clienId: ws.id,
              userName: ws.userName,
            })
          );
        }
      });
    }
  }
};

const sendCanvasData = (ws) => {
  const roomId = ws.roomId;
  if (rooms[roomId] && rooms[roomId].canvasData) {
    ws.send(
      JSON.stringify({ type: "getCanvas", canvas: rooms[roomId].canvasData })
    );
  }
};

const handleDraw = (ws, data) => {
  const roomId = ws.roomId;
  if (rooms[roomId]) {
    const clientsArray = Array.from(wss.clients);
    rooms[roomId].forEach((user) => {
      const client = clientsArray.find((client) => client.id === user.id);
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
};

const handleStoreCanvas = (ws, data) => {
  const roomId = ws.roomId;
  if (rooms[roomId]) {
    rooms[roomId].canvasData = data.canvasData;
  }
};
const getStoreCanvas = (data) => {
  const roomId = data.roomId;
  rooms[roomId].forEach((user) => {
    const client = clientsArray.find((client) => client.id === user.id);
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "onStoreCanvas",
          canvas: rooms[roomId].canvasData,
        })
      );
    }
  });
};

const handleClearBoard = (roomId) => {
  if (rooms[roomId]) {
    rooms[roomId].canvasData = null;
    const clientsArray = Array.from(wss.clients);
    rooms[roomId].forEach((user) => {
      const client = clientsArray.find((client) => client.id === user.id);
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "clearBoard" }));
      }
    });
  }
};

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
