/**
 * 位图坐标位置和长度接口
 * 用于在画布上精确定位和绘制图形元素
 */
export interface BitmapPositionLength {
  /** 在位图坐标系中的起始位置 */
  position: number;
  /** 在位图坐标系中的长度 */
  length: number;
}
