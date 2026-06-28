import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

const accommodationOptions = [
  { id: "1", name: "Hotels", slug: "hotels", emoji: "🏨", desc: "Comfortable stays & services" },
  { id: "2", name: "Hostels", slug: "hostels", emoji: "🛏️", desc: "Budget-friendly stays" },
  { id: "3", name: "Paying Guest", slug: "pg", emoji: "🏠", desc: "Homely & peaceful" },
  { id: "4", name: "Homestays", slug: "homestays", emoji: "🌿", desc: "Live like a local" },
  { id: "5", name: "Resorts", slug: "resorts", emoji: "🏖️", desc: "Luxury & relaxation" },
];

export default function AccommodationPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredData = accommodationOptions.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f3f5f9]">

      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800">Accommodation</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Find a place that feels like home
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
                router.push(`/category/accommodation/${item.slug}`);
              }}
              className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow"
            >
              <Text className="text-4xl mr-4">{item.emoji}</Text>

              <View className="flex-1">
                <Text className="text-lg font-semibold">{item.name}</Text>
                <Text className="text-sm text-gray-500 mt-1">{item.desc}</Text>
              </View>

              <View className="items-end">
                <Text className="text-xl text-gray-400 mt-1">›</Text>
              </View>
            </TouchableOpacity>
          ))}

          {filteredData.length === 0 && (
            <Text className="text-center text-gray-500 mt-10">
              No accommodation found 😬
            </Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}


