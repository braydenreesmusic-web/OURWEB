import React from 'react';

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={() => onOpenChange?.(false)} />
      {children}
    </div>
  );
}

export function DialogContent({ children, className = '' }) {
  const base = 'relative z-50 max-w-sm w-[92%] sm:w-full rounded-2xl bg-white/80 backdrop-blur border border-white/40 shadow-xl p-4';
  return <div className={[base, className].join(' ').trim()}>{children}</div>;
}

export function DialogHeader({ children }) {
  return <div className="mb-2">{children}</div>;
}

export function DialogTitle({ children, className = '' }) {
  const base = 'text-lg font-semibold tracking-tight';
  return <h3 className={[base, className].join(' ').trim()}>{children}</h3>;
}

export default Dialog;
