import fetch from "node-fetch";

const MODE_MAP = {
  car: "driving-car",
  walk: "foot-walking",
  bike: "cycling-regular",
};

export async function getRoute(source, destination, mode = "car") {
  try {
    // Read at call time so dotenv has already loaded
    const ORS_API_KEY = process.env.ORS_API_KEY;

    if (!ORS_API_KEY) {
      console.error("ORS_API_KEY is missing from .env");
      return { success: false, error: "ORS API key not configured" };
    }

    const orsProfile = MODE_MAP[mode] || MODE_MAP.car;

    const body = {
      coordinates: [
        [source.longitude, source.latitude],
        [destination.longitude, destination.latitude],
      ],
    };

    console.log("ORS REQUEST:", orsProfile, body.coordinates);

    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/${orsProfile}`,
      {
        method: "POST",
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      console.log("ORS STATUS:", response.status);
      const text = await response.text();
      console.log("ORS ERROR BODY:", text);
      return { success: false, error: `ORS API error (${response.status})` };
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return { success: false, error: "No route found" };
    }

    const route = data.routes[0];

    return {
      success: true,
      data: {
        distance: route.summary.distance,
        duration: route.summary.duration,
        polyline: route.geometry,
      },
    };
  } catch (error) {
    console.error("ROUTE ERROR:", error);
    return { success: false, error: "Route fetch failed" };
  }
}