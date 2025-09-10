/**
 * 数据提供者工厂
 * 根据环境自动选择合适的数据提供者
 */

import type { 
  IDataProvider, 
  IDataProviderFactory, 
  DataProviderConfig 
} from './data-provider.types';
import { MockDataProvider } from './mock-data-provider';
import { RealDataProvider } from './real-data-provider';
import { detectEnvironment, shouldUseMockData, devLog } from './environment.utils';

/**
 * 数据提供者工厂实现
 */
export class DataProviderFactory implements IDataProviderFactory {
  private static instance: DataProviderFactory;
  private providers = new Map<string, IDataProvider>();
  
  /**
   * 获取工厂单例
   */
  static getInstance(): DataProviderFactory {
    if (!DataProviderFactory.instance) {
      DataProviderFactory.instance = new DataProviderFactory();
    }
    return DataProviderFactory.instance;
  }
  
  /**
   * 创建数据提供者
   */
  createProvider(config?: DataProviderConfig): IDataProvider {
    const environment = detectEnvironment();
    const useMock = shouldUseMockData();
    
    devLog('创建数据提供者', { environment, useMock, config });
    
    if (useMock) {
      return this.createMockProvider(config);
    } else {
      return this.createRealProvider(config);
    }
  }
  
  /**
   * 获取提供者类型
   */
  getProviderType(): 'mock' | 'real' {
    return shouldUseMockData() ? 'mock' : 'real';
  }

  /**
   * 创建模拟数据提供者
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createMockProvider(_config?: DataProviderConfig): IDataProvider {
    const key = 'mock';
    
    if (!this.providers.has(key)) {
      const provider = new MockDataProvider();
      this.providers.set(key, provider);
      devLog('创建模拟数据提供者');
    }
    
    return this.providers.get(key)!;
  }
  
  /**
   * 创建真实数据提供者
   */
  createRealProvider(config?: DataProviderConfig): IDataProvider {
    const key = `real-${JSON.stringify(config || {})}`;
    
    if (!this.providers.has(key)) {
      const provider = new RealDataProvider(config);
      this.providers.set(key, provider);
      devLog('创建真实数据提供者', config);
    }
    
    return this.providers.get(key)!;
  }
  
  /**
   * 获取所有已创建的提供者
   */
  getAllProviders(): IDataProvider[] {
    return Array.from(this.providers.values());
  }
  
  /**
   * 清理所有提供者
   */
  async cleanup(): Promise<void> {
    devLog('清理所有数据提供者');
    
    const disconnectPromises = Array.from(this.providers.values()).map(provider => 
      provider.disconnect?.().catch(error => {
        console.warn(`断开提供者 ${provider.name} 连接失败:`, error);
      }) || Promise.resolve()
    );
    
    await Promise.all(disconnectPromises);
    this.providers.clear();
  }
}

/**
 * 全局数据提供者工厂实例
 */
export const dataProviderFactory = DataProviderFactory.getInstance();

/**
 * 便捷函数：创建数据提供者
 */
export function createDataProvider(config?: DataProviderConfig): IDataProvider {
  return dataProviderFactory.createProvider(config);
}

/**
 * 便捷函数：创建模拟数据提供者
 */
export function createMockDataProvider(config?: DataProviderConfig): IDataProvider {
  return dataProviderFactory.createMockProvider(config);
}

/**
 * 便捷函数：创建真实数据提供者
 */
export function createRealDataProvider(config?: DataProviderConfig): IDataProvider {
  return dataProviderFactory.createRealProvider(config);
}

/**
 * 便捷函数：清理所有数据提供者
 */
export function cleanupDataProviders(): Promise<void> {
  return dataProviderFactory.cleanup();
}