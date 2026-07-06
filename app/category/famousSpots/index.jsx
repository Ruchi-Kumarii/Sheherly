import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const travelCategories = [
  { id: "1", name: "Parks & Gardens", slug: "parks-gardens", emoji: "🌳", desc: "Nature, walks & relaxation" },
  { id: "2", name: "Historic Monuments", slug: "historic-monuments", emoji: "🏛️", desc: "Heritage & architecture" },
  { id: "3", name: "Art Galleries", slug: "art-galleries", emoji: "🖼️", desc: "Culture & exhibitions" },
  { id: "4", name: "Shopping Malls", slug: "shopping-malls", emoji: "🏬", desc: "Brands, food & entertainment" },
  { id: "5", name: "Local Markets", slug: "local-markets", emoji: "🛍️", desc: "Street shopping & souvenirs" },
  { id: "6", name: "Water Parks", slug: "water-parks", emoji: "🎢", desc: "Rides & fun activities" },
  { id: "7", name: "Religious Places", slug: "religious-places", emoji: "🛕", desc: "Peace & spirituality" },
  { id: "8", name: "View Points", slug: "view-points", emoji: "🌄", desc: "Scenic city views" },
];

export default function FamousSpotsPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb]">
      {/* Header */}
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800">Explore Places</Text>
        <Text className="text-sm text-gray-600 mt-1">Popular spots for travellers</Text>
      </View>

      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {travelCategories.map(item => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() => {
              Haptics.selectionAsync();
              router.push(`/category/famousSpots/${item.slug}`);
            }}
            className="flex-row items-center bg-white p-4 rounded-2xl mb-4"
            style={{ shadowColor: "#64748b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.13, shadowRadius: 10, elevation: 5 }}
          >
            <Text className="text-4xl mr-4">{item.emoji}</Text>

            <View className="flex-1">
              <Text className="text-lg font-semibold">{item.name}</Text>
              <Text className="text-sm text-gray-600 mt-1">{item.desc}</Text>
            </View>

            <Text className="text-xl text-gray-400">›</Text>
          </TouchableOpacity>
        ))}

        {/* Travel Tip Banner */}
        <View className="h-28 rounded-2xl bg-yellow-100 justify-center items-center mt-4 mb-10 px-4">
          <Text className="text-sm font-semibold text-yellow-800 text-center">
            🧭 Tip: Visit early mornings or weekdays for fewer crowds
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

