import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Alert,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

// ── helpers ──────────────────────────────────────────────────
const roleBadge = {
  admin:     { bg: "#fff3e0", text: "#e65100" },
  user:      { bg: "#dcedc8", text: "#2e7d32" },
  suspended: { bg: "#fce4ec", text: "#b71c1c" },
  blocked:   { bg: "#eeeeee", text: "#424242" },
};

const statusLabel = (u) => {
  if (u.blocked)   return "blocked";
  if (u.suspended) return "suspended";
  return u.role || "user";
};

export default function Users() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null); // user shown in modal

  // ── fetch ─────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "users"));
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);
    } catch (e) {
      console.error("FETCH USERS ERROR:", e);
      Alert.alert("Error", "Could not load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── update helper ─────────────────────────────────────────
  const updateUser = async (uid, patch) => {
    try {
      await updateDoc(doc(db, "users", uid), patch);
      // Refresh local state without full refetch
      setUsers((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, ...patch } : u))
      );
      if (selected?.id === uid) setSelected((prev) => ({ ...prev, ...patch }));
    } catch (e) {
      console.error("UPDATE USER ERROR:", e);
      Alert.alert("Error", "Could not update user");
    }
  };

  // ── role change ───────────────────────────────────────────
  const handleChangeRole = (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    Alert.alert(
      "Change Role",
      `Set "${user.email}" as ${newRole.toUpperCase()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => updateUser(user.id, { role: newRole }),
        },
      ]
    );
  };

  // ── block ─────────────────────────────────────────────────
  const handleBlock = (user) => {
    const isBlocked = !!user.blocked;
    Alert.alert(
      isBlocked ? "Unblock User" : "Block User",
      isBlocked
        ? `Unblock "${user.email}"?`
        : `Block "${user.email}"? They won't be able to sign in.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isBlocked ? "Unblock" : "Block",
          style: isBlocked ? "default" : "destructive",
          onPress: () =>
            updateUser(user.id, {
              blocked: !isBlocked,
              // clear suspension if blocking
              ...(isBlocked ? {} : { suspended: false }),
            }),
        },
      ]
    );
  };

  // ── suspend ───────────────────────────────────────────────
  const handleSuspend = (user) => {
    const isSuspended = !!user.suspended;
    Alert.alert(
      isSuspended ? "Lift Suspension" : "Suspend User",
      isSuspended
        ? `Lift suspension for "${user.email}"?`
        : `Suspend "${user.email}" temporarily?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isSuspended ? "Lift" : "Suspend",
          style: isSuspended ? "default" : "destructive",
          onPress: () =>
            updateUser(user.id, {
              suspended: !isSuspended,
              ...(isSuspended ? {} : { blocked: false }),
            }),
        },
      ]
    );
  };

  // ── user card ─────────────────────────────────────────────
  const renderUser = ({ item, index }) => {
    const label = statusLabel(item);
    const badge = roleBadge[label] || roleBadge.user;

    return (
      <TouchableOpacity
        onPress={() => setSelected(item)}
        activeOpacity={0.85}
        style={{
          backgroundColor: "white",
          padding: 16,
          borderRadius: 14,
          marginBottom: 12,
          elevation: 2,
        }}
      >
        {/* Row: email + badge */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#222", flex: 1, marginRight: 8 }}>
            {index + 1}. {item.email}
          </Text>
          <View style={{ backgroundColor: badge.bg, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 }}>
            <Text style={{ fontWeight: "700", color: badge.text, fontSize: 11 }}>
              {label.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={{ marginTop: 6, color: "#555" }}>
          Name: {item.name?.trim() || "N/A"}
        </Text>
        <Text style={{ marginTop: 3, color: "#555" }}>
          Phone: {item.phone?.trim() || "N/A"}
        </Text>

        {/* Action buttons */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          <ActionBtn
            label={item.role === "admin" ? "Make User" : "Make Admin"}
            color="#218fb4"
            onPress={() => handleChangeRole(item)}
          />
          <ActionBtn
            label={item.suspended ? "Lift Suspension" : "Suspend"}
            color={item.suspended ? "#2e7d32" : "#f57c00"}
            onPress={() => handleSuspend(item)}
          />
          <ActionBtn
            label={item.blocked ? "Unblock" : "Block"}
            color={item.blocked ? "#2e7d32" : "#c62828"}
            onPress={() => handleBlock(item)}
          />
        </View>
      </TouchableOpacity>
    );
  };

  // ── details modal ─────────────────────────────────────────
  const DetailModal = () => {
    if (!selected) return null;
    const label = statusLabel(selected);
    const badge = roleBadge[label] || roleBadge.user;

    return (
      <Modal visible animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, backgroundColor: "#00000055", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "80%" }}>
            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Header row */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "#111" }}>User Details</Text>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Text style={{ fontSize: 22, color: "#888" }}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Status badge */}
              <View style={{ alignSelf: "flex-start", backgroundColor: badge.bg, paddingVertical: 5, paddingHorizontal: 14, borderRadius: 20, marginBottom: 18 }}>
                <Text style={{ fontWeight: "700", color: badge.text }}>{label.toUpperCase()}</Text>
              </View>

              {/* Details */}
              {[
                ["Email",      selected.email],
                ["Name",       selected.name?.trim()  || "N/A"],
                ["Phone",      selected.phone?.trim() || "N/A"],
                ["Role",       selected.role  || "user"],
                ["Blocked",    selected.blocked   ? "Yes" : "No"],
                ["Suspended",  selected.suspended ? "Yes" : "No"],
                ["Joined",     selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "N/A"],
                ["UID",        selected.id],
              ].map(([label, value]) => (
                <View key={label} style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, color: "#999", marginBottom: 2 }}>{label}</Text>
                  <Text style={{ fontSize: 14, color: "#222" }}>{value}</Text>
                </View>
              ))}

              {/* Actions */}
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#111", marginTop: 10, marginBottom: 12 }}>
                Actions
              </Text>

              <View style={{ gap: 10 }}>
                <ModalActionBtn
                  label={selected.role === "admin" ? "Change Role → User" : "Change Role → Admin"}
                  color="#218fb4"
                  onPress={() => handleChangeRole(selected)}
                />
                <ModalActionBtn
                  label={selected.suspended ? "Lift Suspension" : "Suspend User"}
                  color={selected.suspended ? "#2e7d32" : "#f57c00"}
                  onPress={() => handleSuspend(selected)}
                />
                <ModalActionBtn
                  label={selected.blocked ? "Unblock User" : "Block User"}
                  color={selected.blocked ? "#2e7d32" : "#c62828"}
                  onPress={() => handleBlock(selected)}
                />
              </View>

              <TouchableOpacity
                onPress={() => setSelected(null)}
                style={{ marginTop: 16, padding: 14, borderRadius: 12, backgroundColor: "#f0f0f0", alignItems: "center" }}
              >
                <Text style={{ color: "#555", fontWeight: "600" }}>Close</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // ── render ────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fa" }}>
      <StatusBar barStyle="dark-content" />

      <View style={{ padding: 20, paddingBottom: 8 }}>
        <Text style={{ fontSize: 26, fontWeight: "700", color: "#222" }}>
          Manage Users
        </Text>
        <Text style={{ marginTop: 4, color: "#666", fontSize: 15 }}>
          {users.length} registered user{users.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#218fb4" />
          <Text style={{ marginTop: 10, color: "#555" }}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 30 }}
          renderItem={renderUser}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 40, color: "#777" }}>
              No users found
            </Text>
          }
        />
      )}

      <DetailModal />
    </SafeAreaView>
  );
}

// ── small components ──────────────────────────────────────────
function ActionBtn({ label, color, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderWidth: 1.5,
        borderColor: color,
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 12,
      }}
    >
      <Text style={{ color, fontWeight: "600", fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function ModalActionBtn({ label, color, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: color,
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>{label}</Text>
    </TouchableOpacity>
  );
}
