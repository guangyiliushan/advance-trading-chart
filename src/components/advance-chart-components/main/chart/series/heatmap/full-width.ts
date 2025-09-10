import type { BitmapPositionLength } from './common';

/**
 * 计算完整柱状图宽度的位图坐标
 * 这个函数确保热力图的每个时间柱完全填满可用空间，不留间隙
 * @param xMedia 柱状图中心的X坐标（媒体坐标系）
 * @param halfBarSpacingMedia 柱状图间距的一半（媒体坐标系）
 * @param horizontalPixelRatio 水平像素比率（用于高DPI屏幕适配）
 * @returns 位图坐标系中的位置和宽度
 */
export function fullBarWidth(
  xMedia: number,
  halfBarSpacingMedia: number,
  horizontalPixelRatio: number
): BitmapPositionLength {
  // 计算柱状图左边界（媒体坐标系）
  const fullWidthLeftMedia = xMedia - halfBarSpacingMedia;
  
  // 计算柱状图右边界（媒体坐标系）
  const fullWidthRightMedia = xMedia + halfBarSpacingMedia;
  
  // 将左边界转换为位图坐标并四舍五入
  const fullWidthLeftBitmap = Math.round(fullWidthLeftMedia * horizontalPixelRatio);
  
  // 将右边界转换为位图坐标并四舍五入
  const fullWidthRightBitmap = Math.round(fullWidthRightMedia * horizontalPixelRatio);
  
  // 计算位图坐标系中的实际宽度
  const fullWidthBitmap = fullWidthRightBitmap - fullWidthLeftBitmap;
  
  return {
    position: fullWidthLeftBitmap,  // 起始位置
    length: fullWidthBitmap,        // 宽度长度
  };
}
