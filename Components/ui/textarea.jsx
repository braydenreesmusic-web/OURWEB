import React from 'react';

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl min-h-[80px] border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus:border-pink-300 ${className}`}
      {...props}
    />
  );
}

export default Textarea;
