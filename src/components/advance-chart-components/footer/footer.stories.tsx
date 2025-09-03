import React from "react";
import { Footer } from "./footer";

export default {
  title: "Chart/Footer",
  component: Footer,
};

export const Default = () => (
  <Footer
    theme="light"
    rangeSpan="1d"
    onRangeSpanChange={() => {}}
    autoMode={true}
    onAutoModeChange={() => {}}
  />
);
