import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { handleOnCreate, handleOnJoin } from "../webRTC/action";
import { setRoomNoVar } from "../webRTC/globals";
import { useRouter } from "next/navigation";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYXJuYXZndXB0YTMwMzUiLCJhIjoiY2x4NmlwZzdnMDhsZTJrc2c0YXplM3UyYyJ9.5CqvL3pP9iuudQ1F4L9alA";

interface Event {
  id: string;
  title: string;
  description: string | null;
  geometry: Array<{ coordinates?: [number, number] }>;
}

interface MapComponentProps {
  events: Event[];
}

const MapComponent: React.FC<MapComponentProps> = ({ events }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v10",
        center: [-96, 37.8],
        zoom: 3,
      });

      mapRef.current.on("load", () => {
        updateMap();
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      updateMap();
    }
  }, [events]);

  const updateMap = () => {
    const map = mapRef.current;
    if (!map) return;

    if (map.getLayer("event-layer")) map.removeLayer("event-layer");
    if (map.getSource("events")) map.removeSource("events");

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: events.flatMap((event) =>
        event.geometry.map((geo) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: geo.coordinates!,
          },
          properties: {
            title: event.title,
            description: event.description,
          },
        }))
      ),
    };

    map.addSource("events", {
      type: "geojson",
      data: geojson,
    });

    map.addLayer({
      id: "event-layer",
      type: "circle",
      source: "events",
      paint: {
        "circle-radius": 6,
        "circle-color": "#FF4136",
        "circle-stroke-width": 1,
        "circle-stroke-color": "#FFFFFF",
      },
    });

    map.on("click", "event-layer", (e) => {
      if (e.features && e.features[0] && e.features[0].properties && e.features[0].properties.title) {
        const titleWithOutSpaces = e.features[0].properties.title.replace(
          /\s/g,
          ""
        );
        console.log(titleWithOutSpaces);

        handleOnCreate();
        setRoomNoVar(titleWithOutSpaces);
        router.push("/room");
      }

      // if (e.features && e.features[0].geometry.type === "Point") {
      //   const coordinates = e.features[0].geometry.coordinates.slice() as [
      //     number,
      //     number
      //   ];
      //   const { title, description } = e.features[0].properties as {
      //     title: string;
      //     description: string | null;
      //   };

      //   while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      //   }

      //   new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
      //     .setLngLat(coordinates)
      //     .setHTML(
      //       `<h3 class="text-lg font-bold">${title}</h3><p class="text-sm">${
      //         description || "No description available"
      //       }</p>`
      //     )
      //     .addTo(map);
      // }
    });

    map.on("mouseenter", "event-layer", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "event-layer", () => {
      map.getCanvas().style.cursor = "";
    });
  };

  return (
    <div
      className="map-container"
      ref={mapContainer}
      style={{ height: "calc(100% - 6rem)" }}
    ></div>
  );
};

export default MapComponent;
