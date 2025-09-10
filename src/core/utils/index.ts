/**
 * 核心工具函数模块入口
 * 提供图表数据、时间、颜色、格式化等工具函数
 */

export * from './chart-data.utils';
export * from './time.utils';
export * from './color.utils';
export * from './format.utils';

// 重新导出数据生成// 兼容性导出
export { generateData } from '../data/mock-data-generator';