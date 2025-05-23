import { supabase } from '@/integrations/supabase/client';
import { UserEvent, GameResult, Deck, SideboardGuide, Card as MagicCard, EventFormat } from '@/types';
import { Json } from '@/integrations/supabase/types';

export interface StoreProfile {
  id: string;
  username: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProfile() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user || !user.user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

export async function updateProfile(updates: any) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error('No user logged in');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userData.user.id)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function uploadProfileImage(file: File): Promise<string | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error('No user logged in');
    }
    
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userData.user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });
      
    if (error) {
      throw error;
    }
    
    // Get public URL
    const { data: publicURL } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);
      
    // Update the user's profile with the new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicURL.publicUrl })
      .eq('id', userData.user.id);
      
    if (updateError) {
      console.error('Error updating profile with new avatar:', updateError);
    }
      
    return publicURL.publicUrl;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return null;
  }
}

export async function uploadBannerImage(file: File): Promise<string | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error('No user logged in');
    }
    
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userData.user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('banners')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });
      
    if (error) {
      throw error;
    }
    
    // Get public URL
    const { data: publicURL } = supabase.storage
      .from('banners')
      .getPublicUrl(data.path);
      
    // Update the user's profile with the new banner URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ banner_url: publicURL.publicUrl })
      .eq('id', userData.user.id);
      
    if (updateError) {
      console.error('Error updating profile with new banner:', updateError);
    }
      
    return publicURL.publicUrl;
  } catch (error) {
    console.error('Error uploading banner image:', error);
    return null;
  }
}

export async function getStoreProfile(storeId: string): Promise<StoreProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', storeId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as StoreProfile;
  } catch (error) {
    console.error('Error getting store profile:', error);
    return null;
  }
}

// Functions for deck management

export async function getUserDecks(): Promise<Deck[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error('No user logged in');
    }
    
    const { data, error } = await supabase
      .from('decks')
      .select('*, cards(*)')
      .eq('user_id', userData.user.id)
      .order('updated_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    if (!data) {
      return [];
    }
    
    // Process the data to match the expected Deck type structure
    const processedDecks: Deck[] = data.map((deck: any) => {
      const maindeckCards = deck.cards.filter((card: any) => !card.is_sideboard);
      const sideboardCards = deck.cards.filter((card: any) => card.is_sideboard);
      
      // Safely cast the sideboard_guide to SideboardGuide or undefined
      let sideboardGuide: SideboardGuide | undefined = undefined;
      if (deck.sideboard_guide) {
        try {
          // Type assertion with unknown as intermediate step
          sideboardGuide = deck.sideboard_guide as unknown as SideboardGuide;
        } catch (e) {
          console.error('Failed to parse sideboard guide:', e);
        }
      }
      
      return {
        id: deck.id,
        name: deck.name,
        format: deck.format as EventFormat,
        cards: maindeckCards.map((card: any) => ({
          id: card.id,
          name: card.name,
          quantity: card.quantity,
          imageUrl: card.image_url,
          scryfallId: card.scryfall_id
        })),
        sideboardCards: sideboardCards.map((card: any) => ({
          id: card.id,
          name: card.name,
          quantity: card.quantity,
          imageUrl: card.image_url,
          scryfallId: card.scryfall_id
        })),
        cardBackgroundUrl: deck.card_background_url,
        createdAt: deck.created_at,
        updatedAt: deck.updated_at,
        userId: deck.user_id,
        sideboardGuide
      };
    });
    
    return processedDecks;
  } catch (error) {
    console.error('Error getting user decks:', error);
    return [];
  }
}

