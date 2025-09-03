import React, { useState } from "react";
import { ChartTypeSwitcher } from "./chart-type-switcher";
import type { ChartTypeStr } from "@/lib/types";

export default {
  title: "AdvanceChart/Header/Left/ChartTypeSwitcher",
  component: ChartTypeSwitcher,
};

export const Default = () => {
  const [type, setType] = useState<ChartTypeStr>("Candlestick");
  return <ChartTypeSwitcher value={type} onChange={setType} />;
};
