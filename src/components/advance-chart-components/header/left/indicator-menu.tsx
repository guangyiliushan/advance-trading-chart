import * as React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SquareFunction } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../ui/command"
import { useTranslation } from "react-i18next"

export const IndicatorMenu: React.FC = () => {
  const [open, setOpen] = React.useState(false)
  const [_label, setLabel] = React.useState<string>("")
  const { t } = useTranslation()

  // Derive a stable i18n key from label text. Prefer the English name in parentheses if present.
  const toIndicatorKey = React.useCallback((raw: string) => {
    const m = raw.match(/\(([^)]+)\)/)
    const base = (m ? m[1] : raw).toLowerCase()
    return base
      .replace(/[’'`]/g, "") // remove quotes
      .replace(/[^a-z0-9]+/g, "_") // non-alphanumerics to underscore
      .replace(/^_+|_+$/g, "") // trim underscores
  }, [])

  const labels = React.useMemo(
    () => [
      "52 Week High/Low",
      "Accelerator Oscillator",
      "Elder's Force Index",
      "EMA交叉",
      "Know Sure Thing",
      "MACD",
      "MA与EAM交叉",
      "Moving Average",
      "Ratio",
      "SMI 遍历性指标(SMI Ergodic Indicator/Oscillator)",
      "Spread",
      "Volume Profile Fixed Range",
      "Volume Profile Visible Range",
      "一目均衡表(Ichimoku Cloud)",
      "三重指数平滑平均线(Triple EMA)",
      "三重指数平滑移动平均线(TRIX)",
      "三重移动平均",
      "中位数价格",
      "之字转向(Zig Zag)",
      "价格摆动指标(Price Oscillator)",
      "价格通道(Price Channel)",
      "价量趋势指标(Price Volume Trend)",
      "估波曲线(Coppock Curve)",
      "克林格成交量摆动指标(Klinger Oscillator)",
      "典型价格",
      "净成交量(Net Volume)",
      "加权移动平均线(Moving Average Weighted)",
      "动向指标(Directional Movement)",
      "动量指标(Momentum)",
      "动量震荡指标(Awesome Oscillator)",
      "包络线指标",
      "历史波动率(Historical Volatility)",
      "双指数移动平均线(Double EMA)",
      "双移动平均线",
      "变化速率(Rate Of Change)",
      "唐奇安通道(Donchian Channels)",
      "均势指标(Balance of Power)",
      "多数决原则",
      "多重移动平均线",
      "威廉姆斯分形指标(Williams Fractal)",
      "威廉姆斯指标(Williams %R)",
      "威廉姆斯鳄鱼线(Williams Alligator)",
      "布林带 %B(Bollinger Bands %B)",
      "布林带(Bollinger Bands)",
      "布林带宽度(Bollinger Bands Width)",
      "平均价",
      "平均趋向指数(Average Directional Index)",
      "平滑移动平均线(Smoothed Moving Average)",
      "康纳相对强弱指数(CRSI)",
      "成交量(Volume)",
      "成交量加权平均价(VWAP)",
      "成交量加权移动平均值(VWMA)",
      "成交量震荡指标(Volume Oscillator)",
      "抛物线转向指标(Parabolic SAR)",
      "指数移动平均线(Moving Average Exponential)",
      "振动升降指标(ASI)",
      "旋涡指标(Vortex Indicator)",
      "最小二乘移动平均线(Least Squares Moving Average)",
      "枢轴点 - 标准(Pivot Points Standard)",
      "标准偏差",
      "标准误差",
      "标准误差带",
      "梅斯线(Mass Index)",
      "波动区间(Chop Zone)",
      "波动指数(Choppiness Index)",
      "波动率 O-H-L-C",
      "波动率Close-to-Close",
      "波动率指数",
      "波动率零趋势Close-to-Close",
      "海明移动平均",
      "涨跌比(Advance/Decline)",
      "相关 - 记录",
      "相关系数(Correlation Coefficient)",
      "相对强弱指标(Relative Strength Index)",
      "相对离散指数(Relative Volatility Index)",
      "相对能量指数(Relative Vigor Index)",
      "真实强弱指数",
      "真实波动幅度均值(Average True Range)",
      "移动平均线通道(Moving Average Channel)",
      "移动揉搓线(MA Cross)",
      "简易波动指标(Ease Of Movement)",
      "累积/派发线(Accumulation/Distribution)",
      "线性回归斜率",
      "线性回归曲线(Linear Regression Curve)",
      "终极波动指标(Ultimate Oscillator)",
      "肯特纳通道(Keltner Channels)",
      "能量潮指标(On Balance Volume)",
      "自适应移动均线",
      "船体移动平均线(Hull Moving Average)",
      "蔡金波动率",
      "蔡金资金流量(Chaikin Money Flow)",
      "蔡金资金流量震荡指标(Chaikin Oscillator)",
      "费舍尔转换(Fisher Transform)",
      "资金流量指数",
      "超级趋势",
      "趋势强度指数",
      "钱德克罗止损(Chande Kroll Stop)",
      "钱德动量摆动指标(Chande Momentum Oscillator)",
      "阿诺勒古移动平均线(Arnaud Legoux Moving Average)",
      "阿隆指标(Aroon)",
      "随机指数(Stochastic)",
      "随机相对强弱指数(Stoch RSI)",
      "非趋势价格摆动指标(Detrended Price Oscillator)",
      "顺势指标(Commodity Channel Index)",
      "顾比复合移动平均线（GMMA）",
      "麦吉利动态指标(McGinley Dynamic)",
    ],
    []
  )

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <SquareFunction className="h-5 w-5" />
          {t('chart.header.indicator')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>{t('chart.header.indicatorMenu.title')}</DropdownMenuLabel>
        <Command>
          <CommandInput placeholder={t('chart.header.indicatorMenu.searchPlaceholder')} autoFocus={true} className="h-9" />
          <CommandList>
            <CommandEmpty>{t('chart.header.indicatorMenu.empty')}</CommandEmpty>
            <CommandGroup>
              {labels.map((raw) => {
                const key = toIndicatorKey(raw)
                const display = t(`chart.indicators.${key}`, { defaultValue: raw })
                return (
                  <CommandItem
                    key={key || raw}
                    // Use both the raw and translated text to improve search matching
                    value={`${raw} ${display}`}
                    onSelect={() => {
                      setLabel(display)
                      setOpen(false)
                    }}
                  >
                    {display}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}