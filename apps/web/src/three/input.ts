const forwardKeys = new Set(['w', 'arrowup']);
const backwardKeys = new Set(['s', 'arrowdown']);
const leftKeys = new Set(['a', 'arrowleft']);
const rightKeys = new Set(['d', 'arrowright']);

export function trackKeyPresses(
  pressed: Set<string>,
  target: Window | Document = window,
): { detach: () => void } {
  const normalizeKey = (key: string) => key.toLowerCase();
  const isEditableTarget = (t: EventTarget | null) => {
    if (!t || !(t as Element).closest) return false;
    const el = t as HTMLElement;
    const tag = el.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    return el.isContentEditable === true;
  };

  const handleKeyDown: EventListener = (event) => {
    const keyEvent = event as KeyboardEvent;
    if (keyEvent.defaultPrevented || typeof keyEvent.key !== 'string') return;
    const key = normalizeKey(keyEvent.key);
    if (isMoveKey(key)) {
      if (!isEditableTarget(keyEvent.target)) {
        keyEvent.preventDefault();
      }
      pressed.add(key);
    }
  };

  const handleKeyUp: EventListener = (event) => {
    const keyEvent = event as KeyboardEvent;
    if (typeof keyEvent.key !== 'string') return;
    const key = normalizeKey(keyEvent.key);
    if (isMoveKey(key)) {
      pressed.delete(key);
    }
  };

  target.addEventListener('keydown', handleKeyDown, { passive: false });
  target.addEventListener('keyup', handleKeyUp, { passive: false });

  return {
    detach: () => {
      target.removeEventListener('keydown', handleKeyDown);
      target.removeEventListener('keyup', handleKeyUp);
    },
  };
}

export function computeMoveVector(pressed: Set<string>): { x: number; z: number } {
  let x = 0;
  let z = 0;

  for (const key of pressed) {
    const lowered = key.toLowerCase();
    if (forwardKeys.has(lowered)) z -= 1;
    if (backwardKeys.has(lowered)) z += 1;
    if (leftKeys.has(lowered)) x -= 1;
    if (rightKeys.has(lowered)) x += 1;
  }

  const length = Math.hypot(x, z) || 1;
  return { x: x / length, z: z / length };
}

function isMoveKey(key: string): boolean {
  const lowered = key.toLowerCase();
  return forwardKeys.has(lowered) || backwardKeys.has(lowered) || leftKeys.has(lowered) || rightKeys.has(lowered);
}
