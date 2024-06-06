"use client";

import { addUser, getClients, streamLocal } from "./globals";
import { socket } from "./socket";

export var peerConnectionList: Record<string, RTCPeerConnection> = {};

export const peerConnectionListAdd = (clientID: string) => {
  peerConnectionList[clientID] = new RTCPeerConnection(configuration);
};
export const peerConnectionListRemove = (clientID: string) => {

  peerConnectionList[clientID].close();
  delete peerConnectionList[clientID];

}

export const peerConnectionListReset = () => {
  peerConnectionList = {};

}

export const peerConnectionListUpdate = (
  clientID: string,
  pc: RTCPeerConnection
) => {
  peerConnectionList[clientID] = pc;
};

export const configuration = {
  iceServers: [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "9f34e381594b9c5b5f50e39a",
      credential: "Fz9ZL2lv7tc+TVc1",
    },
  ],
};

export const sendOffer = async (client: string) => {
  eventlistenerSetup(client);


  const offer = await peerConnectionList[client].createOffer();
  await peerConnectionList[client].setLocalDescription(offer);
  socket.send(
    JSON.stringify({
      type: "offer",
      offer: offer,
      target: client,
    })
  );

};

const handleNegotiationNeededOffer = async (client: string) => {
  if (peerConnectionList[client]) {
    const offer = await peerConnectionList[client].createOffer();
    await peerConnectionList[client].setLocalDescription(offer);
    socket.send(
      JSON.stringify({
        type: "offer",
        offer: offer,
        target: client,
        negotiation: true,
      })
    );

  }
};
export const handleNegotiationNeededAnswer = async (data: any) => {
  try {

    if (!peerConnectionList[data.senderID]) return;  

    const remoteDescription = data.payloadOffer
      ? new RTCSessionDescription(data.payloadOffer)
      : null;
    if (!remoteDescription) return; 

    await peerConnectionList[data.senderID].setRemoteDescription(
      remoteDescription
    );
    const answer = await peerConnectionList[data.senderID].createAnswer();

    await peerConnectionList[data.senderID].setLocalDescription(answer);

    socket.send(
      JSON.stringify({
        type: "answer",
        answer: answer,
        target: data.senderID,
        negotiation: true,
      })
    );

  } catch (error) {
  }
};

const sendAnswer = async (data: any) => {


  addUser({ name: data.senderName, clientID: data.senderID });
  eventlistenerSetup(data.senderID);

  negotiationEventlistenerSetup(data.senderID);

  if (!peerConnectionList[data.senderID]) return; 

  const remoteDescription = data.payloadOffer
    ? new RTCSessionDescription(data.payloadOffer)
    : null;
  if (!remoteDescription) return;

  await peerConnectionList[data.senderID].setRemoteDescription(
    remoteDescription
  );
  const answer = await peerConnectionList[data.senderID].createAnswer();

  await peerConnectionList[data.senderID].setLocalDescription(answer);

  socket.send(
    JSON.stringify({
      type: "answer",
      answer: answer,
      target: data.senderID,
    })
  );

 
  socket.send(
    JSON.stringify({
      type: "clientList",

      target: "all",
    })
  );

};

const handleIceCandidate = (event: any, clientId: any) => {

  if (event.candidate && peerConnectionList[clientId]) {
    socket.send(
      JSON.stringify({
        type: "iceCandidate",
        candidate: event.candidate,
        target: clientId,
      })
    );

  }
};

export const handleRecieveIceCandidate = async (data: any) => {
  if (peerConnectionList[data.senderID]) {
    try {
      const candidate = new RTCIceCandidate(data.candidate);
      await peerConnectionList[data.senderID].addIceCandidate(candidate);

    } catch (err) {
      
    }
  }
};

export const handleRecieveOffer = async (data: any) => {
  
  await sendAnswer(data);
};

export const handleRecieveAnswer = async (data: any, client: string) => {
  try {
    if (data.answer) {
     

      addUser({ name: data.senderName, clientID: data.senderID });

      if (peerConnectionList[data.senderID]) {

        await peerConnectionList[data.senderID].setRemoteDescription(
          new RTCSessionDescription(data.answer)
        ); 

        

      }
    }
  } catch (error) {
  }
};

export const addTrackAddon = async (stream: MediaStream) => {
  var clientList = getClients();
  const clientListSet = new Set(clientList);
  clientList = Array.from(clientListSet);


  clientList.forEach((client: any) => {
    if (stream) {
      if (peerConnectionList[client]) {
        try {
          negotiationEventlistenerSetup(client);
          stream
            .getTracks()
            .forEach((track) =>
              peerConnectionList[client].addTrack(track, stream)
            );
          
        } catch (err) {
        }
      }
    }
  });
};

const eventlistenerSetup = (clientID: string) => {
  peerConnectionList[clientID].onicecandidate = (event) =>
    handleIceCandidate(event, clientID);

  peerConnectionList[clientID].oniceconnectionstatechange = () => {
    
    if (peerConnectionList[clientID].iceConnectionState === "connected") {
    } else if (
      peerConnectionList[clientID].iceConnectionState === "disconnected"
    ) {

      
    }
  };
};

const negotiationEventlistenerSetup = (clientID: string) => {
  peerConnectionList[clientID].onnegotiationneeded = async () => {
    await handleNegotiationNeededOffer(clientID);
  };
};


const handleDisconnect = () => {
 

  var clientList = getClients();
  const clientListSet = new Set(clientList);
  clientList = Array.from(clientListSet);
  if (socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
  clientList.forEach((client) => {
    if (peerConnectionList[client]) {
      peerConnectionList[client].close();
    }
  });
  window.location.replace("/");
};
