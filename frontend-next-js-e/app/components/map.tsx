import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map as MapboxMap, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";
import { handleOnCreate, handleOnJoin, userAction } from "../webRTC/action";
import { setMediaConstraintsG, setRoomNoVar } from "../webRTC/globals";
import { setSocket, socket } from "../webRTC/socket";

interface MapProps {
  initialCenter: [number, number];
  initialZoom: number;
}

export default function Map({ initialCenter, initialZoom }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<MapboxMap | null>(null);
  const router = useRouter();

  const handleSendLocation = ({ latitude, longitude }: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "location",
          data: { latitude, longitude },
        })
      );
    } else {
      console.error("WebSocket is not open. readyState:", socket?.readyState);
    }
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
          resolve();
        }
        currentAttempt++;
      }, intervalTime);
    });
  };

  const initializeMap = () => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYXJuYXZndXB0YTMwMzUiLCJhIjoiY2x4NmlwZzdnMDhsZTJrc2c0YXplM3UyYyJ9.5CqvL3pP9iuudQ1F4L9alA";

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: initialCenter,
      zoom: initialZoom,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-left");

    map.on("load", () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setCenter([longitude, latitude]);
          map.setZoom(14);

          handleSendLocation({ latitude, longitude });

          const marker = new Marker()
            .setLngLat([longitude, latitude])
            .addTo(map);

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            "<div>You</div>"
          );

          marker.setPopup(popup);

          marker.getElement().addEventListener("mouseenter", () => {
            marker.togglePopup();
          });

          marker.getElement().addEventListener("mouseleave", () => {
            marker.togglePopup();
          });

          marker.getElement().addEventListener("click", () => {
            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);

            handleOnCreate();
            setRoomNoVar((latitude.toFixed(3) + longitude.toFixed(3)).toString());
            router.push("/room");
          });

          socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "location") {
                
              const listForLocations = data.payload;
              listForLocations.forEach((location: any) => {
                const { latitude, longitude } = location.data;
                console.log("Location:", location);
                const otherMarker = new mapboxgl.Marker()
                  .setLngLat([longitude, latitude])
                  .addTo(map!);

                const otherPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                  "<div>Someone else's location</div>"
                );

                otherMarker.setPopup(otherPopup);

                otherMarker.getElement().addEventListener("mouseenter", () => {
                  otherMarker.togglePopup();
                });

                otherMarker.getElement().addEventListener("mouseleave", () => {
                  otherMarker.togglePopup();
                });

                otherMarker.getElement().addEventListener("click", () => {
                  handleOnJoin();
                  setRoomNoVar((latitude.toFixed(3) + longitude.toFixed(3)).toString());
                  router.push("/room");

                  console.log("Latitude:", latitude);
                  console.log("Longitude:", longitude);
                });
              });
            }
          };
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    });

    setMap(map);
  };

  useEffect(() => {
    waitSocketConnection().then(() => {
      initializeMap();
    }).catch(() => {
      console.error("WebSocket connection failed.");
    });
  }, [initialCenter, initialZoom, router]);

  return (
    <div className="w-full h-full p-4 flex justify-center items-center">
      <div ref={mapContainerRef} className="w-5/6 h-5/6" />
    </div>
  );
}
