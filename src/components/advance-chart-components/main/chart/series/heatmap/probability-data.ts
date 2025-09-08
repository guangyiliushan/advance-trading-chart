import type { HeatMapData } from './data';
import type { Time } from 'lightweight-charts';

/**
 * 价格区间接口
 * 定义单个价格区间的数据结构
 */
export interface PriceBin {
  /** 价格区间下边界 */
  lbound: number;
  /** 价格区间上边界 */
  rbound: number;
  /** 该价格区间的概率值（0-1之间） */
  prob: number;
}

/**
 * 概率数据接口
 * 定义某个时间点的完整概率分布数据
 */
export interface ProbabilityData {
  /** Unix时间戳 */
  timestamp: number;
  /** 该时间点的所有价格区间概率数据 */
  bins: PriceBin[];
}

/**
 * 将价格区间概率数据转换为热力图数据格式
 * 这是数据转换的核心函数，将原始概率数据转换为图表可以理解的格式
 * @param probabilityDataArray 原始概率数据数组
 * @returns 转换后的热力图数据数组
 */
export function convertProbabilityToHeatMapData(probabilityDataArray: ProbabilityData[]): HeatMapData[] {
  return probabilityDataArray.map(data => {
    return {
      // 设置时间轴数据
      time: Number(String(data.timestamp)) as Time,
      // 转换价格区间数据
      cells: data.bins
        .filter(bin => bin.lbound !== -Infinity && bin.rbound !== Infinity) // 过滤掉无限值，避免渲染问题
        .map(bin => ({
          low: bin.lbound,           // 价格区间下边界
          high: bin.rbound,          // 价格区间上边界
          amount: bin.prob * 100,    // 将概率转换为百分比以便更好地显示颜色强度
        }))
    };
  });
}

/**
 * 生成示例概率数据用于测试和演示
 * 当没有真实数据时，可以使用这个函数生成模拟数据
 * @returns 生成的示例概率数据数组
 */
export function generateSampleProbabilityData(): ProbabilityData[] {
  const sampleData: ProbabilityData[] = [];
  const baseTime = 1700094000; // 2023-11-16 的Unix时间戳作为起始时间
  
  // 生成30天的数据
  for (let day = 0; day < 30; day++) {
    // 计算当前时间戳（每天递增）
    const timestamp = baseTime + day * 24 * 60 * 60;
    
    // 生成基础价格，使用正弦函数模拟价格波动
    const basePrice = 1959 + Math.sin(day * 0.2) * 5;
    
    // 为当前时间点生成价格区间
    const bins: PriceBin[] = [];
    const numBins = 12;        // 价格区间数量
    const priceRange = 2;      // 总价格范围
    const binSize = priceRange / numBins;  // 每个区间的大小
    
    // 生成每个价格区间
    for (let i = 0; i < numBins; i++) {
      // 计算区间边界
      const lbound = basePrice - priceRange/2 + i * binSize;
      const rbound = lbound + binSize;
      
      // 生成正态分布概率：中间概率高，两端概率低
      const center = numBins / 2;                    // 中心位置
      const distance = Math.abs(i - center);         // 距离中心的距离
      const prob = Math.exp(-distance * distance / (2 * 2 * 2)) * 0.2; // 高斯分布公式
      
      bins.push({
        lbound,
        rbound,
        prob
      });
    }
    
    // 归一化概率，确保所有概率的总和为1
    const totalProb = bins.reduce((sum, bin) => sum + bin.prob, 0);
    bins.forEach(bin => bin.prob = bin.prob / totalProb);
    
    // 添加到示例数据数组
    sampleData.push({
      timestamp,
      bins
    });
  }
  
  return sampleData;
}
