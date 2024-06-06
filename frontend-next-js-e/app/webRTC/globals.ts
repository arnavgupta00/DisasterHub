"use client";

export const userList: {name: string, mediaStream?: MediaStream, clientID: String}[] = [];

export const addUser = (user: {name:string , mediaStream?: MediaStream , clientID : String}) => {
    userList.find((u) => u.clientID === user.clientID) ? userList : userList.push(user);
  
};

export const updateMediaStream = (clientID: String, mediaStream: MediaStream) => {
    userList.forEach((user) => {
        if(user.clientID === clientID){
        user.mediaStream = mediaStream;
        }
    });
    
}

export const mediaConstraintsG = {
    video: true,
    audio: true,
};

export const setMediaConstraintsG = ({video, audio}: {video: boolean, audio: boolean}) => {
    mediaConstraintsG.video = video;
    mediaConstraintsG.audio = audio;
}

export var roomNoVar: any = 0;

export const setRoomNoVar = (value: any) => {
  roomNoVar = value;
};

export var authenticationObject: {
  authenticated: boolean,
  user: {
    email: string,
    name: string,
    id: string
    servers: string[]
  }
};

export const setAuthenticatedObject = (authenticated: boolean, email: string, name: string, id: string, servers:string[]) => {
  authenticationObject = {
    authenticated,
    user: {
      email,
      name,
      id,
      servers
    }
  };
};



export var tempaa: number = 0;

export const setTempaa = (value: number) => {
  tempaa = value;
};

export var streamLocal: MediaStream;

export const setStreamLocal = (value: MediaStream) => {
  streamLocal = value;
};

export const formData = {
  userName: "",
  userEmail: "",
  userRoomNumber: "1111",
};

export const setFormData = (data: any) => {
  formData.userName = data.userName;
  formData.userEmail = data.userEmail;
  formData.userRoomNumber = data.userRoomNumber;
  setRoomNoVar(data.userRoomNumber);
};



let clients: string[] = [];

export const addClient = (id: string) => {
  clients.push(id);
};

export const removeClient = (id: string) => {
  clients = clients.filter((client) => client !== id);
};

export const getClients = () => {
  return [...clients];
};
