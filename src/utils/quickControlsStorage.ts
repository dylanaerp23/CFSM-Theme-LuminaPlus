const STORAGE_KEY = "cfsm-luminaplus:quick-controls-expanded";

/**
 * 窗口至少这么宽才恢复成展开。和 home.css 的 `@media (max-width: 1023px)` 对齐：
 * 比它窄时展开的快捷栏会把站点名盖掉，每次打开都还是收起。
 */
const RESTORE_MIN_WIDTH = 1024;

/**
 * 首页右上角快捷栏上次是不是展开着（只记在本机浏览器）。
 *
 * 反复刷新页面试配置的人每次都要多点一下展开（issue #6），所以记住上次的状态；不做成设置项。
 */
export function readQuickControlsExpanded(): boolean {
  try {
    if (window.innerWidth < RESTORE_MIN_WIDTH) return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeQuickControlsExpanded(expanded: boolean): void {
  try {
    if (expanded) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 隐私模式等写不进去时就不记，下次照旧收起。
  }
}
