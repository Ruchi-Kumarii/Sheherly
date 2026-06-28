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

const BASE_URL = ADMIN_URL;

export default function LocalServiceTypePage() {
  const { service } = useLocalSearchParams();
  const router = useRouter();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Normalize Data
  const normalizeLocalServices = (rawData = []) => {
    return rawData
      .map((item) => {

        if (item.amenity === "bank" || item.amenity === "atm") {
          return {
            id: item.id,
            name: item.name || item.brand || "Bank / ATM",
            lat: item.lat,
            lng: item.lon || item.lng,
            type: item.amenity.toUpperCase(),
            address: item.address,
            opening_hours: item.opening_hours
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
            delivery: item.delivery
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
            opening_hours: item.opening_hours
          };
        }

        if (item.phone) {
          return {
            id: item.id,
            name: item.name,
            lat: item.lat,
            lng: item.lng,
            type: item.type,
            address: item.area || item.address,
            opening_hours: item.opening_hours,
            phone: item.phone
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const fetchLocalServices = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(`${BASE_URL}/api/admin/data/local/${service}`);
      const json = await response.json();

      const normalized = normalizeLocalServices(json || []);
      setData(normalized);
    } catch (error) {
      console.error("LOCAL SERVICES FETCH ERROR:", error);
      Alert.alert("Error", "Could not load local services");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (service) {
      fetchLocalServices();
    }
  }, [service]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f6f7fb]">
        <View className="p-6">
          <Text className="text-3xl font-bold capitalize text-gray-800">
            {service ? service.replace(/-/g, " ") : "Local Services"}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">Available services near you</Text>
        </View>
        <View className="px-4">
          {[1, 2, 3, 4].map((i) => <ListingCardSkeleton key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb]">

      {/* 🔹 Header */}
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800 capitalize">
          {service ? service.replace(/-/g, " ") : "Local Services"}
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Available services near you
        </Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchLocalServices(true)}
            colors={["#218fb4"]}
            tintColor="#218fb4"
          />
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-2xl mb-4 shadow">

            <Text className="text-lg font-semibold">{item.name}</Text>

            <Text className="text-sm text-gray-500 mt-1">
              {item.type} · {item.address}
            </Text>

            <Text className="text-xs text-gray-400 mt-1">
              🕒 {item.opening_hours || "N/A"}
            </Text>

            {item.delivery !== undefined && (
              <Text className="text-xs mt-1 text-gray-500">
                {item.delivery ? "🛵 Delivery Available" : "🚫 No Delivery"}
              </Text>
            )}

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: "/map",
                  params: { destLat: item.lat, destLng: item.lng, destName: item.name },
                });
              }}
              className="mt-3 bg-blue-500 px-3 py-2 rounded-lg"
            >
              <Text className="text-white text-center text-sm">
                Get Directions
              </Text>
            </TouchableOpacity>

            {item.phone && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Linking.openURL(`tel:${item.phone}`);
                }}
                className="mt-2 bg-green-500 px-3 py-2 rounded-lg"
              >
                <Text className="text-white text-center text-sm">
                  Call Now
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No services available 😕
          </Text>
        }
      />
    </SafeAreaView>
  );
}
