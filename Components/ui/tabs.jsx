import React, { useState } from 'react';

export function Tabs({ defaultValue, children, className }) {
  return <div className={className}>{children}</div>;
}

export function TabsList({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ value, children, className, onClick }) {
  return (
    <button onClick={onClick} className={className} data-value={value}>
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  return <div className={className}>{children}</div>;
}

export default Tabs;