export async function getDeckById(deckId: string): Promise<Deck | null> {
  try {
    const { data, error } = await supabase
      .from('decks')
      .select('*, cards(*)')
      .eq('id', deckId)
      .single();
      
    if (error) {
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    // Process the data to match the expected Deck type structure
    const maindeckCards = data.cards.filter((card: any) => !card.is_sideboard);
    const sideboardCards = data.cards.filter((card: any) => card.is_sideboard);
    
    // Safely cast the sideboard_guide to SideboardGuide or undefined
    let sideboardGuide: SideboardGuide | undefined = undefined;
    if (data.sideboard_guide) {
      try {
        // Type assertion with unknown as intermediate step
        sideboardGuide = data.sideboard_guide as unknown as SideboardGuide;
      } catch (e) {
        console.error('Failed to parse sideboard guide:', e);
      }
    }
    
    const deck: Deck = {
      id: data.id,
      name: data.name,
      format: data.format as EventFormat,
      cards: maindeckCards.map((card: any) => ({
        id: card.id,
        name: card.name,
        quantity: card.quantity,
        imageUrl: card.image_url,
        scryfallId: card.scryfall_id
      })),
      sideboardCards: sideboardCards.map((card: any) => ({
        id: card.id,
        name: card.name,
        quantity: card.quantity,
        imageUrl: card.image_url,
        scryfallId: card.scryfall_id
      })),
      cardBackgroundUrl: data.card_background_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.user_id,
      sideboardGuide
    };
    
    return deck;
  } catch (error) {
    console.error('Error getting deck by ID:', error);
    return null;
  }
}

export async function createDeck(deck: Partial<Deck>): Promise<Deck> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error('No user logged in');
    }
    
    // First, create the deck entry
    const { data: deckData, error: deckError } = await supabase
      .from('decks')
      .insert({
        user_id: userData.user.id,
        name: deck.name,
        format: deck.format,
        card_background_url: deck.cardBackgroundUrl
      })
      .select()
      .single();
      
    if (deckError) {
      throw deckError;
    }
    
    // Then, insert all cards associated with the deck
    if (deck.cards && deck.cards.length > 0) {
      const cardsToInsert = deck.cards.map(card => ({
        deck_id: deckData.id,
        name: card.name,
        quantity: card.quantity,
        image_url: card.imageUrl,
        scryfall_id: card.scryfallId,
        is_sideboard: false
      }));
      
      const { error: cardsError } = await supabase
        .from('cards')
        .insert(cardsToInsert);
        
      if (cardsError) {
        throw cardsError;
      }
    }
    
    // Insert sideboard cards if any
    if (deck.sideboardCards && deck.sideboardCards.length > 0) {
      const sideboardCardsToInsert = deck.sideboardCards.map(card => ({
        deck_id: deckData.id,
        name: card.name,
        quantity: card.quantity,
        image_url: card.imageUrl,
        scryfall_id: card.scryfallId,
        is_sideboard: true
      }));
      
      const { error: sideboardError } = await supabase
        .from('cards')
        .insert(sideboardCardsToInsert);
        
      if (sideboardError) {
        throw sideboardError;
      }
    }
    
    // Return the created deck with its cards
    const newDeck = await getDeckById(deckData.id);
    if (!newDeck) {
      throw new Error('Failed to fetch the created deck');
    }
    return newDeck;
  } catch (error) {
    console.error('Error creating deck:', error);
    throw error;
  }
}

