import type { BitmapPositionLength } from './common';

/**
 * 计算居中偏移量
 * @param lineBitmapWidth 线条在位图中的宽度
 * @returns 居中偏移量
 */
function centreOffset(lineBitmapWidth: number): number {
  // 返回宽度的一半，用于居中对齐
  return Math.floor(lineBitmapWidth * 0.5);
}

/**
 * 计算线条在位图坐标系中的位置和长度
 * 用于绘制居中对齐的线条或细长的图形元素
 * @param positionMedia 媒体坐标系中的位置
 * @param pixelRatio 像素比率（用于高DPI屏幕适配）
 * @param desiredWidthMedia 期望的宽度（媒体坐标系）
 * @param widthIsBitmap 宽度是否已经是位图坐标
 * @returns 位图坐标系中的位置和长度
 */
export function positionsLine(
  positionMedia: number,
  pixelRatio: number,
  desiredWidthMedia: number = 1,
  widthIsBitmap?: boolean
): BitmapPositionLength {
  // 将媒体坐标转换为位图坐标
  const scaledPosition = Math.round(pixelRatio * positionMedia);
  
  // 计算线条在位图中的宽度
  const lineBitmapWidth = widthIsBitmap
    ? desiredWidthMedia  // 如果已经是位图坐标，直接使用
    : Math.round(desiredWidthMedia * pixelRatio);  // 否则转换为位图坐标
  
  // 计算居中偏移量
  const offset = centreOffset(lineBitmapWidth);
  
  // 计算最终位置（居中对齐）
  const position = scaledPosition - offset;
  
  return { position, length: lineBitmapWidth };
}

/**
 * 计算矩形框在位图坐标系中的位置和长度
 * 用于绘制热力图的价格区间矩形
 * @param position1Media 第一个位置点（媒体坐标系）
 * @param position2Media 第二个位置点（媒体坐标系）
 * @param pixelRatio 像素比率
 * @returns 位图坐标系中的位置和长度
 */
export function positionsBox(
  position1Media: number,
  position2Media: number,
  pixelRatio: number
): BitmapPositionLength {
  // 将两个媒体坐标点转换为位图坐标
  const scaledPosition1 = Math.round(pixelRatio * position1Media);
  const scaledPosition2 = Math.round(pixelRatio * position2Media);
  
  return {
    // 取较小的位置作为起始点
    position: Math.min(scaledPosition1, scaledPosition2),
    // 计算长度（两点间距离 + 1 确保至少有1像素宽度）
    length: Math.abs(scaledPosition2 - scaledPosition1) + 1,
  };
}
