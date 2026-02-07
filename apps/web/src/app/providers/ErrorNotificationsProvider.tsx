import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Toast from '../../ui/components/Toast';

type ErrorNote = { id: number; message: string };

type ErrorNotificationsContextValue = {
  notifyError: (message: string) => void;
};

const ErrorNotificationsContext = createContext<ErrorNotificationsContextValue | undefined>(undefined);

export function ErrorNotificationsProvider({ children }: PropsWithChildren) {
  const [notes, setNotes] = useState<ErrorNote[]>([]);

  const dismiss = useCallback((id: number) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const notifyError = useCallback((message: string) => {
    setNotes((prev) => {
      const next = [...prev, { id: Date.now() + Math.floor(Math.random() * 1000), message }];
      return next.slice(-3);
    });
  }, []);

  useEffect(() => {
    if (!notes.length) return;
    const timers = notes.map((note) => window.setTimeout(() => dismiss(note.id), 6000));
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [dismiss, notes]);

  const value = useMemo<ErrorNotificationsContextValue>(() => ({ notifyError }), [notifyError]);

  return (
    <ErrorNotificationsContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="assertive">
        {notes.map((note) => (
          <div key={note.id} className="toast-card">
            <Toast tone="danger">{note.message}</Toast>
            <button type="button" className="btn btn-ghost" onClick={() => dismiss(note.id)}>
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </ErrorNotificationsContext.Provider>
  );
}

export function useErrorNotifications(): ErrorNotificationsContextValue {
  const ctx = useContext(ErrorNotificationsContext);
  if (!ctx) {
    throw new Error('useErrorNotifications must be used within ErrorNotificationsProvider');
  }
  return ctx;
}
