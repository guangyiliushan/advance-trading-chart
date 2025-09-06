/**
 * 数据格式化工具函数
 * 包含数字、价格、时间等格式化功能
 */

// ============================================================================
// 数字格式化
// ============================================================================

/**
 * 格式化数字，添加千分位分隔符
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * 格式化价格
 */
export function formatPrice(price: number, decimals: number = 2): string {
  if (price === 0) return '0.00';
  
  // 自动调整小数位数
  if (price < 0.01 && decimals === 2) {
    decimals = 6;
  } else if (price < 1 && decimals === 2) {
    decimals = 4;
  }
  
  return formatNumber(price, decimals);
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * 格式化成交量
 */
export function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return `${formatNumber(volume / 1e9, 2)}B`;
  } else if (volume >= 1e6) {
    return `${formatNumber(volume / 1e6, 2)}M`;
  } else if (volume >= 1e3) {
    return `${formatNumber(volume / 1e3, 2)}K`;
  }
  return formatNumber(volume, 0);
}

/**
 * 格式化市值
 */
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${formatNumber(marketCap / 1e12, 2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${formatNumber(marketCap / 1e9, 2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${formatNumber(marketCap / 1e6, 2)}M`;
  } else if (marketCap >= 1e3) {
    return `$${formatNumber(marketCap / 1e3, 2)}K`;
  }
  return `$${formatNumber(marketCap, 2)}`;
}

// ============================================================================
// 时间格式化
// ============================================================================

/**
 * 格式化时间戳为日期字符串
 */
export function formatDate(timestamp: number, format: 'short' | 'long' | 'time' = 'short'): string {
  const date = new Date(timestamp * 1000);
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'time':
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    default:
      return date.toLocaleDateString();
  }
}

/**
 * 格式化时间范围
 */
export function formatTimeRange(startTime: number, endTime: number): string {
  const start = formatDate(startTime, 'short');
  const end = formatDate(endTime, 'short');
  return `${start} - ${end}`;
}

/**
 * 格式化相对时间（如：2小时前）
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) {
    return 'Just now';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  } else if (diff < 2592000) {
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  } else {
    return formatDate(timestamp, 'short');
  }
}

// ============================================================================
// 字符串格式化
// ============================================================================

/**
 * 截断字符串并添加省略号
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * 驼峰命名转换为短横线命名
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 短横线命名转换为驼峰命名
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

// ============================================================================
// 数据验证和清理
// ============================================================================

/**
 * 检查数值是否有效
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * 安全的数字转换
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value);
  return isValidNumber(num) ? num : defaultValue;
}

/**
 * 限制数值在指定范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 四舍五入到指定小数位
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ============================================================================
// 数组和对象工具
// ============================================================================

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
    }
  };
}