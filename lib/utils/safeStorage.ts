// lib/utils/safeStorage.ts

export const safeStorage = {
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error("safeStorage setItem error:", error);
    }
  },

  getItem: (key: string) => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error("safeStorage getItem error:", error);
      return null;
    }
  },

  removeItem: (key: string) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error("safeStorage removeItem error:", error);
    }
  }
}
