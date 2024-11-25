"use client";
import React, { useEffect, useState } from "react";
import { FetchDisasters } from "../components/fetchDisasters";
import { Loader2 } from "lucide-react";
import Particles from "../components/particles";
import SegmentedControl from "../components/segmentedControl/segmentControl";
import MapComponent from "./mapComponent";

interface Category {
  id: string;
  title: string;
}

interface Geometry {
  magnitudeValue?: number;
  magnitudeUnit?: string;
  date: string;
  type: string;
  coordinates?: [number, number];
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  link: string;
  closed: string | null;
  categories: Category[];
  sources: Array<{ id: string; url: string }>;
  geometry: Geometry[];
}

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [dateRange, setDateRange] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const responseLimit = "100";
      const data = await FetchDisasters(dateRange.toString(), responseLimit);
      setEvents(data.events);
      console.log(data.events);
      const uniqueCategories: string[] = [
        ...new Set(
          data.events.flatMap((event: Event) =>
            event.categories.map((cat) => cat.title)
          ) as string[]
        ),
      ];
      setCategories(uniqueCategories);
      setSelectedCategory(uniqueCategories[0]);
    } catch (error) {
      console.error("Error fetching disaster events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [dateRange]);

  useEffect(() => {
    const filterEvents = () => {
      const filtered = events.filter((event) =>
        event.categories.some((cat) => cat.title === selectedCategory)
      );
      setFilteredEvents(filtered);
    };

    filterEvents();
  }, [events, selectedCategory]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
      <Particles
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={100}
      />

      <div className="w-full md:w-2/3 h-full flex flex-col p-4 md:p-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-300 mb-4 md:mb-6">
          Disaster Events
        </h1>
        <div className="flex flex-col gap-4 w-full mb-4 h-3/12">
          <div className="flex flex-col md:flex-row justify-between items-start w-full md:w-1/2">
            <SegmentedControl
              name="date-range"
              callback={(val) => {
                console.log(val);
                setDateRange(parseInt(val));
              }}
              segments={[
                { label: "Today", value: "1" },
                { label: "This Week", value: "7" },
                { label: "This Month", value: "30" },
                { label: "This Year", value: "366" },
              ]}
            />
          </div>
          {categories.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-start w-full md:w-1/2">
              <SegmentedControl
                name="category"
                callback={(val) => {
                  setSelectedCategory(val);
                }}
                segments={categories.map((category) => ({
                  label: category,
                  value: category,
                }))}
              />
            </div>
          )}
        </div>
        <div className="flex-grow">
          <MapComponent events={filteredEvents} />
        </div>
      </div>
      <div className="w-full md:w-1/3 h-full border-white">
        <div className="overflow-y-auto h-full p-4 bg-transparent text-white rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div key={event.id} className="mb-4 p-4 bg-[#1C1C1E] rounded-lg">
                <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                <p className="text-sm mb-2">
                  {event.description || "No description available"}
                </p>
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-400">
                    Show more
                  </summary>
                  <div className="mt-2">
                    <p>
                      <strong>Link:</strong>{" "}
                      <a
                        href={event.link}
                        className="text-blue-400"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {event.link}
                      </a>
                    </p>
                    <p>
                      <strong>Categories:</strong>{" "}
                      {event.categories.map((cat) => cat.title).join(", ")}
                    </p>
                    <p>
                      <strong>Sources:</strong>{" "}
                      {event.sources
                        .map((source) => (
                          <a
                            key={source.id}
                            href={source.url}
                            className="text-blue-400"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {source.url}
                          </a>
                        ))
                        // @ts-ignore
                        .reduce((prev, curr) => [prev, ", ", curr])}
                    </p>
                    <p>
                      <strong>Coordinates:</strong>{" "}
                      {event.geometry
                        .map((geo) => geo.coordinates?.join(", "))
                        .join(" | ")}
                    </p>
                  </div>
                </details>
              </div>
            ))
          ) : (
            <p className="text-gray-300">No events found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
