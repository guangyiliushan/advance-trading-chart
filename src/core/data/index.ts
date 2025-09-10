/**
 * 数据模块统一导出
 */

// 类型定义
export type {
  DataRequest,
  DataResponse,
  RealtimeCallback,
  UnsubscribeFunction,
  IDataProvider,
  IDataProviderFactory,
  EnvironmentInfo,
  DataProviderConfig
} from './data-provider.types';

// 环境工具
export {
  detectEnvironment,
  shouldUseMockData,
  getApiConfig,
  devLog,
  errorLog
} from './environment.utils';

// 模拟数据生成器
export {
  generateMockData,
  generateSimpleData,
  generateDataForSymbol,
  generateRealtimeUpdate,
  SYMBOL_CONFIGS,
  TIMEFRAME_TO_SECONDS
} from './mock-data-generator';
export type { MockDataConfig } from './mock-data-generator';

// 模拟数据提供者
export { MockDataProvider } from './mock-data-provider';

// 真实数据提供者
export { RealDataProvider } from './real-data-provider';

// 数据提供者工厂
export {
  DataProviderFactory,
  dataProviderFactory,
  createDataProvider,
  createMockDataProvider,
  createRealDataProvider,
  cleanupDataProviders
} from './data-provider-factory';