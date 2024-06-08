"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import Particles from "../components/particles";
import { setMediaConstraintsG, setRoomNoVar } from "../webRTC/globals";
import { handleOnCreate, handleOnJoin, userAction } from "../webRTC/action";
import { useRouter } from "next/navigation";
import Map from "@/app/components/map";
import { setSocket, socket } from "../webRTC/socket";
export default function Page() {
  const router = useRouter();

  useEffect(() => {}, []);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
      <Particles
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={100}
      />
        <Map initialCenter={[-96, 37.8]} initialZoom={3} />

      {/* <div className="w-1/3 h-1/3 flex flex-row flex-wrap bg-transparent justify-center items-center gap-12">
        <button
          onClick={() => {
            setRoomNoVar("Room1");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          1
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room2");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          2
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room3");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          3
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room4");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          4
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room5");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          5
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room6");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          6
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room7");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          7
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room8");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          8
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room9");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          9
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room10");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          10
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room11");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          11
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room12");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          12
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room13");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          13
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room14");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          14
        </button>
        <button
          onClick={() => {
            setRoomNoVar("Room15");
            handleOnJoin();
            router.push("/room");
            
          }}
          className="rounded-full w-1/12 h-1/12 bg-white opacity-75 text-gray-950 font-semibold	 text-lg"
        >
          15
        </button>
      </div> */}
    </div>
  );
}
