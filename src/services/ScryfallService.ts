
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
 * Clean up card name by removing set code, collector number, and special characters
 * Example: "Caves of Koilos (DSC) 268" -> "Caves of Koilos"
 */
const cleanCardName = (cardName: string): string => {
  // First remove anything in parentheses and any numbers/characters that follow
  let cleanedName = cardName.replace(/\s*\([^)]*\)\s*\d*.*$/, '').trim();
  
  // Remove angle brackets and their contents
  cleanedName = cleanedName.replace(/<[^>]*>/g, '').trim();
  
  // Remove square brackets and their contents
  cleanedName = cleanedName.replace(/\[[^\]]*\]/g, '').trim();
  
  return cleanedName;
}

/**
 * Search for cards by name using Scryfall API
 */
export const searchCardByName = async (cardName: string): Promise<ScryfallCard[]> => {
  if (!cardName || cardName.trim().length < 2) {
    return [];
  }
  
  // Clean up the card name first
  const cleanedName = cleanCardName(cardName);
  
  const encodedName = encodeURIComponent(cleanedName);
  console.log(`Searching for card: "${cleanedName}" (original: "${cardName}")`);
  
  // Check if it's a basic land
  if (cleanedName === "Plains" || cleanedName === "Island" || 
      cleanedName === "Swamp" || cleanedName === "Mountain" || 
      cleanedName === "Forest") {
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
  
  // Try exact match search
  try {
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodedName}`);
    if (response.ok) {
      const data = await response.json();
      return [data];
    }
  } catch (error) {
    console.error('Error with exact match search:', error);
  }

  // Try fuzzy search if exact match fails
  try {
    const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodedName}`);
    if (response.ok) {
      const data = await response.json();
      return [data];
    }
  } catch (error) {
    console.error('Error with fuzzy search:', error);
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
  // Extract clean card name if name exists
  const cardName = card.name ? cleanCardName(card.name) : undefined;
  
  // For basic lands, use direct API endpoint
  if (cardName && (cardName === "Plains" || cardName === "Island" || 
      cardName === "Swamp" || cardName === "Mountain" || cardName === "Forest")) {
    return BASIC_LAND_IMAGES[cardName as keyof typeof BASIC_LAND_IMAGES];
  }

  // If we have image_uris, use them directly
  if (card.image_uris && card.image_uris[size]) {
    return card.image_uris[size];
  }

  // For double-faced cards
  if ('card_faces' in card && Array.isArray(card.card_faces) && card.card_faces[0]?.image_uris) {
    return card.card_faces[0].image_uris[size];
  }

  // If we have just the name, use the named endpoint
  if (cardName) {
    return `https://api.scryfall.com/cards/named?format=image&exact=${encodeURIComponent(cardName)}`;
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
  
  // Clean card name to remove set and collector number info
  const cleanedName = cleanCardName(name);
  
  try {
    // Try exact match first
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cleanedName)}`);
    if (response.ok) {
      return await response.json();
    }
    
    // Try fuzzy match if exact fails
    const fuzzyResponse = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cleanedName)}`);
    if (fuzzyResponse.ok) {
      return await fuzzyResponse.json();
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching card by name:', error);
    return null;
  }
};
