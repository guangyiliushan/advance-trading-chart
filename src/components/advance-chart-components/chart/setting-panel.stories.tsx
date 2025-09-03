import React from "react";
import { SettingPanel } from "./setting-panel";
import { Button } from "@/components/ui/button";

export default {
  title: "Chart/SettingPanel",
  component: SettingPanel,
};

export const Default = () => (
  <SettingPanel>
    <Button>设置</Button>
  </SettingPanel>
);
