const QUOTE_KEY = 'ye_quote_daily_v1';

function todayKey() {
  // YYYY-MM-DD
  return new Date().toISOString().slice(0, 10);
}

export const storage = {
  load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  async getDailyQuote(fetcher) {
    const cached = this.load(QUOTE_KEY);
    const today = todayKey();

    if (cached && cached.date === today && cached.data) {
      return cached.data;
    }

    const data = await fetcher();
    this.save(QUOTE_KEY, { date: today, data });
    return data;
  },
};
