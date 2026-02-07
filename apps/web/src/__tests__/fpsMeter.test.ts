import { describe, expect, it } from 'vitest';
import { createFpsMeter } from '../three/fpsMeter';

describe('fpsMeter', () => {
  it('computes fps over a 1s window', () => {
    const meter = createFpsMeter(1000);
    let fps = Number.NaN;
    for (let i = 0; i < 61; i += 1) {
      fps = meter.tick(i * 16.4);
    }
    expect(fps).toBeCloseTo(61, 1);
  });

  it('evicts stale samples when window advances', () => {
    const meter = createFpsMeter(1000);
    meter.tick(0);
    meter.tick(50);
    const fpsAfterGap = meter.tick(2000);
    expect(Number.isNaN(fpsAfterGap)).toBe(true);
    const fpsAfterResume = meter.tick(2016);
    expect(fpsAfterResume).toBeCloseTo(62.5, 1);
  });
});
