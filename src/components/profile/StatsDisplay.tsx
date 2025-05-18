
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserStats, getUserGames, getUserDecks } from '@/services/ProfileService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts';
import { Calendar, Trophy, ChevronDown, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Define interfaces for our data structures
interface WinRateTrendDataPoint {
  date: string;
  fullDate: Date;
  monthWinRate: number;
  overallWinRate: number;
  games: number;
  wins: number;
}

interface MonthlyGameData {
  wins: number;
  games: number;
  date: Date;
}

interface DeckWinRateStats {
  deckId: string;
  deckName: string;
  wins: number;
  total: number;
  winRate: number;
}

interface MatchupWinRateStats {
  opponentDeck: string;
  wins: number;
  total: number;
  winRate: number;
}

const StatsDisplay = () => {
  // State for format and deck filters
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>("all");

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

  // Filter games by time range
  const filterGamesByTimeRange = (games) => {
    if (timeRange === "all") return games;
    
    const now = new Date();
    let startDate = new Date();
    
    switch(timeRange) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return games;
    }
    
    return games.filter(game => new Date(game.date) >= startDate);
  };

  // Calculate format-specific deck win rates
  const calculateDeckWinRates = (format: string | null) => {
    const filteredGames = format 
      ? filterGamesByTimeRange(games.filter(game => game.opponentDeckFormat === format))
      : filterGamesByTimeRange(games);
    
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
    
    const filteredGames = filterGamesByTimeRange(games.filter(game => 
      game.opponentDeckFormat === format && game.deckUsed === deck
    ));
    
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
  const recentGames = [...games]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Format match score for display
  const formatMatchScore = game => {
    if (!game.matchScore) return '';
    const { playerWins, opponentWins } = game.matchScore;
    return `${playerWins}-${opponentWins}`;
  };

  // Get deck name from id
  const getDeckName = deckId => {
    const deck = decks.find(d => d.id === deckId);
    return deck ? deck.name : deckId;
  };

  // Generate time-series data for win rate trends
  const generateWinRateTrendData = (format = null, deckId = null): WinRateTrendDataPoint[] => {
    // Filter games by format and deck if specified
    let filteredGames = [...games];
    if (format) filteredGames = filteredGames.filter(g => g.opponentDeckFormat === format);
    if (deckId) filteredGames = filteredGames.filter(g => g.deckUsed === deckId);

    if (filteredGames.length === 0) return [];

    // Sort games by date (oldest first)
    filteredGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group games by month
    const gamesByMonth: Record<string, MonthlyGameData> = filteredGames.reduce((acc, game) => {
      const date = new Date(game.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          wins: 0,
          games: 0,
          date: new Date(date.getFullYear(), date.getMonth(), 1)
        };
      }
      
      acc[monthYear].games += 1;
      if (game.win) acc[monthYear].wins += 1;
      
      return acc;
    }, {} as Record<string, MonthlyGameData>);

    // Convert to array with running win rate
    let totalGames = 0;
    let totalWins = 0;
    
    return Object.entries(gamesByMonth).map(([month, data]) => {
      totalGames += data.games;
      totalWins += data.wins;
      
      return {
        date: month,
        fullDate: data.date,
        monthWinRate: (data.wins / data.games) * 100,
        overallWinRate: (totalWins / totalGames) * 100,
        games: data.games,
        wins: data.wins
      };
    });
  };

  // Get deck win rates for selected format
  const deckWinRates = calculateDeckWinRates(selectedFormat);
  
  // Get matchup win rates for selected format and deck
  const matchupWinRates = calculateMatchupWinRates(selectedFormat, selectedDeck);

  // Sort decks by win rate
  const sortedDeckWinRates: DeckWinRateStats[] = Object.entries(deckWinRates)
    .sort((a, b) => b[1].winRate - a[1].winRate)
    .map(([deckId, stats]) => ({
      deckId,
      deckName: getDeckName(deckId),
      ...stats
    }));

  // Sort matchups by win rate
  const sortedMatchupWinRates: MatchupWinRateStats[] = Object.entries(matchupWinRates)
    .sort((a, b) => b[1].winRate - a[1].winRate)
    .map(([opponentDeck, stats]) => ({
      opponentDeck,
      ...stats
    }));

  // Generate win rate trend data based on filters
  const winRateTrendData = generateWinRateTrendData(selectedFormat, selectedDeck);

  return (
    <div className="space-y-6">
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
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b pb-4">
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
        
        {/* Time range selector */}
        <div className="w-full sm:w-auto">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Periodo de tiempo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el tiempo</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="quarter">Últimos 3 meses</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Win Rate Timeline Chart */}
      <Card className="magic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5" />
            Evolución del Win Rate en el tiempo
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          {winRateTrendData.length < 2 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No hay suficientes datos para mostrar la evolución del win rate.
              Se necesitan partidas de al menos 2 meses diferentes.
            </div>
          ) : (
            <ChartContainer config={{
              "Ratio mensual": { color: '#7856E3' },
              "Ratio acumulado": { color: '#0EA5E9' }
            }}>
              <LineChart data={winRateTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => value}
                />
                <YAxis 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="monthWinRate" 
                  name="Ratio mensual" 
                  stroke="#7856E3" 
                  strokeWidth={2} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="overallWinRate" 
                  name="Ratio acumulado" 
                  stroke="#0EA5E9" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
      
      {/* Deck Win Rates Section with Table UI */}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mazo</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead>Victorias</TableHead>
                  <TableHead>Partidas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDeckWinRates.map((item) => (
                  <TableRow key={item.deckId}>
                    <TableCell className="font-medium">{item.deckName}</TableCell>
                    <TableCell>
                      <Badge variant={item.winRate >= 50 ? "outline" : "destructive"} className={item.winRate >= 50 ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                        {item.winRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{item.wins}</TableCell>
                    <TableCell>{item.total}</TableCell>
                    <TableCell className="text-right">
                      {selectedFormat && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDeck(item.deckId)}
                        >
                          Ver enfrentamientos
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Matchup Analysis Section with Table UI */}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mazo Rival</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead>Victorias</TableHead>
                    <TableHead>Partidas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMatchupWinRates.map((matchup) => (
                    <TableRow key={matchup.opponentDeck}>
                      <TableCell className="font-medium">{matchup.opponentDeck}</TableCell>
                      <TableCell>
                        <Badge variant={matchup.winRate >= 50 ? "outline" : "destructive"} className={matchup.winRate >= 50 ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                          {matchup.winRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>{matchup.wins}</TableCell>
                      <TableCell>{matchup.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Advanced Charts Tabs */}
      <Tabs defaultValue="winloss" className="w-full">
        <TabsList>
          <TabsTrigger value="winloss" className="flex items-center gap-1">
            <PieChartIcon className="h-4 w-4" />
            Win/Loss
          </TabsTrigger>
          <TabsTrigger value="formats" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Formatos
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Partidas recientes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="winloss">
          <Card>
            <CardHeader>
              <CardTitle>Victorias / Derrotas</CardTitle>
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
                <PieChart>
                  <Pie 
                    data={winLossData} 
                    cx="50%" 
                    cy="50%" 
                    labelLine={false} 
                    outerRadius={100}
                    fill="#8884d8" 
                    dataKey="value" 
                    nameKey="name" 
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {winLossData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="formats">
          <Card>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
        </TabsContent>
        
        <TabsContent value="recent">
          {/* Recent Games */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Partidas recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentGames.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No hay partidas registradas
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resultado</TableHead>
                      <TableHead>Rival</TableHead>
                      <TableHead>Mi mazo</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentGames.map(game => (
                      <TableRow key={game.id}>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            game.win ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {game.win ? 'Victoria' : 'Derrota'}
                            {game.matchScore && (
                              <span className="ml-1 flex items-center">
                                <Trophy className="h-3 w-3 mx-1" /> 
                                {formatMatchScore(game)}
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>{game.opponentDeckName}</TableCell>
                        <TableCell>{getDeckName(game.deckUsed)}</TableCell>
                        <TableCell>{new Date(game.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsDisplay;
