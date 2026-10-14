// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readQuickControlsExpanded,
  writeQuickControlsExpanded,
} from "@/utils/quickControlsStorage";

const setWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true });
};

describe("quick controls expanded state", () => {
  beforeEach(() => {
    window.localStorage.clear();
    setWidth(1440);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts collapsed until the visitor has expanded it once", () => {
    expect(readQuickControlsExpanded()).toBe(false);
  });

  it("remembers the last state across reloads", () => {
    writeQuickControlsExpanded(true);
    expect(readQuickControlsExpanded()).toBe(true);

    writeQuickControlsExpanded(false);
    expect(readQuickControlsExpanded()).toBe(false);
  });

  it("always starts collapsed on narrow screens, where the expanded bar covers the site name", () => {
    writeQuickControlsExpanded(true);
    setWidth(1023);
    expect(readQuickControlsExpanded()).toBe(false);
    setWidth(1024);
    expect(readQuickControlsExpanded()).toBe(true);
  });

  it("falls back to collapsed when storage is unavailable", () => {
    // 测试里的 localStorage 是 vitest.setup 补的内存版，直接替换它的方法。
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => writeQuickControlsExpanded(true)).not.toThrow();
    expect(readQuickControlsExpanded()).toBe(false);
  });
});
