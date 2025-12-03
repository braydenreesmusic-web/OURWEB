import React from 'react';

export default function AppShell({ header, children }) {
  return (
    <div className="container mx-auto max-w-2xl px-4 pb-24" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}>
      <div className="pt-4 pb-6">
        {header}
      </div>
      {children}
    </div>
  );
}
