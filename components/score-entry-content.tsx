'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Save,
  Edit,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface Player {
  ign: string;
  id: string;
  username: string;
  minecraftUsername: string;
  discordUsername: string;
}

interface Judge {
  id: string;
  name: string;
  role: string;
}

interface Criterion {
  id: string;
  name: string;
  maxPoints: number;
  order: number;
}

interface JudgeScore {
  judgeId: string;
  scores: Record<string, number | null>;
}

interface PlayerScore {
  playerId: string;
  judgeScores: Map<string, JudgeScore>;
  isExpanded: boolean;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
}

export default function ScoreEntryContent() {
  const { admin } = useAuth();
  const [round, setRound] = useState<'qualification' | 'finals'>(
    'qualification'
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [playerScores, setPlayerScores] = useState<Map<string, PlayerScore>>(
    new Map()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [finalsEnabled, setFinalsEnabled] = useState(false);
  const [qualificationLocked, setQualificationLocked] = useState(false);
  const [sortBy, setSortBy] = useState<'Date' | 'Score'>('Date');
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const itemsPerPage = 10;

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          playersRes,
          judgesRes,
          criteriaRes,
          scoresRes,
          settingsRes,
          totalCount,
        ] = await Promise.all([
          fetch(
            `/api/data/players?round=${round}&sort=${sortBy}&page=${currentPage}&pageSize=${itemsPerPage}`
          ),
          fetch('/api/data/judges'),
          fetch(`/api/data/criteria?type=${round}`),
          fetch('/api/data/scores'),
          fetch('/api/data/settings'),
          fetch(`/api/data/players?round=${round}&total=true`),
        ]);

        const playersData = await playersRes.json();
        const judgesData = await judgesRes.json();
        const criteriaData = await criteriaRes.json();
        const scoresData = await scoresRes.json();
        const settingsData = await settingsRes.json();
        const totalPlayerCount = await totalCount.json();
        setTotalPlayers(totalPlayerCount?.total || 0);
        setPlayers(playersData.players);
        setJudges(judgesData.judges);
        setCriteria(
          criteriaData.criteria
            .filter((c: any) => c.active)
            .sort((a: any, b: any) => a.order - b.order)
        );
        setFinalsEnabled(settingsData.finalsEnabled || false);
        setQualificationLocked(settingsData.qualificationLocked || false);

        const scoresMap = new Map<string, PlayerScore>();
        const roundScores = scoresData[round] || [];

        playersData.players.forEach((player: Player) => {
          const playerData = roundScores.find(
            (ps: any) => ps.playerId === player.id
          );
          const judgeScoresMap = new Map<string, JudgeScore>();

          // Create score entry for each judge
          judgesData.judges.forEach((judge: Judge) => {
            const scores: Record<string, number | null> = {};

            criteriaData.criteria
              .filter((c: any) => c.active)
              .forEach((criterion: Criterion) => {
                scores[criterion.id] = null;
              });

            // Load existing scores if available
            if (playerData && playerData.scores[judge.id]) {
              Object.entries(playerData.scores[judge.id]).forEach(
                ([criterionId, score]) => {
                  scores[criterionId] = score as number;
                }
              );
            }

            judgeScoresMap.set(judge.id, {
              judgeId: judge.id,
              scores,
            });
          });

          scoresMap.set(player.id, {
            playerId: player.id,
            judgeScores: judgeScoresMap,
            isExpanded: false,
            isSaving: false,
            saveStatus: 'idle',
          });
        });

        setPlayerScores(scoresMap);
      } catch (error) {
        console.error('[v0] Error loading data:', error);
      }
    };

    loadData();
  }, [round, sortBy, currentPage, itemsPerPage]);

  const filteredPlayers = players.filter((player) =>
    searchQuery
      ? player.minecraftUsername
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        player.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.discordUsername
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true
  );

  // Pagination
  const totalPages = Math.ceil(totalPlayers / itemsPerPage);

  const toggleExpand = (playerId: string) => {
    const score = playerScores.get(playerId);
    if (score) {
      setPlayerScores(
        new Map(
          playerScores.set(playerId, {
            ...score,
            isExpanded: !score.isExpanded,
          })
        )
      );
    }
  };

  const handleCancel = (playerId: string) => {
    const score = playerScores.get(playerId);
    if (score) {
      setPlayerScores(
        new Map(playerScores.set(playerId, { ...score, isExpanded: false }))
      );
    }
  };

  const updateScore = (
    playerId: string,
    judgeId: string,
    criterionId: string,
    value: string
  ) => {
    const playerScore = playerScores.get(playerId);
    if (!playerScore) return;

    const judgeScore = playerScore.judgeScores.get(judgeId);
    if (!judgeScore) return;

    const numValue = value === '' ? null : Number(value);
    const criterion = criteria.find((c) => c.id === criterionId);

    if (numValue !== null && criterion) {
      if (numValue < 0 || numValue > criterion.maxPoints) {
        return;
      }
    }

    const updatedJudgeScore = {
      ...judgeScore,
      scores: { ...judgeScore.scores, [criterionId]: numValue },
    };

    const updatedJudgeScores = new Map(playerScore.judgeScores);
    updatedJudgeScores.set(judgeId, updatedJudgeScore);

    setPlayerScores(
      new Map(
        playerScores.set(playerId, {
          ...playerScore,
          judgeScores: updatedJudgeScores,
        })
      )
    );
  };

  const handleSave = async (playerId: string) => {
    const playerScore = playerScores.get(playerId);
    if (!playerScore) return;

    setPlayerScores(
      new Map(
        playerScores.set(playerId, {
          ...playerScore,
          isSaving: true,
          saveStatus: 'idle',
        })
      )
    );

    try {
      // Convert judgeScores map to object format for API
      const scoresPayload: Record<string, Record<string, number | null>> = {};
      playerScore.judgeScores.forEach((judgeScore, judgeId) => {
        scoresPayload[judgeId] = judgeScore.scores;
      });

      const response = await fetch('/api/admin/scores/save-player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          round,
          playerId: playerScore.playerId,
          allJudgesScores: scoresPayload,
          adminId: admin?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save score');
      }

      setPlayerScores(
        new Map(
          playerScores.set(playerId, {
            ...playerScore,
            isSaving: false,
            isExpanded: false,
            saveStatus: 'success',
          })
        )
      );

      setTimeout(() => {
        const currentScore = playerScores.get(playerId);
        if (currentScore) {
          setPlayerScores(
            new Map(
              playerScores.set(playerId, {
                ...currentScore,
                saveStatus: 'idle',
              })
            )
          );
        }
      }, 3000);
    } catch (error) {
      console.error('[v0] Error saving score:', error);
      setPlayerScores(
        new Map(
          playerScores.set(playerId, {
            ...playerScore,
            isSaving: false,
            saveStatus: 'error',
          })
        )
      );
    }
  };

  const calculateTotal = (scores: Record<string, number | null>) => {
    return Object.values(scores).reduce(
      (sum, score) => (sum || 0) + (score || 0),
      0
    );
  };

  const calculateGrandTotal = (judgeScores: Map<string, JudgeScore>) => {
    let total = 0;
    judgeScores.forEach((judgeScore) => {
      const totalValue = calculateTotal(judgeScore?.scores);
      if (totalValue) {
        total += totalValue;
      }
    });
    return total;
  };

  const renderScoreEntry = () => (
    <div className="space-y-4">
      {round === 'qualification' && qualificationLocked && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-200">
                Qualification round scores are locked. No modifications can be
                made.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search by Minecraft username, Discord username, or Player ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 bg-slate-950/50 border-slate-700 text-white"
              />
            </div>

            {/* Sort dropdown */}
            {round === 'qualification' && (
              <Select
                value={sortBy}
                onValueChange={(value: 'Date' | 'Score') => setSortBy(value)}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-slate-950/50 border-slate-700 text-white">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Date">Sory by Date</SelectItem>
                  <SelectItem value="Score">Sory by Score</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score Entry Cards */}
      <div className="space-y-3">
        {filteredPlayers?.map((player) => {
          const scoreData = playerScores.get(player.id);
          if (!scoreData) return null;

          const isExpanded = scoreData.isExpanded;
          const grandTotal = calculateGrandTotal(scoreData.judgeScores);

          return (
            <Card
              key={player.id}
              className="bg-slate-900/50 border-purple-500/20 overflow-hidden"
              onClick={() => {
                if (!isExpanded) {
                  toggleExpand(player.id);
                }
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      {player.minecraftUsername}
                      {isExpanded && (
                        <span className="text-sm font-normal text-slate-400">
                          (Total: {grandTotal} pts)
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-sm mt-1">
                      • Username:{' '}
                      <span className="text-sm font-bold">
                        {player.username}
                      </span>{' '}
                      • IGN:{' '}
                      <span className="text-sm font-bold">{player.ign}</span> •
                      Discord:{' '}
                      <span className="text-sm font-bold">
                        {player.discordUsername}
                      </span>{' '}
                      • Player ID:{' '}
                      <span className="text-sm font-bold">{player.id}</span>
                      {!isExpanded && grandTotal > 0 && (
                        <span className="text-lg font-bold text-cyan-400 text-slate-400 mt-4 ml-4">
                          (Total: {grandTotal} pts)
                        </span>
                      )}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    {scoreData.saveStatus === 'success' && (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Saved
                      </div>
                    )}
                    {scoreData.saveStatus === 'error' && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Error
                      </div>
                    )}

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(player.id);
                      }}
                      size="sm"
                      className="gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          {round === 'qualification' && qualificationLocked
                            ? 'Locked'
                            : 'Edit'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="border-t border-slate-700/50 pt-4 space-y-4">
                  {judges.map((judge) => {
                    const judgeScore = scoreData.judgeScores.get(judge.id);
                    if (!judgeScore) return null;

                    const judgeTotal = calculateTotal(judgeScore.scores);

                    return (
                      <div
                        key={judge.id}
                        className="bg-slate-950/50 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-white font-medium">
                              {judge.name}
                            </h4>
                            <p className="text-sm text-slate-400">
                              {judge.role}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">
                              Judge Total
                            </p>
                            <p className="text-lg font-bold text-cyan-400">
                              {judgeTotal} pts
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 gap-3">
                          {criteria.map((criterion) => (
                            <div key={criterion.id} className="space-y-2">
                              <label className="text-sm font-medium text-slate-300 block">
                                {criterion.name}
                                <span className="text-xs text-slate-500 ml-1">
                                  / {criterion.maxPoints}
                                </span>
                              </label>
                              <Input
                                type="number"
                                min={0}
                                max={criterion.maxPoints}
                                value={judgeScore.scores[criterion.id] ?? ''}
                                onChange={(e) =>
                                  updateScore(
                                    player.id,
                                    judge.id,
                                    criterion.id,
                                    e.target.value
                                  )
                                }
                                className="bg-slate-900 border-slate-700 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="text-slate-400 text-sm">
                      Grand Total:{' '}
                      <span className="text-2xl font-bold text-cyan-400 ml-2">
                        {grandTotal}
                      </span>{' '}
                      points
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleCancel(player.id)}
                        size="sm"
                        variant="outline"
                        className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSave(player.id)}
                        size="sm"
                        disabled={
                          scoreData.isSaving ||
                          (round === 'qualification' && qualificationLocked)
                        }
                        className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {scoreData.isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            {round === 'qualification' &&
                            qualificationLocked ? (
                              <>🔒 Locked</>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                Save All Scores
                              </>
                            )}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {round === 'qualification' && totalPlayers > itemsPerPage && (
        <Card className="bg-slate-900/50 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Showing{' '}
                {(currentPage === 1 ? currentPage - 1 : currentPage) *
                  itemsPerPage +
                  1}{' '}
                to {currentPage * itemsPerPage} of {totalPlayers} players
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="text-sm text-white">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Score Entry</h1>
        <p className="text-slate-400 mt-1">
          Enter and manage scores for each player by judge
        </p>
      </div>

      {finalsEnabled ? (
        <Tabs
          value={round}
          onValueChange={(v) => setRound(v as 'qualification' | 'finals')}
        >
          <TabsList className="bg-slate-900/50 border border-slate-700/50">
            <TabsTrigger value="qualification">
              Qualification Round {qualificationLocked && '🔒'}
            </TabsTrigger>
            <TabsTrigger value="finals">Finals Round</TabsTrigger>
          </TabsList>

          <TabsContent value={round} className="space-y-4 mt-6">
            {renderScoreEntry()}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          <Card className="bg-slate-900/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Qualification Round</CardTitle>
              <CardDescription className="text-slate-400">
                Currently in qualification phase. Finals will be available once
                enabled by Main Admin.
              </CardDescription>
            </CardHeader>
          </Card>

          {renderScoreEntry()}
        </div>
      )}
    </div>
  );
}
