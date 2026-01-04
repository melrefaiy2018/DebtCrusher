import { CreditCard, FinancialProfile } from '../types';

interface DatabaseSchema {
  profile: FinancialProfile;
  cards: Record<string, CreditCard>;
  lastUpdated: number;
}

const DEFAULT_DB: DatabaseSchema = {
  profile: { monthlyNetIncome: 0 },
  cards: {},
  lastUpdated: Date.now(),
};

// In-memory cache
let dbCache: DatabaseSchema | null = null;

export const DB = {
  /**
   * Loads the entire database from the file system API.
   */
  loadAsync: async (): Promise<DatabaseSchema> => {
    if (dbCache) {
        console.log("[DB] Loading from cache", dbCache);
        return dbCache;
    }

    try {
      const response = await fetch('/api/db');
      if (!response.ok) throw new Error('Failed to fetch DB');
      
      const data = await response.json();
      
      // If empty object (new file), return default
      if (!data || Object.keys(data).length === 0) {
         dbCache = DEFAULT_DB;
         return DEFAULT_DB;
      }

      // Merge with default to ensure structure
      dbCache = { ...DEFAULT_DB, ...data };
      console.log("[DB] Loaded from file system", dbCache);
      return dbCache!;
    } catch (e) {
      console.error("Failed to load DB from file system", e);
      return DEFAULT_DB;
    }
  },

  /**
   * Persists the database to the file system API.
   */
  saveAsync: async (data: Partial<DatabaseSchema>) => {
    try {
      // Ensure we have the latest state in cache or fetch it first?
      // For simplicity, we assume cache is populated if we are saving.
      const current = dbCache || DEFAULT_DB;
      const updated = { ...current, ...data, lastUpdated: Date.now() };
      
      // Update cache
      dbCache = updated;
      
      // Persist
      console.log("[DB] Saving to file system", updated);
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.error("Failed to save DB to file system", e);
    }
  },

  // --- Entity Accessors (Async) ---

  getCards: async (): Promise<CreditCard[]> => {
    const db = await DB.loadAsync();
    return Object.values(db.cards || {});
  },

  saveCards: async (cards: CreditCard[]) => {
    const cardDict: Record<string, CreditCard> = {};
    cards.forEach(c => {
      cardDict[c.id] = c;
    });
    await DB.saveAsync({ cards: cardDict });
  },

  getProfile: async (): Promise<FinancialProfile> => {
    const db = await DB.loadAsync();
    return db.profile || DEFAULT_DB.profile;
  },

  saveProfile: async (profile: FinancialProfile) => {
    await DB.saveAsync({ profile });
  }
};