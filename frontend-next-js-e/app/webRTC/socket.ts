import { addClient, getClients } from "./globals";

export var socket: WebSocket;



export var socketReadyState: boolean = false;
export const removeSocket = () => {
  socket?.close();
};


export const setSocket = () => {
  
  socket = new WebSocket("wss://disasterhub-q09r.onrender.com") ; //URL OF WEBSOCKET SERVER
  socket.onopen = () => {
    socketReadyState = true;
  };

  socket.onmessage = (event) => {

    const data = JSON.parse(event.data);
    if (data.type === "clientList") {
      var listClients = getClients();
      data.list.forEach((client: string) => {
        if (listClients.includes(client) === false) {
          addClient(client);
        }
      });
    }
  };
  return socket;
};