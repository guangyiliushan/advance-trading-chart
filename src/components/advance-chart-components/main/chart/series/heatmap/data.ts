import type { CustomData } from 'lightweight-charts';

/**
 * 热力图单元格接口
 * 定义了热力图中每个价格区间的数据结构
 */
export interface HeatmapCell {
  /** 价格区间的下边界 */
  low: number;
  /** 价格区间的上边界 */
  high: number;
  /** 该价格区间的数量/概率值，用于决定颜色深浅 */
  amount: number;
}

/**
 * 热力图数据接口
 * 继承自 lightweight-charts 的 CustomData，包含时间信息
 */
export interface HeatMapData extends CustomData {
  /** 该时间点的所有价格区间单元格 */
  cells: HeatmapCell[];
}
