function OnboardingPage() {
  return (
    <section className="page-card">
      <h2 className="page-title">Onboarding</h2>
      <p className="page-subtitle">Collect display name, avatar preset, and interests (mocked).</p>
      <div className="route-grid">
        <div className="route-chip">Step 1: Display name</div>
        <div className="route-chip">Step 2: Avatar preset</div>
        <div className="route-chip">Step 3: Interest tags</div>
        <div className="route-chip">Step 4: Audio device check (mock)</div>
      </div>
    </section>
  );
}

export default OnboardingPage;
