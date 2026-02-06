import { render, screen } from '@testing-library/react';
import {
  defaultFeatureFlags,
  FeatureFlagsProvider,
  resolveFeatureFlags,
  useFeatureFlags,
} from '../app/providers/FeatureFlagsProvider';

describe('resolveFeatureFlags', () => {
  it('defaults all flags to true when env is missing', () => {
    const flags = resolveFeatureFlags({});
    expect(flags).toEqual(defaultFeatureFlags);
  });

  it('parses string and boolean values from env', () => {
    const flags = resolveFeatureFlags({
      VITE_USE_MOCK_AUTH: 'false',
      VITE_USE_MOCK_PROFILE: '0',
      VITE_USE_MOCK_ROOMS: true,
      VITE_USE_MOCK_REALTIME: 'yes',
      VITE_USE_MOCK_VOICE: '1',
    });

    expect(flags.USE_MOCK_AUTH).toBe(false);
    expect(flags.USE_MOCK_PROFILE).toBe(false);
    expect(flags.USE_MOCK_ROOMS).toBe(true);
    expect(flags.USE_MOCK_REALTIME).toBe(true);
    expect(flags.USE_MOCK_VOICE).toBe(true);
  });
});

describe('FeatureFlagsProvider', () => {
  function Consumer() {
    const flags = useFeatureFlags();
    return <div>auth:{flags.USE_MOCK_AUTH ? 'on' : 'off'}</div>;
  }

  it('provides feature flags to descendants', () => {
    render(
      <FeatureFlagsProvider>
        <Consumer />
      </FeatureFlagsProvider>,
    );

    expect(screen.getByText(/auth:on/)).toBeInTheDocument();
  });
});
