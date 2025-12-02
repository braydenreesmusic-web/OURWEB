//
//  dayscounter.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//


import React, { useState, useEffect } from 'react';
import { Heart, Calendar } from 'lucide-react';

export default function DaysCounter({ startDate }) {
  const [days, setDays] = useState(0);
  const [months, setMonths] = useState(0);
  const [years, setYears] = useState(0);

  useEffect(() => {
    if (!startDate) return;

    const calculateTime = () => {
      const start = new Date(startDate);
      const now = new Date();
      const diffTime = Math.abs(now - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const totalMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      
      setDays(diffDays);
      setMonths(totalMonths);
      setYears(Math.floor(totalMonths / 12));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);

    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white animate-heartbeat" />
          </div>
          <div>
            <h3 className="text-gray-800 font-bold">Together</h3>
            <p className="text-gray-400 text-sm">& counting...</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/50 rounded-xl p-3">
            <div className="text-2xl font-bold gradient-text">{years}</div>
            <div className="text-xs text-gray-500">Years</div>
          </div>
          <div className="bg-white/50 rounded-xl p-3">
            <div className="text-2xl font-bold gradient-text">{months % 12}</div>
            <div className="text-xs text-gray-500">Months</div>
          </div>
          <div className="bg-white/50 rounded-xl p-3">
            <div className="text-2xl font-bold gradient-text">{days}</div>
            <div className="text-xs text-gray-500">Days</div>
          </div>
        </div>

        {startDate && (
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>Since {new Date(startDate).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}</span>
          </div>
        )}
      </div>
    </div>
  );
}