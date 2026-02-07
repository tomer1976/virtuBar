import {
  CHAT_MAX_LENGTH,
  DESKTOP_TRANSFORM_RATE_LIMIT,
  DeviceType,
  MOBILE_TRANSFORM_RATE_LIMIT,
  RealtimeEventHandler,
  RealtimeProvider,
  RealtimeServerEventName,
} from './types';

export type RateLimitedOptions = {
  deviceType?: DeviceType;
  debug?: boolean;
};

type TimestampMs = number;

function nowMs(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

function detectDeviceType(): DeviceType {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

export class RateLimitedProvider implements RealtimeProvider {
  private readonly inner: RealtimeProvider;

  private readonly deviceType: DeviceType;

  private readonly debug: boolean;

  private readonly transformTimestamps: TimestampMs[] = [];

  constructor(inner: RealtimeProvider, options?: RateLimitedOptions) {
    this.inner = inner;
    this.deviceType = options?.deviceType ?? detectDeviceType();
    this.debug = Boolean(options?.debug);
  }

  async connect(): Promise<void> {
    return this.inner.connect();
  }

  async disconnect(): Promise<void> {
    return this.inner.disconnect();
  }

  async joinRoom(payload: Parameters<RealtimeProvider['joinRoom']>[0]): Promise<void> {
    return this.inner.joinRoom(payload);
  }

  async leaveRoom(roomId: string): Promise<void> {
    return this.inner.leaveRoom(roomId);
  }

  async sendTransform(payload: Parameters<RealtimeProvider['sendTransform']>[0]): Promise<void> {
    if (!this.allowTransform()) {
      if (this.debug) {
        const limit = this.deviceType === 'mobile' ? MOBILE_TRANSFORM_RATE_LIMIT : DESKTOP_TRANSFORM_RATE_LIMIT;
        console.debug('[realtime] transform dropped (rate limited)', { deviceType: this.deviceType, limit });
      }
      return;
    }
    this.transformTimestamps.push(nowMs());
    return this.inner.sendTransform(payload);
  }

  async sendChat(payload: Parameters<RealtimeProvider['sendChat']>[0]): Promise<void> {
    if (!payload.text || payload.text.length > CHAT_MAX_LENGTH) {
      if (this.debug) {
        console.debug('[realtime] chat dropped (length)', { length: payload.text?.length ?? 0, max: CHAT_MAX_LENGTH });
      }
      return;
    }
    return this.inner.sendChat(payload);
  }

  async sendEmote(payload: Parameters<RealtimeProvider['sendEmote']>[0]): Promise<void> {
    return this.inner.sendEmote(payload);
  }

  on<TName extends RealtimeServerEventName>(
    event: TName,
    handler: RealtimeEventHandler<TName>,
  ): () => void {
    return this.inner.on(event, handler);
  }

  private allowTransform(): boolean {
    const now = nowMs();
    const windowMs = 1000;
    const limit = this.deviceType === 'mobile' ? MOBILE_TRANSFORM_RATE_LIMIT : DESKTOP_TRANSFORM_RATE_LIMIT;
    while (this.transformTimestamps.length && now - this.transformTimestamps[0] > windowMs) {
      this.transformTimestamps.shift();
    }
    return this.transformTimestamps.length < limit;
  }
}

export function createRateLimitedProvider(
  inner: RealtimeProvider,
  options?: RateLimitedOptions,
): RealtimeProvider {
  return new RateLimitedProvider(inner, options);
}

export { detectDeviceType };
