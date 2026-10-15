import { t } from "@/i18n";

// 与后端 computeUsedByType 保持一致，空或未知类型按 max 处理。
export interface TrafficDisplay {
  fraction: number;
  color: string;
  remainingLabel: string;
  detail: string;
  /** 悬停提示：已用 / 总量 / 剩余，下一行写已用量怎么算（原来是「流量阈值 · 仅上行」，像在介绍两项指标）。 */
  tooltip: string;
}

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * 按节点的 `traffic_limit_type` 从累计上/下行总量算出已用流量。默认(空/未知)为 "max",与后端一致。
 */
export function computeTrafficUsed(
  type: string | null | undefined,
  up: number,
  down: number,
): number {
  const safeUp = nonNegative(up);
  const safeDown = nonNegative(down);
  switch ((type ?? "").trim().toLowerCase()) {
    case "up":
      return safeUp;
    case "down":
      return safeDown;
    case "sum":
      return safeUp + safeDown;
    case "min":
      return Math.min(safeUp, safeDown);
    case "max":
    default:
      return Math.max(safeUp, safeDown);
  }
}

interface TrafficUsage {
  used: number;
  limit: number;
  unlimited: boolean;
  remaining: number;
  fraction: number;
}

// 首页卡片与实例详情共用同一归约口径。
export function resolveTrafficUsage(
  type: string | null | undefined,
  up: number,
  down: number,
  limit: number,
): TrafficUsage {
  const used = computeTrafficUsed(type, up, down);
  const unlimited = !(limit > 0);
  const remaining = unlimited ? 0 : Math.max(0, limit - used);
  const fraction = unlimited ? 0 : Math.max(0, Math.min(1, used / limit));
  return { used, limit, unlimited, remaining, fraction };
}

/** 已用量的计算方式，一句话说清（悬停提示的第二行）。 */
export function trafficTypeLabel(type: string | null | undefined): string {
  switch ((type ?? "").trim().toLowerCase()) {
    case "up":
      return t("trafficType.up");
    case "down":
      return t("trafficType.down");
    case "sum":
      return t("trafficType.sum");
    case "min":
      return t("trafficType.min");
    case "max":
    default:
      return t("trafficType.max");
  }
}
