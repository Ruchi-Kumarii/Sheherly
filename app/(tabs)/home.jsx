import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from "expo-router";
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
      <View className="flex items-center justify-start pt-5">
        <View className="bg-white w-full justify-center items-center flex flex-row p-1 border border-[#9fd5efff]"
          style={{ borderRadius: 20 }}>
          <Image source={logo} style={{ width: 200, height: 85 }} />
        </View>
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
        <View className="w-11/12 mt-6 self-center bg-white rounded-xl p-4 shadow-md border border-amber-100">

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
                <Text className="text-2xl">🍔</Text>
              </View>
              <Text className="text-xs font-medium mt-1 text-slate-600">Open Night Cafes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Medical */}
        <View className="w-11/12 mt-6 self-center bg-white rounded-xl p-4 shadow-md border border-rose-100">

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
        <View className="w-11/12 mt-6 self-center bg-white rounded-xl p-4 shadow-md border border-violet-100">

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
        <View className="w-11/12 mt-6 self-center bg-white rounded-xl p-4 shadow-md border border-blue-100">
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
        <View className="w-11/12 mt-6 self-center bg-white rounded-xl p-4 shadow-md border border-cyan-100">

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
        <View className="w-11/12 mt-6 self-center bg-white rounded-xl p-4 shadow-md border border-yellow-100">

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

        {/* Safety and Police */}
        <View className="w-11/12 mt-6 mb-10 self-center bg-white rounded-xl p-4 shadow-md border border-red-300">

          <View className="flex flex items-center justify-between mb-3">
            <TouchableOpacity onPress={() => router.push("/category/safety")}>
              <Text className="text-xl font-bold text-slate-800">🚨 Safety</Text>
            </TouchableOpacity>

          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}