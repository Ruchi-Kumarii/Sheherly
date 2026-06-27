import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      Alert.alert("Error", "Type DELETE to confirm");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Please enter your password to confirm");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/signin");
        return;
      }

      // Re-authenticate before deleting
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete Firestore profile doc
      await deleteDoc(doc(db, "users", user.uid));

      // Delete Firebase Auth account
      await deleteUser(user);

      Alert.alert("Account Deleted", "Your account has been permanently deleted.", [
        { text: "OK", onPress: () => router.replace("/signup") },
      ]);
    } catch (err) {
      console.log("DELETE ACCOUNT ERROR:", err.code);
      const messages = {
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-credential": "Incorrect password.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
      };
      Alert.alert("Error", messages[err.code] || "Failed to delete account.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb] px-6 pt-6">
      <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
        Delete Account
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-4">
        This action is permanent and cannot be undone.
      </Text>

      <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <Text className="text-red-700 text-sm">
          • Your profile will be permanently deleted{"\n"}
          • You will lose all saved data{"\n"}
          • This cannot be recovered
        </Text>
      </View>

      <Text className="text-sm text-gray-600 mb-2">Enter your password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry
        className="bg-white p-3 rounded-2xl shadow mb-4"
      />

      <Text className="text-sm text-gray-600 mb-2">Type DELETE to confirm</Text>
      <TextInput
        value={confirmText}
        onChangeText={setConfirmText}
        placeholder="DELETE"
        className="bg-white p-3 rounded-2xl shadow mb-6"
      />

      <TouchableOpacity
        onPress={handleDelete}
        disabled={confirmText !== "DELETE"}
        className={`p-4 rounded-2xl items-center ${
          confirmText === "DELETE" ? "bg-red-600" : "bg-red-300"
        }`}
      >
        <Text className="text-white font-semibold">Permanently Delete Account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
