import { View, Text, ScrollView, TouchableOpacity, TextInput, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

const medicalOptions = [
  { id: "1", name: "Hospitals", slug: "hospitals", emoji: "🏥", desc: "24/7 emergency care" },
  { id: "2", name: "Clinics", slug: "clinics", emoji: "🩺", desc: "General & specialist care" },
  { id: "3", name: "Pharmacies", slug: "pharmacies", emoji: "💊", desc: "Medicines & essentials" },
  { id: "4", name: "Diagnostic Labs", slug: "labs", emoji: "🧪", desc: "Tests & reports" },
  { id: "5", name: "Ambulance", slug: "ambulance", emoji: "🚑", desc: "Emergency transport" },
];

export default function MedicalServicesPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredData = medicalOptions.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#eef7f6]">
      
      <View className="p-6">
        <Text className="text-3xl font-bold text-[#0d47a1]">
          Medical Services
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Healthcare help when you need it
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4">
          {filteredData.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => {
                if (item.slug === "ambulance") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  Linking.openURL("tel:108");
                } else {
                  Haptics.selectionAsync();
                  router.push(`/category/medical/${item.slug}`);
                }
              }}
              className={`flex-row items-center p-4 rounded-2xl mb-3 shadow ${
                item.slug === "ambulance" ? "bg-red-100" : "bg-white"
              }`}
            >
              <Text className="text-4xl mr-4">{item.emoji}</Text>

              <View className="flex-1">
                <Text className="text-lg font-semibold">{item.name}</Text>
                <Text className="text-sm text-gray-500 mt-1">{item.desc}</Text>
              </View>

              {item.slug === "ambulance" ? (
                <Text className="text-lg font-bold text-red-600">108</Text>
              ) : (
                <Text className="text-xl text-gray-400">›</Text>
              )}
            </TouchableOpacity>
          ))}

          {filteredData.length === 0 && (
            <Text className="text-center text-gray-500 mt-10">
              No medical services found 😬
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

