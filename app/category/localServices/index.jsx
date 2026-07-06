import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const localServices = [
  {
    id: "1",
    name: "Finance",
    slug: "finance",
    emoji: "💰",
    desc: "Banks & ATMs",
  },
  {
    id: "2",
    name: "Local Markets",
    slug: "local-markets",
    emoji: "🧺",
    desc: "Street shops & bazaars",
  },
  {
    id: "3",
    name: "Groceries",
    slug: "groceries",
    emoji: "🥕",
    desc: "Daily essentials & stores",
  },
  {
    id: "4",
    name: "House Services",
    slug: "house-services",
    emoji: "🧹",
    desc: "Cleaning, repairs & help",
  },
];

export default function LocalServicesPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredData = localServices.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb]">

      {/* Header */}
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800">Local Services</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Everyday help around you
        </Text>
      </View>

      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {filteredData.map(item => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() => {
              Haptics.selectionAsync();
              router.push(`/category/localServices/${item.slug}`);
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

        {filteredData.length === 0 && (
          <Text className="text-center text-gray-500 mt-10">
            No services found 😕
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

