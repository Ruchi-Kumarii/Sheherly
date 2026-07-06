import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { ADMIN_URL } from "../../../config";
import { ListingCardSkeleton } from "../../../components/SkeletonCard";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";

const BASE_URL = ADMIN_URL;

const TYPE_META = {
  hospitals:   { label: "Hospitals",       color: "#dc2626", bg: "#fef2f2", accent: "#fee2e2" },
  clinics:     { label: "Clinics",         color: "#0284c7", bg: "#f0f9ff", accent: "#e0f2fe" },
  pharmacies:  { label: "Pharmacies",      color: "#16a34a", bg: "#f0fdf4", accent: "#dcfce7" },
  labs:        { label: "Diagnostic Labs", color: "#7c3aed", bg: "#faf5ff", accent: "#ede9fe" },
};

const isOpenNow = (timings) => {
  if (!timings) return null;
  if (timings.toLowerCase().includes("24")) return true;
  const match = timings.match(/(\d{1,2})[:\s]?([APM]{2})?\s*[-–]\s*(\d{1,2})[:\s]?([APM]{2})?/i);
  if (!match) return null;
  const now = new Date().getHours();
  let start = parseInt(match[1]);
  let end = parseInt(match[3]);
  const startMerid = match[2]?.toUpperCase();
  const endMerid = match[4]?.toUpperCase();
  if (startMerid === "PM" && start !== 12) start += 12;
  if (endMerid === "PM" && end !== 12) end += 12;
  if (startMerid === "AM" && start === 12) start = 0;
  if (endMerid === "AM" && end === 12) end = 0;
  if (end < start) return now >= start || now < end;
  return now >= start && now < end;
};

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function MedicalTypePage() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const meta = TYPE_META[type] || { label: type, color: "#218fb4", bg: "#f0f9ff", accent: "#e0f2fe" };

  const [userLocation, setUserLocation] = useState(null);
  const [data, setData] = useState([]);
  const [sortType, setSortType] = useState("nearest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    })();
  }, []);

  const fetchMedicalData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/data/medical/${type}`);
      const json = await response.json();
      const formatted = (json || []).map((item, index) => ({
        id: item.id || `medical_${index}`,
        name: item.name,
        address: item.address || item.location || "No address available",
        lat: item.lat,
        lng: item.lng,
        phone: item.phone,
        timings: item.timings || null,
        openStatus: isOpenNow(item.timings),
      }));
      setData(formatted);
    } catch (error) {
      Alert.alert("Error", "Could not load medical services");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (type) fetchMedicalData();
  }, [type]);

  const getSortedData = () => {
    let sorted = [...data];
    if (sortType === "nearest" && userLocation) {
      sorted.sort((a, b) =>
        haversineKm(userLocation.latitude, userLocation.longitude, a.lat, a.lng) -
        haversineKm(userLocation.latitude, userLocation.longitude, b.lat, b.lng)
      );
    } else if (sortType === "open") {
      sorted.sort((a, b) => (b.openStatus === true ? 1 : -1) - (a.openStatus === true ? 1 : -1));
    }
    if (filterOpen) sorted = sorted.filter((i) => i.openStatus === true);
    return sorted;
  };

  const finalData = getSortedData();

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: meta.bg }}>
        <View className="p-6">
          <Text className="text-3xl font-bold text-gray-800">{meta.label}</Text>
          <Text className="text-sm text-gray-500 mt-1">Finding services near you</Text>
        </View>
        <View className="px-4">
          {[1, 2, 3, 4].map((i) => <ListingCardSkeleton key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: meta.bg }}>

      <View className="p-6 pb-3">
        <Text className="text-3xl font-bold text-gray-800">{meta.label}</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {finalData.length} places found
        </Text>
      </View>

      {/* Filter / Sort bar */}
      <View className="flex-row px-4 pb-3 gap-2">
        {[
          { key: "nearest", label: "Nearest" },
          { key: "open",    label: "Open First" },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => { Haptics.selectionAsync(); setSortType(opt.key); }}
            style={{
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
              backgroundColor: sortType === opt.key ? meta.color : "white",
              borderWidth: 1, borderColor: sortType === opt.key ? meta.color : "#e2e8f0",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: sortType === opt.key ? "white" : "#64748b" }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); setFilterOpen(!filterOpen); }}
          style={{
            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
            backgroundColor: filterOpen ? meta.color : "white",
            borderWidth: 1, borderColor: filterOpen ? meta.color : "#e2e8f0",
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: filterOpen ? "white" : "#64748b" }}>
            Open Now
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={finalData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchMedicalData(true)} colors={[meta.color]} tintColor={meta.color} />
        }
        renderItem={({ item }) => {
          const distKm = userLocation
            ? haversineKm(userLocation.latitude, userLocation.longitude, item.lat, item.lng).toFixed(1)
            : null;

          return (
            <View
              className="bg-white rounded-2xl mb-3 overflow-hidden"
              style={{ shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
            >
              {/* Top accent bar */}
              <View style={{ height: 3, backgroundColor: meta.color }} />

              <View className="p-4">
                {/* Name + badges row */}
                <View className="flex-row items-start justify-between">
                  <Text className="text-base font-bold text-gray-800 flex-1 mr-2" numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    {item.openStatus !== null && (
                      <View style={{
                        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
                        backgroundColor: item.openStatus ? "#dcfce7" : "#fee2e2",
                      }}>
                        <Text style={{ fontSize: 11, fontWeight: "700", color: item.openStatus ? "#16a34a" : "#dc2626" }}>
                          {item.openStatus ? "Open" : "Closed"}
                        </Text>
                      </View>
                    )}
                    {distKm && (
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: meta.accent }}>
                        <Text style={{ fontSize: 11, fontWeight: "600", color: meta.color }}>{distKm} km</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Address */}
                <View className="flex-row items-center mt-2 gap-1">
                  <Ionicons name="location-outline" size={13} color="#94a3b8" />
                  <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>{item.address}</Text>
                </View>

                {/* Timings */}
                {item.timings && (
                  <View className="flex-row items-center mt-1 gap-1">
                    <Ionicons name="time-outline" size={13} color="#94a3b8" />
                    <Text className="text-xs text-gray-400">{item.timings}</Text>
                  </View>
                )}

                {/* Action buttons */}
                <View className="flex-row mt-3 gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push({ pathname: "/map", params: { destLat: item.lat, destLng: item.lng, destName: item.name } });
                    }}
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: meta.color, paddingVertical: 10, borderRadius: 12 }}
                  >
                    <Ionicons name="navigate-outline" size={15} color="white" />
                    <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>Directions</Text>
                  </TouchableOpacity>

                  {item.phone && item.phone !== "N/A" && (
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Linking.openURL(`tel:${item.phone}`);
                      }}
                      style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#f1f5f9", paddingVertical: 10, borderRadius: 12 }}
                    >
                      <Ionicons name="call-outline" size={15} color="#475569" />
                      <Text style={{ color: "#475569", fontSize: 13, fontWeight: "600" }}>Call</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 px-8">
            <Ionicons name="medkit-outline" size={48} color="#cbd5e1" />
            <Text className="text-base font-bold text-gray-600 mt-4 mb-1">No results found</Text>
            <Text className="text-sm text-gray-400 text-center">Pull down to refresh or try another category.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
