import React from 'react';

const base = 'flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus:border-pink-300 disabled:cursor-not-allowed disabled:opacity-50';

export function Input({ className = '', ...props }) {
  return <input className={[base, className].join(' ').trim()} {...props} />;
}

export default Input;
