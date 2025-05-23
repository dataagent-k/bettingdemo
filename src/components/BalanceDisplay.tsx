'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/auth/AuthModal';

export default function BalanceDisplay() {
  const { user, signOut, resetBalance } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!user) {
    return (
      <>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowAuthModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Sign In
          </Button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-white">
        <span className="text-sm text-slate-300">Welcome, {user.username}!</span>
      </div>
      <div className="text-white">
        <span className="text-sm text-slate-300">Balance:</span>
        <span className="ml-2 font-bold text-green-400">
          ${user.balance.toFixed(2)}
        </span>
      </div>
      {user.balance < 10 && (
        <Button
          onClick={resetBalance}
          size="sm"
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Reset Balance
        </Button>
      )}
      <Button
        onClick={signOut}
        size="sm"
        variant="outline"
        className="border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        Sign Out
      </Button>
    </div>
  );
}