export async function updateDeck(deckId: string, updates: Partial<Deck>): Promise<Deck> {
  try {
    // First, update the deck entry
    const deckUpdates: any = {};
    if (updates.name) deckUpdates.name = updates.name;
    if (updates.format) deckUpdates.format = updates.format;
    if (updates.cardBackgroundUrl !== undefined) deckUpdates.card_background_url = updates.cardBackgroundUrl;
    if (updates.sideboardGuide !== undefined) deckUpdates.sideboard_guide = updates.sideboardGuide;
    
    if (Object.keys(deckUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('decks')
        .update(deckUpdates)
        .eq('id', deckId);
        
      if (updateError) {
        throw updateError;
      }
    }
    
    // Update cards if provided
    if (updates.cards) {
      // Delete existing maindeck cards
      const { error: deleteError } = await supabase
        .from('cards')
        .delete()
        .eq('deck_id', deckId)
        .eq('is_sideboard', false);
        
      if (deleteError) {
        throw deleteError;
      }
      
      // Insert new maindeck cards
      if (updates.cards.length > 0) {
        const cardsToInsert = updates.cards.map(card => ({
          deck_id: deckId,
          name: card.name,
          quantity: card.quantity,
          image_url: card.imageUrl,
          scryfall_id: card.scryfallId,
          is_sideboard: false
        }));
        
        const { error: insertError } = await supabase
          .from('cards')
          .insert(cardsToInsert);
          
        if (insertError) {
          throw insertError;
        }
      }
    }
    
    // Update sideboard cards if provided
    if (updates.sideboardCards) {
      // Delete existing sideboard cards
      const { error: deleteError } = await supabase
        .from('cards')
        .delete()
        .eq('deck_id', deckId)
        .eq('is_sideboard', true);
        
      if (deleteError) {
        throw deleteError;
      }
      
      // Insert new sideboard cards
      if (updates.sideboardCards.length > 0) {
        const cardsToInsert = updates.sideboardCards.map(card => ({
          deck_id: deckId,
          name: card.name,
          quantity: card.quantity,
          image_url: card.imageUrl,
          scryfall_id: card.scryfallId,
          is_sideboard: true
        }));
        
        const { error: insertError } = await supabase
          .from('cards')
          .insert(cardsToInsert);
          
        if (insertError) {
          throw insertError;
        }
      }
    }
    
    // Return the updated deck
    const updatedDeck = await getDeckById(deckId);
    if (!updatedDeck) {
      throw new Error('Failed to fetch the updated deck');
    }
    return updatedDeck;
  } catch (error) {
    console.error('Error updating deck:', error);
    throw error;
  }
}

export async function deleteDeck(deckId: string): Promise<void> {
  try {
    // Delete all cards associated with the deck
    const { error: cardsError } = await supabase
      .from('cards')
      .delete()
      .eq('deck_id', deckId);
      
    if (cardsError) {
      throw cardsError;
    }
    
    // Delete the deck itself
    const { error: deckError } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId);
      
    if (deckError) {
      throw deckError;
    }
  } catch (error) {
    console.error('Error deleting deck:', error);
    throw error;
  }
}

// Functions for UserEvents
export async function getUserEvents(): Promise<UserEvent[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error('No user logged in');
    }
    
    // Get user events
    const { data, error } = await supabase
      .from('user_events')
      .select('*')
      .eq('user_id', userData.user.id);
    
    if (error) {
      console.error('Error fetching user events:', error);
      return [];
    }
    
    // Convert raw data to UserEvent type with proper type checking
    const userEvents: UserEvent[] = [];
    
    if (data && Array.isArray(data)) {
      data.forEach((event) => {
        userEvents.push({
          id: event.id,
          name: event.name,
          date: event.date,
          games: [], // We'll populate this with an additional query if needed
          userId: event.user_id
        });
      });
    }
    
    return userEvents;
  } catch (error) {
    console.error('Error getting user events:', error);
    return [];
  }
}

export async function createUserEvent(event: Partial<UserEvent>): Promise<UserEvent> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error('No user logged in');
    }
    
    // Insert new event
    const { data, error } = await supabase
      .from('user_events')
      .insert([{
        name: event.name || '',
        date: event.date || new Date().toISOString(),
        user_id: userData.user.id
      }])
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from event creation');
    }
    
    return {
      id: data.id,
      name: data.name,
      date: data.date,
      games: [],
      userId: data.user_id
    };
  } catch (error) {
    console.error('Error creating user event:', error);
    throw error;
  }
}

export async function updateUserEvent(eventId: string, updates: Partial<UserEvent>): Promise<UserEvent> {
  try {
    // Update event
    const { data, error } = await supabase
      .from('user_events')
      .update({
        name: updates.name,
        date: updates.date
      })
      .eq('id', eventId)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from event update');
    }
    
    return {
      id: data.id,
      name: data.name,
      date: data.date,
      games: [],
      userId: data.user_id
    };
  } catch (error) {
    console.error('Error updating user event:', error);
    throw error;
  }
}

