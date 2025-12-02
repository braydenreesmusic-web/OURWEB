//
//  savingsgoal.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PiggyBank, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function SavingsGoal({ current, goal, onUpdate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [amount, setAmount] = useState('');
  
  const percentage = Math.min((current / goal) * 100, 100);
  const remaining = goal - current;

  const handleAdd = () => {
    const newAmount = current + parseFloat(amount || 0);
    onUpdate(newAmount);
    setAmount('');
    setShowDialog(false);
  };

  const quickAmounts = [50, 100, 250, 500];

  return (
    <>
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-800 font-bold">Savings Goal</h3>
              <p className="text-gray-400 text-sm">${remaining.toLocaleString()} to go</p>
            </div>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            size="icon"
            className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 w-9 h-9"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="text-gray-700 font-medium">{percentage.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full smooth-transition"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-emerald-600 font-bold">${current.toLocaleString()}</span>
            <span className="text-gray-400">${goal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="gradient-text">Add to Savings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              type="number"
              placeholder="Enter amount..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl h-12"
            />
            <div className="flex gap-2 flex-wrap">
              {quickAmounts.map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  onClick={() => setAmount(q.toString())}
                  className="rounded-full"
                >
                  +${q}
                </Button>
              ))}
            </div>
            <Button
              onClick={handleAdd}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl h-12"
            >
              Add ${amount || '0'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}