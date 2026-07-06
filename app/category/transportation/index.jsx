import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const transportOptions = [
  {
    id: "1",
    name: "Bus",
    slug: "bus",
    emoji: "🚌",
    desc: "Affordable · Frequent",
  },
  {
    id: "3",
    name: "Bike Rentals",
    slug: "bike-rentals",
    emoji: "🏍️",
    desc: "Quick · Cheap",
  },
  {
    id: "4",
    name: "Rickshaw",
    slug: "rickshaw",
    emoji: "🛺",
    desc: "Local travel",
  },
];

export default function TransportationPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredData = transportOptions.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f4f6fb]">
      {/* Header */}
      <View className="p-6">
        <Text className="text-3xl font-bold text-[#0b3d91]">
          Transportation
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Choose how you want to travel
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4">
          {/* Search bar */}
          <TextInput
            placeholder="Search transport..."
            value={search}
            onChangeText={setSearch}
            className="bg-white p-3 rounded-xl mb-4"
          />

          {/* Transport Cards */}
          {filteredData.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}


              onPress={() => {
                Haptics.selectionAsync();
                router.push({
                  pathname: "/category/transportation/search",
                  params: { type: item.slug },
                });
              }}

              className="flex-row items-center bg-white p-4 rounded-2xl mb-3"
              style={{ shadowColor: "#64748b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.13, shadowRadius: 10, elevation: 5 }}
            >
              <Text className="text-4xl mr-4">{item.emoji}</Text>

              <View className="flex-1">
                <Text className="text-lg font-semibold">{item.name}</Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {item.desc}
                </Text>
              </View>

              <Text className="text-xl text-gray-400">›</Text>
            </TouchableOpacity>
          ))}

          {/* No results */}
          {filteredData.length === 0 && (
            <Text className="text-center text-gray-500 mt-10">
              No transport found 😬
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}