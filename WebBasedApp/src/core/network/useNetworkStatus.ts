import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

export const useNetworkStatus = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let interval: ReturnType<typeof setInterval>;

    const checkNetwork = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        if (isMounted) {
          // If internetReachable is explicitly false, or if there's no connection
          const offline = networkState.isConnected === false || networkState.isInternetReachable === false;
          setIsOffline(offline);
        }
      } catch (e) {
        // Fallback to offline if we can't check
        if (isMounted) setIsOffline(true);
      }
    };

    // Initial check
    checkNetwork();

    // Poll occasionally (Expo Network doesn't have listeners in bare workflow for some versions, polling is safest)
    interval = setInterval(checkNetwork, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { isOffline };
};
