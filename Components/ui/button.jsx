import React from 'react';

const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none';
const sizes = {
  default: 'h-11 px-4 text-sm',
  sm: 'h-9 px-3 text-sm',
  lg: 'h-12 px-5 text-base',
  icon: 'h-9 w-9',
};
const variants = {
  default: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
};

export function Button({ children, className = '', variant = 'default', size = 'default', ...props }) {
  const cls = [base, sizes[size] || sizes.default, variants[variant] || variants.default, className].join(' ').trim();
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}

export default Button;
