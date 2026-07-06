import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ADMIN_URL } from "../../../config";

const BASE_URL = ADMIN_URL;

const emergencyServices = [
  { id: "1", title: "Police", number: "100", emoji: "🚓", desc: "Report crime or danger", color: "#e53935" },
  { id: "2", title: "Ambulance", number: "108", emoji: "🚑", desc: "Medical emergency", color: "#d32f2f" },
  { id: "3", title: "Fire Brigade", number: "101", emoji: "🚒", desc: "Fire & rescue", color: "#f57c00" },
  { id: "4", title: "Women Helpline", number: "181", emoji: "🛡️", desc: "Support & safety", color: "#7b1fa2" },
  { id: "5", title: "Child Helpline", number: "1098", emoji: "🛡️", desc: "Support & safety", color: "#a40b69ff" },
];

export default function SafetyPage() {
  const [showPolice, setShowPolice] = useState(false);
  const [policeStations, setPoliceStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPoliceData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/api/admin/data/safety`);
      const json = await response.json();

      const formatted = (json || []).map((item, index) => ({
        id: item.id || `police_${index}`,
        name: item.name || item["name:en"] || "Police Station",
        info: item["addr:street"] || item["addr:city"] || item.address || "Jaipur",
        lat: item.lat,
        lng: item.lng
      }));

      setPoliceStations(formatted);
    } catch (error) {
      console.error("POLICE FETCH ERROR:", error);
      Alert.alert("Error", "Could not load police station data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoliceData();
  }, []);

  const makeCall = (number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <ScrollView showsVerticalScrollIndicator={false}>

        <View className="p-6">
          <Text className="text-3xl font-bold text-gray-800">
            Safety & Emergency
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            Immediate help when it matters most
          </Text>
        </View>

        <View className="px-4">

          {emergencyServices.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => makeCall(item.number)}
              className="flex-row items-center bg-white p-4 rounded-2xl mb-4"
              style={{ borderLeftColor: item.color, borderLeftWidth: 6, shadowColor: "#64748b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.13, shadowRadius: 10, elevation: 5 }}
            >
              <Text className="text-4xl mr-4">{item.emoji}</Text>

              <View className="flex-1">
                <Text className="text-lg font-bold">{item.title}</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {item.desc}
                </Text>
              </View>

              <View className="items-center">
                <Text
                  className="text-xl font-bold"
                  style={{ color: item.color }}
                >
                  {item.number}
                </Text>
                <Text className="text-xs font-bold text-gray-700 mt-1">
                  CALL
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setShowPolice(prev => !prev);
            }}
            className="h-20 rounded-2xl bg-orange-300 justify-center items-center mt-4 mb-6 px-4"
          >
            <Text className="text-xl font-semibold text-red-800 text-center">
              🚨 Nearby Police Stations
            </Text>
          </TouchableOpacity>

          {showPolice && (
            <View className="mb-10">
              {loading ? (
                <View className="items-center mt-6">
                  <ActivityIndicator size="large" color="#e53935" />
                  <Text className="mt-2 text-gray-500">Loading police stations...</Text>
                </View>
              ) : (
                policeStations.map(item => (
                  <View
                    key={item.id}
                    className="bg-orange-100 p-4 rounded-2xl mb-3"
                    style={{ shadowColor: "#64748b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.13, shadowRadius: 10, elevation: 5 }}
                  >
                    <Text className="text-lg font-semibold">{item.name}</Text>

                    <View className="flex-row items-center mt-1" style={{ gap: 4 }}>
                      <Ionicons name="location-outline" size={13} color="#6b7280" />
                      <Text className="text-sm text-gray-500 flex-1">{item.info}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push({
                          pathname: "/map",
                          params: { destLat: item.lat, destLng: item.lng, destName: item.name },
                        });
                      }}
                      className="mt-3 bg-red-500 px-3 py-2 rounded-lg"
                    >
                      <Text className="text-white text-center text-sm">
                        Get Directions
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}