import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebase";

// ─── Key helpers ───────────────────────────────────────────────────────────────
// All keys are scoped to the logged-in user:
//   offline_cache:<uid>:list:<category>:<type>   → full list cache
//   offline_cache:<uid>:item:<itemId>             → single saved item
//   offline_cache:<uid>:__list_index__            → array of list keys
//   offline_cache:<uid>:__item_index__            → array of item keys

function getUid() {
  return auth?.currentUser?.uid || null;
}

function listKey(uid, category, type) {
  return `offline_cache:${uid}:list:${category}:${type}`;
}

function itemKey(uid, itemId) {
  return `offline_cache:${uid}:item:${itemId}`;
}

function listIndexKey(uid) {
  return `offline_cache:${uid}:__list_index__`;
}

function itemIndexKey(uid) {
  return `offline_cache:${uid}:__item_index__`;
}

// ─── Auth guard helper ─────────────────────────────────────────────────────────
function requireAuth() {
  const uid = getUid();
  if (!uid) return null;
  return uid;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LIST CACHE  (full category page)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Save a full list for a category+type.
 * Silent no-op if user is not logged in (guest mode).
 */
export async function saveOfflineData(category, type, data, meta = {}) {
  try {
    const uid = requireAuth();
    if (!uid) return; // guest — never save

    const key = listKey(uid, category, type);
    const payload = { category, type, data, meta, savedAt: new Date().toISOString() };
    await AsyncStorage.setItem(key, JSON.stringify(payload));

    const idxKey = listIndexKey(uid);
    const raw = await AsyncStorage.getItem(idxKey);
    const index = raw ? JSON.parse(raw) : [];
    if (!index.includes(key)) {
      index.push(key);
      await AsyncStorage.setItem(idxKey, JSON.stringify(index));
    }
  } catch (err) {
    console.warn("saveOfflineData error:", err);
  }
}

/**
 * Load cached list. Works for any user (guest gets null).
 */
export async function loadOfflineData(category, type) {
  try {
    const uid = requireAuth();
    if (!uid) return null;

    const key = listKey(uid, category, type);
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("loadOfflineData error:", err);
    return null;
  }
}

export async function removeOfflineData(category, type) {
  try {
    const uid = requireAuth();
    if (!uid) return;

    const key = listKey(uid, category, type);
    await AsyncStorage.removeItem(key);

    const idxKey = listIndexKey(uid);
    const raw = await AsyncStorage.getItem(idxKey);
    if (!raw) return;
    const index = JSON.parse(raw).filter((k) => k !== key);
    await AsyncStorage.setItem(idxKey, JSON.stringify(index));
  } catch (err) {
    console.warn("removeOfflineData error:", err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ITEM CACHE  (individual bookmarked item)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Save a single bookmarked item.
 * @param {object} item       The full item object (must have .id or .name)
 * @param {object} itemMeta   { category, type, label, emoji, route }
 */
export async function saveOfflineItem(item, itemMeta = {}) {
  try {
    const uid = requireAuth();
    if (!uid) return false; // guest

    // Use a stable id: prefer item.id, fallback to slugified name
    const stableId = item.id || item.name?.toLowerCase().replace(/\s+/g, "-") || Date.now().toString();
    const key = itemKey(uid, stableId);

    const payload = {
      id: stableId,
      item,
      itemMeta,
      savedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(key, JSON.stringify(payload));

    const idxKey = itemIndexKey(uid);
    const raw = await AsyncStorage.getItem(idxKey);
    const index = raw ? JSON.parse(raw) : [];
    if (!index.includes(key)) {
      index.push(key);
      await AsyncStorage.setItem(idxKey, JSON.stringify(index));
    }
    return true;
  } catch (err) {
    console.warn("saveOfflineItem error:", err);
    return false;
  }
}

/**
 * Check if an individual item is already bookmarked.
 */
export async function isItemSaved(itemId) {
  try {
    const uid = requireAuth();
    if (!uid) return false;
    const key = itemKey(uid, itemId);
    const raw = await AsyncStorage.getItem(key);
    return raw !== null;
  } catch {
    return false;
  }
}

/**
 * Remove a single bookmarked item.
 */
export async function removeOfflineItem(itemId) {
  try {
    const uid = requireAuth();
    if (!uid) return;
    const key = itemKey(uid, itemId);
    await AsyncStorage.removeItem(key);

    const idxKey = itemIndexKey(uid);
    const raw = await AsyncStorage.getItem(idxKey);
    if (!raw) return;
    const index = JSON.parse(raw).filter((k) => k !== key);
    await AsyncStorage.setItem(idxKey, JSON.stringify(index));
  } catch (err) {
    console.warn("removeOfflineItem error:", err);
  }
}

/**
 * Load all individually saved items for the current user.
 */
export async function loadAllOfflineItems() {
  try {
    const uid = requireAuth();
    if (!uid) return [];

    const idxKey = itemIndexKey(uid);
    const raw = await AsyncStorage.getItem(idxKey);
    if (!raw) return [];

    const index = JSON.parse(raw);
    const results = [];
    for (const key of index) {
      const entry = await AsyncStorage.getItem(key);
      if (entry) results.push(JSON.parse(entry));
    }
    return results;
  } catch (err) {
    console.warn("loadAllOfflineItems error:", err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAP LOCATION CACHE
// ═══════════════════════════════════════════════════════════════════════════════

function mapKey(uid) {
  return `offline_cache:${uid}:saved_maps`;
}

/**
 * Save a map location pin.
 * @param {{ name, lat, lng, address? }} location
 */
export async function saveMapLocation(location) {
  try {
    const uid = requireAuth();
    if (!uid) return false;

    const key = mapKey(uid);
    const raw = await AsyncStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : [];

    // avoid duplicates by name+coords
    const stableId = `${location.name}-${location.lat}-${location.lng}`;
    const alreadyExists = existing.some(
      (e) => e.id === stableId
    );
    if (alreadyExists) return true;

    existing.push({ ...location, id: stableId, savedAt: new Date().toISOString() });
    await AsyncStorage.setItem(key, JSON.stringify(existing));
    return true;
  } catch (err) {
    console.warn("saveMapLocation error:", err);
    return false;
  }
}

export async function loadMapLocations() {
  try {
    const uid = requireAuth();
    if (!uid) return [];

    const key = mapKey(uid);
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("loadMapLocations error:", err);
    return [];
  }
}

export async function removeMapLocation(locationId) {
  try {
    const uid = requireAuth();
    if (!uid) return;
    const key = mapKey(uid);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return;
    const updated = JSON.parse(raw).filter((l) => l.id !== locationId);
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.warn("removeMapLocation error:", err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LOAD ALL  (for the Saved screen — lists + items + maps)
// ═══════════════════════════════════════════════════════════════════════════════

export async function loadAllOfflineData() {
  try {
    const uid = requireAuth();
    if (!uid) return [];

    const idxKey = listIndexKey(uid);
    const raw = await AsyncStorage.getItem(idxKey);
    if (!raw) return [];

    const index = JSON.parse(raw);
    const results = [];
    for (const key of index) {
      const entry = await AsyncStorage.getItem(key);
      if (entry) results.push(JSON.parse(entry));
    }
    return results;
  } catch (err) {
    console.warn("loadAllOfflineData error:", err);
    return [];
  }
}

export async function clearAllOfflineData() {
  try {
    const uid = requireAuth();
    if (!uid) return;

    const idxKey = listIndexKey(uid);
    const itemIdxKey = itemIndexKey(uid);
    const mapK = mapKey(uid);

    const rawLists = await AsyncStorage.getItem(idxKey);
    const rawItems = await AsyncStorage.getItem(itemIdxKey);

    const listKeys = rawLists ? JSON.parse(rawLists) : [];
    const itemKeys = rawItems ? JSON.parse(rawItems) : [];

    await AsyncStorage.multiRemove([...listKeys, ...itemKeys, idxKey, itemIdxKey, mapK]);
  } catch (err) {
    console.warn("clearAllOfflineData error:", err);
  }
}
