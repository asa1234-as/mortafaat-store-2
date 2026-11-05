import { EN, KW_EN } from './translations.en';
import type { Language } from './types';

// Current language lives at module level so t() works anywhere (components, helpers, context).
// StoreContext updates it on every render, and the whole tree re-renders when language changes.
let currentLanguage: Language = 'ar';

export function setCurrentLanguage(lang: Language) {
  currentLanguage = lang;
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

export function locale(): string {
  return currentLanguage === 'ar' ? 'ar-EG' : 'en-US';
}

/**
 * t("نص عربي") -> returns the English text when the store language is English.
 * Placeholders: t("عرض {0} من {1}", a, b). Missing translations fall back to the Arabic text.
 */
export function t(key: string, ...args: Array<string | number>): string {
  let out = key;
  if (currentLanguage === 'en') {
    const direct = EN[key];
    if (direct !== undefined) {
      out = direct;
    } else {
      // keep leading/trailing spaces of the original while looking up the trimmed text
      const lead = key.match(/^\s*/)![0];
      const trail = key.match(/\s*$/)![0];
      const core = key.trim().replace(/\s+/g, ' ');
      const hit = EN[core];
      if (hit !== undefined) out = lead + hit + trail;
    }
  }
  if (args.length) {
    args.forEach((a, i) => {
      out = out.split(`{${i}}`).join(String(a));
    });
  }
  return out;
}

/** English text for a key (or undefined) - used to match English chat messages against Arabic bot keywords. */
export function enOf(key: string): string | undefined {
  return KW_EN[key.trim().replace(/\s+/g, ' ')];
}

/** Product name in the current language. */
export function pn(p: { name: string; nameEn?: string }): string {
  return currentLanguage === 'ar' ? p.name : (p.nameEn || p.name);
}
