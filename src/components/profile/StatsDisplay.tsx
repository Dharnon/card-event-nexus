
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserStats, getUserGames } from '@/services/ProfileService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { EventFormat } from '@/types';
import { Calendar } from "lucide-react"

const StatsDisplay = () => {
  // Fetch user stats and games
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats,
  });
  
  const { data: games = [], isLoading: isGamesLoading } = useQuery({
    queryKey: ['userGames'],
    queryFn: () => getUserGames(),
  });
  
  const isLoading = isStatsLoading || isGamesLoading;
  
  if (isLoading) {
    return <div className="flex justify-center my-8">Cargando estadísticas...</div>;
  }
  
  if (!stats) {
    return <div className="text-center py-10">No hay estadísticas disponibles</div>;
  }
  
  // Prepare data for win/loss pie chart
  const winLossData = [
    { name: 'Victorias', value: stats.wins, color: '#10B981' }, // green
    { name: 'Derrotas', value: stats.losses, color: '#EF4444' }, // red
  ];
  
  // Prepare data for format bar chart
  const formatData = Object.entries(stats.statsByFormat).map(([format, data]) => ({
    name: format,
    Victorias: data.wins,
    Derrotas: data.losses,
  }));
  
  // Get recent games
  const recentGames = [...games]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
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
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Win/Loss Pie Chart */}
        <Card className="magic-card">
          <CardHeader>
            <CardTitle>Victorias / Derrotas</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer 
              config={{
                Victorias: { color: '#10B981' },
                Derrotas: { color: '#EF4444' }
              }}
            >
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {winLossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
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
            <ChartContainer 
              config={{
                Victorias: { color: '#10B981' },
                Derrotas: { color: '#EF4444' }
              }}
            >
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
      
      {/* Recent Games */}
      <Card className="magic-card">
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
            <div className="divide-y">
              {recentGames.map((game) => (
                <div key={game.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      game.win ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {game.win ? 'Victoria' : 'Derrota'}
                    </span>
                    <span className="ml-2">vs {game.opponentDeckName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(game.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsDisplay;
