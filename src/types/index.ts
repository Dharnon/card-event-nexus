export interface Card {
  id: string;
  name: string;
  quantity: number;
  imageUrl?: string;
  scryfallId?: string;
}

export type EventFormat =
  | "Standard"
  | "Modern"
  | "Legacy"
  | "Commander"
  | "Pioneer"
  | "Vintage"
  | "Draft"
  | "Sealed"
  | "Prerelease"
  | "Other";

export interface Deck {
  id: string;
  name: string;
  format: EventFormat;
  cards: Card[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  sideboardGuide?: SideboardGuide;
  photos?: DeckPhoto[];
}

export interface GameResult {
  id: string;
  win: boolean;
  opponentDeckName: string;
  opponentDeckFormat: EventFormat;
  deckUsed: string;
  notes?: string;
  eventId: string;
  date: string;
}

export interface UserEvent {
  id: string;
  name: string;
  date: string;
  games: GameResult[];
  userId: string;
}

export interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  statsByFormat: {
    [format: string]: {
      totalGames: number;
      wins: number;
      losses: number;
      winRate: number;
    };
  };
}

export interface ScryfallCard {
  name: string;
  image_uris: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface SideboardGuide {
  id: string;
  deckId: string;
  mainNotes: string;
  matchups: Matchup[];
}

export interface Matchup {
  id: string;
  name: string;
  strategy: string;
  cardsToSideIn: Card[];
  cardsToSideOut: Card[];
}

export interface DeckPhoto {
  id: string;
  url: string;
  caption: string;
  date: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  format: EventFormat;
  capacity: number;
  registeredPlayers: number;
  image?: string;
  type: EventType;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export type EventType = 
  | "tournament"
  | "casual"
  | "prerelease"
  | "draft"
  | "championship"
  | "other";

export type UserRole = 'user' | 'admin' | 'store';

export interface CardSearchInputProps {
  onCardSelect: (card: Card) => void;
  placeholder?: string;
}
