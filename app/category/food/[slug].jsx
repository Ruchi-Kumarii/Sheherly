import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Linking,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListingCardSkeleton } from "../../../components/SkeletonCard";
import { ADMIN_URL } from "../../../config";

const BASE_URL = ADMIN_URL;

export default function FoodTypePage() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();

  const [data, setData] = useState([]);
  const [sortType, setSortType] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFoodData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(`${BASE_URL}/api/admin/data/food/${slug}`);
      const json = await response.json();
      setData(json || []);
    } catch (error) {
      Alert.alert("Error", "Could not load food data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (slug) fetchFoodData();
  }, [slug]);

  const getSortedData = () => {
    let sorted = [...data];
    if (sortType === "rating") sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted;
  };

  const finalData = getSortedData();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f3f5f9]">
        <View className="p-6">
          <Text className="text-3xl font-bold capitalize text-gray-800">
            {slug ? slug.replace(/-/g, " ") : "Food"}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">Explore food places</Text>
        </View>
        <View className="px-4">
          {[1, 2, 3, 4].map((i) => <ListingCardSkeleton key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f3f5f9]">

      <View className="p-6">
        <Text className="text-3xl font-bold capitalize text-gray-800">
          {slug ? slug.replace(/-/g, " ") : "Food"}
        </Text>
        <Text className="text-sm text-gray-600 mt-1">Explore food places</Text>
      </View>

      <View className="mb-4">
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            setSortType(sortType === "rating" ? "" : "rating");
          }}
          className={`px-4 py-2 rounded-lg shadow self-start ml-4 ${sortType === "rating" ? "bg-[#218fb4]" : "bg-white"}`}
        >
          <Text className={sortType === "rating" ? "text-white font-semibold" : ""}>⭐ Top Rated</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={finalData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchFoodData(true)}
            colors={["#218fb4"]}
            tintColor="#218fb4"
          />
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-2xl mb-4"
            style={{ shadowColor: "#64748b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.13, shadowRadius: 10, elevation: 5 }}>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold flex-1">{item.name}</Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: "/map",
                      params: { destLat: item.lat, destLng: item.lng, destName: item.name },
                    });
                  }}
                  className="ml-2"
                >
                  <Ionicons name="location-outline" size={22} color="#218fb4" />
                </TouchableOpacity>
                {item.phone && item.phone !== "N/A" && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Linking.openURL(`tel:${item.phone}`);
                    }}
                    className="ml-3"
                  >
                    <Text className="text-lg">📞</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text className="text-sm text-gray-500 mt-1">
              {item.location} · ⭐ {item.rating || 0}
            </Text>
            {item.timings && (
              <Text className="text-sm text-gray-500 mt-1">🕒 {item.timings}</Text>
            )}
            {item.zomato && (
              <TouchableOpacity
                onPress={() => Linking.openURL(item.zomato)}
                className="mt-3 bg-red-200 px-3 py-2 rounded-lg"
              >
                <Text className="text-center text-red-800 font-medium">
                  🍽️ Zomato{item.zomatoPrice ? ` · ${item.zomatoPrice}` : ""}
                </Text>
              </TouchableOpacity>
            )}
            {item.swiggy && (
              <TouchableOpacity
                onPress={() => Linking.openURL(item.swiggy)}
                className="mt-2 bg-orange-200 px-3 py-2 rounded-lg"
              >
                <Text className="text-center text-orange-800 font-medium">
                  🛵 Swiggy{item.swiggyPrice ? ` · ${item.swiggyPrice}` : ""}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-16 px-8">
            <Text className="text-5xl mb-4">😕</Text>
            <Text className="text-lg font-bold text-gray-700 mb-2">No places found</Text>
            <Text className="text-sm text-gray-400 text-center">Pull down to refresh or try another category.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}