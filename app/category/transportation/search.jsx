import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TransportSearch() {
  const router = useRouter();
  const { type } = useLocalSearchParams();

  // BUS
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // RICKSHAW
  const [service, setService] = useState("Passenger");
  const [area, setArea] = useState("Sindhi Camp");

  const areas = [
    "Sindhi Camp",
    "Bapu Nagar",
    "Vaishali Nagar",
    "Malviya Nagar",
    "Jawahar Nagar",
    "Civil Lines",
    "Jaipur Central",
    "Mansarovar",
  ];


  const handleSearch = () => {
    // RICKSHAW
    if (type === "rickshaw") {
      if (!service || !area) {
        Alert.alert("Missing Info", "Please select service and area");
        return;
      }

      router.push(
        `/category/transportation/rickshaw?service=${encodeURIComponent(
          service
        )}&area=${encodeURIComponent(area)}`
      );
      return;
    }

    // BIKE RENTALS
    if (type === "bike-rentals") {
      // (optional validation later if needed)
      router.push(`/category/transportation/bike-rentals`);
      return;
    }

    // BUS
    if (!from.trim() || !to.trim()) {
      Alert.alert(
        "Missing Info",
        "Please enter both From and To locations"
      );
      return;
    }

    router.push(
      `/category/transportation/bus?from=${encodeURIComponent(
        from.trim()
      )}&to=${encodeURIComponent(to.trim())}`
    );
  };

  const detectLocation = () => {
    if (type === "rickshaw") {
      setArea("Sindhi Camp");
    } else if (type === "bike-rentals") {
      // optional future GPS logic
    } else {
      setFrom("Jaipur");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {type === "bus"
          ? "Search Buses 🚌"
          : type === "rickshaw"
            ? "Find E-Rickshaw 🚖"
            : type === "bike-rentals"
              ? "Bike Rentals 🏍️"
              : `Search ${type}`}
      </Text>

      <TouchableOpacity style={styles.locationBtn} onPress={detectLocation}>
        <Ionicons name="locate-outline" size={16} color="#0b3d91" style={{ marginRight: 6 }} />
        <Text style={styles.locationText}>Use Current Location</Text>
      </TouchableOpacity>


      {type === "bus" ? (
        <View style={styles.card}>
          <TextInput
            placeholder="From (e.g. Jaipur)"
            value={from}
            onChangeText={setFrom}
            style={styles.input}
          />

          <TextInput
            placeholder="To (e.g. Delhi)"
            value={to}
            onChangeText={setTo}
            style={styles.input}
          />
        </View>
      ) : type === "rickshaw" ? (

        <View style={styles.card}>
          <Text style={styles.label}>Service Type</Text>

          <View style={styles.serviceRow}>
            {["Passenger", "Goods"].map((item) => {
              const active = service === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, active && styles.activeChip]}
                  onPress={() => setService(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && styles.activeChipText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>Pickup Area</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 6 }}
          >
            {areas.map((item) => {
              const active = area === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    active && styles.activeChip,
                    { marginRight: 10 },
                  ]}
                  onPress={() => setArea(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && styles.activeChipText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : type === "bike-rentals" ? (
        /* 🛵 BIKE RENTALS UI */
        <View style={styles.card}>
          <Text style={styles.label}>Find Nearby Bikes</Text>
          <Text style={{ color: "#6b7280", marginBottom: 10 }}>
            Click fast, rent faster..
          </Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>
          {type === "rickshaw"
            ? "Find Drivers"
            : type === "bike-rentals"
              ? "Find Bikes"
              : "Search"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6fb",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 15,
    color: "#0b3d91",
  },

  locationBtn: {
    backgroundColor: "#e8f0ff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },

  locationText: {
    color: "#0b3d91",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4b5563",
    marginBottom: 10,
  },

  serviceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  chip: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 10,
    marginBottom: 10,
  },

  activeChip: {
    backgroundColor: "#eef2ff",
    borderColor: "#4F6EF7",
  },

  chipText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 13,
  },

  activeChipText: {
    color: "#4F6EF7",
  },

  button: {
    backgroundColor: "#5a5affd9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});