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

const SERVICE_META = {
  finance:        { label: "Finance",        color: "#0284c7", bg: "#f0f9ff", accent: "#e0f2fe", icon: "card-outline" },
  "local-markets":{ label: "Local Markets",  color: "#d97706", bg: "#fffbeb", accent: "#fef3c7", icon: "storefront-outline" },
  groceries:      { label: "Groceries",      color: "#16a34a", bg: "#f0fdf4", accent: "#dcfce7", icon: "basket-outline" },
  "house-services":{ label: "House Services", color: "#7c3aed", bg: "#faf5ff", accent: "#ede9fe", icon: "home-outline" },
};

const normalizeItem = (item) => {
  if (item.amenity === "bank" || item.amenity === "atm") {
    return {
      id: item.id,
      name: item.name || item.brand || "Bank / ATM",
      lat: item.lat,
      lng: item.lon || item.lng,
      type: item.amenity.toUpperCase(),
      address: item.address,
      opening_hours: item.opening_hours,
      phone: null,
      delivery: null,
    };
  }
  if (item.store_id) {
    return {
      id: item.store_id,
      name: item.name,
      lat: item.lat,
      lng: item.lng,
      type: item.type,
      address: item.address,
      opening_hours: item.opening_hours,
      phone: null,
      delivery: item.delivery,
    };
  }
  if (item.market_id) {
    return {
      id: item.market_id,
      name: item.name,
      lat: item.lat,
      lng: item.lng,
      type: item.type,
      address: item.address,
      opening_hours: item.opening_hours,
      phone: null,
      delivery: null,
    };
  }
  // phone-based service
  return {
    id: item.id,
    name: item.name,
    lat: item.lat,
    lng: item.lng,
    type: item.type,
    address: item.area || item.address,
    opening_hours: item.opening_hours,
    phone: item.phone,
    delivery: null,
  };
};

export default function LocalServiceTypePage() {
  const { service } = useLocalSearchParams();
  const router = useRouter();
  const meta = SERVICE_META[service] || { label: service?.replace(/-/g, " "), color: "#218fb4", bg: "#f0f9ff", accent: "#e0f2fe", icon: "grid-outline" };

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocalServices = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/data/local/${service}`);
      const json = await response.json();
      const normalized = (json || []).map(normalizeItem).filter(Boolean);
      setData(normalized);
    } catch (error) {
      Alert.alert("Error", "Could not load local services");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (service) fetchLocalServices();
  }, [service]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: meta.bg }}>
        <View className="p-6">
          <Text className="text-3xl font-bold text-gray-800 capitalize">{meta.label}</Text>
          <Text className="text-sm text-gray-500 mt-1">Loading services near you</Text>
        </View>
        <View className="px-4">
          {[1, 2, 3, 4].map((i) => <ListingCardSkeleton key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: meta.bg }}>

      <View className="p-6 pb-4">
        <Text className="text-3xl font-bold text-gray-800 capitalize">{meta.label}</Text>
        <Text className="text-sm text-gray-500 mt-1">{data.length} places found</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchLocalServices(true)} colors={[meta.color]} tintColor={meta.color} />
        }
        renderItem={({ item }) => (
          <View
            className="bg-white rounded-2xl mb-3 overflow-hidden"
            style={{ shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
          >
            {/* Top accent */}
            <View style={{ height: 3, backgroundColor: meta.color }} />

            <View className="p-4">
              {/* Name + type badge */}
              <View className="flex-row items-start justify-between">
                <Text className="text-base font-bold text-gray-800 flex-1 mr-2" numberOfLines={2}>
                  {item.name}
                </Text>
                {item.type && (
                  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: meta.accent }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: meta.color }}>{item.type}</Text>
                  </View>
                )}
              </View>

              {/* Address */}
              {item.address && (
                <View className="flex-row items-center mt-2 gap-1">
                  <Ionicons name="location-outline" size={13} color="#94a3b8" />
                  <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>{item.address}</Text>
                </View>
              )}

              {/* Hours */}
              {item.opening_hours && (
                <View className="flex-row items-center mt-1 gap-1">
                  <Ionicons name="time-outline" size={13} color="#94a3b8" />
                  <Text className="text-xs text-gray-400">{item.opening_hours}</Text>
                </View>
              )}

              {/* Delivery badge */}
              {item.delivery !== null && item.delivery !== undefined && (
                <View className="flex-row items-center mt-1 gap-1">
                  <Ionicons name={item.delivery ? "bicycle-outline" : "close-circle-outline"} size={13} color={item.delivery ? "#16a34a" : "#94a3b8"} />
                  <Text style={{ fontSize: 12, color: item.delivery ? "#16a34a" : "#94a3b8" }}>
                    {item.delivery ? "Delivery available" : "No delivery"}
                  </Text>
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
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#f1f5f9", paddingVertical: 10, borderRadius: 12 }}
                  >
                    <Ionicons name="call-outline" size={15} color="#475569" />
                    <Text style={{ color: "#475569", fontSize: 13, fontWeight: "600" }}>Call</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 px-8">
            <Ionicons name={meta.icon} size={48} color="#cbd5e1" />
            <Text className="text-base font-bold text-gray-600 mt-4 mb-1">No results found</Text>
            <Text className="text-sm text-gray-400 text-center">Pull down to refresh or try another category.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
