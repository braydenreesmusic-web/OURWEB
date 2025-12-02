import React from 'react';

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return <div className="dialog-root">{children}</div>;
}

export function DialogContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function DialogHeader({ children }) {
  return <div className="dialog-header">{children}</div>;
}

export function DialogTitle({ children, className = '' }) {
  return <h3 className={className}>{children}</h3>;
}

export default Dialog;
