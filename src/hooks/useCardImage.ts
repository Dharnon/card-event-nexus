
import { useState, useEffect } from 'react';

interface UseCardImageProps {
  name?: string;
  set?: string;
  collectorNumber?: string;
  imageUrl?: string;
}

export const useCardImage = ({ name, set, collectorNumber, imageUrl }: UseCardImageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [finalImageUrl, setFinalImageUrl] = useState<string | undefined>(imageUrl);

  // Get the most reliable image URL based on available data
  const getImageUrl = (): string => {
    // If we already have an imageUrl, use it first
    if (imageUrl) return imageUrl;
    
    // If we have set and collector number, generate a direct URL
    if (set && collectorNumber) {
      return `https://api.scryfall.com/cards/${set}/${collectorNumber}?format=image`;
    }
    
    // If we only have a name, use the API to get the image
    if (name) {
      return `https://api.scryfall.com/cards/named?format=image&exact=${encodeURIComponent(name)}`;
    }
    
    // Default to card back if we don't have any info
    return 'https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
  };

  // Initialize image URL
  useEffect(() => {
    if (!finalImageUrl || (imageUrl && imageUrl !== finalImageUrl)) {
      setFinalImageUrl(getImageUrl());
      setIsLoading(true);
      setError(false);
    }
  }, [name, set, collectorNumber, imageUrl]);

  return {
    imageUrl: finalImageUrl,
    isLoading,
    setIsLoading,
    error,
    setError
  };
};
