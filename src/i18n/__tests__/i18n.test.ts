import { afterEach, describe, expect, it } from "vitest";
import { getLanguage, resolveLanguage, setLanguage, t } from "@/i18n";
import { en } from "@/i18n/messages/en";
import { es } from "@/i18n/messages/es";
import { zh } from "@/i18n/messages/zh";

describe("resolveLanguage", () => {
  it("uses the site default when it names a language", () => {
    expect(resolveLanguage("zh", ["en-US"])).toBe("zh");
    expect(resolveLanguage("EN", ["zh-CN"])).toBe("en");
    expect(resolveLanguage("es", ["zh-CN"])).toBe("es");
  });

  it("follows the browser for auto, like the built-in theme", () => {
    expect(resolveLanguage("auto", ["es-MX", "en"])).toBe("es");
    expect(resolveLanguage("auto", ["zh-TW"])).toBe("zh");
    expect(resolveLanguage("auto", ["fr-FR", "zh-CN"])).toBe("zh");
    expect(resolveLanguage("auto", ["fr-FR", "de"])).toBe("en");
    // 老后端不下发、或值认不出：按 auto 处理。
    expect(resolveLanguage("", ["es"])).toBe("es");
    expect(resolveLanguage("jp", [])).toBe("en");
  });
});

describe("t", () => {
  afterEach(() => setLanguage("zh"));

  it("switches language and fills in parameters", () => {
    expect(getLanguage()).toBe("zh");
    expect(t("renewal.expiresIn", { n: 3 })).toBe("3 天后到期");
    setLanguage("en");
    expect(t("renewal.expiresIn", { n: 3 })).toBe("Expires in 3 d");
    setLanguage("es");
    expect(t("renewal.expiresIn", { n: 3 })).toBe("Vence en 3 d");
  });

  it("keeps the same placeholders in every language", () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of Object.keys(zh) as Array<keyof typeof zh>) {
      expect(placeholders(en[key]), `en ${key}`).toEqual(placeholders(zh[key]));
      expect(placeholders(es[key]), `es ${key}`).toEqual(placeholders(zh[key]));
    }
  });

  it("has no untranslated Chinese left in en / es", () => {
    const cjk = /[一-鿿]/;
    for (const key of Object.keys(zh) as Array<keyof typeof zh>) {
      expect(cjk.test(en[key]), `en ${key}: ${en[key]}`).toBe(false);
      expect(cjk.test(es[key]), `es ${key}: ${es[key]}`).toBe(false);
    }
  });
});
