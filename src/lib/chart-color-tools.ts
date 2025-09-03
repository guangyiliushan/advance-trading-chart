// ---------------- Color utilities ----------------

// Cache by raw value string -> computed rgb/rgba string
const __colorCache = new Map<string, string>()

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x))
}

function srgbCompandChannel(x: number) {
  // x is linear sRGB channel
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055
}

function rad(deg: number) {
  return (deg * Math.PI) / 180
}

// Convert OKLab to linear sRGB (no companding, no clamping)
function oklabToLinearSRGB(L: number, a: number, b: number) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  return [r, g, bl] as const
}

function inGamutLinearRGB(rgb: readonly [number, number, number]) {
  return rgb[0] >= 0 && rgb[0] <= 1 && rgb[1] >= 0 && rgb[1] <= 1 && rgb[2] >= 0 && rgb[2] <= 1
}

// Simple gamut mapping: scale chroma (a,b) to bring color inside sRGB gamut
function oklabToSrgbClamped(L: number, a: number, b: number): [number, number, number] {
  let rgb = oklabToLinearSRGB(L, a, b)
  if (!inGamutLinearRGB(rgb)) {
    // Binary search scaling factor on chroma
    let lo = 0
    let hi = 1
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2
      const test = oklabToLinearSRGB(L, a * mid, b * mid)
      if (inGamutLinearRGB(test)) {
        lo = mid
        rgb = test
      } else {
        hi = mid
      }
    }
  }
  // Convert to encoded sRGB and clamp to [0,255]
  const r = Math.round(clamp01(srgbCompandChannel(clamp01(rgb[0]))) * 255)
  const g = Math.round(clamp01(srgbCompandChannel(clamp01(rgb[1]))) * 255)
  const bl = Math.round(clamp01(srgbCompandChannel(clamp01(rgb[2]))) * 255)
  return [r, g, bl]
}

function parseNumber(n: string): number {
  const t = n.trim()
  if (t.endsWith('%')) {
    return parseFloat(t.slice(0, -1)) / 100
  }
  return parseFloat(t)
}

function parseHue(h: string): number {
  const t = h.trim().toLowerCase()
  if (t.endsWith('deg')) return parseFloat(t)
  if (t.endsWith('rad')) return (parseFloat(t) * 180) / Math.PI
  if (t.endsWith('turn')) return parseFloat(t) * 360
  return parseFloat(t)
}

type RGB = [number, number, number]

type RGBWithA = { rgb: RGB; a?: number }

function oklchToRgb(value: string): RGBWithA | null {
  // Accept forms: oklch(L C H) or oklch(L C H / A)
  const inside = value.slice(value.indexOf('(') + 1, value.lastIndexOf(')'))
  const parts = inside.split('/')
  const main = parts[0].trim()
  const tokens = main.split(/[\s,]+/).filter(Boolean)
  if (tokens.length < 3) return null
  let L = parseNumber(tokens[0])
  const C = parseNumber(tokens[1])
  const H = parseHue(tokens[2])
  if (isFinite(L) && L > 1) L = L / 100 // allow L given as percentage number
  const a = C * Math.cos(rad(H))
  const b = C * Math.sin(rad(H))
  const rgb = oklabToSrgbClamped(L, a, b)
  const alpha = parts[1] ? clamp01(parseNumber(parts[1])) : undefined
  return { rgb, a: alpha }
}

function oklabStrToRgb(value: string): RGBWithA | null {
  // Accept: oklab(L a b / A)
  const inside = value.slice(value.indexOf('(') + 1, value.lastIndexOf(')'))
  const parts = inside.split('/')
  const main = parts[0].trim()
  const tokens = main.split(/[\s,]+/).filter(Boolean)
  if (tokens.length < 3) return null
  let L = parseNumber(tokens[0])
  const a = parseFloat(tokens[1])
  const b = parseFloat(tokens[2])
  if (isFinite(L) && L > 1) L = L / 100
  const rgb = oklabToSrgbClamped(L, a, b)
  const alpha = parts[1] ? clamp01(parseNumber(parts[1])) : undefined
  return { rgb, a: alpha }
}

function hexToRgb(hex: string): RGBWithA | null {
  const m = hex.trim().toLowerCase()
  if (!/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(m)) return null
  let r = 0, g = 0, b = 0, a: number | undefined
  if (m.length === 4 || m.length === 5) {
    r = parseInt(m[1] + m[1], 16)
    g = parseInt(m[2] + m[2], 16)
    b = parseInt(m[3] + m[3], 16)
    if (m.length === 5) a = parseInt(m[4] + m[4], 16) / 255
  } else {
    r = parseInt(m.slice(1, 3), 16)
    g = parseInt(m.slice(3, 5), 16)
    b = parseInt(m.slice(5, 7), 16)
    if (m.length === 9) a = parseInt(m.slice(7, 9), 16) / 255
  }
  return { rgb: [r, g, b], a }
}

function normalizeToRgbViaCSS(color: string): string | null {
  if (typeof document === 'undefined') return null
  const temp = document.createElement('div')
  temp.style.color = color
  document.body.appendChild(temp)
  const out = getComputedStyle(temp).color
  document.body.removeChild(temp)
  return /^rgb\(/i.test(out) ? out : null
}

// Read a CSS custom property (e.g. --background) and return rgb(...) or rgba(...)
// Converts OKLCH/OKLab/HEX to sRGB and does simple gamut mapping to avoid green-only outputs
export function getCssVariableRgb(varName: string): string {
  try {
    if (typeof document === 'undefined') return 'rgb(255,255,255)'
    const root = document.documentElement
    const raw = getComputedStyle(root).getPropertyValue(varName).trim()
    if (!raw) return 'rgb(255,255,255)'

    const cached = __colorCache.get(raw)
    if (cached) return cached

    let result: RGBWithA | null = null
    const low = raw.toLowerCase()

    if (low.startsWith('oklch(')) {
      result = oklchToRgb(raw)
    } else if (low.startsWith('oklab(')) {
      result = oklabStrToRgb(raw)
    } else if (low.startsWith('#')) {
      result = hexToRgb(raw)
    }

    let out: string | null = null
    if (result) {
      const [r, g, b] = result.rgb
      if (result.a != null && result.a < 1) {
        out = `rgba(${r}, ${g}, ${b}, ${+result.a.toFixed(3)})`
      } else {
        out = `rgb(${r}, ${g}, ${b})`
      }
    } else {
      // For rgb()/hsl()/named colors, rely on browser to normalize
      out = normalizeToRgbViaCSS(raw)
    }

    const finalColor = out ?? 'rgb(255,255,255)'
    __colorCache.set(raw, finalColor)
    return finalColor
  } catch {
    return 'rgb(255,255,255)'
  }
}