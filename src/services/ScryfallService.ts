
// ScryfallService.ts
export interface ScryfallCard {
  id: string;
  name: string;
  type_line?: string;
  oracle_id?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  card_faces?: Array<{
    name?: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
      png: string;
      art_crop: string;
      border_crop: string;
    }
  }>;
  set?: string;
  set_name?: string;
  collector_number?: string;
  rarity?: string;
  prices?: {
    usd?: string;
    eur?: string;
  };
}

// Basic land image URLs - guaranteed to work
const BASIC_LAND_IMAGES = {
  'Plains': "https://api.scryfall.com/cards/named?format=image&exact=Plains",
  'Island': "https://api.scryfall.com/cards/named?format=image&exact=Island",
  'Swamp': "https://api.scryfall.com/cards/named?format=image&exact=Swamp",
  'Mountain': "https://api.scryfall.com/cards/named?format=image&exact=Mountain",
  'Forest': "https://api.scryfall.com/cards/named?format=image&exact=Forest"
};

/**
 * Search for cards by name using Scryfall API
 */
export const searchCardByName = async (cardName: string): Promise<ScryfallCard[]> => {
  if (!cardName || cardName.trim().length < 2) {
    return [];
  }
    
  const encodedName = encodeURIComponent(cardName.trim());
  console.log(`Searching for card: "${cardName.trim()}"`);
    
  // Check if it's a basic land
  if (cardName.trim() === "Plains" || cardName.trim() === "Island" || 
      cardName.trim() === "Swamp" || cardName.trim() === "Mountain" || 
      cardName.trim() === "Forest") {
    try {
      const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodedName}`);
      if (response.ok) {
        const data = await response.json();
        return [data];
      }
    } catch (error) {
      console.error('Error fetching basic land:', error);
    }
  }
    
  // Try an autocomplete search first
  try {
    const response = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodedName}`);
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const exactName = encodeURIComponent(data.data[0]);
        const cardResponse = await fetch(`https://api.scryfall.com/cards/named?exact=${exactName}`);
        if (cardResponse.ok) {
          const cardData = await cardResponse.json();
          return [cardData];
        }
      }
    }
  } catch (error) {
    console.error('Error with autocomplete search:', error);
  }

  // Try direct search
  try {
    const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodedName}`);
    if (response.ok) {
      const data = await response.json();
      return [data];
    }
  } catch (error) {
    console.error('Error with direct search:', error);
  }

  // Fallback to general search
  try {
    const response = await fetch(`https://api.scryfall.com/cards/search?q=name:${encodedName}`);
    if (response.ok) {
      const data = await response.json();
      return data.data.slice(0, 8);
    }
  } catch (error) {
    console.error('Error with general search:', error);
  }

  return [];
};

/**
 * Get card image URL based on available card data
 */
export const getCardImageUrl = (card: {name?: string, set?: string, collector_number?: string, image_uris?: any}, size: 'small' | 'normal' | 'large' = 'normal'): string => {
  // For basic lands, use direct API endpoint
  if (card.name && (card.name === "Plains" || card.name === "Island" || card.name === "Swamp" || 
      card.name === "Mountain" || card.name === "Forest")) {
    return BASIC_LAND_IMAGES[card.name as keyof typeof BASIC_LAND_IMAGES];
  }

  // If we have image_uris, use them directly
  if (card.image_uris && card.image_uris[size]) {
    return card.image_uris[size];
  }

  // For double-faced cards
  if ('card_faces' in card && Array.isArray(card.card_faces) && card.card_faces[0]?.image_uris) {
    return card.card_faces[0].image_uris[size];
  }

  // If we have set and collector number, use the direct API endpoint
  if (card.set && card.collector_number) {
    return `https://api.scryfall.com/cards/${card.set}/${card.collector_number}?format=image&version=${size}`;
  }

  // If we have just the name, use the named endpoint
  if (card.name) {
    return `https://api.scryfall.com/cards/named?format=image&exact=${encodeURIComponent(card.name)}`;
  }

  // Default to card back
  return 'https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
};

/**
 * Get a card by set and collector number
 */
export const getCardBySetAndNumber = async (set: string, collectorNumber: string): Promise<ScryfallCard | null> => {
  try {
    const response = await fetch(`https://api.scryfall.com/cards/${set}/${collectorNumber}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching card by set/number:', error);
    return null;
  }
};

/**
 * Get a card by name
 */
export const getCardByName = async (name: string): Promise<ScryfallCard | null> => {
  if (!name) return null;
  
  try {
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`);
    if (!response.ok) {
      const fuzzyResponse = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`);
      if (!fuzzyResponse.ok) return null;
      return await fuzzyResponse.json();
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching card by name:', error);
    return null;
  }
};
