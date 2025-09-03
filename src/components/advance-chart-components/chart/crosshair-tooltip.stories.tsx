import React from "react";
import CrosshairTooltip from "./crosshair-tooltip";

export default {
  title: "Chart/CrosshairTooltip",
  component: CrosshairTooltip,
};

export const Default = () => <CrosshairTooltip chart={null} data={[]} containerRef={{ current: null }} layoutColors={{ up: "#0f0", down: "#f00", text: "#fff" }} />;
