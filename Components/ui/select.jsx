import React from 'react';

export function Select({ children, value, onChange, className = '', ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus:border-pink-300 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function SelectContent({ children }) {
  return <div className="select-content">{children}</div>;
}

export function SelectItem({ children, value }) {
  return <option value={value}>{children}</option>;
}

export function SelectTrigger({ className = '', ...props }) {
  return <div className={`h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm ${className}`} {...props} />;
}

export function SelectValue({ children }) {
  return <span>{children}</span>;
}

export default Select;
