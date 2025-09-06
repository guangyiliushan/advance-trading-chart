import { MainChart } from "./main-chart";
import type { ChartData } from "@/core/types";

const mockData: ChartData[] = [
  { time: 1718000000 as any, open: 100, high: 110, low: 95, close: 105, volume: 1200 },
  { time: 1718000600 as any, open: 105, high: 112, low: 104, close: 110, volume: 900 },
];

export default {
  title: "AdvanceChart/Main/MainChart",
  component: MainChart,
};

export const Default = () => (
  <MainChart data={mockData} dark={false} symbol="BTC/USD" chartType="Candlestick" enableCrosshairTooltip />
);