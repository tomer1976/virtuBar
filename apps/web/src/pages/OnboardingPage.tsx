import { useEffect, useMemo, useState } from 'react';
import { useProfile } from '../app/providers/ProfileProvider';
import { Button, Input } from '../ui/components';

const avatarPresets = ['aurora', 'midnight', 'neon', 'sunset'];
const interestOptions = ['Music', 'Karaoke', 'VR', 'Cocktails', 'Live DJ', 'Chill'];
const MIN_INTERESTS = 5;
type AudioPermissionState = 'idle' | 'prompting' | 'granted' | 'denied';

function OnboardingPage() {
  const { profile, updateProfile } = useProfile();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [ageConfirmed, setAgeConfirmed] = useState(profile.ageConfirmed);
  const [avatarPreset, setAvatarPreset] = useState(profile.avatarPreset);
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const [audioPermission, setAudioPermission] = useState<AudioPermissionState>(
    profile.audioPermission ?? 'idle',
  );
  const [audioReady, setAudioReady] = useState(profile.audioReady);

  useEffect(() => {
    setDisplayName(profile.displayName);
    setAgeConfirmed(profile.ageConfirmed);
    setAvatarPreset(profile.avatarPreset);
    setInterests(profile.interests);
    setAudioPermission(profile.audioPermission ?? 'idle');
    setAudioReady(profile.audioReady);
  }, [profile]);

  const stepLabels = useMemo(
    () => ['Identity & age', 'Avatar preset', 'Interests', 'Audio setup'],
    [],
  );

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, stepLabels.length));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  function handleSaveIdentity() {
    updateProfile({ displayName: displayName.trim(), ageConfirmed });
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

  function handleRequestPermission() {
    setAudioPermission('prompting');
    updateProfile({ audioPermission: 'prompting' });
  }

  function handlePermissionChoice(choice: AudioPermissionState) {
    setAudioPermission(choice);
    updateProfile({ audioPermission: choice, audioReady: choice === 'granted' ? audioReady : false });
    if (choice !== 'granted') {
      setAudioReady(false);
    }
  }

  function handleAudioReady() {
    if (audioPermission !== 'granted') return;
    setAudioReady(true);
    updateProfile({ audioReady: true, audioPermission: 'granted' });
  }

  const summary = useMemo(
    () => (
      <div className="route-grid" style={{ marginTop: '16px' }}>
        <div className="route-chip">Name: {displayName}</div>
        <div className="route-chip">Age gate: {ageConfirmed ? 'Confirmed' : 'Pending'}</div>
        <div className="route-chip">Avatar: {avatarPreset}</div>
        <div className="route-chip">Interests: {interests.join(', ') || 'None'}</div>
        <div className="route-chip">Audio permission: {audioPermission}</div>
        <div className="route-chip">Audio check: {audioReady ? 'Ready' : 'Pending'}</div>
      </div>
    ),
    [ageConfirmed, audioPermission, audioReady, avatarPreset, displayName, interests],
  );

  const interestsMissing = Math.max(0, MIN_INTERESTS - interests.length);

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
        <div style={{ marginTop: '20px', maxWidth: '420px', display: 'grid', gap: '12px' }}>
          <label htmlFor="display-name" style={{ display: 'block' }}>
            <span style={{ display: 'block', marginBottom: '8px' }}>Display name</span>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your bar name"
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              aria-label="Confirm legal age"
            />
            <span>I confirm I am of legal age to enter VirtuBar.</span>
          </label>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
            Age gate is a mock check for demo purposes.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button
              onClick={handleSaveIdentity}
              disabled={!displayName.trim() || !ageConfirmed}
              type="button"
            >
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
          <p style={{ margin: 0 }}>Select interests (pick at least {MIN_INTERESTS}):</p>
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
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
            {interestsMissing > 0
              ? `${interestsMissing} more ${interestsMissing === 1 ? 'tag' : 'tags'} needed to continue.`
              : 'Great, minimum interests selected.'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="ghost" onClick={prevStep} type="button">
              Back
            </Button>
            <Button onClick={nextStep} type="button" disabled={interests.length < MIN_INTERESTS}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
          <p style={{ margin: 0 }}>Audio device check (mock):</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button onClick={handleRequestPermission} type="button" disabled={audioPermission === 'granted'}>
              {audioPermission === 'idle' ? 'Request mic access (mock)' : 'Re-request mic access'}
            </Button>
            <Button
              variant="primary"
              onClick={() => handlePermissionChoice('granted')}
              type="button"
              disabled={audioPermission === 'granted'}
            >
              Allow (mock)
            </Button>
            <Button
              variant="ghost"
              onClick={() => handlePermissionChoice('denied')}
              type="button"
            >
              Deny (mock)
            </Button>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button
              onClick={handleAudioReady}
              type="button"
              disabled={audioReady || audioPermission !== 'granted'}
            >
              {audioReady ? 'Audio Ready' : 'Mark Audio Ready'}
            </Button>
            <Button variant="ghost" onClick={prevStep} type="button">
              Back
            </Button>
          </div>
          <div className="route-chip" aria-live="polite">
            {audioPermission === 'idle' && 'Mic permission not requested yet.'}
            {audioPermission === 'prompting' && 'Prompting for microphone access (mock).'}
            {audioPermission === 'granted' && 'Permission granted (mock).'}
            {audioPermission === 'denied' && 'Permission denied (mock); try again or proceed without audio.'}
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
