
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
}

// Identificadores específicos para tierras básicas
const BASIC_LAND_ORACLES = {
  'Plains': '56719f6a-dc9c-4ff5-988f-9dab3f54a1be',
  'Island': '0c20398a-113a-4541-a993-6d3bf3f09999',
  'Swamp': '30add6e1-c1e0-4927-ae19-aec706b32dc3',
  'Mountain': '93f1803c-0c55-4573-bc96-bafa9ccbd8fb',
  'Forest': '8f683968-8826-47cd-8c15-8ef33c6fc7bf'
};

export const searchCardByName = async (cardName: string): Promise<ScryfallCard[]> => {
  try {
    if (!cardName || cardName.trim().length < 2) {
      return [];
    }
    
    const encodedName = encodeURIComponent(cardName.trim());
    
    // Check if it's a basic land
    const normalizedCardName = cardName.trim().toLowerCase();
    const basicLandMatch = Object.keys(BASIC_LAND_ORACLES).find(
      land => land.toLowerCase().includes(normalizedCardName)
    );
    
    if (basicLandMatch) {
      // For basic lands, search by oracle_id to get the latest version
      const oracleId = BASIC_LAND_ORACLES[basicLandMatch as keyof typeof BASIC_LAND_ORACLES];
      const response = await fetch(
        `https://api.scryfall.com/cards/oracle/${oracleId}`
      );
      
      if (!response.ok) {
        console.error(`Failed to fetch basic land: ${basicLandMatch}`, response.statusText);
        throw new Error('Error fetching basic land data');
      }
      
      const data = await response.json();
      return [data];
    }
    
    // For all other cards, use a more robust search approach
    
    // Try an autocomplete search first (faster and more likely to find cards)
    try {
      const autocompleteResponse = await fetch(
        `https://api.scryfall.com/cards/autocomplete?q=${encodedName}`
      );
      
      if (autocompleteResponse.ok) {
        const autocompleteData = await autocompleteResponse.json();
        
        // If we have autocomplete results, search for the first one
        if (autocompleteData.data && autocompleteData.data.length > 0) {
          // Use the first result from autocomplete to get the full card
          const exactCardName = encodeURIComponent(autocompleteData.data[0]);
          const exactResponse = await fetch(
            `https://api.scryfall.com/cards/named?exact=${exactCardName}`
          );
          
          if (exactResponse.ok) {
            const exactData = await exactResponse.json();
            console.log("Found card with images:", exactData.name, exactData.image_uris || exactData.card_faces?.[0]?.image_uris);
            return [exactData];
          }
        }
      }
    } catch (error) {
      console.log('Autocomplete search failed, trying direct search');
    }
    
    // If autocomplete didn't work, try an exact match
    try {
      const exactResponse = await fetch(
        `https://api.scryfall.com/cards/named?exact=${encodedName}`
      );
      
      if (exactResponse.ok) {
        const data = await exactResponse.json();
        console.log("Exact match found for:", data.name, data.image_uris || data.card_faces?.[0]?.image_uris);
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
        console.log("Fuzzy match found for:", data.name, data.image_uris || data.card_faces?.[0]?.image_uris);
        return [data];
      }
    } catch (error) {
      console.log('Fuzzy search failed, trying general search');
    }
    
    // If both exact and fuzzy fail, try a more general search
    const searchResponse = await fetch(
      `https://api.scryfall.com/cards/search?q=${encodedName}`
    );
    
    if (!searchResponse.ok) {
      // Try an even more lenient search if all else fails
      const fallbackResponse = await fetch(
        `https://api.scryfall.com/cards/search?q=name:${encodedName}`
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

export const getCardImageUrl = (card: ScryfallCard, size: 'small' | 'normal' | 'large' = 'normal'): string => {
  if (!card) {
    console.log("No card provided to getCardImageUrl");
    return 'https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
  }

  console.log("Getting image URL for card:", card.name);

  // Handle double-faced cards
  if (!card.image_uris && card.card_faces && card.card_faces[0]?.image_uris) {
    const imageUrl = card.card_faces[0].image_uris?.[size];
    console.log("Using double-faced card front image:", imageUrl);
    return imageUrl || 'https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
  }
  
  // Handle regular cards
  if (card.image_uris && card.image_uris[size]) {
    console.log("Using standard card image:", card.image_uris[size]);
    return card.image_uris[size];
  }
  
  // Fallback to other size if requested size is not available
  if (card.image_uris) {
    const fallback = card.image_uris.normal || card.image_uris.small || card.image_uris.large || card.image_uris.png;
    console.log("Using fallback card image:", fallback);
    return fallback || 'https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
  }
  
  // Ultimate fallback
  console.log("No suitable image found, using card back");
  return 'https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
};

// Function to search for basic lands by specific name
export const getBasicLand = async (landName: string): Promise<ScryfallCard | null> => {
  const normalizedName = landName.trim();
  const basicLandMatch = Object.keys(BASIC_LAND_ORACLES).find(
    land => land.toLowerCase().includes(normalizedName.toLowerCase())
  );
  
  if (!basicLandMatch) {
    return null;
  }
  
  try {
    const oracleId = BASIC_LAND_ORACLES[basicLandMatch as keyof typeof BASIC_LAND_ORACLES];
    const response = await fetch(`https://api.scryfall.com/cards/oracle/${oracleId}`);
    
    if (!response.ok) {
      console.error(`Error fetching basic land: ${basicLandMatch}`, response.statusText);
      throw new Error(`Error fetching basic land: ${basicLandMatch}`);
    }
    
    const data = await response.json();
    console.log("Basic land image URL:", data.image_uris?.normal);
    return data;
  } catch (error) {
    console.error('Error fetching basic land:', error);
    return null;
  }
};
