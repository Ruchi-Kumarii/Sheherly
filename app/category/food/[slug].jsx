import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { ADMIN_URL } from "../../../config";

const BASE_URL = ADMIN_URL;

export default function FoodTypePage() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();

  const [data, setData] = useState([]);
  const [sortType, setSortType] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFoodData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/api/admin/data/food/${slug}`);
      const json = await response.json();

      setData(json || []);
    } catch (error) {
      console.error("FOOD FETCH ERROR:", error);
      Alert.alert("Error", "Could not load food data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchFoodData();
    }
  }, [slug]);

  // Sort by rating
  const getSortedData = () => {
    let sorted = [...data];

    if (sortType === "rating") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return sorted;
  };

  const finalData = getSortedData();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f3f5f9] justify-center items-center">
        <ActivityIndicator size="large" color="#218fb4" />
        <Text className="mt-3 text-gray-600">Loading food places...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f3f5f9]">

      {/* HEADER */}
      <View className="p-6">
        <Text className="text-3xl font-bold capitalize text-gray-800">
          {slug ? slug.replace(/-/g, " ") : "Food"}
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Explore food places
        </Text>
      </View>

      {/* FILTER */}
      <View className="mb-4">
        <TouchableOpacity
          onPress={() => setSortType("rating")}
          className="bg-white px-4 py-2 rounded-lg shadow self-start ml-4"
        >
          <Text>⭐ Top Rated</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={finalData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}

        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-2xl mb-4 shadow">


            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold flex-1">
                {item.name}
              </Text>

              <View className="flex-row items-center">


                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/map",
                      params: { destLat: item.lat, destLng: item.lng, destName: item.name },
                    })
                  }
                  className="ml-2"
                >
                  <Text className="text-lg">📍</Text>
                </TouchableOpacity>


                {item.phone && item.phone !== "N/A" && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
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
              <Text className="text-sm text-gray-500 mt-1">
                🕒 {item.timings}
              </Text>
            )}

            {item.zomato && (
              <TouchableOpacity
                onPress={() => Linking.openURL(item.zomato)}
                className="mt-3 bg-red-200 px-3 py-2 rounded-lg"
              >
                <Text className="text-center text-red-800 font-medium">
                  🍽️ Zomato
                  {item.zomatoPrice ? ` · ${item.zomatoPrice}` : ""}
                </Text>
              </TouchableOpacity>
            )}


            {item.swiggy && (
              <TouchableOpacity
                onPress={() => Linking.openURL(item.swiggy)}
                className="mt-2 bg-orange-200 px-3 py-2 rounded-lg"
              >
                <Text className="text-center text-orange-800 font-medium">
                  🛵 Swiggy
                  {item.swiggyPrice ? ` · ${item.swiggyPrice}` : ""}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No places found 😕
          </Text>
        }
      />
    </SafeAreaView>
  );
}