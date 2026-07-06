import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SEARCH_URL } from "../../config";

const BACKEND_URL = SEARCH_URL;

export default function Search() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (text) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: text }),
      });

      const data = await res.json();

      if (data.success) {
        setSuggestions(data.suggestions || []);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.log("Suggestion error:", error);
      setSuggestions([]);
    }
  };

  const handleChange = (text) => {
    setQuery(text);
    fetchSuggestions(text);
  };

  const handleSearch = async (text) => {
    if (!text.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: text }),
      });

      const data = await res.json();

      if (data.success && data.route) {
        router.push({
          pathname: data.route,
          params: data.filters || {},
        });

        setQuery("");
        setSuggestions([]);
      } else {
        Alert.alert("No Match", "Could not understand search.");
      }
    } catch (error) {
      console.log("Search error:", error);
      Alert.alert("Error", "Backend not reachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb]">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-3xl font-bold text-slate-800">Search</Text>
        <Text className="text-sm text-gray-600 mt-1">Find anything in Jaipur</Text>
      </View>

      {/* Search bar */}
      <View className="mx-5 mt-3 mb-2 flex-row items-center bg-white rounded-2xl px-4 py-3"
        style={{ shadowColor: "#64748b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.13, shadowRadius: 10, elevation: 5 }}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search anything..."
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={handleChange}
          onSubmitEditing={() => handleSearch(query)}
          className="flex-1 text-base text-slate-800"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => { setQuery(""); setSuggestions([]); }}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </Pressable>
        )}
      </View>

      {loading && (
        <View className="mt-4 items-center">
          <ActivityIndicator size="small" color="#218fb4" />
        </View>
      )}

      {suggestions.length > 0 && (
        <View className="mx-5 mt-2 bg-white rounded-2xl overflow-hidden"
          style={{ shadowColor: "#64748b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSearch(item)}
                className="px-4 py-3 border-b border-gray-100 flex-row items-center"
                style={({ pressed }) => pressed ? { backgroundColor: "#f1f5f9" } : {}}
              >
                <Ionicons name="search-outline" size={14} color="#94a3b8" style={{ marginRight: 10 }} />
                <Text className="text-sm text-slate-700 capitalize">{item}</Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Empty state hint */}
      {!loading && suggestions.length === 0 && query.length === 0 && (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="search-outline" size={52} color="#cbd5e1" />
          <Text className="text-base font-bold text-gray-600 mt-4 mb-1">Search anything</Text>
          <Text className="text-sm text-gray-400 text-center">
            Try "hospitals near me", "street food", "bus to Ajmer"
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}