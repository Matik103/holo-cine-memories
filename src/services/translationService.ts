const CACHE_PREFIX = 'cinemind_translation_';
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedTranslation {
  text: string;
  timestamp: number;
}

interface TranslationCache {
  [key: string]: CachedTranslation;
}

class TranslationService {
  private memoryCache: TranslationCache = {};
  private pendingTranslations: Map<string, Promise<string>> = new Map();

  private getCacheKey(text: string, targetLang: string): string {
    return `${CACHE_PREFIX}${targetLang}_${this.hashText(text)}`;
  }

  private hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private getFromCache(text: string, targetLang: string): string | null {
    const key = this.getCacheKey(text, targetLang);
    
    if (this.memoryCache[key]) {
      const cached = this.memoryCache[key];
      if (Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
        return cached.text;
      }
    }

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const cached: CachedTranslation = JSON.parse(stored);
        if (Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
          this.memoryCache[key] = cached;
          return cached.text;
        }
        localStorage.removeItem(key);
      }
    } catch {
      // localStorage not available or parse error
    }

    return null;
  }

  private setCache(text: string, targetLang: string, translatedText: string): void {
    const key = this.getCacheKey(text, targetLang);
    const cached: CachedTranslation = {
      text: translatedText,
      timestamp: Date.now(),
    };

    this.memoryCache[key] = cached;

    try {
      localStorage.setItem(key, JSON.stringify(cached));
    } catch {
      // localStorage full or not available
    }
  }

  async translateText(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    if (!text.trim() || targetLang === sourceLang) {
      return text;
    }

    const cached = this.getFromCache(text, targetLang);
    if (cached) {
      return cached;
    }

    const pendingKey = `${targetLang}_${text}`;
    if (this.pendingTranslations.has(pendingKey)) {
      return this.pendingTranslations.get(pendingKey)!;
    }

    const translationPromise = this.fetchTranslation(text, targetLang, sourceLang);
    this.pendingTranslations.set(pendingKey, translationPromise);

    try {
      const result = await translationPromise;
      this.setCache(text, targetLang, result);
      return result;
    } finally {
      this.pendingTranslations.delete(pendingKey);
    }
  }
  
  // Alias for translateText - translates from auto-detected source to target language
  async translate(text: string, targetLang: string): Promise<string> {
    if (!text.trim()) {
      return text;
    }
    
    // Use 'auto' for source language detection
    const cached = this.getFromCache(text, targetLang);
    if (cached) {
      return cached;
    }

    const pendingKey = `${targetLang}_${text}`;
    if (this.pendingTranslations.has(pendingKey)) {
      return this.pendingTranslations.get(pendingKey)!;
    }

    const translationPromise = this.fetchTranslation(text, targetLang, 'auto');
    this.pendingTranslations.set(pendingKey, translationPromise);

    try {
      const result = await translationPromise;
      this.setCache(text, targetLang, result);
      return result;
    } finally {
      this.pendingTranslations.delete(pendingKey);
    }
  }

  private async fetchTranslation(text: string, targetLang: string, sourceLang: string): Promise<string> {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );

      if (!response.ok) {
        return text;
      }

      const data = await response.json();
      
      if (data && data[0]) {
        const translatedParts = data[0]
          .filter((part: unknown[]) => part && part[0])
          .map((part: unknown[]) => part[0]);
        return translatedParts.join('');
      }

      return text;
    } catch {
      return text;
    }
  }

  async translateBatch(texts: string[], targetLang: string, sourceLang: string = 'auto'): Promise<string[]> {
    if (targetLang === sourceLang) {
      return texts;
    }

    const results = await Promise.all(
      texts.map(text => this.translate(text, targetLang))
    );

    return results;
  }

  clearCache(): void {
    this.memoryCache = {};
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // localStorage not available
    }
  }

  getCacheStats(): { memoryEntries: number; localStorageEntries: number } {
    let localStorageEntries = 0;
    
    try {
      const keys = Object.keys(localStorage);
      localStorageEntries = keys.filter(key => key.startsWith(CACHE_PREFIX)).length;
    } catch {
      // localStorage not available
    }

    return {
      memoryEntries: Object.keys(this.memoryCache).length,
      localStorageEntries,
    };
  }
}

export const translationService = new TranslationService();
