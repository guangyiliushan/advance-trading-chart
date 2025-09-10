import { type BitmapCoordinatesRenderingScope, CanvasRenderingTarget2D } from 'fancy-canvas';
import type { ICustomSeriesPaneRenderer, PaneRendererCustomData, PriceToCoordinateConverter, Time } from 'lightweight-charts';
import type { HeatMapData } from './data';
import type { HeatMapSeriesOptions } from './options';
import { fullBarWidth } from './full-width';
import { positionsBox } from './positions';

/**
 * 热力图柱状图单元格接口（渲染用）
 * 这是经过坐标转换后的单元格数据，用于实际绘制
 */
interface HeatMapBarItemCell {
  /** 价格区间下边界（已转换为屏幕坐标） */
  low: number;
  /** 价格区间上边界（已转换为屏幕坐标） */
  high: number;
  /** 数量/概率值，用于确定颜色 */
  amount: number;
}

/**
 * 热力图柱状图项接口（渲染用）
 * 代表某个时间点的完整热力图数据
 */
interface HeatMapBarItem {
  /** 时间轴上的X坐标位置 */
  x: number;
  /** 该时间点的所有价格区间单元格 */
  cells: HeatMapBarItemCell[];
}

/**
 * 热力图系列渲染器
 * 这是热力图的核心渲染类，负责将数据绘制到画布上
 * 实现了 lightweight-charts 的自定义渲染器接口
 */
export class HeatMapSeriesRenderer<TData extends HeatMapData> implements ICustomSeriesPaneRenderer {
  /** 当前的渲染数据，包含所有需要绘制的信息 */
  _data: PaneRendererCustomData<Time, TData> | null = null;
  /** 当前的渲染选项，包含颜色、边框等配置 */
  _options: HeatMapSeriesOptions | null = null;

  /**
   * 绘制方法
   * 这是 lightweight-charts 调用的主要绘制入口点
   * @param target 画布渲染目标
   * @param priceConverter 价格到坐标的转换器
   */
  draw(target: CanvasRenderingTarget2D, priceConverter: PriceToCoordinateConverter): void {
    // 使用位图坐标空间进行绘制，确保在高DPI屏幕上的清晰度
    target.useBitmapCoordinateSpace(scope => this._drawImpl(scope, priceConverter));
  }

  /**
   * 更新渲染数据和选项
   * 当图表数据或配置发生变化时调用
   * @param data 新的渲染数据
   * @param options 新的渲染选项
   */
  update(data: PaneRendererCustomData<Time, TData>, options: HeatMapSeriesOptions): void {
    this._data = data;
    this._options = options;
  }

  /**
   * 实际的绘制实现
   * 这里包含了热力图绘制的所有逻辑
   * @param renderingScope 位图坐标渲染作用域
   * @param priceToCoordinate 价格到屏幕坐标的转换函数
   */
  _drawImpl(renderingScope: BitmapCoordinatesRenderingScope, priceToCoordinate: PriceToCoordinateConverter): void {
    // 检查必要的数据是否存在
    if (this._data === null || this._data.bars.length === 0 || this._data.visibleRange === null || this._options === null) {
      return; // 如果数据不完整，直接返回不绘制
    }
    
    const options = this._options;
    
    // 将原始数据转换为渲染用的数据格式
    const bars: HeatMapBarItem[] = this._data.bars.map(bar => {
      return {
        x: bar.x, // 时间轴上的X坐标
        cells: bar.originalData.cells.map(cell => {
          return {
            amount: cell.amount, // 保持原始数量值
            // 将价格转换为屏幕Y坐标
            low: priceToCoordinate(cell.low)!,
            high: priceToCoordinate(cell.high)!,
          };
        }),
      };
    });
    
    // 决定是否绘制边框：只有当柱状图间距足够大时才绘制边框
    const drawBorder = this._data.barSpacing > options.cellBorderWidth * 3;

    // 遍历可见范围内的所有柱状图
    for (let i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
      const bar = bars[i];
      
      // 计算当前柱状图的完整宽度
      const fullWidth = fullBarWidth(bar.x, this._data.barSpacing / 2, renderingScope.horizontalPixelRatio);
      
      // 计算边框宽度（如果需要绘制边框）
      const borderWidthHorizontal = drawBorder ? options.cellBorderWidth * renderingScope.horizontalPixelRatio : 0;
      const borderWidthVertical = drawBorder ? options.cellBorderWidth * renderingScope.verticalPixelRatio : 0;
      
      // 绘制当前柱状图的所有单元格
      for (const cell of bar.cells) {
        // 计算单元格的垂直位置和高度
        const verticalDimension = positionsBox(cell.low, cell.high, renderingScope.verticalPixelRatio);
        
        // 设置填充颜色（根据数量值通过着色器函数计算）
        renderingScope.context.fillStyle = options.cellShader(cell.amount);
        
        // 绘制填充的矩形（热力图单元格的主体）
        renderingScope.context.fillRect(
          fullWidth.position + borderWidthHorizontal,           // X起始位置（考虑边框）
          verticalDimension.position + borderWidthVertical,     // Y起始位置（考虑边框）
          fullWidth.length - borderWidthHorizontal * 2,        // 宽度（减去左右边框）
          verticalDimension.length - 1 - borderWidthVertical * 2 // 高度（减去上下边框，-1避免重叠）
        );
        
        // 如果需要绘制边框且边框不透明
        if (drawBorder && options.cellBorderWidth && options.cellBorderColor !== 'transparent') {
          // 开始绘制边框路径
          renderingScope.context.beginPath();
          renderingScope.context.rect(
            fullWidth.position + borderWidthHorizontal / 2,     // 边框X位置
            verticalDimension.position + borderWidthVertical / 2, // 边框Y位置
            fullWidth.length - borderWidthHorizontal,           // 边框宽度
            verticalDimension.length - 1 - borderWidthVertical  // 边框高度
          );
          
          // 设置边框样式并绘制
          renderingScope.context.strokeStyle = options.cellBorderColor;
          renderingScope.context.lineWidth = borderWidthHorizontal;
          renderingScope.context.stroke();
        }
      }
    }
  }
}
