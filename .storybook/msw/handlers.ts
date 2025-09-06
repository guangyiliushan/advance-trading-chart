import { http, HttpResponse } from 'msw'

// Basic image handler to support ImageMenu fetching from public assets or external placeholder
// Adjust or extend as your stories require
export const handlers = [
  // Example: intercept placeholder image requests (used in stories or default props)
  http.get('https://via.placeholder.com/:size', ({ params }) => {
    const size = String(params.size || '300')
    // Return a simple 1x1 PNG or a dynamic SVG for better scalability
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="#333">${size}</text></svg>`
    return new HttpResponse(svg, { status: 200, headers: { 'Content-Type': 'image/svg+xml' } })
  }),

  // Intercept relative image paths commonly used in stories (adjust as needed)
  http.get('/images/:name', ({ params }) => {
    const name = String(params.name || 'chart.svg')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="100%" height="100%" fill="#f5f5f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#444">${name}</text></svg>`
    return new HttpResponse(svg, { status: 200, headers: { 'Content-Type': 'image/svg+xml' } })
  }),
]