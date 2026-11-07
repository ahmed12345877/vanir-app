import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TravelApiConfig {
  rapidApi: {
    enabled: boolean;
    key: string;
    host: string;
  };
  amadeus: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    environment: 'test' | 'production';
  };
}

const STORAGE_KEY = '@vanir_travel_api_config_v1';

/**
 * Default travel API credentials.
 * Users can either paste their keys here directly or update them
 * dynamically via the in-app settings / AsyncStorage.
 */
export const DEFAULT_TRAVEL_CONFIG: TravelApiConfig = {
  rapidApi: {
    enabled: true,
    key: '', // Paste RapidAPI Key here (e.g. from rapidapi.com)
    host: 'booking-com15.p.rapidapi.com',
  },
  amadeus: {
    enabled: true,
    clientId: '', // Paste Amadeus Client ID here (from developers.amadeus.com)
    clientSecret: '', // Paste Amadeus Client Secret here
    environment: 'test', // 'test' = Free Sandbox (2000 free req/mo), 'production' = Live
  },
};

let inMemoryConfig: TravelApiConfig = { ...DEFAULT_TRAVEL_CONFIG };

/**
 * Loads configuration from local persistent storage with fallback to defaults.
 */
export async function getTravelApiConfig(): Promise<TravelApiConfig> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      inMemoryConfig = {
        rapidApi: {
          ...DEFAULT_TRAVEL_CONFIG.rapidApi,
          ...(parsed.rapidApi || {}),
        },
        amadeus: {
          ...DEFAULT_TRAVEL_CONFIG.amadeus,
          ...(parsed.amadeus || {}),
        },
      };
    }
  } catch {
    // Keep inMemoryConfig as fallback
  }
  return inMemoryConfig;
}

/**
 * Saves updated API credentials to persistent storage.
 */
export async function saveTravelApiConfig(config: Partial<TravelApiConfig>): Promise<TravelApiConfig> {
  try {
    inMemoryConfig = {
      rapidApi: {
        ...inMemoryConfig.rapidApi,
        ...(config.rapidApi || {}),
      },
      amadeus: {
        ...inMemoryConfig.amadeus,
        ...(config.amadeus || {}),
      },
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryConfig));
  } catch (err) {
    console.warn('[TravelApiConfig] Error saving config:', err);
  }
  return inMemoryConfig;
}

/**
 * Synchronous getter for current memory config.
 */
export function getCachedTravelConfig(): TravelApiConfig {
  return inMemoryConfig;
}

export function isRapidApiActive(): boolean {
  return inMemoryConfig.rapidApi.enabled && inMemoryConfig.rapidApi.key.trim().length > 10;
}

export function isAmadeusActive(): boolean {
  return (
    inMemoryConfig.amadeus.enabled &&
    inMemoryConfig.amadeus.clientId.trim().length > 5 &&
    inMemoryConfig.amadeus.clientSecret.trim().length > 5
  );
}
