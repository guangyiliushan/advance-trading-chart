/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * 环境检测工具
 * 用于检测当前运行环境，决定使用模拟数据还是真实数据
 */

import type { EnvironmentInfo } from './data-provider.types';

/**
 * 检测当前运行环境
 */
export function detectEnvironment(): EnvironmentInfo {
  // 检测是否为Storybook环境
  const isStorybook = 
    typeof window !== 'undefined' && 
    (window.location?.pathname?.includes('storybook') ||
     window.location?.pathname?.includes('iframe.html') ||
     // @ts-ignore
     window.__STORYBOOK_ADDONS__ !== undefined ||
     // @ts-ignore
     window.parent !== window && window.parent.__STORYBOOK_ADDONS__ !== undefined);

  // 检测Node.js环境变量
  const nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : undefined;
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  return {
    isStorybook,
    isDevelopment,
    isProduction,
    isTest
  };
}

/**
 * 判断是否应该使用模拟数据
 */
export function shouldUseMockData(): boolean {
  const env = detectEnvironment();
  
  // 在Storybook环境中始终使用模拟数据
  if (env.isStorybook) {
    return true;
  }
  
  // 在测试环境中使用模拟数据
  if (env.isTest) {
    return true;
  }
  
  // 检查环境变量强制使用模拟数据
  if (typeof process !== 'undefined' && process.env.FORCE_MOCK_DATA === 'true') {
    return true;
  }
  
  // 开发环境中，如果没有配置真实API，使用模拟数据
  if (env.isDevelopment) {
    const hasApiConfig = 
      typeof process !== 'undefined' && 
      (process.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL);
    return !hasApiConfig;
  }
  
  // 生产环境默认使用真实数据
  return false;
}

/**
 * 获取API配置
 */
export function getApiConfig() {
  if (typeof process === 'undefined') {
    return {};
  }
  
  return {
    baseUrl: process.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL,
    apiKey: process.env.VITE_API_KEY || process.env.REACT_APP_API_KEY,
    timeout: parseInt(process.env.VITE_API_TIMEOUT || process.env.REACT_APP_API_TIMEOUT || '10000'),
    retryCount: parseInt(process.env.VITE_API_RETRY_COUNT || process.env.REACT_APP_API_RETRY_COUNT || '3'),
  };
}

/**
 * 日志工具（仅在开发环境输出）
 */
export function devLog(message: string, ...args: any[]) {
  const env = detectEnvironment();
  if (env.isDevelopment || env.isStorybook) {
    console.log(`[DataProvider] ${message}`, ...args);
  }
}

/**
 * 错误日志工具
 */
export function errorLog(message: string, error?: any) {
  console.error(`[DataProvider Error] ${message}`, error);
}