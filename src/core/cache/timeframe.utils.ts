/**
 * 时间框架工具函数
 * 提供时间框架字符串与秒数的转换，以及预热列表生成
 */

import type { TimeframeSec } from '../types';

// ============================================================================
// 时间框架映射
// ============================================================================

/**
 * 时间框架字符串到秒数的映射
 */
export const TF_STR_TO_SEC: Record<string, TimeframeSec> = {
  '1m': 60,
  '3m': 180,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  // 小时级
  '1h': 3600,
  '3h': 10800,
  '4h': 14400,
  '6h': 21600,
  '8h': 28800,
  '12h': 43200,
  // 天/周/月
  '1d': 86400,
  '3d': 259200,
  '1w': 604800,
  '1M': 2592000,
  '1y': 31536000,
};

/**
 * 秒数转换为时间框架字符串
 */
export const TF_SEC_TO_STR = (sec: TimeframeSec): string => {
  const entry = Object.entries(TF_STR_TO_SEC).find(([, v]) => v === sec);
  return entry ? entry[0] : `${sec}s`;
};

/**
 * 字符串转换为秒数（非法输入时抛错）
 */
export function tfStrToSec(tfStr: string): TimeframeSec {
  const v = TF_STR_TO_SEC[tfStr];
  if (!v) {
    throw new Error(`Unsupported timeframe string: ${tfStr}`);
  }
  return v as TimeframeSec;
}

/**
 * 获取所有支持的时间框架秒数
 */
export function getSupportedTimeframes(): TimeframeSec[] {
  return Object.values(TF_STR_TO_SEC);
}

/**
 * 获取所有支持的时间框架字符串
 */
export function getSupportedTimeframeStrings(): string[] {
  return Object.keys(TF_STR_TO_SEC);
}

/**
 * 检查时间框架是否有效
 */
export function isValidTimeframe(tfSec: number): tfSec is TimeframeSec {
  return Object.values(TF_STR_TO_SEC).includes(tfSec as TimeframeSec);
}

/**
 * 检查时间框架字符串是否有效
 */
export function isValidTimeframeString(tfStr: string): boolean {
  return tfStr in TF_STR_TO_SEC;
}

// ============================================================================
// 预热列表生成
// ============================================================================

/**
 * 生成预热时间框架列表
 * 基于基准时间框架，生成需要预热的更大时间框架列表
 */
export function getWarmupList(baseTfSec: TimeframeSec): TimeframeSec[] {
  const allTfs = getSupportedTimeframes().sort((a, b) => a - b);
  return allTfs.filter(tf => tf > baseTfSec);
}

/**
 * 获取常用的预热时间框架组合
 */
export function getCommonWarmupList(baseTfSec: TimeframeSec): TimeframeSec[] {
  const commonTfs: TimeframeSec[] = [300, 900, 1800, 3600, 14400, 86400]; // 5m, 15m, 30m, 1h, 4h, 1d
  return commonTfs.filter(tf => tf > baseTfSec);
}

/**
 * 获取下一个更大的时间框架
 */
export function getNextTimeframe(currentTfSec: TimeframeSec): TimeframeSec | null {
  const allTfs = getSupportedTimeframes().sort((a, b) => a - b);
  const currentIndex = allTfs.indexOf(currentTfSec);
  
  if (currentIndex === -1 || currentIndex === allTfs.length - 1) {
    return null;
  }
  
  return allTfs[currentIndex + 1];
}

/**
 * 获取上一个更小的时间框架
 */
export function getPreviousTimeframe(currentTfSec: TimeframeSec): TimeframeSec | null {
  const allTfs = getSupportedTimeframes().sort((a, b) => a - b);
  const currentIndex = allTfs.indexOf(currentTfSec);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return allTfs[currentIndex - 1];
}

/**
 * 计算时间框架的倍数关系
 * 返回 targetTf 是 baseTf 的多少倍
 */
export function getTimeframeMultiplier(baseTf: TimeframeSec, targetTf: TimeframeSec): number {
  return targetTf / baseTf;
}

/**
 * 检查两个时间框架是否兼容（targetTf 是 baseTf 的整数倍）
 */
export function areTimeframesCompatible(baseTf: TimeframeSec, targetTf: TimeframeSec): boolean {
  const multiplier = getTimeframeMultiplier(baseTf, targetTf);
  return Number.isInteger(multiplier) && multiplier >= 1;
}

/**
 * 获取时间框架的显示名称
 */
export function getTimeframeDisplayName(tfSec: TimeframeSec): string {
  const tfStr = TF_SEC_TO_STR(tfSec);
  
  // 特殊处理一些显示名称
  const displayNames: Record<string, string> = {
    '1s': '1 秒',
    '5s': '5 秒',
    '15s': '15 秒',
    '30s': '30 秒',
    '1m': '1 分钟',
    '3m': '3 分钟',
    '5m': '5 分钟',
    '15m': '15 分钟',
    '30m': '30 分钟',
    '1h': '1 小时',
    '2h': '2 小时',
    '4h': '4 小时',
    '6h': '6 小时',
    '8h': '8 小时',
    '12h': '12 小时',
    '1d': '1 天',
    '3d': '3 天',
    '1w': '1 周',
    '1M': '1 月',
  };
  
  return displayNames[tfStr] || tfStr;
}

/**
 * 根据时间范围推荐合适的时间框架
 */
export function recommendTimeframe(startTime: number, endTime: number): TimeframeSec {
  const duration = endTime - startTime;
  const days = duration / 86400;
  
  if (days <= 1) {
    return 300; // 5m
  } else if (days <= 7) {
    return 900; // 15m
  } else if (days <= 30) {
    return 3600; // 1h
  } else if (days <= 90) {
    return 14400; // 4h
  } else {
    return 86400; // 1d
  }
}