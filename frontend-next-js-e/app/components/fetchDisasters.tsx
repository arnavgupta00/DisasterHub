export const FetchDisasters = async (days: string, responseLimit: string) => {
  const response = await fetch(
    `https://eonet.gsfc.nasa.gov/api/v3/events?limit=${responseLimit}&days=${days}`
  );
  const data = await response.json();

  return data;
};
