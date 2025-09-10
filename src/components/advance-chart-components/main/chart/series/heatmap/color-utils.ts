/**
 * 热力图颜色工具模块（重构版）
 * 使用项目核心颜色工具，移除 d3 依赖
 */

import { rgbToString } from '@/core/utils/color.utils';

/**
 * RGB 颜色类型定义
 */
type RGB = [number, number, number];

/**
 * Plasma 色标的关键颜色点（手动定义）
 * 基于 d3-scale-chromatic 的 Plasma 色标
 */
const PLASMA_COLORS: RGB[] = [
  [13, 8, 135],      // 深紫色 (0.0)
  [75, 3, 161],      // 紫色 (0.2)
  [125, 3, 168],     // 品红 (0.4)
  [168, 34, 150],    // 粉红 (0.6)
  [208, 90, 110],    // 橙红 (0.8)
  [240, 249, 33],    // 黄色 (1.0)
];

/**
 * 在两个RGB颜色之间进行线性插值
 */
function interpolateRgb(color1: RGB, color2: RGB, t: number): RGB {
  const [r1, g1, b1] = color1;
  const [r2, g2, b2] = color2;
  
  return [
    Math.round(r1 + (r2 - r1) * t),
    Math.round(g1 + (g2 - g1) * t),
    Math.round(b1 + (b2 - b1) * t),
  ];
}

/**
 * 获取 Plasma 色标中指定位置的颜色
 * @param t 位置参数 (0-1)
 * @returns RGB颜色数组
 */
function getPlasmaColor(t: number): RGB {
  // 限制在 0-1 范围内
  const normalized = Math.min(Math.max(t, 0), 1);
  
  // 如果是边界值，直接返回
  if (normalized === 0) return PLASMA_COLORS[0];
  if (normalized === 1) return PLASMA_COLORS[PLASMA_COLORS.length - 1];
  
  // 计算在色标中的位置
  const scaledPos = normalized * (PLASMA_COLORS.length - 1);
  const lowerIndex = Math.floor(scaledPos);
  const upperIndex = Math.ceil(scaledPos);
  const t_local = scaledPos - lowerIndex;
  
  // 如果正好在某个颜色点上
  if (lowerIndex === upperIndex) {
    return PLASMA_COLORS[lowerIndex];
  }
  
  // 在两个颜色点之间插值
  return interpolateRgb(
    PLASMA_COLORS[lowerIndex],
    PLASMA_COLORS[upperIndex],
    t_local
  );
}

/**
 * 将概率/数量值映射到 Plasma 渐变颜色
 * @param amount 当前值
 * @param maxAmount 最大值（用于归一化到 0~1）
 * @param opacity 额外透明度系数 (0~1)
 * @returns RGBA 颜色字符串
 */
export function probabilityToColor(
  amount: number,
  maxAmount: number,
  opacity: number = 0.7
): string {
  // 零值直接透明
  if (amount === 0 || maxAmount <= 0) return "rgba(0, 0, 0, 0)";

  // 归一化到 0~1
  const normalized = Math.min(Math.max(amount / maxAmount, 0), 1);

  // 透明度：随值从 0.3 线性提升到 1.0，再乘以外部系数
  const alpha = (0.3 + normalized * 0.7) * Math.min(Math.max(opacity, 0), 1);

  // 获取 Plasma 色标颜色
  const rgb = getPlasmaColor(normalized);
  
  // 使用核心工具转换为 RGBA 字符串
  return rgbToString(rgb, alpha);
}

/**
 * 创建可直接用于 cellShader 的颜色函数
 * @param maxAmount 最大值
 * @param opacity 透明度系数
 * @returns (amount)=>rgba(...)
 */
export function createColorShader(
  maxAmount: number,
  opacity: number = 0.7
): (amount: number) => string {
  return (amount: number) => probabilityToColor(amount, maxAmount, opacity);
}

/**
 * 默认着色器：Plasma（0~1 输入）
 */
export function defaultColorShader(
  amount: number,
  opacity: number = 0.7
): string {
  return probabilityToColor(amount, 1, opacity);
}