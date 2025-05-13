
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

// Identificadores específicos para tierras básicas
const BASIC_LAND_ORACLES = {
  'Plains': '56719f6a-dc9c-4ff5-988f-9dab3f54a1be',
  'Island': '0c20398a-113a-4541-a993-6d3bf3f09999',
  'Swamp': '30add6e1-c1e0-4927-ae19-aec706b32dc3',
  'Mountain': '93f1803c-0c55-4573-bc96-bafa9ccbd8fb',
  'Forest': '8f683968-8826-47cd-8c15-8ef33c6fc7bf'
};

// Fixed basic land image URLs that are guaranteed to work
const BASIC_LAND_IMAGES = {
  'Plains': "https://cards.scryfall.io/normal/front/5/f/5fc26aa1-58b9-41b5-95b4-7e9bf2309b54.jpg",
  'Island': "https://cards.scryfall.io/normal/front/d/c/dc41cb44-ebdb-4a58-b95e-c4c4cded7033.jpg",
  'Swamp': "https://cards.scryfall.io/normal/front/8/3/83249211-164c-456c-8bda-ca3a607ada7e.jpg", 
  'Mountain': "https://cards.scryfall.io/normal/front/4/4/44c1a862-00fc-4e79-a83a-289fef81503a.jpg",
  'Forest': "https://cards.scryfall.io/normal/front/c/f/cfb41b34-4037-4a3c-9a6d-def7bfda5635.jpg"
};

/**
 * Search for cards by name using Scryfall API
 */
