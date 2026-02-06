import { tokens } from '../styles/tokens';

describe('design tokens', () => {
  it('exposes expected color palette', () => {
    expect(tokens.colors).toMatchObject({
      primary: '#2563eb',
      primaryStrong: '#1d4ed8',
      surface: '#f8fafc',
      surfaceElevated: '#ffffff',
      textPrimary: '#0f172a',
      textMuted: '#475569',
      border: '#cbd5e1',
    });
  });

  it('provides spacing scale and radii', () => {
    expect(tokens.spacing['2']).toBe('8px');
    expect(tokens.spacing['6']).toBe('24px');
    expect(tokens.radii.md).toBe('10px');
    expect(tokens.radii.lg).toBe('12px');
  });

  it('defines typography defaults', () => {
    expect(tokens.typography.fontFamily).toContain('Segoe UI');
    expect(tokens.typography.lineHeight).toBeCloseTo(1.5);
    expect(tokens.typography.sizes.title).toBe('1.5rem');
  });
});
