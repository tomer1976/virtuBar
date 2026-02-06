type SpacingScale = Record<'2' | '3' | '4' | '5' | '6', string>;

type TypographyScale = {
  fontFamily: string;
  lineHeight: number;
  sizes: {
    title: string;
    body: string;
  };
};

type Colors = {
  surface: string;
  surfaceElevated: string;
  border: string;
  nav: string;
  primary: string;
  primaryStrong: string;
  textPrimary: string;
  textMuted: string;
};

type Radii = {
  md: string;
  lg: string;
};

type Shadows = {
  sm: string;
};

export const tokens = {
  colors: {
    surface: '#f8fafc',
    surfaceElevated: '#ffffff',
    border: '#cbd5e1',
    nav: '#e2e8f0',
    primary: '#2563eb',
    primaryStrong: '#1d4ed8',
    textPrimary: '#0f172a',
    textMuted: '#475569',
  } satisfies Colors,
  spacing: {
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
  } satisfies SpacingScale,
  radii: {
    md: '10px',
    lg: '12px',
  } satisfies Radii,
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.04)',
  } satisfies Shadows,
  typography: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    lineHeight: 1.5,
    sizes: {
      title: '1.5rem',
      body: '1rem',
    },
  } satisfies TypographyScale,
} as const;

export type DesignTokens = typeof tokens;
