import { View, Text, FlatList, TouchableOpacity, Linking, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ADMIN_URL } from "../../../config";
import { ListingCardSkeleton } from "../../../components/SkeletonCard";
import * as Haptics from "expo-haptics";

const BASE_URL = ADMIN_URL;

export default function AccommodationTypePage() {
  const { type } = useLocalSearchParams();
  const router = useRouter();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const openLink = async (platformName, hotelName, url) => {
    let searchUrl = url;

    // Generate search URLs for platforms that block deep links
    const hotelQuery = encodeURIComponent(hotelName);
    const cityQuery = "Jaipur";

    if (platformName.toLowerCase().includes("agoda")) {
      searchUrl = `https://www.agoda.com/search?city=6241&checkIn=2026-12-01&checkOut=2026-12-02&rooms=1&adults=1&children=0&cid=1844104&searchText=${hotelQuery}`;
    } else if (platformName.toLowerCase().includes("goibibo")) {
      searchUrl = `https://www.goibibo.com/hotels/search/?hquery=${hotelQuery}&cc=IN`;
    } else if (platformName.toLowerCase().includes("makemytrip")) {
      searchUrl = `https://www.makemytrip.com/hotels/hotel-listing/?checkin=12012026&checkout=12022026&city=CTJAI&country=IN&searchText=${hotelQuery}`;
    } else if (platformName.toLowerCase().includes("booking")) {
      searchUrl = `https://www.booking.com/searchresults.html?ss=${hotelQuery}+${cityQuery}`;
    }

    const supported = await Linking.canOpenURL(searchUrl);
    if (supported) {
      await Linking.openURL(searchUrl);
    } else {
      Alert.alert("Error", "Could not open booking page");
    }
  };

  const fetchAccommodationData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/data/accommodation/${type}`);
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching accommodation data:", error);
      Alert.alert("Error", "Could not load accommodation data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (type) {
      fetchAccommodationData();
    }
  }, [type]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f3f5f9]">
        <View className="p-6">
          <Text className="text-3xl font-bold capitalize text-gray-800">{type}</Text>
          <Text className="text-sm text-gray-600 mt-1">Compare prices across platforms</Text>
        </View>
        <View className="px-4">
          {[1, 2, 3].map((i) => <ListingCardSkeleton key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f3f5f9]">

      {/* Header */}
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800 capitalize">
          {type}
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Compare prices across platforms
        </Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAccommodationData(true)}
            colors={["#218fb4"]}
            tintColor="#218fb4"
          />
        }
        renderItem={({ item }) => {

          const isPG = type === "pg";

          const sortedPlatforms = item.platforms
            ? [...item.platforms].sort((a, b) => a.price - b.price)
            : [];

          const cheapest = sortedPlatforms[0];

          return (
            <View className="bg-white p-4 rounded-2xl mb-4 shadow">

              <Text className="text-lg font-semibold">
                {item.name}
              </Text>

              <Text className="text-sm text-gray-500 mt-1">
                📍 {item.location} · ⭐ {item.rating} ({item.reviews} reviews)
              </Text>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: "/map",
                    params: { destLat: item.lat, destLng: item.lng, destName: item.name },
                  });
                }}
                className="mt-2 bg-gray-200 px-3 py-2 rounded-lg"
              >
                <Text className="text-center text-sm">View Location</Text>
              </TouchableOpacity>

              {isPG ? (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    openLink(`tel:${item.phone}`);
                  }}
                  className="mt-3 bg-green-500 px-3 py-2 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    📞 Call Now
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={sortedPlatforms}
                    keyExtractor={(p, i) => i.toString()}
                    className="mt-3"
                    renderItem={({ item: platform }) => {

                      const isCheapest = platform.price === cheapest?.price;

                      return (
                        <View
                          className={`mr-3 p-3 rounded-xl min-w-[140px] ${isCheapest ? "bg-green-100" : "bg-gray-100"
                            }`}
                        >
                          <Text className="text-sm font-medium">
                            {platform.name}
                          </Text>

                          <Text className="text-sm font-bold mt-1">
                            ₹{platform.price}
                          </Text>

                          <TouchableOpacity
                            onPress={() => openLink(platform.name, item.name, platform.link)}
                            className="bg-blue-500 mt-2 px-2 py-1 rounded"
                          >
                            <Text className="text-white text-xs text-center">
                              Book
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    }}
                  />

                  {cheapest && (
                    <Text className="text-xs text-green-600 mt-2">
                      💰 Best deal on {cheapest.name} for ₹{cheapest.price}
                    </Text>
                  )}
                </>
              )}

            </View>
          );
        }}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No options available 😕
          </Text>
        }
      />
    </SafeAreaView>
  );
}