export async function deleteUserEvent(eventId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_events')
      .delete()
      .eq('id', eventId);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting user event:', error);
    throw error;
  }
}

export async function getUserGames(): Promise<GameResult[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error('No user logged in');
    }
    
    // Get user games
    const { data, error } = await supabase
      .from('game_results')
      .select('*')
      .eq('user_id', userData.user.id);
      
    if (error) {
      throw error;
    }
    
    // Convert raw data to GameResult type with proper type checking
    const gameResults: GameResult[] = [];
    
    if (data && Array.isArray(data)) {
      data.forEach((game) => {
        // Parse match_score if it exists
        let matchScore = undefined;
        if (game.match_score) {
          try {
            matchScore = game.match_score as {
              playerWins: number;
              opponentWins: number;
            };
          } catch (e) {
            console.error('Failed to parse match score:', e);
          }
        }
        
        gameResults.push({
          id: game.id,
          win: game.win,
          opponentDeckName: game.opponent_deck_name,
          opponentDeckFormat: game.opponent_deck_format as EventFormat,
          deckUsed: game.deck_used,
          notes: game.notes,
          eventId: game.event_id,
          date: game.date,
          matchScore: matchScore
        });
      });
    }
    
    return gameResults;
  } catch (error) {
    console.error('Error getting user games:', error);
    return [];
  }
}

export async function createGameResult(gameResult: Omit<GameResult, 'id'>): Promise<GameResult> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error('No user logged in');
    }
    
    // Insert new game result - Fix the type mismatch for match_score
    const { data, error } = await supabase
      .from('game_results')
      .insert({
        event_id: gameResult.eventId,
        win: gameResult.win,
        opponent_deck_name: gameResult.opponentDeckName,
        opponent_deck_format: gameResult.opponentDeckFormat,
        deck_used: gameResult.deckUsed,
        notes: gameResult.notes || '',
        date: gameResult.date || new Date().toISOString(),
        match_score: gameResult.matchScore as unknown as Json,
        user_id: userData.user.id
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from game result creation');
    }
    
    return {
      id: data.id,
      win: data.win,
      opponentDeckName: data.opponent_deck_name,
      opponentDeckFormat: data.opponent_deck_format as EventFormat,
      deckUsed: data.deck_used,
      notes: data.notes,
      eventId: data.event_id,
      date: data.date,
      matchScore: data.match_score as unknown as {
        playerWins: number;
        opponentWins: number;
      } | undefined
    };
  } catch (error) {
    console.error('Error creating game result:', error);
    throw error;
  }
}

export async function getUserStats() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error('No user logged in');
    }
    
    // Get user games
    const { data, error } = await supabase
      .from('game_results')
      .select('*')
      .eq('user_id', userData.user.id);
      
    if (error) {
      throw error;
    }
    
    // Calculate stats
    const games = data || [];
    const totalGames = games.length;
    const wins = games.filter(game => game.win).length;
    const losses = totalGames - wins;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    
    // Calculate stats by format
    const statsByFormat: Record<string, { wins: number, losses: number, totalGames: number, winRate: number }> = {};
    
    if (games.length > 0) {
      games.forEach((game: any) => {
        const format = game.opponent_deck_format || 'Unknown';
        if (!statsByFormat[format]) {
          statsByFormat[format] = { wins: 0, losses: 0, totalGames: 0, winRate: 0 };
        }
        
        statsByFormat[format].totalGames++;
        if (game.win) {
          statsByFormat[format].wins++;
        } else {
          statsByFormat[format].losses++;
        }
        
        statsByFormat[format].winRate = 
          (statsByFormat[format].wins / statsByFormat[format].totalGames) * 100;
      });
    }
    
    return {
      totalGames,
      wins,
      losses,
      winRate,
      statsByFormat
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
}
