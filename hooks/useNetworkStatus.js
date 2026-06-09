import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Returns { isOnline: boolean }
 * Subscribes to network changes and updates in real-time.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Fetch current state immediately
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected && state.isInternetReachable !== false);
    });

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected && state.isInternetReachable !== false);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline };
}
