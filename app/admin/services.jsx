import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  fetchTransportData,
  addTransportItem,
  deleteTransportItem,
} from "../../utils/transportAdmin";
import { ADMIN_URL } from "../../config";

const BASE_URL = ADMIN_URL;

const categories = {
  food: ["restaurants", "street-food", "chill-cafes", "night-cafes"],
  medical: ["hospitals", "pharmacies", "clinics", "labs"],
  transportation: ["bus", "rickshaw", "bike-rentals"],
  local: ["finance", "groceries", "local-markets", "house-services"],
  accommodation: ["hotels", "hostels", "pg", "homestays", "resorts"],
  famous: ["parks-gardens", "historic-monuments", "art-galleries", "shopping-malls", "local-markets", "water-parks", "religious-places", "view-points"],
  safety: null,
};

// Transportation fields (Firebase only)
const transportFieldConfig = {
  bus: ["name", "from", "to", "type", "price", "departure", "arrival", "duration", "rating", "seats"],
  rickshaw: ["driver_name", "driver_id", "vehicle_model", "service_type", "operating_zone", "contact_number", "availability"],
  "bike-rentals": ["name", "type", "price_per_hour", "price_per_day", "pickup_location", "shop_name", "phone", "whatsapp", "google_maps_link", "image_url", "available"],
};

// Backend categories fields
const fieldConfig = {
  food: {
    restaurants: ["id", "name", "lat", "lng", "location", "rating", "phone", "timings", "zomato", "swiggy", "zomatoPrice", "swiggyPrice"],
    "street-food": ["id", "name", "lat", "lng", "location", "rating", "phone", "timings", "zomato", "swiggy", "zomatoPrice", "swiggyPrice"],
    "chill-cafes": ["id", "name", "lat", "lng", "location", "rating", "phone", "timings", "zomato", "swiggy", "zomatoPrice", "swiggyPrice"],
    "night-cafes": ["id", "name", "lat", "lng", "location", "rating", "phone", "timings", "zomato", "swiggy", "zomatoPrice", "swiggyPrice"],
  },

  medical: {
    hospitals: ["id", "name", "address", "lat", "lng", "phone", "timings"],
    pharmacies: ["id", "name", "address", "lat", "lng", "phone", "timings"],
    clinics: ["id", "name", "address", "lat", "lng", "phone", "timings"],
    labs: ["id", "name", "address", "lat", "lng", "phone", "timings"],
  },

  local: {
    finance: ["id", "name", "brand", "amenity", "lat", "lon", "address", "opening_hours"],
    groceries: ["store_id", "name", "type", "area", "lat", "lng", "opening_hours", "delivery", "address"],
    "local-markets": ["market_id", "name", "type", "area", "lat", "lng", "opening_hours", "address"],
    "house-services": ["id", "name", "type", "area", "lat", "lng", "opening_hours", "phone"],
  },

  accommodation: {
    hotels: ["id", "name", "lat", "lng", "location", "rating", "reviews", "platforms"],
    hostels: ["id", "name", "lat", "lng", "location", "rating", "reviews", "platforms"],
    pg: ["id", "name", "lat", "lng", "location", "rating", "reviews", "phone"],
    homestays: ["id", "name", "lat", "lng", "location", "rating", "reviews", "platforms"],
    resorts: ["id", "name", "lat", "lng", "location", "rating", "reviews", "platforms"],
  },

  famous: {
    "parks-gardens": ["id", "name", "lat", "lng", "address", "timings"],
    "historic-monuments": ["id", "name", "lat", "lng", "address", "timings"],
    "art-galleries": ["id", "name", "lat", "lng", "address", "timings"],
    "shopping-malls": ["id", "name", "lat", "lng", "address", "timings"],
    "local-markets": ["id", "name", "lat", "lng", "address", "timings"],
    "water-parks": ["id", "name", "lat", "lng", "address", "timings"],
    "religious-places": ["id", "name", "lat", "lng", "address", "timings"],
    "view-points": ["id", "name", "lat", "lng", "address", "timings"],
  },

  safety: {
    default: ["name", "address", "lat", "lng"],
  },
};

