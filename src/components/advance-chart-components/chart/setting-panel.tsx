import * as React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuItem, DropdownMenuPortal, } from "@/components/ui/dropdown-menu"

export const SettingPanel: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        {/* 第一分组：数据适配与坐标相关 */}
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem checked>自动(调整数据适于屏幕)</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>锁定价格对K线比例</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>仅缩放价格图表</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>翻转价格坐标</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* 第二分组：比例模式 */}
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup defaultValue="regular">
            <DropdownMenuRadioItem value="regular">常规</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="percent">
              百分比
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="base100">基准100</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="log">
              对数
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem>将坐标移至左侧</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* 第三分组：标签子菜单 */}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
               标签
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-48">
                {[
                  { label: "商品名称标签", defaultChecked: true },
                  { label: "商品最新价格标签", defaultChecked: true },
                  { label: "高低价标签", defaultChecked: false },
                  { label: "指标名称标签", defaultChecked: false },
                  { label: "指标值标签", defaultChecked: true },
                  { label: "无重叠标签", defaultChecked: true },
                ].map(({ label, defaultChecked }) => (
                  <DropdownMenuCheckboxItem 
                    key={label}
                    defaultChecked={defaultChecked}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* 线条子菜单 */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              线条
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-32">
                <DropdownMenuCheckboxItem>价格线</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>高低价线</DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem>当前K线结束倒计时</DropdownMenuItem>
          <DropdownMenuItem>加号按钮</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>设置</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}