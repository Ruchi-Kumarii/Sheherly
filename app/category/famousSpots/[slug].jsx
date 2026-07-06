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
import { useState, useEffect } from "react";
import { ADMIN_URL } from "../../../config";
import { ListingCardSkeleton } from "../../../components/SkeletonCard";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";

const BASE_URL = ADMIN_URL;

const SLUG_META = {
  "parks-gardens":      { color: "#16a34a", accent: "#dcfce7" },
  "historic-monuments": { color: "#b45309", accent: "#fef3c7" },
  "art-galleries":      { color: "#7c3aed", accent: "#ede9fe" },
  "shopping-malls":     { color: "#0284c7", accent: "#e0f2fe" },
  "local-markets":      { color: "#d97706", accent: "#fff7ed" },
  "water-parks":        { color: "#06b6d4", accent: "#ecfeff" },
  "religious-places":   { color: "#dc2626", accent: "#fef2f2" },
  "view-points":        { color: "#8b5cf6", accent: "#f5f3ff" },
};

export default function FamousSpotTypePage() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const meta = SLUG_META[slug] || { color: "#218fb4", accent: "#e0f2fe" };

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFamousSpots = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/data/famous/${slug}`);
      const json = await response.json();
      const formattedData = (json || []).map((item) => ({
        id: item.id,
        name: item.name,
        lat: item.lat,
        lng: item.lng,
        address: item.address || item.location || "No address available",
        timings: item.timings || null,
        rating: item.rating || null,
        phone: item.phone && item.phone !== "N/A" ? item.phone : null,
        website: item.website || null,
        entry_fee: item.entry_fee || null,
      }));
      setData(formattedData);
    } catch (error) {
      Alert.alert("Error", "Could not load famous spots");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (slug) fetchFamousSpots();
  }, [slug]);

  const title = slug ? slug.replace(/-/g, " ") : "Famous Spots";

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f6f7fb]">
        <View className="p-6">
          <Text className="text-3xl font-bold capitalize text-gray-800">{title}</Text>
          <Text className="text-sm text-gray-500 mt-1">Popular places in Jaipur</Text>
        </View>
        <View className="px-4">
          {[1, 2, 3, 4].map((i) => <ListingCardSkeleton key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb]">

      <View className="p-6 pb-4">
        <Text className="text-3xl font-bold text-gray-800 capitalize">{title}</Text>
        <Text className="text-sm text-gray-500 mt-1">{data.length} places in Jaipur</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchFamousSpots(true)} colors={[meta.color]} tintColor={meta.color} />
        }
        renderItem={({ item }) => (
          <View
            className="bg-white rounded-2xl mb-4 overflow-hidden"
            style={{ shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
          >
            {/* Top accent */}
            <View style={{ height: 3, backgroundColor: meta.color }} />

            <View className="p-4">
              {/* Name + rating */}
              <View className="flex-row items-start justify-between">
                <Text className="text-base font-bold text-gray-800 flex-1 mr-2" numberOfLines={2}>
                  {item.name}
                </Text>
                {item.rating && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: meta.accent }}>
                    <Ionicons name="star" size={11} color={meta.color} />
                    <Text style={{ fontSize: 12, fontWeight: "700", color: meta.color }}>{item.rating}</Text>
                  </View>
                )}
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

              {/* Entry fee */}
              {item.entry_fee && (
                <View className="flex-row items-center mt-1 gap-1">
                  <Ionicons name="ticket-outline" size={13} color="#94a3b8" />
                  <Text className="text-xs text-gray-400">Entry: {item.entry_fee}</Text>
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

                {item.phone && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Linking.openURL(`tel:${item.phone}`);
                    }}
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#f1f5f9", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 }}
                  >
                    <Ionicons name="call-outline" size={15} color="#475569" />
                    <Text style={{ color: "#475569", fontSize: 13, fontWeight: "600" }}>Call</Text>
                  </TouchableOpacity>
                )}

                {item.website && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Linking.openURL(item.website);
                    }}
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#f1f5f9", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 }}
                  >
                    <Ionicons name="globe-outline" size={15} color="#475569" />
                    <Text style={{ color: "#475569", fontSize: 13, fontWeight: "600" }}>Website</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 px-8">
            <Ionicons name="map-outline" size={48} color="#cbd5e1" />
            <Text className="text-base font-bold text-gray-600 mt-4 mb-1">No places found</Text>
            <Text className="text-sm text-gray-400 text-center">Pull down to refresh or check back later.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
