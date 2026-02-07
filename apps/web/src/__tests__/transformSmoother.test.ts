import { describe, expect, it } from 'vitest';
import { TransformSmoother } from '../net/realtime/transformSmoother';

const baseSample = {
  userId: 'user-a',
  seq: 1,
  x: 0,
  y: 0,
  z: 0,
  rotY: 0,
  anim: 'idle' as const,
  speaking: false,
};

describe('TransformSmoother', () => {
  it('interpolates between samples within the buffer window', () => {
    const smoother = new TransformSmoother({ bufferMs: 50, snapDistance: 100 });
    smoother.ingestSample({ ...baseSample, ts: 0 });
    smoother.ingestSample({ ...baseSample, seq: 2, x: 10, z: 10, rotY: Math.PI / 2, ts: 100 });

    const smoothed = smoother.getSmoothed(120);
    expect(smoothed).not.toBeNull();
    expect(smoothed?.x).toBeCloseTo(7);
    expect(smoothed?.z).toBeCloseTo(7);
    expect(smoothed?.rotY).toBeCloseTo(Math.PI * 0.35);
  });

  it('snaps when distance exceeds threshold', () => {
    const smoother = new TransformSmoother({ bufferMs: 0, snapDistance: 1 });
    smoother.ingestSample({ ...baseSample, ts: 0 });
    smoother.ingestSample({ ...baseSample, seq: 2, x: 5, z: 0, ts: 100 });

    const smoothed = smoother.getSmoothed(50);
    expect(smoothed?.x).toBe(5);
    expect(smoothed?.z).toBe(0);
  });

  it('handles rotation wrap with the shortest path', () => {
    const smoother = new TransformSmoother({ bufferMs: 0, snapDistance: 100, snapRotation: Math.PI });
    smoother.ingestSample({ ...baseSample, rotY: Math.PI - 0.1, ts: 0 });
    smoother.ingestSample({ ...baseSample, seq: 2, rotY: -Math.PI + 0.1, ts: 100 });

    const smoothed = smoother.getSmoothed(50);
    expect(smoothed?.rotY).toBeCloseTo(Math.PI, 3);
  });

  it('drops older or duplicate seq samples', () => {
    const smoother = new TransformSmoother({ bufferMs: 0 });
    smoother.ingestSample({ ...baseSample, seq: 2, x: 2, ts: 50 });
    smoother.ingestSample({ ...baseSample, seq: 1, x: 99, ts: 60 });

    const smoothed = smoother.getSmoothed(70);
    expect(smoothed?.x).toBe(2);
  });

  it('produces smooth, monotonic motion at normal update rates', () => {
    const smoother = new TransformSmoother({ bufferMs: 100, snapDistance: 10 });
    smoother.ingestSample({ ...baseSample, seq: 1, x: 0, ts: 0 });
    smoother.ingestSample({ ...baseSample, seq: 2, x: 1, ts: 50 });
    smoother.ingestSample({ ...baseSample, seq: 3, x: 2, ts: 100 });
    smoother.ingestSample({ ...baseSample, seq: 4, x: 3, ts: 150 });

    const smoothedEarly = smoother.getSmoothed(200); // target time 100
    const smoothedLater = smoother.getSmoothed(220); // target time 120

    expect(smoothedEarly?.x).toBeCloseTo(2, 2);
    expect(smoothedLater?.x).toBeGreaterThan(smoothedEarly?.x ?? 0);
    expect(smoothedLater?.x).toBeLessThanOrEqual(3);
  });
});
