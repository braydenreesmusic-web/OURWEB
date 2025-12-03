import React, { useEffect } from 'react';

export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (e) => {
        if (e.key === 'Escape') onOpenChange?.(false);
      };
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => onOpenChange?.(false)} />
      {children}
    </div>
  );
}

export function DialogContent({ children, className = '' }) {
  const base = 'relative z-50 max-w-sm w-[92%] sm:w-full rounded-2xl bg-white/85 backdrop-blur border border-white/50 shadow-xl p-4 animate-in fade-in zoom-in-95 duration-150';
  return <div role="dialog" aria-modal="true" className={[base, className].join(' ').trim()}>{children}</div>;
}

export function DialogHeader({ children }) {
  return <div className="mb-2">{children}</div>;
}

export function DialogTitle({ children, className = '' }) {
  const base = 'text-lg font-semibold tracking-tight';
  return <h3 className={[base, className].join(' ').trim()}>{children}</h3>;
}

export default Dialog;
