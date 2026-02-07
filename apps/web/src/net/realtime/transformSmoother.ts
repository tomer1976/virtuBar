import { AvatarTransformBroadcastPayload, RealtimeEnvelope } from './types';

type TransformSample = AvatarTransformBroadcastPayload & { ts: number };

type TransformSmootherOptions = {
  bufferMs?: number;
  snapDistance?: number;
  snapRotation?: number;
  maxSamples?: number;
  pruneMs?: number;
};

const defaultOptions: Required<TransformSmootherOptions> = {
  bufferMs: 150,
  snapDistance: 1.5,
  snapRotation: Math.PI / 2,
  maxSamples: 12,
  pruneMs: 3000,
};

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function distance(a: TransformSample, b: TransformSample): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function angleDelta(a: number, b: number): number {
  return Math.abs(Math.atan2(Math.sin(b - a), Math.cos(b - a)));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpAngle(a: number, b: number, t: number): number {
  const delta = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + delta * t;
}

function isEnvelope(
  value: unknown,
): value is RealtimeEnvelope<'avatar_transform_broadcast', AvatarTransformBroadcastPayload> {
  if (!value || typeof value !== 'object') return false;
  return 'payload' in value && 'ts' in value;
}

export class TransformSmoother {
  private readonly options: Required<TransformSmootherOptions>;

  private readonly samples: TransformSample[] = [];

  constructor(options?: TransformSmootherOptions) {
    this.options = { ...defaultOptions, ...options };
  }

  ingest(
    input: TransformSample | RealtimeEnvelope<'avatar_transform_broadcast', AvatarTransformBroadcastPayload>,
    receivedAt: number = nowMs(),
  ): void {
    if (isEnvelope(input)) {
      this.ingestSample({ ...input.payload, ts: input.ts });
      return;
    }
    const ts = Number.isFinite(input.ts) ? input.ts : receivedAt;
    this.ingestSample({ ...input, ts });
  }

  ingestSample(sample: TransformSample): void {
    if (!Number.isFinite(sample.ts)) {
      return;
    }
    const next: TransformSample = { ...sample };
    const last = this.samples[this.samples.length - 1];
    if (last && next.seq <= last.seq) {
      return;
    }
    this.samples.push(next);
    this.prune(next.ts);
  }

  getSmoothed(now: number = nowMs()): TransformSample | null {
    if (!this.samples.length) return null;

    const targetTime = now - this.options.bufferMs;
    if (this.samples.length === 1 || targetTime <= this.samples[0].ts) {
      return this.samples[0];
    }

    for (let i = 1; i < this.samples.length; i += 1) {
      const prev = this.samples[i - 1];
      const next = this.samples[i];
      if (targetTime > next.ts) continue;

      const dt = Math.max(next.ts - prev.ts, 1);
      const t = Math.min(Math.max((targetTime - prev.ts) / dt, 0), 1);

      if (distance(prev, next) > this.options.snapDistance || angleDelta(prev.rotY, next.rotY) > this.options.snapRotation) {
        return next;
      }

      return {
        ...next,
        x: lerp(prev.x, next.x, t),
        y: lerp(prev.y, next.y, t),
        z: lerp(prev.z, next.z, t),
        rotY: lerpAngle(prev.rotY, next.rotY, t),
        anim: t < 0.5 ? prev.anim : next.anim,
        speaking: t < 0.5 ? prev.speaking : next.speaking,
        ts: targetTime,
      };
    }

    return this.samples[this.samples.length - 1];
  }

  clear(): void {
    this.samples.splice(0, this.samples.length);
  }

  private prune(latestTs: number): void {
    while (this.samples.length > this.options.maxSamples) {
      this.samples.shift();
    }
    const cutoff = latestTs - this.options.pruneMs;
    if (cutoff <= 0) return;
    while (this.samples.length && this.samples[0].ts < cutoff) {
      this.samples.shift();
    }
  }
}

export type { TransformSample };
