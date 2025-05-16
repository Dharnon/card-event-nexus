
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserStats, getUserGames, getUserDecks } from '@/services/ProfileService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { EventFormat, Deck, GameResult } from '@/types';
import { Calendar, Trophy, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

const StatsDisplay = () => {
  // State for format and deck filters
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);

  // Fetch user stats, games, and decks
  const {
    data: stats,
    isLoading: isStatsLoading
  } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => getUserStats()
  });
  
  const {
    data: games = [],
    isLoading: isGamesLoading
  } = useQuery({
    queryKey: ['userGames'],
    queryFn: () => getUserGames()
  });
  
  const {
    data: decks = [],
    isLoading: isDecksLoading
  } = useQuery({
    queryKey: ['userDecks'],
    queryFn: () => getUserDecks()
  });
  
  const isLoading = isStatsLoading || isGamesLoading || isDecksLoading;
  
  if (isLoading) {
    return <div className="flex justify-center my-8">Cargando estadísticas...</div>;
  }
  
  if (!stats) {
    return <div className="text-center py-10">No hay estadísticas disponibles</div>;
  }

  // Get unique formats from games
  const formats = [...new Set(games.map(game => game.opponentDeckFormat))];

  // Calculate format-specific deck win rates
  const calculateDeckWinRates = (format: string | null) => {
    const filteredGames = format 
      ? games.filter(game => game.opponentDeckFormat === format)
      : games;
    
    const deckStats: {[key: string]: {wins: number, total: number, winRate: number}} = {};
    
    // Group games by deck and count wins
    filteredGames.forEach(game => {
      if (!deckStats[game.deckUsed]) {
        deckStats[game.deckUsed] = { wins: 0, total: 0, winRate: 0 };
      }
      
      deckStats[game.deckUsed].total += 1;
      if (game.win) deckStats[game.deckUsed].wins += 1;
    });
    
    // Calculate win rates
    Object.keys(deckStats).forEach(deck => {
      const { wins, total } = deckStats[deck];
      deckStats[deck].winRate = total > 0 ? (wins / total) * 100 : 0;
    });
    
    return deckStats;
  };

  // Calculate matchup win rates for a specific format and deck
  const calculateMatchupWinRates = (format: string | null, deck: string | null) => {
    if (!format || !deck) return {};
    
    const filteredGames = games.filter(game => 
      game.opponentDeckFormat === format && game.deckUsed === deck
    );
    
    const matchupStats: {[key: string]: {wins: number, total: number, winRate: number}} = {};
    
    // Group games by opponent deck and count wins
    filteredGames.forEach(game => {
      if (!matchupStats[game.opponentDeckName]) {
        matchupStats[game.opponentDeckName] = { wins: 0, total: 0, winRate: 0 };
      }
      
      matchupStats[game.opponentDeckName].total += 1;
      if (game.win) matchupStats[game.opponentDeckName].wins += 1;
    });
    
    // Calculate win rates
    Object.keys(matchupStats).forEach(opponent => {
      const { wins, total } = matchupStats[opponent];
      matchupStats[opponent].winRate = total > 0 ? (wins / total) * 100 : 0;
    });
    
    return matchupStats;
  };

  // Prepare data for win/loss pie chart
  const winLossData = [{
    name: 'Victorias',
    value: stats.wins,
    color: '#10B981'
  },
  // green
  {
    name: 'Derrotas',
    value: stats.losses,
    color: '#EF4444'
  } // red
  ];

  // Prepare data for format bar chart
  const formatData = Object.entries(stats.statsByFormat).map(([format, data]) => ({
    name: format,
    Victorias: data.wins,
    Derrotas: data.losses
  }));

  // Get recent games
  const recentGames = [...games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // Format match score for display
  const formatMatchScore = game => {
    if (!game.matchScore) return '';
    const {
      playerWins,
      opponentWins
    } = game.matchScore;
    return `${playerWins}-${opponentWins}`;
  };

  // Get deck name from id
  const getDeckName = deckId => {
    const deck = decks.find(d => d.id === deckId);
    return deck ? deck.name : deckId;
  };

  // Get deck win rates for selected format
  const deckWinRates = calculateDeckWinRates(selectedFormat);
  
  // Get matchup win rates for selected format and deck
  const matchupWinRates = calculateMatchupWinRates(selectedFormat, selectedDeck);

  // Sort decks by win rate
  const sortedDeckWinRates = Object.entries(deckWinRates)
    .sort((a, b) => b[1].winRate - a[1].winRate)
    .map(([deckId, stats]) => ({
      deckId,
      deckName: getDeckName(deckId),
      ...stats
    }));

  // Sort matchups by win rate
  const sortedMatchupWinRates = Object.entries(matchupWinRates)
    .sort((a, b) => b[1].winRate - a[1].winRate)
    .map(([opponentDeck, stats]) => ({
      opponentDeck,
      ...stats
    }));

  return <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mis Estadísticas</h2>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="magic-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Partidas jugadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalGames}</div>
          </CardContent>
        </Card>
        
        <Card className="magic-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Victorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-magic-green">{stats.wins}</div>
          </CardContent>
        </Card>
        
        <Card className="magic-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ratio de victorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Format Selector for filtering */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="w-full sm:w-[250px]">
          <Select 
            value={selectedFormat || ""} 
            onValueChange={(value) => {
              setSelectedFormat(value || null);
              setSelectedDeck(null); // Reset deck selection when format changes
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los formatos</SelectItem>
              {formats.map((format) => (
                <SelectItem key={format} value={format}>{format}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedFormat ? `Mostrando estadísticas para ${selectedFormat}` : "Mostrando estadísticas para todos los formatos"}
        </div>
      </div>
      
      {/* Deck Win Rates Section */}
      <Card className="magic-card">
        <CardHeader>
          <CardTitle>
            {selectedFormat 
              ? `Rendimiento de mazos en ${selectedFormat}` 
              : "Rendimiento de mazos en todos los formatos"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedDeckWinRates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay datos disponibles para este formato
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDeckWinRates.map((item) => (
                <div key={item.deckId} className="border rounded-lg p-4">
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="font-medium text-lg">{item.deckName}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.winRate >= 50 ? "success" : "destructive"}>
                            {item.winRate.toFixed(1)}% win rate
                          </Badge>
                          <Badge variant="outline">
                            {item.wins} W / {item.total - item.wins} L
                          </Badge>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      {/* Matchup Analysis Button */}
                      {selectedFormat && (
                        <div className="mt-2">
                          <button
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm"
                            onClick={() => setSelectedDeck(item.deckId)}
                          >
                            Ver análisis de enfrentamientos
                          </button>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Matchup Analysis Section */}
      {selectedDeck && selectedFormat && (
        <Card className="magic-card">
          <CardHeader>
            <CardTitle>
              Análisis de enfrentamientos: {getDeckName(selectedDeck)} en {selectedFormat}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedMatchupWinRates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay datos de enfrentamientos disponibles para este mazo en este formato
              </div>
            ) : (
              <div className="space-y-4">
                {sortedMatchupWinRates.map((matchup) => (
                  <div key={matchup.opponentDeck} className="flex justify-between items-center border-b py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-medium">{matchup.opponentDeck}</span>
                      <Badge variant={matchup.winRate >= 50 ? "success" : "destructive"}>
                        {matchup.winRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      {matchup.wins} victorias de {matchup.total} partidas
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Charts */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="recent">Partidas recientes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Win/Loss Pie Chart */}
            <Card className="magic-card">
              <CardHeader>
                <CardTitle>Victorias / Derrotas</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] my-0 py-[2px]">
                <ChartContainer config={{
                Victorias: {
                  color: '#10B981'
                },
                Derrotas: {
                  color: '#EF4444'
                }
              }}>
                  <PieChart>
                    <Pie data={winLossData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({
                    name,
                    percent
                  }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                      {winLossData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            {/* Format Bar Chart */}
            <Card className="magic-card">
              <CardHeader>
                <CardTitle>Estadísticas por formato</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer config={{
                Victorias: {
                  color: '#10B981'
                },
                Derrotas: {
                  color: '#EF4444'
                }
              }}>
                  <BarChart data={formatData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="Victorias" fill="#10B981" />
                    <Bar dataKey="Derrotas" fill="#EF4444" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          {/* Recent Games */}
          <Card className="magic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Partidas recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentGames.length === 0 ? <div className="text-center py-4 text-muted-foreground">
                  No hay partidas registradas
                </div> : <div className="divide-y">
                  {recentGames.map(game => <div key={game.id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${game.win ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {game.win ? 'Victoria' : 'Derrota'}
                          {game.matchScore && <span className="ml-1 flex items-center">
                              <Trophy className="h-3 w-3 mx-1" /> 
                              {formatMatchScore(game)}
                            </span>}
                        </span>
                        <span>vs {game.opponentDeckName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getDeckName(game.deckUsed)}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(game.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>)}
                </div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};

export default StatsDisplay;
