import React from "react";
import { ChartContainer } from "./chart-container";
import type { ChartData } from "@/lib/types";
import type { Time } from "lightweight-charts";

const mockData: ChartData[] = [
  { time: 1718000000 as Time, open: 100, high: 110, low: 95, close: 105, volume: 1200 },
  { time: 1718000600 as Time, open: 105, high: 112, low: 104, close: 110, volume: 900 },
];

export default {
  title: "Chart/ChartContainer",
  component: ChartContainer,
};

export const Default = () => (
  <ChartContainer
    data={mockData}
    dark={false}
    symbol="BTC/USD"
    timeframe="1m"
    rangeSpan={null}
    onRangeSpanChange={() => {}}
    onSymbolChange={() => {}}
    onTimeframeChange={() => {}}
    symbolOptions={["BTC/USD", "ETH/USD"]}
  />
);
