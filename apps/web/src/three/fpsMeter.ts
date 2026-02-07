export function createFpsMeter(windowMs = 1000) {
  const samples: number[] = [];

  return {
    tick(now = performance.now()) {
      samples.push(now);
      while (samples.length && samples[0] < now - windowMs) {
        samples.shift();
      }
      if (samples.length < 2) return Number.NaN;
      const span = samples[samples.length - 1] - samples[0];
      if (span <= 0) return Number.NaN;
      const frames = samples.length - 1;
      return (frames * 1000) / span;
    },
  };
}
