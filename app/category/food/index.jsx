import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const foodOptions = [
  {
    id: "1",
    name: "Restaurants",
    slug: "restaurants",
    emoji: "🍽️",
    desc: "Dine-in & family places",
  },
  {
    id: "2",
    name: "Street Food",
    slug: "street-food",
    emoji: "🌮",
    desc: "Quick bites & local flavors",
  },
  {
    id: "3",
    name: "Chill Cafes",
    slug: "chill-cafes",
    emoji: "☕",
    desc: "Coffee & conversations",
  },
  {
    id: "4",
    name: "Open Night Cafes",
    slug: "night-cafes",
    emoji: "🌙",
    desc: "Late-night cravings",
  },
];

export default function FoodPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredData = foodOptions.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f3f5f9]">

      {/* Header — same style as Medical Services */}
      <View className="p-6">
        <Text className="text-3xl font-bold text-[#085a73]">
          Food & Dining
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Explore, Eat & Repeat 🍴
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4">

          {filteredData.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => {
                Haptics.selectionAsync();
                router.push(`/category/food/${item.slug}`);
              }}
              className="flex-row items-center bg-white p-4 rounded-2xl mb-3"
              style={{ shadowColor: "#64748b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.13, shadowRadius: 10, elevation: 5 }}
            >
              <Text className="text-4xl mr-4">{item.emoji}</Text>

              <View className="flex-1">
                <Text className="text-lg font-semibold">
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {item.desc}
                </Text>
              </View>

              <Text className="text-xl text-gray-400">›</Text>
            </TouchableOpacity>
          ))}

          {filteredData.length === 0 && (
            <Text className="text-center text-gray-500 mt-10">
              No food options found 😬
            </Text>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
