import polyline from "@mapbox/polyline";
import * as Location from "expo-location";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Alert, Text, TextInput, TouchableOpacity,
  View, ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useFocusEffect, useRouter } from "expo-router";
import { MAP_URL } from "../../config";
import { saveMapLocation } from "../../hooks/useOfflineCache";
import { auth } from "../../firebase";

export default function Map() {
  const webRef = useRef(null);
  const router = useRouter();
  const { destLat, destLng, destName } = useLocalSearchParams();

  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [routing, setRouting] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const [fromListing, setFromListing] = useState(false);
  const [listingName, setListingName] = useState("");
  const [locationSaved, setLocationSaved] = useState(false);

  // Reset on screen blur
  useFocusEffect(
    useCallback(() => {
      return () => {
        setFromListing(false);
        setListingName("");
        setDestination(null);
        setRouteCoords([]);
        setDistance(null);
        setDuration(null);
        setSearch("");
        setLocationSaved(false);
      };
    }, [])
  );

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location permission is required.");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (err) {
        Alert.alert("Location Error", "Could not get your location. Please enable GPS.");
      }
    })();
  }, []);

  // Send user location to map once both are ready
  useEffect(() => {
    if (mapReady && userLocation) {
      sendToMap({ type: "SET_USER", lat: userLocation.latitude, lng: userLocation.longitude });
    }
  }, [mapReady, userLocation]);

  // Handle listing destination
  useEffect(() => {
    if (destLat && destLng && destLat !== "undefined" && destLng !== "undefined") {
      const lat = parseFloat(destLat);
      const lng = parseFloat(destLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const place = { latitude: lat, longitude: lng };
        setDestination(place);
        setFromListing(true);
        const name = destName && destName !== "undefined"
          ? decodeURIComponent(destName)
          : "Destination";
        setListingName(name);
        setLocationSaved(false);
      }
    }
  }, [destLat, destLng, destName]);

  // Auto-route when opened from listing
  useEffect(() => {
    if (fromListing && userLocation && destination) {
      findRoute(userLocation, destination);
    }
  }, [fromListing, userLocation, destination]);

  // Send destination marker to map
  useEffect(() => {
    if (mapReady && destination) {
      sendToMap({
        type: "SET_DESTINATION",
        lat: destination.latitude,
        lng: destination.longitude,
        name: listingName || search || "Destination",
      });
    }
  }, [mapReady, destination]);

  // Send route polyline to map
  useEffect(() => {
    if (mapReady && routeCoords.length > 0) {
      sendToMap({ type: "SET_ROUTE", coords: routeCoords });
    }
  }, [mapReady, routeCoords]);

  const sendToMap = (data) => {
    webRef.current?.injectJavaScript(
      `window.handleMessage(${JSON.stringify(data)}); true;`
    );
  };

  const searchPlace = async () => {
    if (!search.trim()) {
      Alert.alert("Enter a place", "Please type a location to search.");
      return;
    }
    setSearching(true);
    setRouteCoords([]);
    setDistance(null);
    setDuration(null);
    try {
      const res = await fetch(
        `${MAP_URL}/api/search?place=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (!data.success || !data.data) {
        Alert.alert("Not found", data.error || "Could not find that place.");
        return;
      }
      const place = { latitude: data.data.latitude, longitude: data.data.longitude };
      setDestination(place);
    } catch (err) {
      Alert.alert("Search Error", "Could not reach map server.");
    } finally {
      setSearching(false);
    }
  };

  const findRoute = async (from, to) => {
    const source = from || userLocation;
    const dest = to || destination;
    if (!source || !dest) {
      Alert.alert("Missing location", "Search a destination first.");
      return;
    }
    setRouting(true);
    try {
      const res = await fetch(`${MAP_URL}/api/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, destination: dest, mode: "car" }),
      });
      const data = await res.json();
      if (!data.success || !data.data?.polyline) {
        Alert.alert("Route Error", data.error || "Could not get route.");
        return;
      }
      setDistance(data.data.distance);
      setDuration(data.data.duration);
      const decoded = polyline.decode(data.data.polyline).map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));
      setRouteCoords(decoded);
    } catch (err) {
      Alert.alert("Route Error", "Could not reach map server.");
    } finally {
      setRouting(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!auth.currentUser) {
      Alert.alert("Sign in required", "You need to be signed in to save map locations.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/signin") },
      ]);
      return;
    }
    if (!destination) return;
    const saved = await saveMapLocation({
      name: listingName || search || "Saved Location",
      lat: destination.latitude,
      lng: destination.longitude,
    });
    if (saved) setLocationSaved(true);
  };

  // Leaflet HTML
  const leafletHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([26.9124, 75.7873], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    var userMarker = null;
    var destMarker = null;
    var routeLine = null;

    window.handleMessage = function(data) {
      if (data.type === 'SET_USER') {
        if (userMarker) map.removeLayer(userMarker);
        var icon = L.divIcon({
          className: '',
          html: '<div style="width:16px;height:16px;background:#218fb4;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        userMarker = L.marker([data.lat, data.lng], { icon: icon })
          .addTo(map)
          .bindPopup('You are here');
        map.setView([data.lat, data.lng], 14);
      }

      if (data.type === 'SET_DESTINATION') {
        if (destMarker) map.removeLayer(destMarker);
        destMarker = L.marker([data.lat, data.lng])
          .addTo(map)
          .bindPopup(data.name)
          .openPopup();
        map.setView([data.lat, data.lng], 14);
      }

      if (data.type === 'SET_ROUTE') {
        if (routeLine) map.removeLayer(routeLine);
        var latlngs = data.coords.map(function(c) { return [c.latitude, c.longitude]; });
        routeLine = L.polyline(latlngs, { color: '#218fb4', weight: 4 }).addTo(map);
        map.fitBounds(routeLine.getBounds(), { padding: [60, 60] });
      }

      if (data.type === 'CLEAR') {
        if (destMarker) { map.removeLayer(destMarker); destMarker = null; }
        if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
      }
    };
  </script>
</body>
</html>
`;

  if (!userLocation) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#218fb4" />
        <Text style={{ marginTop: 25, color: "#555" }}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>

      {/* Top Panel */}
      <View style={{
        position: "absolute", top: 36, left: 12, right: 12, zIndex: 10,
        backgroundColor: "white", borderRadius: 16, padding: 14,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
      }}>
        {fromListing ? (
          <View>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "#f0f9ff", borderRadius: 10,
              paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8,
            }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>📍</Text>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#1a1a1a", flex: 1 }}
                numberOfLines={1}>{listingName}</Text>
              {routing && <ActivityIndicator size="small" color="#218fb4" />}
            </View>
            <TouchableOpacity
              onPress={handleSaveLocation}
              disabled={locationSaved}
              style={{
                flexDirection: "row", alignItems: "center", justifyContent: "center",
                backgroundColor: locationSaved ? "#d1fae5" : "#085a73",
                borderRadius: 10, paddingVertical: 9, gap: 6,
              }}>
              <Text style={{ fontSize: 15 }}>{locationSaved ? "✅" : "🔖"}</Text>
              <Text style={{ color: locationSaved ? "#065f46" : "white", fontWeight: "600", fontSize: 13 }}>
                {locationSaved ? "Location Saved" : "Save for Offline"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "#f5f5f5", borderRadius: 10,
              paddingHorizontal: 12, marginBottom: 10,
            }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
              <TextInput
                placeholder="Search place in Jaipur"
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={searchPlace}
                returnKeyType="search"
                style={{ flex: 1, paddingVertical: 11, fontSize: 14, color: "#1a1a1a" }}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => {
                  setSearch("");
                  setDestination(null);
                  sendToMap({ type: "CLEAR" });
                }}>
                  <Text style={{ fontSize: 16, color: "#aaa", paddingLeft: 8 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={searchPlace}
                disabled={searching}
                style={{
                  flex: 1, backgroundColor: "#218fb4", borderRadius: 10,
                  paddingVertical: 11, alignItems: "center", justifyContent: "center",
                  flexDirection: "row", gap: 6,
                }}>
                {searching
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>Search</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => findRoute()}
                disabled={routing || !destination}
                style={{
                  flex: 1,
                  backgroundColor: destination ? "#16a34a" : "#ccc",
                  borderRadius: 10, paddingVertical: 11,
                  alignItems: "center", justifyContent: "center",
                  flexDirection: "row", gap: 6,
                }}>
                {routing
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
                      {routeCoords.length > 0 ? "Re-route" : "Get Route"}
                    </Text>}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Leaflet WebView */}
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html: leafletHTML }}
        style={{ flex: 1 }}
        javaScriptEnabled
        onLoad={() => setMapReady(true)}
      />

      {/* Distance / Duration Banner */}
      {distance && duration && (
        <View style={{
          position: "absolute", bottom: 24, left: 12, right: 12,
          backgroundColor: "rgba(0,0,0,0.72)",
          borderRadius: 14, padding: 16,
          flexDirection: "row", justifyContent: "space-around",
        }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#9ca3af", fontSize: 12, marginBottom: 2 }}>Distance</Text>
            <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
              {(distance / 1000).toFixed(1)} km
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.2)" }} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#9ca3af", fontSize: 12, marginBottom: 2 }}>By Car</Text>
            <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
              {(duration / 60).toFixed(0)} mins
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
