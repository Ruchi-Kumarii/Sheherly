import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setName(snap.data().name || "");
        setPhone(snap.data().phone || "");
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Not logged in");
        return;
      }

      await updateDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        phone: phone.trim(),
      });

      Alert.alert("Profile updated ✅");
      router.back();
    } catch (err) {
      console.log("UPDATE PROFILE ERROR:", err);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb]">
      <ScrollView className="mx-6 mt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-xl font-bold text-gray-800 mb-6">Edit Profile</Text>

        {/* Name */}
        <View className="mb-4">
          <Text className="text-sm text-gray-500 mb-1">Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            className="bg-white p-3 rounded-2xl shadow text-gray-800"
          />
        </View>

        {/* Phone */}
        <View className="mb-4">
          <Text className="text-sm text-gray-500 mb-1">Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone"
            keyboardType="phone-pad"
            className="bg-white p-3 rounded-2xl shadow text-gray-800"
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-blue-500 p-4 rounded-2xl items-center mt-4"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
