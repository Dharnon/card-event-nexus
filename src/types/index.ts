
export type UserRole = 'user' | 'admin' | 'store';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export type EventFormat = 'Standard' | 'Modern' | 'Legacy' | 'Commander' | 'Pioneer' | 'Vintage' | 'Draft' | 'Sealed' | 'Prerelease' | 'Other';

export type EventType = 'Tournament' | 'Casual Play' | 'Championship' | 'League' | 'Special Event';

export interface EventLocation {
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  format: EventFormat;
  type: EventType;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  location: EventLocation;
  price?: number;
  maxParticipants?: number;
  currentParticipants?: number;
  image?: string;
  featured?: boolean;
  createdBy: string; // Store ID
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Store {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  location: EventLocation;
  logo?: string;
  description?: string;
}

// New types for user profile section

export interface Card {
  id: string;
  name: string;
  quantity: number;
  scryfallId?: string;
  imageUrl?: string;
}

export interface Deck {
  id: string;
  name: string;
  format: EventFormat;
  cards: Card[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameResult {
  id: string;
  win: boolean;
  opponentDeckName: string;
  opponentDeckFormat?: EventFormat;
  notes?: string;
  deckUsed: string; // Deck ID
  eventId?: string; // Optional link to an event
  date: string; // ISO date string
}

export interface UserEvent {
  id: string;
  name: string;
  date: string; // ISO date string
  games: GameResult[];
  userId: string;
}

export interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  statsByFormat: {
    [format in EventFormat]?: {
      totalGames: number;
      wins: number;
      losses: number;
      winRate: number;
    }
  };
}
