import { useEffect, useMemo, useState } from 'react';
import { useProfile } from '../app/providers/ProfileProvider';
import { Button, Input } from '../ui/components';

const avatarPresets = ['aurora', 'midnight', 'neon', 'sunset'];
const interestOptions = ['Music', 'Karaoke', 'VR', 'Cocktails', 'Live DJ', 'Chill'];

function OnboardingPage() {
  const { profile, updateProfile } = useProfile();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatarPreset, setAvatarPreset] = useState(profile.avatarPreset);
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const [audioReady, setAudioReady] = useState(profile.audioReady);

  useEffect(() => {
    setDisplayName(profile.displayName);
    setAvatarPreset(profile.avatarPreset);
    setInterests(profile.interests);
    setAudioReady(profile.audioReady);
  }, [profile]);

  const stepLabels = useMemo(
    () => ['Display name', 'Avatar preset', 'Interests', 'Audio setup'],
    [],
  );

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, stepLabels.length));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  function handleSaveDisplayName() {
    updateProfile({ displayName });
    nextStep();
  }

  function handleSelectAvatar(preset: string) {
    setAvatarPreset(preset);
    updateProfile({ avatarPreset: preset });
  }

  function handleToggleInterest(label: string) {
    const exists = interests.includes(label);
    const next = exists ? interests.filter((i) => i !== label) : [...interests, label];
    setInterests(next);
    updateProfile({ interests: next });
  }

  function handleAudioReady() {
    setAudioReady(true);
    updateProfile({ audioReady: true });
    nextStep();
  }

  const summary = useMemo(
    () => (
      <div className="route-grid" style={{ marginTop: '16px' }}>
        <div className="route-chip">Name: {displayName}</div>
        <div className="route-chip">Avatar: {avatarPreset}</div>
        <div className="route-chip">Interests: {interests.join(', ') || 'None'}</div>
        <div className="route-chip">Audio check: {audioReady ? 'Ready' : 'Pending'}</div>
      </div>
    ),
    [audioReady, avatarPreset, displayName, interests],
  );

  return (
    <section className="page-card">
      <h2 className="page-title">Onboarding</h2>
      <p className="page-subtitle">Mock wizard saves to local storage for continuity.</p>

      <div className="route-grid" aria-label="Steps">
        {stepLabels.map((label, idx) => {
          const current = idx + 1 === step;
          return (
            <div
              key={label}
              className="route-chip"
              style={{
                borderColor: current ? 'var(--color-primary)' : undefined,
                background: current ? 'rgba(37, 99, 235, 0.08)' : undefined,
              }}
            >
              Step {idx + 1}: {label}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div style={{ marginTop: '20px', maxWidth: '360px', display: 'grid', gap: '12px' }}>
          <label htmlFor="display-name" style={{ display: 'block' }}>
            <span style={{ display: 'block', marginBottom: '8px' }}>Display name</span>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your bar name"
            />
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button onClick={handleSaveDisplayName} disabled={!displayName.trim()}>
              Save & Continue
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
          <p style={{ margin: 0 }}>Pick an avatar preset:</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {avatarPresets.map((preset) => {
              const active = avatarPreset === preset;
              return (
                <Button
                  key={preset}
                  variant={active ? 'primary' : 'ghost'}
                  onClick={() => handleSelectAvatar(preset)}
                  aria-pressed={active}
                  type="button"
                >
                  {preset}
                </Button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="ghost" onClick={prevStep} type="button">
              Back
            </Button>
            <Button onClick={nextStep} type="button">
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
          <p style={{ margin: 0 }}>Select interests:</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {interestOptions.map((interest) => {
              const active = interests.includes(interest);
              return (
                <Button
                  key={interest}
                  variant={active ? 'primary' : 'ghost'}
                  type="button"
                  onClick={() => handleToggleInterest(interest)}
                  aria-pressed={active}
                >
                  {interest}
                </Button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="ghost" onClick={prevStep} type="button">
              Back
            </Button>
            <Button onClick={nextStep} type="button">
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
          <p style={{ margin: 0 }}>Audio device check (mock):</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button onClick={handleAudioReady} type="button" disabled={audioReady}>
              {audioReady ? 'Audio Ready' : 'Mark Audio Ready'}
            </Button>
            <Button variant="ghost" onClick={prevStep} type="button">
              Back
            </Button>
          </div>
          <div className="route-chip" aria-live="polite">
            {audioReady ? 'Audio check saved (mock)' : 'Audio not checked yet'}
          </div>
          {summary}
        </div>
      )}

      {step === stepLabels.length && summary}
    </section>
  );
}

export default OnboardingPage;
