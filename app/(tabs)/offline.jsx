import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  loadAllOfflineItems,
  removeOfflineItem,
  loadMapLocations,
  removeMapLocation,
  clearAllOfflineData,
} from "../../hooks/useOfflineCache";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { auth } from "../../firebase";

// ─── Category accent styles ───────────────────────────────────────────────────
const CATEGORY_STYLES = {
  food:           { bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-200" },
  medical:        { bg: "bg-rose-100",   text: "text-rose-700",   border: "border-rose-200" },
  accommodation:  { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  localServices:  { bg: "bg-cyan-100",   text: "text-cyan-700",   border: "border-cyan-200" },
  famousSpots:    { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  transportation: { bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200" },
};

function getCategoryStyle(category) {
  return CATEGORY_STYLES[category] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" };
}

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Auth Wall ────────────────────────────────────────────────────────────────
function AuthWall() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb]">
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800">Saved Offline</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Access your saved services without internet
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <View className="w-24 h-24 rounded-full bg-[#e8f4f8] items-center justify-center mb-5">
          <Text className="text-5xl">🔖</Text>
        </View>

        <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
          Sign in to save for offline
        </Text>
        <Text className="text-sm text-gray-500 text-center leading-5 mb-8">
          Bookmark restaurants, hospitals, spots and more. Access them even without internet — but you need an account first.
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/signup")}
          className="w-full bg-[#085a73] py-3 rounded-xl mb-3"
        >
          <Text className="text-white text-center text-base font-semibold">
            Create Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/signin")}
          className="w-full border border-[#085a73] py-3 rounded-xl"
        >
          <Text className="text-[#085a73] text-center text-base font-semibold">
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function OfflineScreen() {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const isGuest = !auth.currentUser;

  const [savedItems, setSavedItems] = useState([]);
  const [savedMaps, setSavedMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    const [items, maps] = await Promise.all([loadAllOfflineItems(), loadMapLocations()]);
    items.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    maps.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    setSavedItems(items);
    setSavedMaps(maps);
    setLoading(false);
  };

  const handleDeleteItem = (itemId) => {
    Alert.alert("Remove saved item", "Remove this item from offline storage?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => { await removeOfflineItem(itemId); loadData(); },
      },
    ]);
  };

  const handleDeleteMap = (locationId) => {
    Alert.alert("Remove saved location", "Remove this map pin from offline storage?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => { await removeMapLocation(locationId); loadData(); },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert("Clear all saved data", "This will remove all saved items and map locations.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All", style: "destructive",
        onPress: async () => { await clearAllOfflineData(); loadData(); },
      },
    ]);
  };

  // ── Guest ──────────────────────────────────────────────────────────────────
  if (isGuest) return <AuthWall />;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f6f7fb] justify-center items-center">
        <ActivityIndicator size="large" color="#085a73" />
        <Text className="mt-3 text-gray-500">Loading saved data...</Text>
      </SafeAreaView>
    );
  }

  const totalCount = savedItems.length + savedMaps.length;

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (totalCount === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#f6f7fb]">
        <View className="p-6">
          <Text className="text-3xl font-bold text-gray-800">Saved Offline</Text>
          <Text className="text-sm text-gray-500 mt-1">Nothing saved yet</Text>
        </View>

        {/* Network pill */}
        <View className="px-6 mb-2">
          <NetworkPill isOnline={isOnline} />
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-6xl mb-4">📴</Text>
          <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
            No saved items yet
          </Text>
          <Text className="text-sm text-gray-500 text-center leading-5">
            Tap 🏷️ on any restaurant, hospital, or spot to save it. Tap 🔖 on the map to save a location.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/home")}
            className="mt-8 bg-[#085a73] px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold text-base">Browse Categories</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main list ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb]">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View className="px-6 pt-6 pb-3 flex-row items-start justify-between">
          <View>
            <Text className="text-3xl font-bold text-gray-800">Saved Offline</Text>
            <Text className="text-sm text-gray-500 mt-1">
              {totalCount} {totalCount === 1 ? "item" : "items"} saved
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleClearAll}
            className="bg-red-50 border border-red-200 px-3 py-2 rounded-xl mt-1"
          >
            <Text className="text-red-600 text-xs font-semibold">Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Network pill */}
        <View className="px-6 mb-4">
          <NetworkPill isOnline={isOnline} />
        </View>

        {/* ── Saved Services ── */}
        {savedItems.length > 0 && (
          <View className="px-4 mb-2">
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
              🔖 Saved Services ({savedItems.length})
            </Text>

            {savedItems.map((entry) => {
              const style = getCategoryStyle(entry.itemMeta?.category);
              const item = entry.item;

              return (
                <View
                  key={entry.id}
                  className="bg-white rounded-2xl mb-3 shadow overflow-hidden"
                >
                  {/* Color top bar */}
                  <View className={`h-1 ${style.bg}`} />

                  <View className="p-4">
                    {/* Name row */}
                    <View className="flex-row items-start justify-between">
                      <View className="flex-row items-center flex-1 mr-2">
                        <View className={`w-10 h-10 ${style.bg} rounded-xl items-center justify-center mr-3`}>
                          <Text className="text-lg">{entry.itemMeta?.emoji || "📌"}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text className={`text-xs font-medium capitalize mt-0.5 ${style.text}`}>
                            {entry.itemMeta?.category?.replace(/([A-Z])/g, " $1").trim()} ·{" "}
                            {entry.itemMeta?.type}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteItem(entry.id)}
                        className="bg-red-50 border border-red-100 px-2 py-1 rounded-lg"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text className="text-red-500 text-xs font-medium">Remove</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Details */}
                    {(item.location || item.address) && (
                      <Text className="text-xs text-gray-500 mt-2" numberOfLines={1}>
                        📍 {item.location || item.address}
                      </Text>
                    )}
                    {item.timings && (
                      <Text className="text-xs text-gray-400 mt-1">🕒 {item.timings}</Text>
                    )}
                    {item.rating !== undefined && (
                      <Text className="text-xs text-gray-400 mt-1">⭐ {item.rating}</Text>
                    )}

                    {/* Action buttons */}
                    <View className="flex-row mt-3 gap-2">
                      {/* Map button — always shown if coords exist */}
                      {item.lat && item.lng && (
                        <TouchableOpacity
                          onPress={() =>
                            router.push(
                              `/(tabs)/map?destLat=${item.lat}&destLng=${item.lng}&destName=${encodeURIComponent(item.name)}`
                            )
                          }
                          className="flex-1 bg-[#085a73] py-2 rounded-xl items-center flex-row justify-center"
                        >
                          <Text className="text-white text-xs font-semibold">📍 Open in Map</Text>
                        </TouchableOpacity>
                      )}

                      {/* View details — navigate to the category page */}
                      {entry.itemMeta?.route && (
                        <TouchableOpacity
                          onPress={() => router.push(entry.itemMeta.route)}
                          className="flex-1 bg-gray-100 py-2 rounded-xl items-center"
                        >
                          <Text className="text-gray-700 text-xs font-semibold">View Details</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <Text className="text-xs text-gray-400 mt-2">
                      🕒 Saved {formatDate(entry.savedAt)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Saved Map Locations ── */}
        {savedMaps.length > 0 && (
          <View className="px-4 mb-2">
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
              🗺️ Saved Map Locations ({savedMaps.length})
            </Text>

            {savedMaps.map((loc) => (
              <View
                key={loc.id}
                className="bg-white rounded-2xl mb-3 shadow overflow-hidden"
              >
                <View className="h-1 bg-teal-100" />
                <View className="p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-10 h-10 bg-teal-100 rounded-xl items-center justify-center mr-3">
                        <Text className="text-lg">🗺️</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
                          {loc.name}
                        </Text>
                        <Text className="text-xs text-teal-600 mt-0.5">
                          {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteMap(loc.id)}
                      className="bg-red-50 border border-red-100 px-2 py-1 rounded-lg"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text className="text-red-500 text-xs font-medium">Remove</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        `/(tabs)/map?destLat=${loc.lat}&destLng=${loc.lng}&destName=${encodeURIComponent(loc.name)}`
                      )
                    }
                    className="mt-3 bg-teal-600 py-2 rounded-xl items-center"
                  >
                    <Text className="text-white text-xs font-semibold">📍 Open in Map</Text>
                  </TouchableOpacity>

                  <Text className="text-xs text-gray-400 mt-2">
                    🕒 Saved {formatDate(loc.savedAt)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Bottom tip */}
        <View className="mx-4 mb-8 mt-2 bg-blue-50 border border-blue-100 p-4 rounded-2xl">
          <Text className="text-xs text-blue-600 font-medium text-center">
            💡 Tap 🏷️ on any listing to bookmark it. Tap "Save for Offline" on the Map to save a location pin. Both are available without internet.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Shared network status pill ───────────────────────────────────────────────
function NetworkPill({ isOnline }) {
  return (
    <View
      className={`flex-row items-center px-4 py-2 rounded-xl self-start ${
        isOnline ? "bg-green-100 border border-green-300" : "bg-orange-100 border border-orange-300"
      }`}
    >
      <View className={`w-2 h-2 rounded-full mr-2 ${isOnline ? "bg-green-500" : "bg-orange-500"}`} />
      <Text className={`text-xs font-semibold ${isOnline ? "text-green-700" : "text-orange-700"}`}>
        {isOnline ? "Online" : "Offline — showing saved data"}
      </Text>
    </View>
  );
}
