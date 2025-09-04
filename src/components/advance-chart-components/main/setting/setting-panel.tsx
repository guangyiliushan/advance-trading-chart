import * as React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuItem, DropdownMenuPortal, } from "@/components/ui/dropdown-menu"
import { useTranslation } from "react-i18next"

export const SettingPanel: React.FC<React.PropsWithChildren> = ({ children }) => {
  // i18n
  const { t } = useTranslation()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        {/* 第一分组：数据适配与坐标相关 */}
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem checked>{t('chart.settings.autoFit')}</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>{t('chart.settings.lockPriceToCandle')}</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>{t('chart.settings.scaleOnlyPrice')}</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>{t('chart.settings.invertPriceAxis')}</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* 第二分组：比例模式 */}
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup defaultValue="regular">
            <DropdownMenuRadioItem value="regular">{t('chart.settings.scaleMode.regular')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="percent">
              {t('chart.settings.scaleMode.percent')}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="base100">{t('chart.settings.scaleMode.base100')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="log">
              {t('chart.settings.scaleMode.log')}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem>{t('chart.settings.moveAxisLeft')}</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* 第三分组：标签子菜单 */}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
               {t('chart.settings.labels.title')}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-48">
                {[
                  { key: 'chart.settings.labels.symbolName', defaultChecked: true },
                  { key: 'chart.settings.labels.lastPrice', defaultChecked: true },
                  { key: 'chart.settings.labels.highLow', defaultChecked: false },
                  { key: 'chart.settings.labels.indicatorName', defaultChecked: false },
                  { key: 'chart.settings.labels.indicatorValue', defaultChecked: true },
                  { key: 'chart.settings.labels.noOverlap', defaultChecked: true },
                ].map(({ key, defaultChecked }) => (
                  <DropdownMenuCheckboxItem 
                    key={key}
                    defaultChecked={defaultChecked}
                  >
                    {t(key as any)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* 线条子菜单 */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {t('chart.settings.lines.title')}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-32">
                <DropdownMenuCheckboxItem>{t('chart.settings.lines.priceLine')}</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>{t('chart.settings.lines.highLowLine')}</DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem>{t('chart.settings.countdownKLine')}</DropdownMenuItem>
          <DropdownMenuItem>{t('chart.settings.plusButton')}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{t('chart.settings.settings')}</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}