export const searchCardByName = async (cardName: string): Promise<ScryfallCard[]> => {
  try {
    if (!cardName || cardName.trim().length < 2) {
      return [];
    }
    
    const encodedName = encodeURIComponent(cardName.trim());
    console.log(`Searching for card: "${cardName.trim()}"`);
    
    // Check if it's a basic land
    const normalizedCardName = cardName.trim().toLowerCase();
    const basicLandMatch = Object.keys(BASIC_LAND_ORACLES).find(
      land => land.toLowerCase().includes(normalizedCardName)
    );
    
    if (basicLandMatch) {
      // For basic lands, use direct image URLs
      console.log(`Found basic land match: ${basicLandMatch}`);
      const oracleId = BASIC_LAND_ORACLES[basicLandMatch as keyof typeof BASIC_LAND_ORACLES];
      
      // Use scryfall API to get latest version
      const response = await fetch(
        `https://api.scryfall.com/cards/oracle/${oracleId}`
      );
      
      if (!response.ok) {
        console.error(`Failed to fetch basic land: ${basicLandMatch}`, response.statusText);
        
        // Create a synthetic card with known image URL as fallback
        const fallbackCard: ScryfallCard = {
          id: `basic-land-${basicLandMatch.toLowerCase()}`,
          name: basicLandMatch,
          type_line: `Basic Land — ${basicLandMatch}`,
          image_uris: {
            small: BASIC_LAND_IMAGES[basicLandMatch as keyof typeof BASIC_LAND_IMAGES],
            normal: BASIC_LAND_IMAGES[basicLandMatch as keyof typeof BASIC_LAND_IMAGES],
            large: BASIC_LAND_IMAGES[basicLandMatch as keyof typeof BASIC_LAND_IMAGES],
            png: BASIC_LAND_IMAGES[basicLandMatch as keyof typeof BASIC_LAND_IMAGES],
            art_crop: BASIC_LAND_IMAGES[basicLandMatch as keyof typeof BASIC_LAND_IMAGES],
            border_crop: BASIC_LAND_IMAGES[basicLandMatch as keyof typeof BASIC_LAND_IMAGES],
          }
        };
        return [fallbackCard];
      }
      
      const data = await response.json();
      console.log("Basic land data:", data.name, "Image URL:", data.image_uris?.normal);
      return [data];
    }
    
    // Try an autocomplete search first (faster and more likely to find cards)
    try {
      const autocompleteResponse = await fetch(
        `https://api.scryfall.com/cards/autocomplete?q=${encodedName}`
      );
      
      if (autocompleteResponse.ok) {
        const autocompleteData = await autocompleteResponse.json();
        console.log("Autocomplete results:", autocompleteData.data);
        
        // If we have autocomplete results, search for the first one
        if (autocompleteData.data && autocompleteData.data.length > 0) {
          // Use the first result from autocomplete to get the full card
          const exactCardName = encodeURIComponent(autocompleteData.data[0]);
          const exactResponse = await fetch(
            `https://api.scryfall.com/cards/named?exact=${exactCardName}`
          );
          
          if (exactResponse.ok) {
            const exactData = await exactResponse.json();
            console.log("Found card:", exactData.name);
            console.log("Card details:", {
              id: exactData.id,
              name: exactData.name,
              set: exactData.set,
              set_name: exactData.set_name,
              collector_number: exactData.collector_number
            });
            return [exactData];
          }
        }
      }
    } catch (error) {
      console.log('Autocomplete search failed, trying direct search');
    }
    
    // Try an exact match
    try {
      const exactResponse = await fetch(
        `https://api.scryfall.com/cards/named?exact=${encodedName}`
      );
      
      if (exactResponse.ok) {
        const data = await exactResponse.json();
        console.log("Exact match found for:", data.name);
        console.log("Card details:", {
          id: data.id,
          name: data.name,
          set: data.set,
          set_name: data.set_name,
          collector_number: data.collector_number
        });
        return [data];
      }
    } catch (error) {
      console.log('Exact match not found, trying fuzzy search');
    }
    
    // Then try fuzzy search if exact match fails
    try {
      const fuzzyResponse = await fetch(
        `https://api.scryfall.com/cards/named?fuzzy=${encodedName}`
      );
      
      if (fuzzyResponse.ok) {
        const data = await fuzzyResponse.json();
        console.log("Fuzzy match found for:", data.name);
        return [data];
      }
    } catch (error) {
      console.log('Fuzzy search failed, trying general search');
    }
    
    // If both exact and fuzzy fail, try a more general search
    const searchResponse = await fetch(
      `https://api.scryfall.com/cards/search?q=name:${encodedName}`
    );
    
    if (!searchResponse.ok) {
      // Try an even more lenient search if all else fails
      const fallbackResponse = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodedName}`
      );
      
      if (!fallbackResponse.ok) {
        console.error('No cards found with that name');
        return [];
      }
      
      const data = await fallbackResponse.json();
      console.log(`Found ${data.data.length} cards in fallback search`);
      return data.data.slice(0, 8); // Limit to 8 results for better mobile experience
    }
    
    const data = await searchResponse.json();
    console.log(`Found ${data.data.length} cards in general search`);
    return data.data.slice(0, 8); // Limit to 8 results for better mobile experience
  } catch (error) {
    console.error('Error searching for card:', error);
    return [];
  }
};

/**
 * Get card image URL from a ScryfallCard object or by set and collector number
 */
export const getCardImageUrl = (card: ScryfallCard | {set?: string, collector_number?: string, name?: string}, size: 'small' | 'normal' | 'large' = 'normal'): string => {
  if (!card) {
    console.log("No card provided to getCardImageUrl");
    return 'https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
  }

  // For basic lands, use our guaranteed working URLs
  if (card.name && (card.name === "Plains" || card.name === "Island" || card.name === "Swamp" || 
      card.name === "Mountain" || card.name === "Forest")) {
    const basicLandUrl = BASIC_LAND_IMAGES[card.name as keyof typeof BASIC_LAND_IMAGES];
    console.log(`Using fixed basic land image for ${card.name}:`, basicLandUrl);
    return basicLandUrl;
  }

  // Try to construct a direct URL using set and collector number if available
  if (card.set && card.collector_number) {
    try {
      // Use direct Scryfall CDN URL format which is more reliable
      // Format: https://cards.scryfall.io/{size}/{front_or_back}/{set}/{collector_number}.jpg
      const directUrl = `https://cards.scryfall.io/${size}/front/${card.set}/${card.collector_number}.jpg`;
      console.log(`Generated direct Scryfall CDN URL for ${card.name || 'card'}:`, directUrl);
      return directUrl;
    } catch (e) {
      console.log(`Could not generate direct URL for ${card.name || 'card'}, falling back to image_uris`);
      // Continue to next method if this fails
    }
  }

  // For ScryfallCard objects only
  if ('image_uris' in card || 'card_faces' in card) {
    // Handle double-faced cards
    if (!card.image_uris && card.card_faces && card.card_faces[0]?.image_uris) {
      const imageUrl = card.card_faces[0].image_uris?.[size];
      console.log(`Using double-faced card front image for ${card.name}:`, imageUrl);
      return imageUrl || 'https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
    }
    
    // Handle regular cards
    if (card.image_uris && card.image_uris[size]) {
      console.log(`Using standard card image for ${card.name}:`, card.image_uris[size]);
      return card.image_uris[size];
    }
    
    // Fallback to other size if requested size is not available
    if (card.image_uris) {
      const fallback = card.image_uris.normal || card.image_uris.small || card.image_uris.large || card.image_uris.png;
      console.log(`Using fallback card image for ${card.name}:`, fallback);
      return fallback || 'https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
    }
  }
  
  // Ultimate fallback - try to look up card image by name if possible
  if (card.name) {
    console.log(`No suitable image found for ${card.name}, attempting to generate URL by name`);
    return `https://api.scryfall.com/cards/named?format=image&exact=${encodeURIComponent(card.name)}`;
  }
  
  // Card back as last resort
  console.log(`No suitable image found, using card back`);
  return 'https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
};

