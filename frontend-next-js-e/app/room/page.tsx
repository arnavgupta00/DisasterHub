"use client";

import React, { useEffect, useRef, useState } from "react";
import Particles from "../components/particles";

import {
  addClient,
  getClients,
  mediaConstraintsG,
  roomNoVar,
  setStreamLocal,
  streamLocal,
  updateMediaStream,
} from "../webRTC/globals";
import { setSocket, socket } from "../webRTC/socket";
import { startingStep, userAction } from "../webRTC/action";
import "./styles.css";
import ReactPlayer from "react-player";
import {
  Eraser,
  Mic,
  MicOff,
  PhoneOff,
  Presentation,
  ScreenShare,
  Trash,
  Trash2,
  Video,
  VideoOff,
} from "lucide-react";
import {
  addTrackAddon,
  handleNegotiationNeededAnswer,
  handleRecieveAnswer,
  handleRecieveIceCandidate,
  handleRecieveOffer,
  peerConnectionList,
  peerConnectionListAdd,
  peerConnectionListRemove,
  peerConnectionListReset,
  peerConnectionListUpdate,
  sendOffer,
} from "../webRTC/peerConnection";

const Room: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localScreenShare, setLocalScreenShare] = useState<MediaStream>();

  const [rightCont, setRightCont] = useState<string>("chats");

  const [username, setUsername] = useState<string>("");
  const [nameSetBool, setNameSetBool] = useState<boolean>(true);
  const [remoteVideoTracks, setRemoteVideoTracks] = useState<
    MediaStreamTrack[]
  >([]);
  const [remoteAudioTracks, setRemoteAudioTracks] = useState<
    MediaStreamTrack[]
  >([]);

  const [localaStreamState, setLocalStreamState] = useState<MediaStream>();

  const [chatBoxMobile, setChatBoxMobile] = useState<boolean>(false);

  const [videoPremission, setVideoPremission] = useState<boolean>(
    mediaConstraintsG.video
  );
  const [audioPremission, setAudioPremission] = useState<boolean>(
    mediaConstraintsG.audio
  );

  const clientStreamMap = new Map<string, MediaStream>();

  const [usersInfo, setUsersInfo] = useState<
    { name: string; mediaStream: MediaStream; clientID: string }[]
  >([]);

  const [width, setWidth] = useState<number>(0);

  const [color, setColor] = useState<string>("black");
  const [showWhiteBoard, setShowWhiteBoard] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    message: string;
    userName: string;
    userId: string;
    date: Date;
  }>();

  const [messageList, setMessageList] =
    useState<
      { message: string; userName: string; userId: string; date: string }[]
    >();

  const updateName = (clientIdToUpdate: String, newName: string) => {
    setUsersInfo((prevUsersInfo) => {
      const indexToUpdate = prevUsersInfo.findIndex(
        (user) => user.clientID === clientIdToUpdate
      );

      if (indexToUpdate === -1) {
        return prevUsersInfo;
      }

      const updatedUsersInfo = [...prevUsersInfo];
      const updatedUserInfo = { ...updatedUsersInfo[indexToUpdate] };
      updatedUserInfo.name = newName;
      updatedUsersInfo[indexToUpdate] = updatedUserInfo;
      return updatedUsersInfo;
    });
  };

  const deleteUser = (clientID: string) => {
    setUsersInfo((prevUsersInfo) => {
      return prevUsersInfo.filter((user) => user.clientID !== clientID);
    });
  };

  const updateMediaStream = (
    clientIdToUpdate: string,
    newMediaStream: MediaStream,
    user: any
  ) => {
    setUsersInfo((prevUsersInfo) => {
      const indexToUpdate = prevUsersInfo.findIndex(
        (user) => user.clientID === clientIdToUpdate
      );

      if (indexToUpdate === -1) {
        return [
          ...prevUsersInfo,
          {
            name: user?.name || "name",
            mediaStream: newMediaStream,
            clientID: clientIdToUpdate,
          },
        ];
      }

      const updatedUsersInfo = [...prevUsersInfo];
      const updatedUserInfo = { ...updatedUsersInfo[indexToUpdate] };
      updatedUserInfo.mediaStream = newMediaStream;
      updatedUsersInfo[indexToUpdate] = updatedUserInfo;
      return updatedUsersInfo;
    });
  };

  const handleChat = (data: any) => {
    const dataN = {
      message: data.message,
      userName: data.senderName,
      userId: data.senderID,
      date: data.date,
    };

    setMessageList((prevList) => [...(prevList || []), dataN]);
  };
  const handleSendChat = (message: string) => {
    if (message === "") return;

    const dateLocale = new Date().toLocaleTimeString();

    socket.send(
      JSON.stringify({
        type: "chat",
        message: message,
        senderName: username,
        date: dateLocale,
      })
    );

    const data = {
      message: message,
      userName: username,
      userId: username,
      date: dateLocale,
    };

    setMessageList((prevList) => [...(prevList || []), data]);
    setMessage({
      message: "",
      userName: username,
      userId: username,
      date: new Date(),
    });
  };

  const connectionInitiator = async () => {
    socket.onmessage = async (event) => {
      const data = await JSON.parse(event.data);

      if (data.type === "offer") {
        if (data.negotiation) {
          await handleNegotiationNeededAnswer(data);
        } else {
          if (!peerConnectionList[data.senderID]) {
            peerConnectionListAdd(data.senderID);
            trackEventSetup(data.senderID, data);

            await handleRecieveOffer(data);
          }
        }
      } else if (data.type === "answer") {
        trackEventSetup(data.senderID, data);
        updateName(data.senderID, data.senderName);

        await handleRecieveAnswer(data, data.senderID);
      } else if (data.type === "candidate") {
        await handleRecieveIceCandidate(data);
      } else if (data.type === "clientList") {
        var listClients = getClients();
        data.list.forEach((client: string) => {
          if (listClients.includes(client) === false) {
            addClient(client);
          }
        });
      } else if (data.type === "chat") {
        handleChat(data);
      } else if (data.type === "disconnectUser") {
        window.location.replace("/");
      } else if (data.type === "userLeft") {
        disconnectUserFull(data.clienId);
      } else {
      }
    };
    socket.send(
      JSON.stringify({
        type: "clientList",

        target: "all",
      })
    );
  };

  const disconnectUserFull = (clientID: string) => {
    peerConnectionListRemove(clientID);
    clientStreamMap.delete(clientID);
    var users = usersInfo;
    deleteUser(clientID);
  };

  const trackEventSetup = (clientID: string, data: any) => {
    const pc = peerConnectionList[clientID];
    try {
      if (streamLocal) {
        streamLocal
          .getTracks()
          .forEach((track: any) => pc.addTrack(track, streamLocal));
      }
    } catch (err) {}

    pc.ontrack = (event: any) => {
      handleTrackEvent(event, clientID, data);
    };

    peerConnectionListUpdate(clientID, pc);
  };

  const handleTrackEvent = (event: any, clientID: string, data: any) => {
    const track = event.track;

    var user = usersInfo.find((user) => user.clientID == clientID);

    if (!user) {
      var mediaStreamT = clientStreamMap.get(clientID);

      if (mediaStreamT) {
        user = {
          name: data.senderName,
          mediaStream: mediaStreamT,
          clientID: clientID,
        };
      } else {
        user = {
          name: data.senderName,
          mediaStream: new MediaStream(),
          clientID: clientID,
        };

        clientStreamMap.set(clientID, user.mediaStream);
      }
    } else {
    }

    var mediaStream = user.mediaStream;

    if (!mediaStream) {
      return;
    }

    if (track.kind === "video") {
      mediaStream.getVideoTracks().forEach((track) => {
        mediaStream.removeTrack(track);
      });

      mediaStream.addTrack(track);
      setRemoteVideoTracks((prevTracks) => [...prevTracks, track]);
      loadTrack(clientID);

      const existingUserIndex = usersInfo.findIndex(
        (user) => user.clientID == clientID
      );

      updateMediaStream(clientID, mediaStream, user);
    }
    if (track.kind === "audio") {
      mediaStream.addTrack(track);
      setRemoteAudioTracks((prevTracks) => [...prevTracks, track]);
    }

    loadTrack(clientID);
  };

  const loadTrack = (clientID: string) => {
    const number = Math.ceil(
      Math.sqrt(
        Array.from(clientStreamMap.values()).length > 0
          ? Array.from(clientStreamMap.values()).length
          : 1
      )
    );

    setWidth(100 / number);
  };

  const startLocalStream = async () => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoPremission,
        audio: audioPremission,
      });
      setLocalStreamState(stream);
      setStreamLocal(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = streamLocal;
      }
    } catch (error) {
      console.error("Error accessing local media:", error);
    }
  };
  const removeAllTracksFromStream = (stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
      stream.removeTrack(track);
    });
  };
  const startScreenStream = async () => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: videoPremission,
        audio: audioPremission,
      });
      stream.getVideoTracks()[0].onended = async () => {
        deleteUser("0SCREEN");
        setLocalScreenShare(undefined);
        await startLocalStream();
        removeAllTracksFromStream(stream);
        addTrackAddon(streamLocal);
      };
      setLocalStreamState(stream);
      setLocalScreenShare(stream);

      setUsersInfo((prevUsersInfo) => [
        ...prevUsersInfo,
        {
          name: "Screen Share",
          mediaStream: stream,
          clientID: "0SCREEN",
        },
      ]);

      await addTrackAddon(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = streamLocal;
      }
    } catch (error) {
      console.error("Error accessing local media:", error);
    }
  };

  const manageStreamControls = (changeNeeded: string) => {
    const localStream = streamLocal;
    const audioTrack = localStream.getAudioTracks()[0];
    const videoTrack = localStream.getVideoTracks()[0];

    if (audioTrack && !audioPremission && changeNeeded === "audio") {
      audioTrack.enabled = true;
      setAudioPremission(true);
    }
    if (videoTrack && !videoPremission && changeNeeded === "video") {
      videoTrack.enabled = true;
      setVideoPremission(true);
    }
    if (audioTrack && audioPremission && changeNeeded === "audio") {
      audioTrack.enabled = false;
      setAudioPremission(false);
    }

    if (videoTrack && videoPremission && changeNeeded === "video") {
      videoTrack.enabled = false;
      setVideoPremission(false);
    }
  };

  const handleFormSubmit = (event: any) => {
    event.preventDefault();
    handleSendChat(message?.message || "");
  };

  const waitSocketConnection = () => {
    return new Promise<void>((resolve, reject) => {
      const maxNumberOfAttempts = 10;
      const intervalTime = 300;

      setSocket();

      let currentAttempt = 0;
      const interval = setInterval(async () => {
        if (currentAttempt > maxNumberOfAttempts - 1) {
          clearInterval(interval);
          reject();

          window.location.replace("/");
        } else if (socket?.readyState === WebSocket.OPEN) {
          clearInterval(interval);
          startingStep(userAction, socket, username);

          var clientList = getClients();
          const clientListSet = new Set(clientList);
          clientList = Array.from(clientListSet);

          await startLocalStream();
          connectionInitiator();
          resolve();
        }
        currentAttempt++;
      }, intervalTime);
    });
  };
  const fetchData = async () => {
    await waitSocketConnection();
  };

  const handleStartVideoButton = () => {
    const clientList = getClients();
    const clientListSet = new Set(clientList);
    const clientListArray = Array.from(clientListSet);
    clientListArray.forEach(async (client) => {
      if (!peerConnectionList[client]) {
        peerConnectionListAdd(client);
        await sendOffer(client);
      }
    });
  };
  useEffect(() => {
    return () => {
      const tracks = streamLocal?.getTracks();
      tracks && tracks.forEach((track: MediaStreamTrack) => track.stop());

      var clientList = getClients();
      const clientListSet = new Set(clientList);
      clientList = Array.from(clientListSet);
      if (socket?.readyState === WebSocket.OPEN) {
        socket.close();
      }
      peerConnectionListReset();
    };
  }, []);
  const copyToClipboard = () => {
    const textToCopy = `${roomNoVar}`;
    navigator.clipboard.writeText(textToCopy);
    alert("Copied to clipboard");
  };
  const handleContinueButtonClick = () => {
    setNameSetBool(false);
    fetchData();
  };

  return (
    <div className="w-screen h-screen" style={{ overflow: "hidden" }}>
      <Particles
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={100}
      />
      {nameSetBool && (
        <div className="overlay" id="overlay">
          <div className="box">
            <div className="head-name">Enter a Name</div>
            <input
              type="text"
              className="name-field"
              placeholder="Type here.."
              id="name-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              className="continue-name"
              onClick={handleContinueButtonClick}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      <div className="w-full h-full flex flex-row justify-center items-center">
        <Particles
          className="absolute inset-0 -z-10 animate-fade-in"
          quantity={100}
        />
        <div className="w-5/6 h-full  ">
          <Particles
            className="absolute inset-0 -z-10 animate-fade-in"
            quantity={100}
          />
          <div
            className="h-5/6 bg-transparent p-2"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: "100%",
              maxHeight: "90%",
              gap: "1rem",
              flexWrap: "wrap",
            }}
            id="vcont"
          >
            {usersInfo.length === 0
              ? userAction == "joinRoom" && (
                  <button
                    className="w-62 h-4 text-center p-4 pb-8 bg-black text-white rounded "
                    onClick={() => handleStartVideoButton()}
                  >
                    Click To Join
                  </button>
                )
              : null}

            {usersInfo.length > 0 &&
              Array.from(new Set(usersInfo)).map((user) => {
                const widthT =
                  100 /
                  Math.ceil(
                    Math.sqrt(usersInfo.length > 0 ? usersInfo.length : 1)
                  );
                if (user.mediaStream.getVideoTracks().length > 0 || 1 == 1) {
                  return (
                    <div
                      className="flex flex-col justify-center items-center p-0 "
                      style={{
                        maxWidth: `${widthT - 3}%`,
                        maxHeight: `${widthT - 3}%`,
                      }}
                    >
                      <ReactPlayer
                        className="w-full h-ful"
                        style={{
                          maxWidth: `${widthT}%`,
                          maxHeight: `${widthT}%`,
                        }}
                        key={user.clientID ?? "0"}
                        playing
                        url={user.mediaStream}
                        muted={
                          (user.clientID ?? "0") == "0SCREEN" ? true : false
                        }
                      />
                      <div className="nametag text-white" id="myname">
                        {(user.clientID ?? "0") == "0SCREEN"
                          ? `${username} (Your Screen)`
                          : usersInfo.find((u) => u.clientID === user.clientID)
                              ?.name}
                      </div>
                      {!user.mediaStream.getAudioTracks()[0]?.enabled && (
                        <div className="mute-icon text-red-500" id="mymuteicon">
                          <MicOff />
                        </div>
                      )}
                      {!user.mediaStream.getVideoTracks()[0]?.enabled && (
                        <div className="video-off" id="myvideooff">
                          Video Off
                        </div>
                      )}
                    </div>
                  );
                }
              })}
          </div>

          <div className="h-1/6 p-2">
            <div className="utils flex flex-row justify-center items-center gap-4">
              <div className="audio flex flex-row justify-center items-center">
                {videoPremission ? (
                  <Video
                    style={{ color: "white" }}
                    onClick={() => {
                      manageStreamControls("video");
                    }}
                  />
                ) : (
                  <VideoOff
                    style={{ color: "white" }}
                    onClick={() => {
                      manageStreamControls("video");
                    }}
                  />
                )}
              </div>
              <div className="audio flex flex-row justify-center items-center">
                {audioPremission ? (
                  <Mic
                    style={{ color: "white" }}
                    onClick={() => {
                      manageStreamControls("audio");
                    }}
                  />
                ) : (
                  <MicOff
                    style={{ color: "white" }}
                    onClick={() => {
                      manageStreamControls("audio");
                    }}
                  />
                )}
              </div>
              <div className="audio flex flex-row justify-center items-center">
                <ScreenShare
                  style={{ color: "white" }}
                  onClick={() => startScreenStream()}
                />
              </div>
              {/* <div className="audio flex flex-row justify-center items-center">
                <Presentation
                  style={{ color: "white" }}
                  onClick={() => {
                    setShowWhiteBoard(!showWhiteBoard);
                    connectionInitiator();
                  }}
                />
              </div> */}
              <div className="cutcall tooltip flex flex-row justify-center items-center">
                <PhoneOff
                  style={{ color: "white" }}
                  onClick={() => {
                    window.location.replace("/");
                  }}
                />
              </div>
            </div>
            <div className="p-4 bg-transparent opacity-20 w-2/12">
              <button
                className="p-4 bg-white text-black rounded-full w-full mt-4"
                onClick={() => copyToClipboard()}
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>

        <div
          className="w-1/6 h-full bg-gray-700 "
          style={{ backgroundColor: "#333333" }}
        >
          <Particles
            className="absolute inset-0 -z-10 animate-fade-in"
            quantity={100}
          />
          <div className="h-3/12">
            {localaStreamState && (
              <div className="video-box p-0">
                <ReactPlayer
                  className="w-full h-ful"
                  style={{
                    display: "inline",
                  }}
                  key={"local"}
                  playing
                  url={localaStreamState}
                  muted
                />
              </div>
            )}
          </div>
          <div className="h-2/3 flex flex-col gap-4 justify-between">
            <div className=" flex flex-row justify-center gap-4 items-center mt-4 h-1/6">
              <div
                className="p-2 pl-4 pr-4  bg-black text-white"
                onClick={() => setRightCont("chats")}
              >
                <i className="" />
                Chats
              </div>
              <div
                className="p-2 pl-4 pr-4  bg-black text-white"
                onClick={() => setRightCont("attendies")}
              >
                <i className="fas fa-users mr-1" />
                Attendants
              </div>
            </div>
            <div
              className="h-5/6 flex flex-col gap-4"
              style={{ minHeight: "80%" }}
            >
              {rightCont == "chats" && (
                <div
                  className="min-h-3/3"
                  style={{
                    overflowY: "scroll",
                    minHeight: "80%",
                    overflowX: "hidden",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#888888 #333333",
                  }}
                >
                  {messageList &&
                    messageList.map((message) => {
                      return (
                        <div className="flex flex-col justify-center items-start p-2">
                          <div className="flex flex-row justify-between items-start">
                            <div className="text-s">{message.userName}</div>
                            <div className="m-1 text-xs ">{message.date}</div>
                          </div>
                          <div className="text-lg text-white">
                            {message.message}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
              {rightCont == "chats" && (
                <div
                  className="mt-8 flex flex-row justify-center items-center p-2"
                  style={{ maxHeight: "10vh" }}
                >
                  <div className="">
                    <input
                      type="text"
                      className="text-black  w-full h-10 p-2 pl-4 pr-4 bg-white"
                      placeholder="Type here.."
                      onChange={(e) =>
                        setMessage({
                          message: e.target.value,
                          userName: username,
                          userId: username,
                          date: new Date(),
                        })
                      }
                    />
                  </div>
                  <div className="">
                    <button
                      className="text-white bg-black p-2 pl-4 pr-4"
                      onClick={(e) => handleFormSubmit(e)}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {rightCont == "attendies" && (
                <div className="h-2/3 flex flex-col gap-4 p-4">
                  <div className="">
                    <div className="">
                      <div className=" text-white">{username} (you)</div>
                    </div>
                  </div>
                  {usersInfo &&
                    Array.from(new Set(usersInfo)).map((user) => {
                      return (
                        <div className="">
                          <div className="">
                            <div className=" text-white mr-4">{user.name} </div>
                            {userAction == "createRoom" && (
                              <PhoneOff
                                size={16}
                                onClick={() => {
                                  disconnectUserFull(user.clientID);

                                  socket.send(
                                    JSON.stringify({
                                      type: "disconnectUser",
                                      target: user.clientID,
                                    })
                                  );
                                }}
                                color="red"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
