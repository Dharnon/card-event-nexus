
// ScryfallService.ts
export interface ScryfallCard {
  id: string;
  name: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  card_faces?: Array<{
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

export const searchCardByName = async (cardName: string): Promise<ScryfallCard[]> => {
  try {
    const response = await fetch(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(cardName)}`
    );
    
    if (!response.ok) {
      throw new Error('Error fetching card data');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error searching for card:', error);
    return [];
  }
};

export const getCardImageUrl = (card: ScryfallCard, size: 'small' | 'normal' | 'large' = 'normal'): string => {
  // Handle double-faced cards
  if (!card.image_uris && card.card_faces && card.card_faces[0].image_uris) {
    return card.card_faces[0].image_uris[size];
  }
  
  // Handle regular cards
  if (card.image_uris) {
    return card.image_uris[size];
  }
  
  // Fallback
  return 'https://c2.scryfall.com/file/scryfall-card-backs/large/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
};
