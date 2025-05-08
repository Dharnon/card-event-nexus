
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
  'Forest': '8f683968-8826-47cd-8c15-dotfaq1c033e'
};

export const searchCardByName = async (cardName: string): Promise<ScryfallCard[]> => {
  try {
    // Comprobamos si es una tierra básica
    const normalizedCardName = cardName.trim().toLowerCase();
    const basicLandMatch = Object.keys(BASIC_LAND_ORACLES).find(
      land => land.toLowerCase() === normalizedCardName
    );
    
    if (basicLandMatch) {
      // Para tierras básicas, buscamos por oracle_id para obtener la versión más reciente
      const oracleId = BASIC_LAND_ORACLES[basicLandMatch as keyof typeof BASIC_LAND_ORACLES];
      const response = await fetch(
        `https://api.scryfall.com/cards/oracle/${oracleId}`
      );
      
      if (!response.ok) {
        throw new Error('Error fetching basic land data');
      }
      
      const data = await response.json();
      return [data];
    }
    
    // Para cartas normales, usamos el parámetro "exact" para buscar coincidencias exactas primero
    const encodedName = encodeURIComponent(cardName);
    const response = await fetch(
      `https://api.scryfall.com/cards/search?q=name:"${encodedName}" OR name:${encodedName}`
    );
    
    if (!response.ok) {
      // Si no hay resultados exactos, intentamos una búsqueda más amplia
      const fuzzyResponse = await fetch(
        `https://api.scryfall.com/cards/search?q=name:/^${encodedName}/`
      );
      
      if (!fuzzyResponse.ok) {
        console.error('No cards found with that name');
        return [];
      }
      
      const data = await fuzzyResponse.json();
      return data.data;
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

// Función adicional para buscar tierras básicas por nombre específico
export const getBasicLand = async (landName: string): Promise<ScryfallCard | null> => {
  const normalizedName = landName.trim();
  const basicLandMatch = Object.keys(BASIC_LAND_ORACLES).find(
    land => land === normalizedName
  );
  
  if (!basicLandMatch) {
    return null;
  }
  
  try {
    const oracleId = BASIC_LAND_ORACLES[basicLandMatch as keyof typeof BASIC_LAND_ORACLES];
    const response = await fetch(`https://api.scryfall.com/cards/oracle/${oracleId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching basic land: ${basicLandMatch}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching basic land:', error);
    return null;
  }
};
