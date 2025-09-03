import React from "react";
import { Header } from "./header";

export default {
  title: "AdvanceChart/Header",
  component: Header,
};

export const Default = () => (
  <Header
    symbol="BTC/USD"
    onSymbolChange={() => {}}
    timeframe="1m"
    onTimeframeChange={() => {}}
    chartType="Candlestick"
    onChartTypeChange={() => {}}
    symbolOptions={["BTC/USD", "ETH/USD"]}
  />
);
