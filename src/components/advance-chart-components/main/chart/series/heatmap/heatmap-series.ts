import type { CustomSeriesPricePlotValues, ICustomSeriesPaneView, PaneRendererCustomData, WhitespaceData, Time } from 'lightweight-charts';
import { type HeatMapSeriesOptions, defaultOptions } from './options';
import { HeatMapSeriesRenderer } from './renderer';
import type { HeatMapData } from './data';

/**
 * 热力图系列类
 * 这是热力图的核心类，实现了 lightweight-charts 的自定义系列接口
 * 负责管理热力图的数据处理、渲染器和配置选项
 */
export class HeatMapSeries<TData extends HeatMapData> implements ICustomSeriesPaneView<Time, TData, HeatMapSeriesOptions> {
  /** 热力图渲染器实例，负责实际的绘制工作 */
  _renderer: HeatMapSeriesRenderer<TData>;

  /**
   * 构造函数
   * 初始化热力图系列，创建渲染器实例
   */
  constructor() {
    this._renderer = new HeatMapSeriesRenderer();
  }

  /**
   * 价格值构建器
   * 从热力图数据中提取价格信息，用于图表的价格轴显示
   * @param plotRow 单个时间点的热力图数据
   * @returns 价格值数组 [最低价, 最高价, 中间价]
   */
  priceValueBuilder(plotRow: TData): CustomSeriesPricePlotValues {
    // 如果没有单元格数据，返回 NaN
    if (plotRow.cells.length < 1) {
      return [NaN];
    }
    
    // 遍历所有单元格，找出最低价和最高价
    let low = Infinity;   // 初始化为正无穷，确保能找到真正的最小值
    let high = -Infinity; // 初始化为负无穷，确保能找到真正的最大值
    
    plotRow.cells.forEach(cell => {
      if (cell.low < low) low = cell.low;
      if (cell.high > high) high = cell.high;
    });
    
    // 计算中间价格
    const mid = low + (high - low) / 2;
    
    // 返回 [最低价, 最高价, 中间价]，用于价格轴的显示和缩放
    return [low, high, mid];
  }

  /**
   * 判断数据是否为空白数据
   * 用于确定某个时间点是否有有效的热力图数据
   * @param data 要检查的数据
   * @returns 如果是空白数据返回 true
   */
  isWhitespace(data: TData | WhitespaceData): data is WhitespaceData {
    // 检查数据是否缺少 cells 属性或 cells 数组为空
    return (data as Partial<TData>).cells === undefined || (data as Partial<TData>).cells!.length < 1;
  }

  /**
   * 获取渲染器实例
   * lightweight-charts 会调用这个方法来获取负责绘制的渲染器
   * @returns 热力图渲染器实例
   */
  renderer(): HeatMapSeriesRenderer<TData> {
    return this._renderer;
  }

  /**
   * 更新数据和选项
   * 当图表数据或配置发生变化时，这个方法会被调用
   * @param data 新的渲染数据
   * @param options 新的配置选项
   */
  update(data: PaneRendererCustomData<Time, TData>, options: HeatMapSeriesOptions): void {
    // 将数据和选项传递给渲染器
    this._renderer.update(data, options);
  }

  /**
   * 获取默认选项
   * 返回热力图系列的默认配置
   * @returns 默认选项对象
   */
  defaultOptions() {
    return defaultOptions;
  }
}
