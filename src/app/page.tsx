'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MinesGame from '@/components/mines/MinesGame';
import GameHistory from '@/components/GameHistory';
import QuickStats from '@/components/QuickStats';
import GameHelp from '@/components/GameHelp';
import AuthModal from '@/components/auth/AuthModal';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to BetMines
            </h1>
            <p className="text-slate-300 text-lg mb-4">
              Test your luck in the classic Mines game. Reveal tiles to win, but avoid the mines!
            </p>
            <div className="flex justify-center">
              <GameHelp />
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-center">Get Started</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-slate-300">
                  Sign in or create an account to start playing and track your progress!
                </p>
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Sign In / Sign Up
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome back, {user.username}!
        </h1>
        <p className="text-slate-300 text-lg mb-4">
          Test your luck in the classic Mines game. Reveal tiles to win, but avoid the mines!
        </p>
        <div className="flex justify-center">
          <GameHelp />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <MinesGame />
        </div>
        <div className="xl:col-span-1 space-y-6">
          <QuickStats />
          <GameHistory />
        </div>
      </div>
    </div>
  );
}
