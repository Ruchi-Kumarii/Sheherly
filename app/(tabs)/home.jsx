import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
const logo = require("../../assets/images/sheherlyTitle.png")

export default function Home() {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();

  return (
    <SafeAreaView
      style={{ backgroundColor: "white", paddingTop: 0 }}
      className="flex-1"
    >
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <View>
          <Text className="text-xl font-bold text-slate-800">
            {new Date().getHours() < 12 ? "Good morning 👋" : new Date().getHours() < 17 ? "Good afternoon 👋" : "Good evening 👋"}
          </Text>
          <Text className="text-sm text-slate-500 mt-0.5">Explore Jaipur</Text>
        </View>
        <Image source={logo} style={{ width: 110, height: 48 }} resizeMode="contain" />
      </View>

      {/* No internet banner */}
      {!isOnline && (
        <View style={{
          backgroundColor: "#fff7ed",
          borderColor: "#fb923c",
          borderWidth: 1,
          marginHorizontal: 16,
          marginTop: 10,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}>
          <Text style={{ fontSize: 18 }}>📡</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#9a3412", fontWeight: "700", fontSize: 13 }}>
              No Internet Connection
            </Text>
            <Text style={{ color: "#c2410c", fontSize: 12, marginTop: 2 }}>
              Only your saved offline items are available.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/offline")}
            style={{
              backgroundColor: "#ea580c",
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}>
            <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>View Saved</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>


        {/* Food and Dining */}
        <View className="w-11/12 mt-4 self-center bg-white rounded-xl p-4"
          style={{ borderLeftWidth: 4, borderLeftColor: "#f59e0b", shadowColor: "#64748b", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 }}>

          <View className="flex flex-row items-center justify-between mb-3">
            <TouchableOpacity onPress={() => router.push("/category/food")}>
              <Text className="text-lg font-bold text-slate-800">Food and Dining</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/category/food")}>
              <Text className="text-amber-600 text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row justify-between">

            <TouchableOpacity className="items-center" onPress={() => router.push("/category/food/restaurants")}>
              <View className="w-14 h-14 bg-amber-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🍽️</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Restaurants</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center" onPress={() => router.push("/category/food/street-food")}>
              <View className="w-14 h-14 bg-amber-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🌮</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Street Food</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center" onPress={() => router.push("/category/food/chill-cafes")}>
              <View className="w-14 h-14 bg-amber-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">☕</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600"> Chill Cafes</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center" onPress={() => router.push("/category/food/night-cafes")}>
              <View className="w-14 h-14 bg-amber-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🌙</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Open Night Cafes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Medical */}
        <View className="w-11/12 mt-4 self-center bg-white rounded-xl p-4"
          style={{ borderLeftWidth: 4, borderLeftColor: "#f43f5e", shadowColor: "#64748b", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 }}>

          <View className="flex flex-row items-center justify-between mb-3">
            <TouchableOpacity onPress={() => router.push("/category/medical")}>
              <Text className="text-lg font-bold text-slate-800">Medical Services</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/category/medical")}>
              <Text className="text-rose-500 text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row justify-between">

            <TouchableOpacity className="items-center" onPress={() => router.push("/category/medical/hospitals")}>
              <View className="w-14 h-14 bg-rose-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🏥</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Hospitals</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/medical/clinics")}>
              <View className="w-14 h-14 bg-rose-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🩺</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Clinics</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/medical/pharmacies")}>
              <View className="w-14 h-14 bg-rose-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">💊</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Pharmacies</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/medical/labs")}>
              <View className="w-14 h-14 bg-rose-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🧪</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Diagnostic Labs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Accommodation */}
        <View className="w-11/12 mt-4 self-center bg-white rounded-xl p-4"
          style={{ borderLeftWidth: 4, borderLeftColor: "#8b5cf6", shadowColor: "#64748b", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 }}>

          <View className="flex flex-row items-center justify-between mb-3">
            <TouchableOpacity onPress={() => router.push("/category/accommodation")}>
              <Text className="text-lg font-bold text-slate-800">Accommodation</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/category/accommodation")}>
              <Text className="text-violet-500 text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row justify-between">
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/accommodation/hotels")}>
              <View className="w-14 h-14 bg-violet-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🏨</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Hotels</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/accommodation/hostels")}>
              <View className="w-14 h-14 bg-violet-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🛏️</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Hostels</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/accommodation/pg")}>
              <View className="w-14 h-14 bg-violet-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🏠</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Paying Guest</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/accommodation/resorts")}>
              <View className="w-14 h-14 bg-violet-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🏖️</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Resorts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transportation */}
        <View className="w-11/12 mt-4 self-center bg-white rounded-xl p-4"
          style={{ borderLeftWidth: 4, borderLeftColor: "#3b82f6", shadowColor: "#64748b", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 }}>
          <View className="flex flex-row items-center justify-between mb-3">
            <TouchableOpacity onPress={() => router.push("/category/transportation")}>
              <Text className="text-lg font-bold text-slate-800">Transportation</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/category/transportation")}>
              <Text className="text-blue-400 text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row justify-between">
            {/* Bus */}
            <TouchableOpacity
              className="items-center"
              onPress={() =>
                router.push({
                  pathname: "/category/transportation/search",
                  params: { type: "bus" },
                })
              }
            >
              <View className="w-14 h-14 bg-blue-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🚌</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Bus</Text>
            </TouchableOpacity>

            {/* Rickshaw */}
            <TouchableOpacity
              className="items-center"
              onPress={() =>
                router.push({
                  pathname: "/category/transportation/search",
                  params: { type: "rickshaw" },
                })
              }
            >
              <View className="w-14 h-14 bg-blue-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🛺</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Rickshaw</Text>
            </TouchableOpacity>

            {/* Bike Rentals */}
            <TouchableOpacity
              className="items-center"
              onPress={() =>
                router.push({
                  pathname: "/category/transportation/search",
                  params: { type: "bike-rentals" },
                })
              }
            >
              <View className="w-14 h-14 bg-blue-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🚲</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">
                Bike Rentals
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Local Services */}
        <View className="w-11/12 mt-4 self-center bg-white rounded-xl p-4"
          style={{ borderLeftWidth: 4, borderLeftColor: "#06b6d4", shadowColor: "#64748b", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 }}>

          <View className="flex flex-row items-center justify-between mb-3">
            <TouchableOpacity onPress={() => router.push("/category/localServices")}>
              <Text className="text-lg font-bold text-slate-800">Local Services</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/category/localServices")}>
              <Text className="text-cyan-600 text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row justify-between">
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/localServices/finance")}>
              <View className="w-14 h-14 bg-cyan-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">💵</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Finance</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/localServices/local-markets")}>
              <View className="w-14 h-14 bg-cyan-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🛒</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Local Markets</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/localServices/groceries")}>
              <View className="w-14 h-14 bg-cyan-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🥬</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Groceries</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/localServices/house-services")}>
              <View className="w-14 h-14 bg-cyan-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🧹</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">House Services</Text>
            </TouchableOpacity>
          </View>
        </View>



        {/* Famous spots */}
        <View className="w-11/12 mt-4 self-center bg-white rounded-xl p-4"
          style={{ borderLeftWidth: 4, borderLeftColor: "#eab308", shadowColor: "#64748b", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 }}>

          <View className="flex flex-row items-center justify-between mb-3">
            <TouchableOpacity onPress={() => router.push("/category/famousSpots")}>
              <Text className="text-lg font-bold text-slate-800">Famous Spots</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/category/famousSpots")}>
              <Text className="text-yellow-600 text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row justify-between">

            <TouchableOpacity className="items-center" onPress={() => router.push("/category/famousSpots/parks-gardens")}>
              <View className="w-14 h-14 bg-yellow-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🌳</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Parks & Gardens</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/famousSpots/historic-monuments")}>
              <View className="w-14 h-14 bg-yellow-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🏛️</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Historic Monuments</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/famousSpots/shopping-malls")}>
              <View className="w-14 h-14 bg-yellow-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🏬</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Shopping Malls</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push("/category/famousSpots/art-galleries")}>
              <View className="w-14 h-14 bg-yellow-100 rounded-2xl items-center justify-center shadow-sm">
                <Text className="text-2xl">🖼️</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Art Galleries</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety */}
        <TouchableOpacity
          onPress={() => router.push("/category/safety")}
          activeOpacity={0.85}
          style={{
            marginTop: 16,
            marginBottom: 40,
            marginHorizontal: 16,
            borderRadius: 14,
            backgroundColor: "#dc2626",
            overflow: "hidden",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, gap: 14 }}>
            <Ionicons name="warning-outline" size={24} color="white" />
            <View style={{ flex: 1 }}>
              <Text style={{ color: "white", fontWeight: "800", fontSize: 15 }}>Emergency? We're here</Text>
              <Text style={{ color: "#fecaca", fontSize: 12, marginTop: 2 }}>Police, ambulance & safety info</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}
