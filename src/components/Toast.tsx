import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info, AlertCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// ─── Global store (singleton) ─────────────────────────────────────────────────

let _listeners: Array<(toast: Toast) => void> = [];

function emit(toast: Toast) {
  _listeners.forEach(fn => fn(toast));
}

export const toast = {
  success: (message: string) => emit({ id: Date.now().toString(), message, type: 'success' }),
  error: (message: string) => emit({ id: Date.now().toString(), message, type: 'error' }),
  info: (message: string) => emit({ id: Date.now().toString(), message, type: 'info' }),
};

// ─── ToastContainer ───────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <Check size={14} />,
  error: <AlertCircle size={14} />,
  info: <Info size={14} />,
};

const COLORS: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: { bg: '#0a1a12', icon: '#10b981', border: '#10b98140' },
  error:   { bg: '#1a0a0a', icon: '#ef4444', border: '#ef444440' },
  info:    { bg: '#0a0f1a', icon: '#3b82f6', border: '#3b82f640' },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    clearTimeout(timers.current[id]);
  }, []);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts(prev => [...prev.slice(-4), toast]); // max 5 visible
      timers.current[toast.id] = setTimeout(() => dismiss(toast.id), 3200);
    };
    _listeners.push(handler);
    return () => {
      _listeners = _listeners.filter(fn => fn !== handler);
    };
  }, [dismiss]);

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none"
      style={{ width: 'min(360px, calc(100vw - 32px))' }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(t => {
          const col = COLORS[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, y: -10 }}
              transition={{ type: 'spring', damping: 28, stiffness: 400 }}
              className="pointer-events-auto w-full flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
              style={{
                backgroundColor: col.bg,
                border: `1px solid ${col.border}`,
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: col.icon + '22', color: col.icon }}
              >
                {ICONS[t.type]}
              </div>
              <span className="flex-1 text-sm font-medium text-white">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 opacity-40 hover:opacity-70 transition-opacity"
                style={{ color: '#ffffff' }}
              >
                <X size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
