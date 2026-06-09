import polyline from "@mapbox/polyline";
import * as Location from "expo-location";
import { useEffect, useRef, useState, useCallback } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocalSearchParams, useFocusEffect, useRouter } from "expo-router";
import { MAP_URL } from '../../config';
import { saveMapLocation, loadMapLocations, removeMapLocation } from "../../hooks/useOfflineCache";
import { auth } from "../../firebase";

const BASE_URL = MAP_URL;

export default function Map() {
  const mapRef = useRef(null);
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

  // Local flag — true only when actively showing a listing destination
  const [fromListing, setFromListing] = useState(false);
  const [listingName, setListingName] = useState("");
  const [locationSaved, setLocationSaved] = useState(false);

  // Reset everything when screen loses focus
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

  // Get user location once
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
        console.log("LOCATION ERROR:", err);
        Alert.alert("Location Error", "Could not get your location. Please enable GPS and try again.");
      }
    })();
  }, []);

  // When opened from a listing — set destination and flag
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
        mapRef.current?.animateToRegion(
          { ...place, latitudeDelta: 0.05, longitudeDelta: 0.05 },
          1000
        );
      }
    }
  }, [destLat, destLng, destName]);

  // Auto-find route once we have both user location and listing destination
  useEffect(() => {
    if (fromListing && userLocation && destination) {
      findRoute(userLocation, destination);
    }
  }, [fromListing, userLocation, destination]);

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
        `${BASE_URL}/api/search?place=${encodeURIComponent(search)}`
      );
      const data = await res.json();

      if (!data.success || !data.data) {
        Alert.alert("Not found", data.error || "Could not find that place.");
        return;
      }

      const place = {
        latitude: data.data.latitude,
        longitude: data.data.longitude,
      };

      setDestination(place);
      mapRef.current?.animateToRegion(
        { ...place, latitudeDelta: 0.05, longitudeDelta: 0.05 },
        1000
      );
    } catch (err) {
      console.log("SEARCH ERROR:", err);
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
      const res = await fetch(`${BASE_URL}/api/route`, {
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

      if (mapRef.current) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: source.latitude, longitude: source.longitude },
            { latitude: dest.latitude, longitude: dest.longitude },
          ],
          {
            edgePadding: { top: 200, right: 60, bottom: 160, left: 60 },
            animated: true,
          }
        );
      }
    } catch (err) {
      console.log("ROUTE ERROR:", err);
      Alert.alert("Route Error", "Could not reach map server.");
    } finally {
      setRouting(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!auth.currentUser) {
      Alert.alert(
        "Sign in required",
        "You need to be signed in to save map locations for offline use.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/signin") },
        ]
      );
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

      {/* ── Top Panel ── */}
      <View style={{
        position: "absolute", top: 36, left: 12, right: 12, zIndex: 10,
        backgroundColor: "white",
        borderRadius: 16,
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}>

        {fromListing ? (
          /* Listing mode — destination label only */
          <View>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "#f0f9ff",
              borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
              marginBottom: 8,
            }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>📍</Text>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#1a1a1a", flex: 1 }}
                numberOfLines={1}>
                {listingName}
              </Text>
              {routing && <ActivityIndicator size="small" color="#218fb4" />}
            </View>
            {/* Save location button */}
            <TouchableOpacity
              onPress={handleSaveLocation}
              disabled={locationSaved}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: locationSaved ? "#d1fae5" : "#085a73",
                borderRadius: 10,
                paddingVertical: 9,
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 15 }}>{locationSaved ? "✅" : "🔖"}</Text>
              <Text style={{ color: locationSaved ? "#065f46" : "white", fontWeight: "600", fontSize: 13 }}>
                {locationSaved ? "Location Saved" : "Save for Offline"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Manual search mode */
          <>
            {/* Search input */}
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: 10, paddingHorizontal: 12,
              marginBottom: 10, 
            }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
              <TextInput
                placeholder="Search place in Jaipur"
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={searchPlace}
                returnKeyType="search"
                style={{
                  flex: 1, paddingVertical: 11,
                  fontSize: 14, color: "#1a1a1a",
                }}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => { setSearch(""); setDestination(null); }}>
                  <Text style={{ fontSize: 16, color: "#aaa", paddingLeft: 8 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Buttons row */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={searchPlace}
                disabled={searching}
                style={{
                  flex: 1, backgroundColor: "#218fb4",
                  borderRadius: 10, paddingVertical: 11,
                  alignItems: "center", justifyContent: "center",
                  flexDirection: "row", gap: 6,
                }}>
                {searching
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>Search</Text>
                }
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
                    </Text>
                }
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* ── Map ── */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          ...userLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        zoomControlEnabled
        showsCompass={false}
        showsMyLocationButton={false}
      >
        {destination && (
          <Marker
            coordinate={destination}
            title={listingName || search || "Destination"}
          />
        )}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="#218fb4"
          />
        )}
      </MapView>

      {/* ── Distance / Duration Banner ── */}
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
