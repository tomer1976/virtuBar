import { useState } from 'react';
import {
  AvatarBadge,
  Button,
  Drawer,
  Input,
  Modal,
  TagChip,
  Toast,
} from '../ui/components';

function UiKitPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [chipRemoved, setChipRemoved] = useState(false);

  return (
    <section className="page-card">
      <h2 className="page-title">UI Kit</h2>
      <p className="page-subtitle">Design tokens applied across core components.</p>

      <div className="route-grid" aria-label="Buttons">
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Button variant="ghost" onClick={() => setDrawerOpen(true)}>
          Open Drawer
        </Button>
      </div>

      <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
        <label style={{ display: 'block' }} htmlFor="demo-input">
          <span style={{ display: 'block', marginBottom: '8px' }}>Input</span>
          <Input id="demo-input" placeholder="Enter text" />
        </label>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Toast tone="info">Informational toast</Toast>
          <Toast tone="success">Success toast</Toast>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <AvatarBadge name="Ada Lovelace" subtitle="VIP" />
          {!chipRemoved && <TagChip label="House" onRemove={() => setChipRemoved(true)} />}
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
        Modal content placeholder using mocked data.
      </Modal>

      <Drawer open={isDrawerOpen} onClose={() => setDrawerOpen(false)} title="Example Drawer">
        Drawer content placeholder using mocked data.
      </Drawer>
    </section>
  );
}

export default UiKitPage;
