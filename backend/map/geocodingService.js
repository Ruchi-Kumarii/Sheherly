import fetch from "node-fetch";

// Jaipur bounding box — restricts Nominatim results to Jaipur city area
const JAIPUR_VIEWBOX = "75.6,26.7,76.1,27.1";   // minLon,minLat,maxLon,maxLat

export const searchPlace = async (place) => {
  try {
    // Append "Jaipur" to the query to bias results, plus use viewbox for hard restriction
    const query = `${place}, Jaipur, India`;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&viewbox=${JAIPUR_VIEWBOX}&bounded=1&limit=5`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Sheherly-App/1.0",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.log("NOMINATIM ERROR:", text);
      return { success: false, error: "Search API error" };
    }

    const data = await res.json();

    // If bounded search found nothing, retry without bounding box but keep Jaipur in query
    if (!data || data.length === 0) {
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5`;

      const fallbackRes = await fetch(fallbackUrl, {
        headers: { "User-Agent": "Sheherly-App/1.0" },
      });

      const fallbackData = await fallbackRes.json();

      if (!fallbackData || fallbackData.length === 0) {
        return { success: false, error: "Place not found" };
      }

      return {
        success: true,
        data: {
          latitude: parseFloat(fallbackData[0].lat),
          longitude: parseFloat(fallbackData[0].lon),
          name: fallbackData[0].display_name,
        },
      };
    }

    return {
      success: true,
      data: {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        name: data[0].display_name,
      },
    };
  } catch (err) {
    console.error("GEOCODING ERROR:", err);
    return { success: false, error: "Geocoding failed" };
  }
};