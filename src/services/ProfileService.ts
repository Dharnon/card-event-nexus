
import { Deck, GameResult, UserEvent, UserStats, EventFormat, Card } from '@/types';

// Mock user ID for demonstration purposes
const CURRENT_USER_ID = '1';

// Mock database
let decks: Deck[] = [];
let games: GameResult[] = [];
let userEvents: UserEvent[] = [];

// Deck operations
export const getUserDecks = async (userId: string = CURRENT_USER_ID): Promise<Deck[]> => {
  return decks.filter(deck => deck.userId === userId);
};

export const getDeckById = async (deckId: string): Promise<Deck | undefined> => {
  return decks.find(deck => deck.id === deckId);
};

export const createDeck = async (deck: Omit<Deck, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Deck> => {
  const newDeck: Deck = {
    ...deck,
    id: `deck-${Date.now()}`,
    userId: CURRENT_USER_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  decks.push(newDeck);
  return newDeck;
};

export const updateDeck = async (deckId: string, updates: Partial<Omit<Deck, 'id' | 'userId' | 'createdAt'>>): Promise<Deck | undefined> => {
  const deckIndex = decks.findIndex(deck => deck.id === deckId);
  
  if (deckIndex === -1) return undefined;
  
  decks[deckIndex] = {
    ...decks[deckIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return decks[deckIndex];
};

export const deleteDeck = async (deckId: string): Promise<boolean> => {
  const initialLength = decks.length;
  decks = decks.filter(deck => deck.id !== deckId);
  return initialLength > decks.length;
};

// Game results operations
export const getUserGames = async (userId: string = CURRENT_USER_ID): Promise<GameResult[]> => {
  const userDecks = await getUserDecks(userId);
  const userDeckIds = userDecks.map(deck => deck.id);
  
  return games.filter(game => userDeckIds.includes(game.deckUsed));
};

export const createGameResult = async (game: Omit<GameResult, 'id'>): Promise<GameResult> => {
  const newGame: GameResult = {
    ...game,
    id: `game-${Date.now()}`,
  };
  
  games.push(newGame);
  return newGame;
};

export const updateGameResult = async (gameId: string, updates: Partial<Omit<GameResult, 'id'>>): Promise<GameResult | undefined> => {
  const gameIndex = games.findIndex(game => game.id === gameId);
  
  if (gameIndex === -1) return undefined;
  
  games[gameIndex] = {
    ...games[gameIndex],
    ...updates,
  };
  
  return games[gameIndex];
};

export const deleteGameResult = async (gameId: string): Promise<boolean> => {
  const initialLength = games.length;
  games = games.filter(game => game.id !== gameId);
  return initialLength > games.length;
};

// User events operations
export const getUserEvents = async (userId: string = CURRENT_USER_ID): Promise<UserEvent[]> => {
  return userEvents.filter(event => event.userId === userId);
};

export const createUserEvent = async (event: Omit<UserEvent, 'id' | 'userId'>): Promise<UserEvent> => {
  const newEvent: UserEvent = {
    ...event,
    id: `event-${Date.now()}`,
    userId: CURRENT_USER_ID,
  };
  
  userEvents.push(newEvent);
  return newEvent;
};

export const updateUserEvent = async (eventId: string, updates: Partial<Omit<UserEvent, 'id' | 'userId'>>): Promise<UserEvent | undefined> => {
  const eventIndex = userEvents.findIndex(event => event.id === eventId);
  
  if (eventIndex === -1) return undefined;
  
  userEvents[eventIndex] = {
    ...userEvents[eventIndex],
    ...updates,
  };
  
  return userEvents[eventIndex];
};

export const deleteUserEvent = async (eventId: string): Promise<boolean> => {
  const initialLength = userEvents.length;
  userEvents = userEvents.filter(event => event.id !== eventId);
  return initialLength > userEvents.length;
};

// Statistics calculations
export const getUserStats = async (userId: string = CURRENT_USER_ID): Promise<UserStats> => {
  const userGames = await getUserGames(userId);
  const wins = userGames.filter(game => game.win).length;
  const losses = userGames.length - wins;
  
  // Calculate stats by format
  const statsByFormat: Record<string, {
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
  }> = {};
  
  // Get all decks to determine formats
  const userDecks = await getUserDecks(userId);
  
  userGames.forEach(game => {
    const deck = userDecks.find(d => d.id === game.deckUsed);
    if (!deck) return;
    
    const format = deck.format;
    
    if (!statsByFormat[format]) {
      statsByFormat[format] = {
        totalGames: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
      };
    }
    
    statsByFormat[format].totalGames++;
    if (game.win) {
      statsByFormat[format].wins++;
    } else {
      statsByFormat[format].losses++;
    }
    
    statsByFormat[format].winRate = 
      statsByFormat[format].wins / statsByFormat[format].totalGames * 100;
  });
  
  return {
    totalGames: userGames.length,
    wins,
    losses,
    winRate: userGames.length > 0 ? (wins / userGames.length) * 100 : 0,
    statsByFormat: statsByFormat as UserStats['statsByFormat'],
  };
};

// Preload some sample data for demonstration
export const preloadSampleData = () => {
  // Sample decks
  decks = [
    {
      id: 'deck-1',
      name: 'Blue Control',
      format: 'Modern',
      cards: [
        { id: 'card-1', name: 'Island', quantity: 24 },
        { id: 'card-2', name: 'Counterspell', quantity: 4 },
        { id: 'card-3', name: 'Cryptic Command', quantity: 3 },
      ],
      userId: CURRENT_USER_ID,
      createdAt: '2023-01-15T12:00:00Z',
      updatedAt: '2023-02-10T15:30:00Z',
    },
    {
      id: 'deck-2',
      name: 'Red Aggro',
      format: 'Standard',
      cards: [
        { id: 'card-4', name: 'Mountain', quantity: 20 },
        { id: 'card-5', name: 'Lightning Bolt', quantity: 4 },
        { id: 'card-6', name: 'Goblin Guide', quantity: 4 },
      ],
      userId: CURRENT_USER_ID,
      createdAt: '2023-03-05T09:15:00Z',
      updatedAt: '2023-03-05T09:15:00Z',
    },
  ];
  
  // Sample game results
  games = [
    {
      id: 'game-1',
      win: true,
      opponentDeckName: 'Green Stompy',
      opponentDeckFormat: 'Modern',
      notes: 'Countered key threats',
      deckUsed: 'deck-1',
      date: '2023-04-10T18:30:00Z',
    },
    {
      id: 'game-2',
      win: false,
      opponentDeckName: 'Black Control',
      opponentDeckFormat: 'Modern',
      notes: 'Too much discard',
      deckUsed: 'deck-1',
      date: '2023-04-11T19:45:00Z',
    },
    {
      id: 'game-3',
      win: true,
      opponentDeckName: 'White Weenie',
      opponentDeckFormat: 'Standard',
      deckUsed: 'deck-2',
      date: '2023-04-15T14:20:00Z',
    },
  ];
  
  // Sample user events
  userEvents = [
    {
      id: 'event-1',
      name: 'Friday Night Magic',
      date: '2023-04-10T18:00:00Z',
      games: ['game-1', 'game-2'] as any, // This would normally be GameResult objects
      userId: CURRENT_USER_ID,
    },
    {
      id: 'event-2',
      name: 'Standard Showdown',
      date: '2023-04-15T14:00:00Z',
      games: ['game-3'] as any, // This would normally be GameResult objects
      userId: CURRENT_USER_ID,
    },
  ];
};

// Call preload function to populate sample data
preloadSampleData();
