import React from 'react';

export default function AppShell({ header, children }) {
  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="w-full max-w-4xl px-4 pb-24" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}>
        <div className="pt-4 pb-6">
          {header}
        </div>
        {children}
      </div>
    </div>
  );
}
