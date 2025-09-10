import { http, HttpResponse } from 'msw'
import { generateDataForSymbol } from '../../src/core/data/mock-data-generator'

/**
 * MSW handlers for Storybook
 * 提供交易数据API的模拟实现
 */
export const handlers = [
  // 交易数据API - 获取历史K线数据
  http.get('/api/v1/klines', ({ request }) => {
    const url = new URL(request.url)
    const symbol = url.searchParams.get('symbol') || 'BTCUSDT'
    const interval = url.searchParams.get('interval') || '1h'
    const limit = parseInt(url.searchParams.get('limit') || '1000')
    const startTime = url.searchParams.get('startTime')
    const endTime = url.searchParams.get('endTime')
    
    try {
      // 转换symbol格式 (BTCUSDT -> BTC/USDT)
      const formattedSymbol = symbol.replace(/([A-Z]{3,4})([A-Z]{3,4})/, '$1/$2')
      
      // 转换interval格式
      const timeframeMap: Record<string, string> = {
        '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
        '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1w'
      }
      const timeframe = timeframeMap[interval] || '1h'
      
      // 生成模拟数据
      const data = generateDataForSymbol(formattedSymbol, timeframe, limit)
      
      // 过滤时间范围
      let filteredData = data
      if (startTime) {
        const start = parseInt(startTime) / 1000
        filteredData = filteredData.filter(item => (item.time as number) >= start)
      }
      if (endTime) {
        const end = parseInt(endTime) / 1000
        filteredData = filteredData.filter(item => (item.time as number) <= end)
      }
      
      // 转换为API格式
      const apiData = filteredData.map(item => ({
        timestamp: (item.time as number) * 1000,
        open: item.open.toString(),
        high: item.high.toString(),
        low: item.low.toString(),
        close: item.close.toString(),
        volume: (item.volume || 0).toString()
      }))
      
      return HttpResponse.json(apiData)
    } catch (error) {
      return new HttpResponse(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }),
  
  // 交易所信息API - 获取支持的交易对
  http.get('/api/v1/exchangeInfo', () => {
    const symbols = [
      { baseAsset: 'BTC', quoteAsset: 'USDT' },
      { baseAsset: 'ETH', quoteAsset: 'USDT' },
      { baseAsset: 'BNB', quoteAsset: 'USDT' },
      { baseAsset: 'ADA', quoteAsset: 'USDT' },
      { baseAsset: 'SOL', quoteAsset: 'USDT' },
      { baseAsset: 'DOT', quoteAsset: 'USDT' },
      { baseAsset: 'MATIC', quoteAsset: 'USDT' },
      { baseAsset: 'AVAX', quoteAsset: 'USDT' }
    ]
    
    return HttpResponse.json({ symbols })
  }),
  
  // 图片占位符处理器
  http.get('https://via.placeholder.com/:size', ({ params }) => {
    const size = String(params.size || '300')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="#333">${size}</text></svg>`
    return new HttpResponse(svg, { status: 200, headers: { 'Content-Type': 'image/svg+xml' } })
  }),

  // 本地图片路径处理器
  http.get('/images/:name', ({ params }) => {
    const name = String(params.name || 'chart.svg')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="100%" height="100%" fill="#f5f5f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#444">${name}</text></svg>`
    return new HttpResponse(svg, { status: 200, headers: { 'Content-Type': 'image/svg+xml' } })
  }),
]