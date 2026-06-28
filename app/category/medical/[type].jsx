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

const BASE_URL = ADMIN_URL;

export default function MedicalTypePage() {
  const { type } = useLocalSearchParams();
  const router = useRouter();

  const [userLocation, setUserLocation] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    })();
  }, []);

  // Open/Closed Logic
  const isOpenNow = (timings) => {
    if (!timings) return false;

    const currentHour = new Date().getHours();

    if (timings.toLowerCase() === "24 hours") return true;

    const parts = timings.split("-").map(Number);
    if (parts.length !== 2 || parts.some(isNaN)) return false;

    const [start, end] = parts;
    return currentHour >= start && currentHour <= end;
  };

  // Distance calc
  const getDistance = (lat1, lon1, lat2, lon2) => {
    return Math.sqrt(
      Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2)
    );
  };

  const fetchMedicalData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(`${BASE_URL}/api/admin/data/medical/${type}`);
      const json = await response.json();

      let formatted = (json || []).map((item, index) => ({
        id: item.id || `medical_${index}`,
        name: item.name,
        address: item.address || item.location || "No address available",
        lat: item.lat,
        lng: item.lng,
        phone: item.phone,
        timings: item.timings || "Not available",
        isOpen: isOpenNow(item.timings || ""),
      }));

      // Sort nearest first if location available
      if (userLocation) {
        formatted.sort((a, b) =>
          getDistance(userLocation.latitude, userLocation.longitude, a.lat, a.lng) -
          getDistance(userLocation.latitude, userLocation.longitude, b.lat, b.lng)
        );
      }

      setData(formatted);
    } catch (error) {
      console.error("MEDICAL FETCH ERROR:", error);
      Alert.alert("Error", "Could not load medical services");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (type) {
      fetchMedicalData();
    }
  }, [type, userLocation]);


  const callPlace = (phone) => {
    if (!phone || phone === "N/A") return;
    Linking.openURL(`tel:${phone}`);
  };


  const openMaps = (lat, lng, name) => {
    router.push({
      pathname: "/map",
      params: { destLat: lat, destLng: lng, destName: name },
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#eef7f6]">
        <View className="p-6">
          <Text className="text-3xl font-bold text-[#0d47a1] capitalize">{type}</Text>
          <Text className="text-sm text-gray-600 mt-1">Available {type} near you</Text>
        </View>
        <View className="px-4">
          {[1, 2, 3, 4].map((i) => <ListingCardSkeleton key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#eef7f6]">

      <View className="p-6">
        <Text className="text-3xl font-bold text-[#0d47a1] capitalize">
          {type}
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Available {type} near you
        </Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMedicalData(true)}
            colors={["#218fb4"]}
            tintColor="#218fb4"
          />
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-2xl mb-3 shadow">
            <Text className="text-lg font-semibold">
              {item.name}
            </Text>

            <Text className="text-sm text-gray-500 mt-1">
              {item.address}
            </Text>

            <Text className="text-sm mt-1">
              ⏰ {item.timings}
            </Text>

            <Text className="text-sm mt-1">
              {item.isOpen ? "🟢 Open Now" : "🔴 Closed"}
            </Text>

            <View className="flex-row mt-3 space-x-4">

              {item.phone && item.phone !== "N/A" && (
                <TouchableOpacity onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  callPlace(item.phone);
                }}>
                  <Text className="text-blue-600">📞 Call</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openMaps(item.lat, item.lng, item.name);
              }}>
                <Text className="text-green-600">🧭 Directions</Text>
              </TouchableOpacity>

            </View>
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