import React from "react";
import PriceLegendOverlay from "./price-legend-overlay";

export default {
  title: "AdvanceChart/Main/Chart/PriceLegendOverlay",
  component: PriceLegendOverlay,
};

export const Default = () => (
  <div style={{ position: "relative", height: 120, background: "#222" }}>
    <PriceLegendOverlay
      symbol="BTC/USD"
      bar={{ open: 100, high: 110, low: 95, close: 105, volume: 1200 }}
      last={{ open: 105, close: 110 }}
      layoutColors={{ text: "#fff", up: "#0f0", down: "#f00" }}
    />
  </div>
);
