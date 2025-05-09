
import { supabase } from "@/integrations/supabase/client";
import { Deck, Card, EventFormat, SideboardGuide, DeckPhoto, ScryfallCard } from "@/types";

// Fetch user's decks
export const getUserDecks = async (): Promise<Deck[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // For each deck, get its cards
    const decksWithCards = await Promise.all(
      data.map(async (deck) => {
        // Get main deck cards
        const { data: mainCards, error: mainError } = await supabase
          .from('cards')
          .select('*')
          .eq('deck_id', deck.id)
          .eq('is_sideboard', false);
        
        if (mainError) throw mainError;
        
        // Get sideboard cards
        const { data: sideboardCards, error: sideboardError } = await supabase
          .from('cards')
          .select('*')
          .eq('deck_id', deck.id)
          .eq('is_sideboard', true);
        
        if (sideboardError) throw sideboardError;
        
        // Transform to our app's structure
        return {
          id: deck.id,
          name: deck.name,
          format: deck.format as EventFormat,
          userId: deck.user_id,
          createdAt: deck.created_at,
          updatedAt: deck.updated_at,
          cardBackgroundUrl: deck.card_background_url,
          cards: mainCards.map((card) => ({
            id: card.id,
            name: card.name,
            quantity: card.quantity,
            imageUrl: card.image_url,
            scryfallId: card.scryfall_id
          })),
          sideboardCards: sideboardCards.map((card) => ({
            id: card.id,
            name: card.name,
            quantity: card.quantity,
            imageUrl: card.image_url,
            scryfallId: card.scryfall_id
          }))
        };
      })
    );
    
    return decksWithCards;
  } catch (error) {
    console.error('Error fetching decks:', error);
    throw error;
  }
};

// Get a specific deck by ID
export const getDeckById = async (deckId: string): Promise<Deck | null> => {
  try {
    const { data: deck, error } = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .maybeSingle();
    
    if (error) throw error;
    if (!deck) return null;
    
    // Get main deck cards
    const { data: mainCards, error: mainError } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', deckId)
      .eq('is_sideboard', false);
    
    if (mainError) throw mainError;
    
    // Get sideboard cards
    const { data: sideboardCards, error: sideboardError } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', deckId)
      .eq('is_sideboard', true);
    
    if (sideboardError) throw sideboardError;
    
    return {
      id: deck.id,
      name: deck.name,
      format: deck.format as EventFormat,
      userId: deck.user_id,
      createdAt: deck.created_at,
      updatedAt: deck.updated_at,
      cardBackgroundUrl: deck.card_background_url,
      cards: mainCards.map((card) => ({
        id: card.id,
        name: card.name,
        quantity: card.quantity,
        imageUrl: card.image_url,
        scryfallId: card.scryfall_id
      })),
      sideboardCards: sideboardCards.map((card) => ({
        id: card.id,
        name: card.name,
        quantity: card.quantity,
        imageUrl: card.image_url,
        scryfallId: card.scryfall_id
      }))
    };
  } catch (error) {
    console.error(`Error fetching deck with ID ${deckId}:`, error);
    throw error;
  }
};

// Create a new deck
export const createDeck = async (
  deck: Pick<Deck, 'name' | 'format'> & { cards?: Card[], sideboardCards?: Card[] }
): Promise<Deck> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');
    
    // Create the deck
    const { data: newDeck, error } = await supabase
      .from('decks')
      .insert({
        name: deck.name,
        format: deck.format,
        user_id: userData.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const cardsToInsert = [];
    
    // Add main deck cards if provided
    if (deck.cards && deck.cards.length > 0) {
      for (const card of deck.cards) {
        cardsToInsert.push({
          deck_id: newDeck.id,
          name: card.name,
          quantity: card.quantity,
          image_url: card.imageUrl,
          scryfall_id: card.scryfallId,
          is_sideboard: false
        });
      }
    }
    
    // Add sideboard cards if provided
    if (deck.sideboardCards && deck.sideboardCards.length > 0) {
      for (const card of deck.sideboardCards) {
        cardsToInsert.push({
          deck_id: newDeck.id,
          name: card.name,
          quantity: card.quantity,
          image_url: card.imageUrl,
          scryfall_id: card.scryfallId,
          is_sideboard: true
        });
      }
    }
    
    // Insert cards if we have any
    if (cardsToInsert.length > 0) {
      const { error: cardsError } = await supabase
        .from('cards')
        .insert(cardsToInsert);
      
      if (cardsError) throw cardsError;
    }
    
    // Return the created deck
    return {
      id: newDeck.id,
      name: newDeck.name,
      format: newDeck.format as EventFormat,
      userId: newDeck.user_id,
      createdAt: newDeck.created_at,
      updatedAt: newDeck.updated_at,
      cardBackgroundUrl: newDeck.card_background_url,
      cards: deck.cards || [],
      sideboardCards: deck.sideboardCards || []
    };
  } catch (error) {
    console.error('Error creating deck:', error);
    throw error;
  }
};

// Update a deck
export const updateDeck = async (
  deckId: string,
  updates: Partial<Pick<Deck, 'name' | 'format' | 'cardBackgroundUrl'>>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('decks')
      .update({
        name: updates.name,
        format: updates.format,
        card_background_url: updates.cardBackgroundUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', deckId);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error updating deck with ID ${deckId}:`, error);
    throw error;
  }
};

// Delete a deck
export const deleteDeck = async (deckId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting deck with ID ${deckId}:`, error);
    throw error;
  }
};

// Add a card to a deck
export const addCardToDeck = async (
  deckId: string,
  card: Omit<Card, 'id'>,
  isSideboard: boolean = false
): Promise<Card> => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .insert({
        deck_id: deckId,
        name: card.name,
        quantity: card.quantity,
        image_url: card.imageUrl,
        scryfall_id: card.scryfallId,
        is_sideboard: isSideboard
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      quantity: data.quantity,
      imageUrl: data.image_url,
      scryfallId: data.scryfall_id
    };
  } catch (error) {
    console.error(`Error adding card to deck with ID ${deckId}:`, error);
    throw error;
  }
};

// Update a card in a deck
export const updateCard = async (
  cardId: string,
  updates: Partial<Pick<Card, 'quantity'>>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cards')
      .update({ quantity: updates.quantity })
      .eq('id', cardId);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error updating card with ID ${cardId}:`, error);
    throw error;
  }
};

// Remove a card from a deck
export const removeCardFromDeck = async (cardId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error removing card with ID ${cardId}:`, error);
    throw error;
  }
};
