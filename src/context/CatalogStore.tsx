import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogItem } from '../components/CatalogListScreen';
import {
  CatalogCategory,
  fetchAirports,
  fetchEsims,
  fetchFlights,
  fetchHotels,
  fetchJets,
  fetchLimousines,
  fetchVisas,
  fetchYachts,
} from '../services/catalogApi';
import {
  subscribeLiveHotels,
  subscribeLiveYachts,
  subscribeLiveTransfers,
  subscribeLiveJets,
  memoryHotelsCache,
  memoryYachtsCache,
  memoryTransfersCache,
  memoryJetsCache,
} from '../services/firestore';

type CatalogStoreValue = {
  itemsByCategory: Record<CatalogCategory, CatalogItem[]>;
  loadingByCategory: Record<CatalogCategory, boolean>;
  errorsByCategory: Record<CatalogCategory, string | null>;
  fetchCategory: (
    category: CatalogCategory,
    options?: { force?: boolean },
  ) => Promise<void>;
};

const getInitialItems = (): Record<CatalogCategory, CatalogItem[]> => ({
  hotels: (memoryHotelsCache as any) || [],
  jets: (memoryJetsCache as any) || [],
  flights: [],
  yachts: (memoryYachtsCache as any) || [],
  limousines: (memoryTransfersCache as any) || [],
  esims: [],
  visas: [],
  airports: [],
});

const EMPTY_ITEMS: Record<CatalogCategory, CatalogItem[]> = {
  hotels: [],
  jets: [],
  flights: [],
  yachts: [],
  limousines: [],
  esims: [],
  visas: [],
  airports: [],
};

const EMPTY_LOADING: Record<CatalogCategory, boolean> = {
  hotels: false,
  jets: false,
  flights: false,
  yachts: false,
  limousines: false,
  esims: false,
  visas: false,
  airports: false,
};

const EMPTY_ERRORS: Record<CatalogCategory, string | null> = {
  hotels: null,
  jets: null,
  flights: null,
  yachts: null,
  limousines: null,
  esims: null,
  visas: null,
  airports: null,
};

const catalogFetchers: Record<CatalogCategory, () => ReturnType<typeof fetchHotels>> = {
  hotels: fetchHotels,
  jets: fetchJets,
  flights: fetchFlights,
  yachts: fetchYachts,
  limousines: fetchLimousines,
  esims: fetchEsims,
  visas: fetchVisas,
  airports: fetchAirports,
};

const CatalogStoreContext = createContext<CatalogStoreValue | null>(null);

export function CatalogStoreProvider({ children }: PropsWithChildren) {
  const [itemsByCategory, setItemsByCategory] = useState(getInitialItems);
  const [loadingByCategory, setLoadingByCategory] = useState(EMPTY_LOADING);
  const [errorsByCategory, setErrorsByCategory] = useState(EMPTY_ERRORS);
  const itemsRef = useRef(itemsByCategory);
  const loadingRef = useRef(loadingByCategory);

  useEffect(() => {
    itemsRef.current = itemsByCategory;
  }, [itemsByCategory]);

  useEffect(() => {
    loadingRef.current = loadingByCategory;
  }, [loadingByCategory]);

  // Real-time synchronization with Cloud Firestore for hotels, yachts, and limousines
  useEffect(() => {
    const unsubHotels = subscribeLiveHotels(liveHotels => {
      if (liveHotels && liveHotels.length > 0) {
        setItemsByCategory(prev => ({
          ...prev,
          hotels: liveHotels,
        }));
      }
    });

    const unsubYachts = subscribeLiveYachts(liveYachts => {
      if (liveYachts && liveYachts.length > 0) {
        setItemsByCategory(prev => ({
          ...prev,
          yachts: liveYachts,
        }));
      }
    });

    const unsubTransfers = subscribeLiveTransfers(liveTransfers => {
      if (liveTransfers && liveTransfers.length > 0) {
        setItemsByCategory(prev => ({
          ...prev,
          limousines: liveTransfers,
        }));
      }
    });

    const unsubJets = subscribeLiveJets(liveJets => {
      if (liveJets && liveJets.length > 0) {
        setItemsByCategory(prev => ({
          ...prev,
          jets: liveJets,
        }));
      }
    });

    return () => {
      unsubHotels();
      unsubYachts();
      unsubTransfers();
      unsubJets();
    };
  }, []);

  const fetchCategory = useCallback(async (
    category: CatalogCategory,
    options?: { force?: boolean },
  ) => {
    const forceRefresh = Boolean(options?.force);

    if (!forceRefresh && (loadingRef.current[category] || itemsRef.current[category].length > 0)) {
      return;
    }

    setLoadingByCategory(prev => ({ ...prev, [category]: true }));
    setErrorsByCategory(prev => ({ ...prev, [category]: null }));

    try {
      const response = await catalogFetchers[category]();
      setItemsByCategory(prev => ({ ...prev, [category]: response.data }));
    } catch (error) {
      setErrorsByCategory(prev => ({
        ...prev,
        [category]: error instanceof Error ? error.message : 'Unable to load catalog items.',
      }));
    } finally {
      setLoadingByCategory(prev => ({ ...prev, [category]: false }));
    }
  }, []);

  const value = useMemo<CatalogStoreValue>(
    () => ({
      itemsByCategory,
      loadingByCategory,
      errorsByCategory,
      fetchCategory,
    }),
    [errorsByCategory, fetchCategory, itemsByCategory, loadingByCategory],
  );

  return <CatalogStoreContext.Provider value={value}>{children}</CatalogStoreContext.Provider>;
}

export function useCatalogStore() {
  const store = useContext(CatalogStoreContext);

  if (!store) {
    throw new Error('useCatalogStore must be used inside CatalogStoreProvider.');
  }

  return store;
}
