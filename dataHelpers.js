// Assumes data.js exports `get`, `set`, `deleteKey`

const dataHelpers = (() => {
  const isValidKey = (key) => typeof key === "string" && key.trim().length > 0;

  return {
    async safeSet(key, value) {
      if (!isValidKey(key)) {
        console.warn("Invalid key:", key);
        return false;
      }
      try {
        await data.set(key, value);
        console.log(`Saved: ${key} =`, value);
        return true;
      } catch (err) {
        console.error(`Failed to save ${key}:`, err);
        return false;
      }
    },

    async safeGet(key, fallback = null) {
      if (!isValidKey(key)) {
        console.warn("Invalid key:", key);
        return fallback;
      }
      try {
        const result = await data.get(key);
        if (result === undefined || result === null) {
          console.warn(`Key ${key} returned null, using fallback`);
          return fallback;
        }
        return result;
      } catch (err) {
        console.error(`Failed to get ${key}:`, err);
        return fallback;
      }
    },

    async safeDelete(key) {
      if (!isValidKey(key)) {
        console.warn("Invalid key:", key);
        return false;
      }
      try {
        await data.deleteKey(key);
        console.log(`Deleted key: ${key}`);
        return true;
      } catch (err) {
        console.error(`Failed to delete ${key}:`, err);
        return false;
      }
    },

    async exists(key) {
      const val = await this.safeGet(key);
      return val !== null && val !== undefined;
    }
  };
})();
