import { describe, expect, it } from 'vitest';
import { computeMoveVector, trackKeyPresses } from '../three/input';

describe('input helpers', () => {
  it('normalizes diagonal movement', () => {
    const pressed = new Set<string>(['w', 'd']);
    const vec = computeMoveVector(pressed);
    expect(Math.hypot(vec.x, vec.z)).toBeCloseTo(1);
    expect(vec.x).toBeGreaterThan(0);
    expect(vec.z).toBeLessThan(0);
  });

  it('adds and removes keys from the store', () => {
    const pressed = new Set<string>();
    const { detach } = trackKeyPresses(pressed, window);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'W' }));
    expect(pressed.has('w')).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'W' }));
    expect(pressed.has('w')).toBe(false);

    detach();
  });

  it('prevents scrolling on arrow movement keys', () => {
    const pressed = new Set<string>();
    const { detach } = trackKeyPresses(pressed, window);

    const evt = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
    window.dispatchEvent(evt);

    expect(evt.defaultPrevented).toBe(true);
    expect(pressed.has('arrowdown')).toBe(true);

    detach();
  });
});