export default function Services() {
  const [category, setCategory] = useState("food");
  const [type, setType] = useState("restaurants");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({});

  // Auto set subtype when category changes
  useEffect(() => {
    if (category === "safety") {
      setType(null);
    } else {
      setType(categories[category]?.[0] || null);
    }
  }, [category]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [category, type]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Transportation from Firebase
      if (category === "transportation") {
        const transportData = await fetchTransportData(type);
        setData(transportData);
        return;
      }

      // Rest from backend
      const url = type
        ? `${BASE_URL}/api/admin/data/${category}/${type}`
        : `${BASE_URL}/api/admin/data/${category}`;

      const res = await fetch(url);
      const json = await res.json();

      if (Array.isArray(json)) {
        setData(json);
      } else {
        setData([]);
      }
    } catch (err) {
      console.log("FETCH ERROR:", err);
      Alert.alert("Error", "Failed to load data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    // Validation
    if (category !== "transportation" && !formData.name?.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    if (
      category === "transportation" &&
      type === "rickshaw" &&
      !formData.driver_name?.trim()
    ) {
      Alert.alert("Error", "Driver name is required");
      return;
    }

    if (
      category === "transportation" &&
      type !== "rickshaw" &&
      !formData.name?.trim()
    ) {
      Alert.alert("Error", "Name is required");
      return;
    }

    let item = {
      ...formData,
    };

    // Backend categories need manual ID
    if (category !== "transportation") {
      item.id = Date.now().toString();
    }

    // Convert numbers
    if (item.rating) item.rating = Number(item.rating);
    if (item.lat) item.lat = Number(item.lat);
    if (item.lng) item.lng = Number(item.lng);
    if (item.lon) item.lon = Number(item.lon);
    if (item.price) item.price = Number(item.price);
    if (item.price_per_hour) item.price_per_hour = Number(item.price_per_hour);
    if (item.price_per_day) item.price_per_day = Number(item.price_per_day);
    if (item.seats) item.seats = Number(item.seats);

    // Convert booleans for Firebase transport
    if (item.availability !== undefined) {
      item.availability = item.availability === "true";
    }

    if (item.available !== undefined) {
      item.available = item.available === "true";
    }

    if (item.delivery !== undefined) {
      item.delivery = item.delivery === "true";
    }

    // Remove empty keys
    Object.keys(item).forEach((key) => {
      if (item[key] === "" || item[key] === undefined || item[key] === null) {
        delete item[key];
      }
    });

    try {

      if (category === "transportation") {
        const result = await addTransportItem(type, item);

        if (!result.success) {
          Alert.alert("Error", "Failed to add transport item");
          return;
        }

        setFormData({});
        setShowAddModal(false);
        fetchData();
        return;
      }


      const url = type
        ? `${BASE_URL}/api/admin/data/${category}/${type}`
        : `${BASE_URL}/api/admin/data/${category}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      const result = await res.json();

      if (!res.ok) {
        Alert.alert("Error", result.message || "Failed to add item");
        return;
      }

      setFormData({});
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.log("ADD ERROR:", err);
      Alert.alert("Error", "Failed to add item");
    }
  };

  const handleDelete = async (id) => {
    try {

      if (category === "transportation") {
        const result = await deleteTransportItem(type, id);

        if (!result.success) {
          Alert.alert("Error", "Failed to delete transport item");
          return;
        }

        fetchData();
        return;
      }


      const url = type
        ? `${BASE_URL}/api/admin/data/${category}/${type}/${id}`
        : `${BASE_URL}/api/admin/data/${category}/${id}`;

      const res = await fetch(url, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        Alert.alert("Error", result.message || "Failed to delete item");
        return;
      }

      fetchData();
    } catch (err) {
      console.log("DELETE ERROR:", err);
      Alert.alert("Error", "Failed to delete item");
    }
  };

  const getDisplayName = (item) => {
    return (
      item.name ||
      item.driver_name ||
      item.title ||
      item.route ||
      item.type ||
      item.service ||
      item.category ||
      item.address ||
      item["name:en"] ||
      "Unnamed Item"
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f6fb]">
      <FlatList
        data={data}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View className="px-6 pt-6 pb-4">
              <Text className="text-3xl font-bold text-gray-900">
                Manage Services
              </Text>
            </View>

            {/* Category chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              <View className="flex-row">
                {Object.keys(categories).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setCategory(cat);
                      setFormData({});
                    }}
                    className={`px-5 py-3 rounded-2xl mr-3 ${category === cat ? "bg-[#3C91E6]" : "bg-[#e8ebf2]"
                      }`}
                  >
                    <Text
                      className={`font-medium ${category === cat ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Subcategory chips */}
            {categories[category] && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14 }}
              >
                <View className="flex-row">
                  {categories[category].map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => {
                        setType(t);
                        setFormData({});
                      }}
                      className={`px-4 py-2 rounded-xl mr-2 ${type === t ? "bg-[#CDEB8B]" : "bg-[#eef1f6]"
                        }`}
                    >
                      <Text
                        className={`text-sm font-medium ${type === t ? "text-[#2E5E1A]" : "text-gray-700"
                          }`}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}

            {/* Add Button */}
            <View className="px-6 mt-6">
              <TouchableOpacity
                onPress={() => {
                  setFormData({});
                  setShowAddModal(true);
                }}
                className="bg-[#218fb4] py-4 rounded-2xl"
              >
                <Text className="text-white text-center text-lg font-semibold">
                  + Add Item
                </Text>
              </TouchableOpacity>
            </View>

            {/* Loading */}
            {loading && (
              <View className="mt-8 items-center">
                <ActivityIndicator size="large" color="#218fb4" />
                <Text className="mt-2 text-gray-500">Loading...</Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white mx-6 mt-5 px-5 py-5 rounded-3xl shadow-sm border border-[#eef1f6]">
            <Text className="text-lg font-semibold text-gray-900">
              {getDisplayName(item)}
            </Text>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Delete Item",
                  `Delete "${getDisplayName(item)}"?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => handleDelete(item.id),
                    },
                  ]
                )
              }
              className="mt-4"
            >
              <Text className="text-red-500 font-semibold text-base">
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text className="text-center text-gray-500 mt-12">
              No items found
            </Text>
          ) : null
        }
      />

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/30 justify-end">
            <KeyboardAvoidingView
              behavior={Platform.OS === "android" ? "height" : "padding"}
              keyboardVerticalOffset={20}
            >
              <View
                className="bg-white rounded-t-3xl px-6 pb-10"
                style={{
                  maxHeight: "88%",
                  paddingTop: 28,
                }}
              >
                <Text className="text-2xl font-bold text-gray-900 mb-5">
                  Add {category}
                  {type ? ` → ${type}` : ""}
                </Text>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 30 }}
                >
                  {(
                    category === "transportation"
                      ? transportFieldConfig[type] || []
                      : fieldConfig[category]?.[type] ||
                      fieldConfig[category]?.default ||
                      []
                  ).map((field) => (
                    <TextInput
                      key={field}
                      placeholder={field}
                      placeholderTextColor="#777"
                      value={formData[field] || ""}
                      onChangeText={(text) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field]: text,
                        }))
                      }
                      className="border border-gray-300 rounded-2xl px-4 py-4 text-base bg-[#f8f9fc] mb-3"
                      style={{ minHeight: 58 }}
                    />
                  ))}

                  <TouchableOpacity
                    onPress={handleAdd}
                    className="bg-[#218fb4] py-4 rounded-2xl mt-3"
                  >
                    <Text className="text-white text-center text-lg font-semibold">
                      Save Item
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setShowAddModal(false);
                      setFormData({});
                    }}
                    className="py-4 rounded-2xl mt-3 bg-[#eef1f6]"
                  >
                    <Text className="text-center text-gray-700 text-lg font-medium">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}