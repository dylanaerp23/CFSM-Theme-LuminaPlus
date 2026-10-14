import { useSyncExternalStore } from "react";

/** 主题支持的界面语言，和后端 `/api/config` 的 `default_language` 同一套取值（另有 `auto`）。 */
export type Language = "zh" | "en" | "es";

export const LANGUAGES: readonly Language[] = ["zh", "en", "es"];

/** 各语言给 `Intl` 用的区域：西语跟后端一样用拉美西语（es-419）。 */
const LOCALES: Record<Language, string> = {
  zh: "zh-CN",
  en: "en-US",
  es: "es-419",
};

function browserLanguages(): readonly string[] {
  if (typeof navigator === "undefined") return [];
  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) return navigator.languages;
  return navigator.language ? [navigator.language] : [];
}

/**
 * 后台「默认语言」换算成界面语言。`zh` / `en` / `es` 直接用；`auto`（或缺省、认不出的值）按访客浏览器的语言挑：
 * 浏览器首选里先出现西语就西语、先出现中文就中文，都没有用英文 —— 和后端内置主题（`src/frontend/utils/i18n.js`）同一口径。
 */
export function resolveLanguage(
  defaultLanguage: string | null | undefined,
  languages: readonly string[] = browserLanguages(),
): Language {
  const preferred = String(defaultLanguage ?? "").trim().toLowerCase();
  if (preferred === "zh" || preferred === "en" || preferred === "es") return preferred;
  for (const raw of languages) {
    const value = String(raw ?? "").trim().toLowerCase();
    if (value === "es" || value.startsWith("es-")) return "es";
    if (value === "zh" || value.startsWith("zh-")) return "zh";
  }
  return "en";
}

// 默认中文：页面在读到站点配置之前只有加载圈和页脚，语言由 `applySiteLanguage` 在配置到手那一刻定下来；
// 单测不经过入口，保持中文，现有断言不受影响。
let current: Language = "zh";
const listeners = new Set<() => void>();

export function getLanguage(): Language {
  return current;
}

export function getLocale(language: Language = current): string {
  return LOCALES[language];
}

export function setLanguage(language: Language) {
  if (language === current) return;
  current = language;
  if (typeof document !== "undefined") document.documentElement.lang = getLocale(language);
  listeners.forEach((listener) => listener());
}

/** 按站点配置的 `default_language` 定界面语言。在解析 `/api/config` 时调用，内容渲染前语言就已经定了，不会先中文再跳。 */
export function applySiteLanguage(defaultLanguage: string | null | undefined) {
  setLanguage(resolveLanguage(defaultLanguage));
}

export function subscribeLanguage(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 订阅界面语言。语言变了（站长改了默认语言、重新拉到配置）由 App 整棵树按语言重新挂载，见 App.tsx。 */
export function useLanguage(): Language {
  return useSyncExternalStore(subscribeLanguage, getLanguage, getLanguage);
}
