import React from "react";
import { TradingChart } from "./trading-chart";
import type { ChartData } from "@/lib/types";

const mockData: ChartData[] = [
  { time: 1718000000, open: 100, high: 110, low: 95, close: 105, volume: 1200 },
  { time: 1718000600, open: 105, high: 112, low: 104, close: 110, volume: 900 },
];

export default {
  title: "Chart/TradingChart",
  component: TradingChart,
};

export const Default = () => (
  <TradingChart data={mockData} dark={false} symbol="BTC/USD" chartType="Candlestick" />
);
