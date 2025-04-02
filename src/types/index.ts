
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
