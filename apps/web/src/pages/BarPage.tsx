import { useParams } from 'react-router-dom';

function BarPage() {
  const { roomId } = useParams();

  return (
    <section className="page-card">
      <h2 className="page-title">Enter Bar</h2>
      <p className="page-subtitle">Room experience placeholder (mock realtime + voice).</p>
      <div className="route-grid">
        <div className="route-chip">Room ID: {roomId ?? 'unknown'}</div>
        <div className="route-chip">Stage for future 3D scene</div>
        <div className="route-chip">Voice toggle (mock)</div>
      </div>
    </section>
  );
}

export default BarPage;
