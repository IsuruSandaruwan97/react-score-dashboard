'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Users,
  Trophy,
  Clock,
  Eye,
  EyeOff,
  TableProperties,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

interface Player {
  id: string;
  ign: string;
}

export default function DashboardPage() {
  const { admin } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [resultsPublished, setResultsPublished] = useState(false);
  const [finalsEnabled, setFinalsEnabled] = useState(false);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    playersWithScores: 0,
    playersWithoutScores: 0,
  });

  const isMainAdmin = admin?.role === 'main';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [playersRes, scoresRes, settingsRes, totalCount] =
          await Promise.all([
            fetch('/api/data/players'),
            fetch('/api/data/scores'),
            fetch('/api/data/settings'),
            fetch(`/api/data/players?&total=true`),
          ]);

        const playersData = await playersRes.json();
        const scoresData = await scoresRes.json();
        const settingsData = await settingsRes.json();
        const totalPlayerCount = await totalCount.json();
        setPlayers(playersData.players);
        setResultsPublished(settingsData.resultsPublished);
        setFinalsEnabled(settingsData.finalsEnabled || false);

        const qualificationScores = scoresData.qualification || [];
        const playersWithScores = qualificationScores.length;
        const totalPlayers = totalPlayerCount?.total || 0;

        setStats({
          totalPlayers,
          playersWithScores,
          playersWithoutScores: totalPlayers - playersWithScores,
        });
      } catch (error) {
        console.error('[v0] Error loading dashboard data:', error);
      }
    };

    loadData();
  }, []);

  const handleToggleResults = async () => {
    try {
      const response = await fetch('/api/admin/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultsPublished: !resultsPublished }),
      });

      if (response.ok) {
        setResultsPublished(!resultsPublished);
      }
    } catch (error) {
      console.error('[v0] Error toggling results:', error);
    }
  };

  const handleToggleFinals = async () => {
    try {
      const response = await fetch('/api/admin/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalsEnabled: !finalsEnabled,
          qualificationLocked: !finalsEnabled, // Lock qualification when finals are enabled
        }),
      });

      if (response.ok) {
        setFinalsEnabled(!finalsEnabled);
      }
    } catch (error) {
      console.error('[v0] Error toggling finals:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Overview of competition progress and statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="bg-gradient-to-br from-purple-900/20 to-purple-950/20 border-purple-500/30 hover-lift animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Players
            </CardTitle>
            <Users className="w-5 h-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white animate-counter">
              {stats.totalPlayers}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Registered participants
            </p>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-br from-cyan-900/20 to-cyan-950/20 border-cyan-500/30 hover-lift animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Players Scored
            </CardTitle>
            <Trophy className="w-5 h-5 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white animate-counter">
              {stats.playersWithScores}
            </div>
            <p className="text-xs text-slate-400 mt-1">Have received scores</p>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-br from-pink-900/20 to-pink-950/20 border-pink-500/30 hover-lift animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Pending Scores
            </CardTitle>
            <Clock className="w-5 h-5 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white animate-counter">
              {stats.playersWithoutScores}
            </div>
            <p className="text-xs text-slate-400 mt-1">Awaiting score entry</p>
          </CardContent>
        </Card>
      </div>

      {isMainAdmin && (
        <>
          <Card
            className="bg-slate-900/50 border-purple-500/20 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <CardHeader>
              <CardTitle className="text-white">Finals Round Control</CardTitle>
              <CardDescription className="text-slate-400">
                Enable final rounds to lock qualification scores and start
                finals scoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-4">
                  {finalsEnabled ? (
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <Label
                      htmlFor="finals-toggle"
                      className="text-base font-medium text-white cursor-pointer"
                    >
                      {finalsEnabled ? 'Finals Enabled' : 'Finals Disabled'}
                    </Label>
                    <p className="text-sm text-slate-400 mt-1">
                      {finalsEnabled
                        ? 'Finals scoring active, qualification scores are locked'
                        : 'Only qualification round available for scoring'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="finals-toggle"
                  checked={finalsEnabled}
                  onCheckedChange={handleToggleFinals}
                  className="data-[state=checked]:bg-yellow-600"
                />
              </div>
              {finalsEnabled && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-200">
                    ⚠️ Qualification round scores are now locked and cannot be
                    modified. Only finals round scores can be entered.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className="bg-slate-900/50 border-purple-500/20 animate-slide-up"
            style={{ animationDelay: '0.5s' }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Results Visibility
              </CardTitle>
              <CardDescription className="text-slate-400">
                Control whether final results are visible on the public website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-4">
                  {resultsPublished ? (
                    <Eye className="w-5 h-5 text-green-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <Label
                      htmlFor="results-toggle"
                      className="text-base font-medium text-white cursor-pointer"
                    >
                      {resultsPublished
                        ? 'Results Published'
                        : 'Results Hidden'}
                    </Label>
                    <p className="text-sm text-slate-400 mt-1">
                      {resultsPublished
                        ? 'Public can view winners and rankings'
                        : "Public sees 'Results not published yet'"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="results-toggle"
                  checked={resultsPublished}
                  onCheckedChange={handleToggleResults}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card
        className="bg-slate-900/50 border-purple-500/20 animate-slide-up"
        style={{ animationDelay: '0.6s' }}
      >
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/score-entry">
              <Button className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-auto py-4">
                <TableProperties className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Score Entry</div>
                  <div className="text-xs opacity-90">
                    Enter scores for players
                  </div>
                </div>
              </Button>
            </Link>

            {isMainAdmin && (
              <>
                <Link href="/admin/judges">
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-slate-700 hover:bg-slate-800/50 text-white h-auto py-4 bg-transparent"
                  >
                    <Users className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">Manage Judges</div>
                      <div className="text-xs opacity-70">
                        Add or edit judges
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/criteria">
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-slate-700 hover:bg-slate-800/50 text-white h-auto py-4 bg-transparent"
                  >
                    <Trophy className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">Manage Criteria</div>
                      <div className="text-xs opacity-70">
                        Configure scoring criteria
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/admins">
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-slate-700 hover:bg-slate-800/50 text-white h-auto py-4 bg-transparent"
                  >
                    <Users className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">Manage Admins</div>
                      <div className="text-xs opacity-70">
                        Add or manage admin accounts
                      </div>
                    </div>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
