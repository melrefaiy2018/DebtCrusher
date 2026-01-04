import { CreditCard, FinancialProfile } from '../types';

const DB_KEY = 'debtcrusher_db_v1';

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

// In-memory cache to reduce synchronous localStorage reads
let dbCache: DatabaseSchema | null = null;

export const DB = {
  /**
   * Loads the entire database from local storage or memory cache.
   */
  loadRaw: (): DatabaseSchema => {
    if (dbCache) return dbCache;

    try {
      const stored = localStorage.getItem(DB_KEY);
      if (!stored) {
        dbCache = DEFAULT_DB;
        return DEFAULT_DB;
      }
      const parsed = JSON.parse(stored);
      // Merge with default to ensure structure exists if schema changes
      dbCache = { ...DEFAULT_DB, ...parsed };
      return dbCache;
    } catch (e) {
      console.error("Failed to load DB", e);
      return DEFAULT_DB;
    }
  },

  /**
   * Persists the database to local storage and updates memory cache.
   */
  saveRaw: (data: Partial<DatabaseSchema>) => {
    try {
      const current = DB.loadRaw();
      const updated = { ...current, ...data, lastUpdated: Date.now() };
      
      // Update cache
      dbCache = updated;
      
      // Persist
      localStorage.setItem(DB_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save DB", e);
    }
  },

  // --- Entity Accessors ---

  getCards: (): CreditCard[] => {
    const db = DB.loadRaw();
    return Object.values(db.cards || {});
  },

  saveCards: (cards: CreditCard[]) => {
    const cardDict: Record<string, CreditCard> = {};
    cards.forEach(c => {
      cardDict[c.id] = c;
    });
    DB.saveRaw({ cards: cardDict });
  },

  getProfile: (): FinancialProfile => {
    const db = DB.loadRaw();
    return db.profile || DEFAULT_DB.profile;
  },

  saveProfile: (profile: FinancialProfile) => {
    DB.saveRaw({ profile });
  }
};