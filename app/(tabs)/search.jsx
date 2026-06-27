import { View, TextInput, FlatList, Pressable, Text, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
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
    <View className="flex-1 bg-white p-6">
      <View className="border top-10 rounded-xl px-3 py-2">
        <TextInput
          placeholder="Search anything..."
          value={query}
          onChangeText={handleChange}
          onSubmitEditing={() => handleSearch(query)}
          className="text-base"
        />
      </View>

      {loading && (
        <View className="mt-4">
          <ActivityIndicator size="small" />
        </View>
      )}

      {suggestions.length > 0 && (
        <View className="mt-3 bg-white rounded-xl shadow">
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSearch(item)}
                className="px-4 py-3 border-b border-gray-100"
              >
                <Text className="text-base capitalize">{item}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}