/**
 * Get a specific card by set and collector number
 */
export const getCardBySetAndNumber = async (set: string, collectorNumber: string): Promise<ScryfallCard | null> => {
  try {
    const response = await fetch(`https://api.scryfall.com/cards/${set}/${collectorNumber}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch card with set ${set} and collector number ${collectorNumber}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching card by set and number:', error);
    return null;
  }
};

/**
 * Search for basic lands by specific name
 */
export const getBasicLand = async (landName: string): Promise<ScryfallCard | null> => {
  const normalizedName = landName.trim();
  const basicLandMatch = Object.keys(BASIC_LAND_ORACLES).find(
    land => land.toLowerCase().includes(normalizedName.toLowerCase())
  );
  
  if (!basicLandMatch) {
    return null;
  }
  
  try {
    // Create a synthetic basic land card with reliable image URL
    const basicLandCard: ScryfallCard = {
      id: `basic-land-${basicLandMatch.toLowerCase()}`,
      name: basicLandMatch,
      type_line: `Basic Land — ${basicLandMatch}`,
      image_uris: {
        small: BASIC_LAND_IMAGES[basicLandMatch as keyof typeof BASIC_LAND_IMAGES],
        normal: BASIC_LAND_IMAGES[basicLandMatch as keyof typeof BASIC_LAND_IMAGES],
        large: BASIC_LAND_IMAGES[basicLandMatch as keyof typeof BASIC_LAND_IMAGES],
        png: BASIC_LAND_IMAGES[basicLandMatch as keyof typeof BASIC_LAND_IMAGES],
        art_crop: BASIC_LAND_IMAGES[basicLandMatch as keyof typeof BASIC_LAND_IMAGES],
        border_crop: BASIC_LAND_IMAGES[basicLandMatch as keyof typeof BASIC_LAND_IMAGES],
      }
    };
    
    // Also try to get the latest version from Scryfall
    try {
      const oracleId = BASIC_LAND_ORACLES[basicLandMatch as keyof typeof BASIC_LAND_ORACLES];
      const response = await fetch(`https://api.scryfall.com/cards/oracle/${oracleId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Got basic land ${basicLandMatch} from Scryfall API:`, data.name);
        console.log("Basic land image URL:", data.image_uris?.normal);
        return data;
      }
    } catch (error) {
      console.log(`Error getting ${basicLandMatch} from API, using synthetic card`);
    }
    
    // Return our synthetic card as fallback
    return basicLandCard;
  } catch (error) {
    console.error('Error fetching basic land:', error);
    return null;
  }
};

/**
 * Generate direct image URL by set and collector number
 */
export const getCardImageBySetAndNumber = (set: string, collectorNumber: string, size: 'small' | 'normal' | 'large' = 'normal'): string => {
  return `https://cards.scryfall.io/${size}/front/${set}/${collectorNumber}.jpg`;
};

/**
 * Get the default printing of a card by name
 */
export const getCardByName = async (cardName: string): Promise<ScryfallCard | null> => {
  if (!cardName || cardName.trim() === '') {
    return null;
  }

  try {
    const encodedName = encodeURIComponent(cardName.trim());
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodedName}`);
    
    if (!response.ok) {
      // Try fuzzy search if exact fails
      const fuzzyResponse = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodedName}`);
      
      if (!fuzzyResponse.ok) {
        return null;
      }
      
      return await fuzzyResponse.json();
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching card "${cardName}":`, error);
    return null;
  }
};

/**
 * Get a direct image URL for a card by name
 */
export const getCardImageByName = (cardName: string, size: 'small' | 'normal' | 'large' = 'normal'): string => {
  if (!cardName || cardName.trim() === '') {
    return 'https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
  }
  
  // For basic lands, use our guaranteed working URLs
  if (cardName === "Plains" || cardName === "Island" || cardName === "Swamp" || 
      cardName === "Mountain" || cardName === "Forest") {
    return BASIC_LAND_IMAGES[cardName as keyof typeof BASIC_LAND_IMAGES];
  }
  
  // Generate direct Scryfall API image URL
  return `https://api.scryfall.com/cards/named?format=image&version=${size}&exact=${encodeURIComponent(cardName)}`;
};
