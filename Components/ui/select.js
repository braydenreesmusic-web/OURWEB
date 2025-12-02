import React from 'react';

export function Select({ children, value, onChange, ...props }) {
  return (
    <select value={value} onChange={onChange} {...props}>
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

export function SelectTrigger(props) {
  return <div {...props} />;
}

export function SelectValue({ children }) {
  return <span>{children}</span>;
}

export default Select;
