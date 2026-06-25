// All values verified against Figma file CaKWVCHXZEjY1INvc6fhVv.
// Token names mirror Figma style names. Do not edit without re-verifying from Figma.

export const Colors = {
  darkBackground: '#121212',
  bg1: '#1F1F1F',
  bg2: '#262626',
  bg3: '#2E2E2E',

  white: '#FFFFFF',
  avzdaxBlack: '#262626',
  avzdaxGrey: '#BFBFBF',

  black50: '#F9FAFB',
  black100: '#F2F4F7',
  black200: '#E4E7EC',
  black300: '#A3A3A3',
  black400: '#8A8A8A',
  black500: '#525252',
  black600: '#575757',
  black700: '#3D3D3D',
  black800: '#1F1F1F',
  black900: '#121212',

  error500: '#F04438',
  error600: '#D92D20',

  // Lime green active state — used in setup overlay radio button inner dot
  limeAccent: '#A4F000',

  // Figma "Linear 2" — ring/border on glossy panels.
  strokeLinear2: {
    angle: 151,
    stops: [
      { color: 'rgba(112,112,112,1)', offset: 0 },
      { color: 'rgba(112,112,112,0)', offset: 0.36 },
      { color: 'rgba(191,191,191,0.12)', offset: 0.71 },
      { color: 'rgba(191,191,191,1)', offset: 1 },
    ],
  },

  // Figma "Linear BG3" — solid 31→112 gradient used on search bars, name plates.
  linearBG3: {
    angle: 146,
    stops: [
      { color: 'rgba(31,31,31,1)', offset: 0.18 },
      { color: 'rgba(112,112,112,1)', offset: 1 },
    ],
  },

  // Figma "Linear BG4" — Linear BG3 at 0.7 alpha, used on segmented stroke.
  linearBG4: {
    angle: 146,
    stops: [
      { color: 'rgba(31,31,31,0.7)', offset: 0.18 },
      { color: 'rgba(112,112,112,0.7)', offset: 1 },
    ],
  },

  glossInnerShadow: {
    color: 'rgba(204,204,204,1)',
    offsetX: 2,
    offsetY: 2,
    blur: 10,
  },
} as const

const stopsToCss = (stops: readonly { color: string; offset: number }[]) =>
  stops.map(s => `${s.color} ${(s.offset * 100).toFixed(2).replace(/\.00$/, '')}%`).join(', ')

export const cssGradient = (g: {
  angle: number
  stops: readonly { color: string; offset: number }[]
}) => `linear-gradient(${g.angle}deg, ${stopsToCss(g.stops)})`

export const Radii = {
  navPill: 43,
  navCircle: 31.5,
  card: 3,
  chip: 15,
  full: 9999,
} as const

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const Layout = {
  screenWidth: 375,
  screenHeight: 812,
  navPillWidth: 343,
  navPillHeight: 87,
  navPillTop: 674,
  navPillLeft: 16,
  navCircleSize: 63,
} as const
