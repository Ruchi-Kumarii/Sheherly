import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { saveOfflineData, loadOfflineData } from "../../../hooks/useOfflineCache";
import { useNetworkStatus } from "../../../hooks/useNetworkStatus";

export default function Result() {
  const {
    type,
    from = "",
    to = "",
    service = "Passenger",
    area = "Area",
  } = useLocalSearchParams();
  const router = useRouter();

  // BUS STATES
  const [allBuses, setAllBuses] = useState([]);
  const [buses, setBuses] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState("all");
  const [priceRange, setPriceRange] = useState(1000);

  // RICKSHAW STATES
  const [allRickshaws, setAllRickshaws] = useState([]);
  const [rickshaws, setRickshaws] = useState([]);

  // BIKE RENTALS
  const [bikeRentals, setBikeRentals] = useState([]);

  // LOADING
  const [loading, setLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);
  const { isOnline } = useNetworkStatus();

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // RICKSHAW
        if (type === "rickshaw") {
          if (!isOnline) {
            const cached = await loadOfflineData("transportation", "rickshaw");
            if (cached) {
              setAllRickshaws(cached.data || []);
              setIsFromCache(true);
            }
            setLoading(false);
            return;
          }
          const snapshot = await getDocs(collection(db, "erickshaws"));
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setAllRickshaws(data);
          setIsFromCache(false);
          await saveOfflineData("transportation", "rickshaw", data, {
            label: "E-Rickshaw",
            emoji: "🛺",
            accentColor: "#3b82f6",
            route: "/category/transportation/search",
          });
          setLoading(false);
          return;
        }

        // BIKE RENTALS
        if (type === "bike-rentals") {
          if (!isOnline) {
            const cached = await loadOfflineData("transportation", "bike-rentals");
            if (cached) {
              setBikeRentals(cached.data || []);
              setIsFromCache(true);
            }
            setLoading(false);
            return;
          }
          const snapshot = await getDocs(collection(db, "bikeRentals"));
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setBikeRentals(data);
          setIsFromCache(false);
          await saveOfflineData("transportation", "bike-rentals", data, {
            label: "Bike Rentals",
            emoji: "🚲",
            accentColor: "#3b82f6",
            route: "/category/transportation/search",
          });
          setLoading(false);
          return;
        }

        // BUS
        if (!isOnline) {
          const cached = await loadOfflineData("transportation", `bus-${from}-${to}`);
          if (cached) {
            setAllBuses(cached.data || []);
            setBuses(cached.data || []);
            setIsFromCache(true);
          }
          setLoading(false);
          return;
        }
        const snapshot = await getDocs(collection(db, "buses"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const filtered = data.filter(
          (bus) =>
            bus.from?.toLowerCase().trim() === from?.toLowerCase().trim() &&
            bus.to?.toLowerCase().trim() === to?.toLowerCase().trim()
        );
        setAllBuses(filtered);
        setBuses(filtered);
        setIsFromCache(false);
        if (from && to) {
          await saveOfflineData("transportation", `bus-${from}-${to}`, filtered, {
            label: `Bus: ${from} → ${to}`,
            emoji: "🚌",
            accentColor: "#3b82f6",
            route: "/category/transportation/search",
          });
        }
        setLoading(false);
      } catch (error) {
        console.log("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [type, from, to, isOnline]);

  // BUS FILTERS
  useEffect(() => {
    if (type === "rickshaw" || type === "bike-rentals") return;

    let updated = [...allBuses];

    if (filter === "ac") {
      updated = updated.filter((bus) => bus.type?.toLowerCase() === "ac");
    } else if (filter === "non-ac") {
      updated = updated.filter((bus) => bus.type?.toLowerCase() === "non-ac");
    }

    updated = updated.filter((bus) => Number(bus.price) <= priceRange);

    setBuses(updated);
  }, [filter, priceRange, allBuses, type]);

  // RICKSHAW FILTERS
  useEffect(() => {
    if (type !== "rickshaw") return;

    const filtered = allRickshaws.filter(
      (item) =>
        item.availability === true &&
        item.service_type?.toLowerCase() === service?.toLowerCase() &&
        item.operating_zone?.toLowerCase() === area?.toLowerCase()
    );

    setRickshaws(filtered);
  }, [type, allRickshaws, service, area]);

  const getLogo = (name) => {
    const lower = name?.toLowerCase();
    if (lower?.includes("rsrtc")) {
      return "https://upload.wikimedia.org/wikipedia/en/7/7f/RSRTC_Logo.png";
    }
    return "https://cdn-icons-png.flaticon.com/512/61/61231.png";
  };

  const openWebsite = (url) => Linking.openURL(url);
  const callDriver = (number) => {
    if (number) Linking.openURL(`tel:${number}`);
  };

  if (type === "rickshaw" && loading) {
    return (
      <View className="flex-1 bg-[#F0F4FF] justify-center items-center px-6">
        <View className="bg-white px-8 py-8 rounded-[28px] items-center shadow-sm">
          <ActivityIndicator size="large" color="#4F6EF7" />
          <Text className="mt-5 text-[18px] font-bold text-slate-800">
            Finding Drivers
          </Text>
          <Text className="mt-2 text-slate-500 text-center leading-6">
            Please wait while we search nearby e-rickshaws for you.
          </Text>
        </View>
      </View>
    );
  }

  if (type === "bike-rentals" && loading) {
    return (
      <View className="flex-1 bg-[#F0F4FF] justify-center items-center px-6">
        <View className="bg-white px-8 py-8 rounded-[28px] items-center shadow-sm">
          <ActivityIndicator size="large" color="#4F6EF7" />
          <Text className="mt-5 text-[18px] font-bold text-slate-800">
            Finding Bikes
          </Text>
          <Text className="mt-2 text-slate-500 text-center leading-6">
            Please wait while we search bike rentals near your location.
          </Text>
        </View>
      </View>
    );
  }

  if (type !== "rickshaw" && type !== "bike-rentals" && loading) {
    return (
      <View className="flex-1 bg-[#F0F4FF] justify-center items-center px-6">
        <View className="bg-white px-8 py-8 rounded-[28px] items-center shadow-sm">
          <ActivityIndicator size="large" color="#4F6EF7" />
          <Text className="mt-5 text-[18px] font-bold text-slate-800">
            Searching Buses
          </Text>
          <Text className="mt-2 text-slate-500 text-center leading-6">
            Please wait while we find available buses for your route.
          </Text>
        </View>
      </View>
    );
  }

  if (type === "rickshaw") {
    return (
      <View className="flex-1 bg-[#F0F4FF]">
        <View
          className="bg-[#4F6EF7] pt-14 pb-7 px-5 rounded-b-[28px] mb-4"
          style={{
            shadowColor: "#4F6EF7",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <Text className="text-[#BFD0FF] text-xs font-semibold tracking-[2px] uppercase mb-1.5">
            Available E-Rickshaws
          </Text>
          <Text className="text-2xl font-extrabold text-white tracking-wide">
            {service} • {area}
          </Text>
        </View>

        {!isOnline && (
          <View className="mx-4 mb-3 bg-blue-100 border border-blue-300 px-3 py-2 rounded-xl">
            <Text className="text-blue-700 text-xs font-medium">
              📴 Offline — {isFromCache ? "showing saved data" : "no saved data available"}
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-center px-4 mb-3">
          <Text className="text-[13px] text-slate-500 font-medium">
            {rickshaws.length} drivers found
          </Text>
        </View>

        <FlatList
          data={rickshaws}
          keyExtractor={(item, index) =>
            item.driver_id?.toString() || index.toString()
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="items-center mt-20 px-6">
              <Text className="text-xl font-extrabold text-slate-800 mb-2 text-center">
                No Drivers Available
              </Text>
              <Text className="text-slate-500 text-center leading-6">
                No e-rickshaw available right now in {area}. Try another nearby
                area.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              className="bg-white p-[18px] rounded-[20px] mb-3.5"
              style={{
                shadowColor: "#94A3B8",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <View className="flex-row justify-between items-center mb-3.5">
                <View>
                  <Text className="font-bold text-[17px] text-slate-800">
                    {item.driver_name}
                  </Text>
                  <Text className="text-[11px] text-slate-400 font-semibold tracking-widest mt-1">
                    {item.driver_id || "DRIVER"}
                  </Text>
                </View>

                <View className="bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200">
                  <Text className="text-emerald-600 font-extrabold text-sm">
                    Available
                  </Text>
                </View>
              </View>

              <View className="h-px bg-slate-100 mb-3.5" />

              <View className="gap-2 mb-4">
                <Text className="text-[14px] text-slate-700 font-medium">
                  🚖 Vehicle:{" "}
                  <Text className="font-bold">{item.vehicle_model}</Text>
                </Text>
                <Text className="text-[14px] text-slate-700 font-medium">
                  📍 Area:{" "}
                  <Text className="font-bold">{item.operating_zone}</Text>
                </Text>
                <Text className="text-[14px] text-slate-700 font-medium">
                  🧾 Type:{" "}
                  <Text className="font-bold">{item.service_type}</Text>
                </Text>
                <Text className="text-[14px] text-slate-700 font-medium">
                  📞 Contact:{" "}
                  <Text className="font-bold">{item.contact_number}</Text>
                </Text>
              </View>

              <TouchableOpacity
                className="bg-[#4F6EF7] py-[13px] rounded-2xl items-center"
                style={{
                  shadowColor: "#4F6EF7",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={() => callDriver(item.contact_number)}
              >
                <Text className="text-white font-bold text-sm tracking-wide">
                  📞 Call Now
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  }

  if (type === "bike-rentals") {
    return (
      <View className="flex-1 bg-[#F0F4FF]">
        <View
          className="bg-[#4F6EF7] pt-14 pb-7 px-5 rounded-b-[28px] mb-4"
          style={{
            shadowColor: "#4F6EF7",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <Text className="text-[#BFD0FF] text-xs font-semibold tracking-[2px] uppercase mb-1.5">
            Bike Rentals
          </Text>
          <Text className="text-2xl font-extrabold text-white tracking-wide">
            Available Bikes Near You
          </Text>
        </View>

        {!isOnline && (
          <View className="mx-4 mb-3 bg-blue-100 border border-blue-300 px-3 py-2 rounded-xl">
            <Text className="text-blue-700 text-xs font-medium">
              📴 Offline — {isFromCache ? "showing saved data" : "no saved data available"}
            </Text>
          </View>
        )}

        <FlatList
          data={bikeRentals}
          keyExtractor={(item, index) =>
            item.bike_id?.toString() || index.toString()
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="items-center mt-20 px-6">
              <Text className="text-xl font-extrabold text-slate-800 mb-2 text-center">
                No Bikes Available
              </Text>
              <Text className="text-slate-500 text-center leading-6">
                No bike rentals available right now. Try again later.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              className="bg-white rounded-[20px] mb-4 overflow-hidden"
              style={{
                shadowColor: "#94A3B8",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <Image
                source={{ uri: item.image_url }}
                style={{ width: "100%", height: 180 }}
                resizeMode="cover"
              />

              <View className="p-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[18px] font-bold text-slate-800 flex-1">
                    {item.name}
                  </Text>

                  <View
                    className={`px-3 py-1 rounded-full ${item.available ? "bg-green-100" : "bg-red-100"
                      }`}
                  >
                    <Text
                      className={`font-bold text-xs ${item.available ? "text-green-700" : "text-red-600"
                        }`}
                    >
                      {item.available ? "Available" : "Not Available"}
                    </Text>
                  </View>
                </View>

                <Text className="text-slate-500 mb-1">🏍️ {item.type}</Text>

                <Text className="text-slate-700 font-semibold mb-1">
                  ₹{item.price_per_hour}/hr • ₹{item.price_per_day}/day
                </Text>

                <Text className="text-slate-600 mb-1">
                  📍 {item.pickup_location}
                </Text>

                <Text className="text-slate-600 mb-1">🏪 {item.shop_name}</Text>

                <Text className="text-slate-600 mb-3">
                  🪖 Helmet:{" "}
                  {item.specs?.helmet_included ? "Included" : "Not Included"}
                </Text>

                <View className="flex-row justify-between">
                  <TouchableOpacity
                    className="bg-[#4F6EF7] px-4 py-3 rounded-xl flex-1 mr-2 items-center"
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
                  >
                    <Text className="text-white font-bold">📞 Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-green-500 px-4 py-3 rounded-xl flex-1 mr-2 items-center"
                    onPress={() =>
                      Linking.openURL(`https://wa.me/91${item.whatsapp}`)
                    }
                  >
                    <Text className="text-white font-bold">💬 WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-slate-700 px-4 py-3 rounded-xl flex-1 items-center"
                    onPress={() =>
                      router.push(`/(tabs)/map?destLat=${item.lat}&destLng=${item.lng}&destName=${encodeURIComponent(item.shop_name || item.name)}`)
                    }
                  >
                    <Text className="text-white font-bold">📍 Map</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F0F4FF]">
      <View
        className="bg-[#4F6EF7] pt-14 pb-7 px-5 rounded-b-[32px] mb-4"
        style={{
          shadowColor: "#4F6EF7",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <Text className="text-[#BFD0FF] text-xs font-semibold tracking-[3px] uppercase mb-3">
          Available Buses
        </Text>

        <Text className="text-[22px] font-extrabold text-white tracking-wide">
          {from} → {to}
        </Text>
      </View>

      <View className="flex-row justify-between items-center px-4 mb-4">
        <Text className="text-[13px] text-slate-500 font-medium">
          {buses.length} results found
        </Text>

        <TouchableOpacity
          className="bg-[#4F6EF7] py-2.5 px-5 rounded-full"
          style={{
            shadowColor: "#4F6EF7",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={() => setShowFilter(true)}
        >
          <Text className="text-white font-bold text-[13px] tracking-wide">
            ⚙️ Filters
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={buses}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
        ListEmptyComponent={
          <View className="items-center mt-20 px-6">
            <Text className="text-xl font-extrabold text-slate-800 mb-2 text-center">
              No Buses Found
            </Text>
            <Text className="text-slate-500 text-center leading-6">
              Try searching a valid route like Jaipur → Ajmer.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isOpen = expandedId === index;

          return (
            <View
              className="bg-white rounded-[28px] px-4 py-5 mb-5"
              style={{
                shadowColor: "#94A3B8",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View className="flex-row justify-between items-start mb-5">
                <View className="flex-row items-center">
                  <View className="w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center mr-4">
                    <Image
                      source={{ uri: getLogo(item.name) }}
                      className="w-8 h-8"
                    />
                  </View>

                  <View>
                    <Text className="text-[18px] font-extrabold text-slate-800">
                      {item.name}
                    </Text>
                    <Text className="text-[11px] text-slate-400 font-bold tracking-[3px] uppercase mt-1">
                      {item.type || "AC"}
                    </Text>
                  </View>
                </View>

                <View className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3">
                  <Text className="text-emerald-600 font-extrabold text-[18px]">
                    ₹{item.price}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-4">
                <View className="w-[70px]">
                  <Text className="text-[17px] font-extrabold text-slate-800">
                    {item.departure || "07:45"}
                  </Text>
                  <Text className="text-[12px] text-slate-400 font-medium mt-1">
                    {item.from}
                  </Text>
                </View>

                <View className="flex-1 items-center px-2">
                  <View className="flex-row items-center w-full">
                    <View className="w-3 h-3 rounded-full bg-[#4F6EF7]" />
                    <View className="flex-1 h-[2px] bg-slate-300" />
                    <View className="bg-indigo-50 border border-indigo-200 rounded-full px-4 py-2 mx-2">
                      <Text className="text-[#4F6EF7] font-bold text-[12px]">
                        {item.duration || "6h"}
                      </Text>
                    </View>
                    <View className="flex-1 h-[2px] bg-slate-300" />
                    <View className="w-3 h-3 rounded-full bg-[#4F6EF7]" />
                  </View>
                </View>

                <View className="w-[70px] items-end">
                  <Text className="text-[17px] font-extrabold text-slate-800">
                    {item.arrival || "11:30"}
                  </Text>
                  <Text className="text-[12px] text-slate-400 font-medium mt-1">
                    {item.to}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3 mb-5">
                <View className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
                  <Text className="text-[13px] text-slate-600 font-semibold">
                    ⭐ {item.rating || 4.2}
                  </Text>
                </View>

                <View className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
                  <Text className="text-[13px] text-slate-600 font-semibold">
                    🪑 {item.seats || 25} seats left
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                className="bg-[#4F6EF7] py-5 rounded-[22px] items-center"
                style={{
                  shadowColor: "#4F6EF7",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                  elevation: 5,
                }}
                onPress={() => setExpandedId(isOpen ? null : index)}
              >
                <Text className="text-white font-extrabold text-[16px] tracking-wide">
                  {isOpen ? "Close ✕" : "Select Seats →"}
                </Text>
              </TouchableOpacity>

              {isOpen && (
                <View className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <Text className="text-[11px] text-slate-400 font-bold tracking-[2px] uppercase mb-3">
                    Book via
                  </Text>

                  <TouchableOpacity
                    className="flex-row justify-between items-center py-3"
                    onPress={() =>
                      openWebsite(
                        `https://www.redbus.in/search?fromCityName=${item.from}&toCityName=${item.to}`
                      )
                    }
                  >
                    <Text className="text-[15px] font-semibold text-slate-700">
                      RedBus
                    </Text>
                    <Text className="text-[15px] font-bold text-slate-800">
                      ₹{Number(item.price) + 50}
                    </Text>
                  </TouchableOpacity>

                  <View className="h-px bg-slate-200" />

                  <TouchableOpacity
                    className="flex-row justify-between items-center py-3"
                    onPress={() =>
                      openWebsite(
                        `https://www.abhibus.com/bus-tickets/${item.from}-to-${item.to}`
                      )
                    }
                  >
                    <Text className="text-[15px] font-semibold text-slate-700">
                      AbhiBus
                    </Text>
                    <Text className="text-[15px] font-bold text-slate-800">
                      ₹{Number(item.price) - 20}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />

      {showFilter && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-[rgba(15,23,42,0.35)] justify-end">
          <View className="bg-white px-6 pt-4 pb-9 rounded-t-[32px]">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />

            <Text className="text-[20px] font-extrabold text-slate-800 mb-8">
              Filter Buses
            </Text>

            <Text className="text-[14px] font-bold text-slate-500 uppercase tracking-[2px] mb-4">
              Bus Type
            </Text>

            <View className="flex-row mb-8">
              {["all", "ac", "non-ac"].map((busType) => {
                const active = filter === busType;
                return (
                  <TouchableOpacity
                    key={busType}
                    className={`py-3 px-6 rounded-full mr-3 border ${active
                        ? "bg-indigo-50 border-[#4F6EF7]"
                        : "bg-white border-slate-200"
                      }`}
                    onPress={() => setFilter(busType)}
                  >
                    <Text
                      className={`font-semibold text-[14px] ${active ? "text-[#4F6EF7]" : "text-slate-500"
                        }`}
                    >
                      {busType === "all"
                        ? "All"
                        : busType === "ac"
                          ? "AC"
                          : "Non-AC"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-[14px] font-bold text-slate-500 uppercase tracking-[2px]">
                Max Price
              </Text>
              <Text className="text-[18px] font-extrabold text-[#4F6EF7]">
                ₹{priceRange}
              </Text>
            </View>

            <Slider
              minimumValue={50}
              maximumValue={1000}
              step={10}
              value={priceRange}
              onValueChange={(val) => setPriceRange(val)}
              minimumTrackTintColor="#4F6EF7"
              maximumTrackTintColor="#E2E8F0"
              thumbTintColor="#4F6EF7"
            />

            <TouchableOpacity
              className="bg-[#4F6EF7] py-5 rounded-[22px] mt-8 items-center"
              style={{
                shadowColor: "#4F6EF7",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 6,
              }}
              onPress={() => setShowFilter(false)}
            >
              <Text className="text-white font-extrabold text-[17px] tracking-wide">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}