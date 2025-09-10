import type { RGB, RGBWithA, HexColor, ColorTheme, ChartColorConfig, ThemeColorMap } from '../types/color.types';

// 颜色缓存，提高性能
const __colorCache = new Map<string, string>();

/**
 * 将数值限制在0-1范围内
 */
function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/**
 * sRGB通道压缩
 */
function srgbCompandChannel(x: number): number {
  // x is linear sRGB channel
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

/**
 * 角度转弧度
 */
function rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * 将OKLab转换为线性sRGB
 */
function oklabToLinearSRGB(L: number, a: number, b: number): readonly [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  return [r, g, bl] as const;
}

/**
 * 检查RGB值是否在色域内
 */
function inGamutLinearRGB(rgb: readonly [number, number, number]): boolean {
  return rgb[0] >= 0 && rgb[0] <= 1 && rgb[1] >= 0 && rgb[1] <= 1 && rgb[2] >= 0 && rgb[2] <= 1;
}

/**
 * 将OKLab转换为sRGB并进行色域映射
 */
function oklabToSrgbClamped(L: number, a: number, b: number): [number, number, number] {
  let rgb = oklabToLinearSRGB(L, a, b);
  if (!inGamutLinearRGB(rgb)) {
    // Binary search scaling factor on chroma
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      const test = oklabToLinearSRGB(L, a * mid, b * mid);
      if (inGamutLinearRGB(test)) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    rgb = oklabToLinearSRGB(L, a * lo, b * lo);
  }
  return [
    Math.round(clamp01(srgbCompandChannel(rgb[0])) * 255),
    Math.round(clamp01(srgbCompandChannel(rgb[1])) * 255),
    Math.round(clamp01(srgbCompandChannel(rgb[2])) * 255),
  ];
}

/**
 * 解析数字字符串
 */
function parseNumber(n: string): number {
  const trimmed = n.trim();
  if (trimmed.endsWith('%')) {
    return parseFloat(trimmed.slice(0, -1)) / 100;
  }
  return parseFloat(trimmed);
}

/**
 * 解析色相值
 */
function parseHue(h: string): number {
  const trimmed = h.trim();
  if (trimmed.endsWith('deg')) return parseFloat(trimmed.slice(0, -3));
  return parseFloat(trimmed);
}

/**
 * 将OKLCH颜色转换为RGB
 */
function oklchToRgb(value: string): RGBWithA | null {
  const match = value.match(/oklch\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(/\s+/);
  if (parts.length < 3) return null;
  const L = parseNumber(parts[0]);
  const C = parseNumber(parts[1]);
  const H = parseHue(parts[2]);
  const a = parts[3] ? parseNumber(parts[3]) : undefined;
  const hRad = rad(H);
  const aVal = C * Math.cos(hRad);
  const bVal = C * Math.sin(hRad);
  const rgb = oklabToSrgbClamped(L, aVal, bVal);
  return { rgb, a };
}

/**
 * 将OKLab颜色字符串转换为RGB
 */
function oklabStrToRgb(value: string): RGBWithA | null {
  const match = value.match(/oklab\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(/\s+/);
  if (parts.length < 3) return null;
  const L = parseNumber(parts[0]);
  const a = parseNumber(parts[1]);
  const b = parseNumber(parts[2]);
  const alpha = parts[3] ? parseNumber(parts[3]) : undefined;
  const rgb = oklabToSrgbClamped(L, a, b);
  return { rgb, a: alpha };
}

/**
 * 将十六进制颜色转换为RGB
 */
function hexToRgb(hex: string): RGBWithA | null {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { rgb: [r, g, b] };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { rgb: [r, g, b] };
  }
  return null;
}

/**
 * 通过CSS标准化颜色
 */
function normalizeToRgbViaCSS(color: string): string | null {
  if (typeof document === 'undefined') return null;
  const temp = document.createElement('div');
  temp.style.color = color;
  document.body.appendChild(temp);
  const out = getComputedStyle(temp).color;
  document.body.removeChild(temp);
  return /^rgb\(/i.test(out) ? out : null;
}

/**
 * 读取CSS自定义属性并转换为RGB格式
 * @param varName CSS变量名（如 --background）
 * @returns RGB或RGBA字符串
 */
export function getCssVariableRgb(varName: string): string {
  try {
    if (typeof document === 'undefined') return 'rgb(255,255,255)';
    const root = document.documentElement;
    const raw = getComputedStyle(root).getPropertyValue(varName).trim();
    if (!raw) return 'rgb(255,255,255)';

    const cached = __colorCache.get(raw);
    if (cached) return cached;

    let result: RGBWithA | null = null;
    const low = raw.toLowerCase();

    if (low.startsWith('oklch(')) {
      result = oklchToRgb(raw);
    } else if (low.startsWith('oklab(')) {
      result = oklabStrToRgb(raw);
    } else if (low.startsWith('#')) {
      result = hexToRgb(raw);
    }

    let out: string | null = null;
    if (result) {
      const [r, g, b] = result.rgb;
      if (result.a != null && result.a < 1) {
        out = `rgba(${r}, ${g}, ${b}, ${+result.a.toFixed(3)})`;
      } else {
        out = `rgb(${r}, ${g}, ${b})`;
      }
    } else {
      // For rgb()/hsl()/named colors, rely on browser to normalize
      out = normalizeToRgbViaCSS(raw);
    }

    const finalColor = out ?? 'rgb(255,255,255)';
    __colorCache.set(raw, finalColor);
    return finalColor;
  } catch {
    return 'rgb(255,255,255)';
  }
}

/**
 * 将RGB数组转换为CSS颜色字符串
 */
export function rgbToString(rgb: RGB, alpha?: number): string {
  const [r, g, b] = rgb;
  if (alpha !== undefined && alpha < 1) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 将十六进制颜色转换为RGB数组
 */
export function hexToRgbArray(hex: HexColor): RGB | null {
  const result = hexToRgb(hex);
  return result ? result.rgb : null;
}

/**
 * 将RGB数组转换为十六进制颜色
 */
export function rgbToHex(rgb: RGB): HexColor {
  const [r, g, b] = rgb;
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * 默认的浅色主题颜色配置
 */
export const DEFAULT_LIGHT_COLORS: ChartColorConfig = {
  background: '#ffffff',
  grid: '#e1e5e9',
  text: '#131722',
  upColor: '#26a69a',
  downColor: '#ef5350',
  border: '#e1e5e9',
};

/**
 * 默认的深色主题颜色配置
 */
export const DEFAULT_DARK_COLORS: ChartColorConfig = {
  background: '#131722',
  grid: '#363c4e',
  text: '#d1d4dc',
  upColor: '#26a69a',
  downColor: '#ef5350',
  border: '#363c4e',
};

/**
 * 默认主题颜色映射
 */
export const DEFAULT_THEME_COLORS: ThemeColorMap = {
  light: DEFAULT_LIGHT_COLORS,
  dark: DEFAULT_DARK_COLORS,
};

/**
 * 根据主题获取颜色配置
 */
export function getThemeColors(theme: ColorTheme): ChartColorConfig {
  return DEFAULT_THEME_COLORS[theme];
}