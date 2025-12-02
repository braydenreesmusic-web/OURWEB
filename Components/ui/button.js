import React from 'react';

export function Button({ children, className = '', variant, size, ...props }) {
  const cls = className;
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}

export default Button;
