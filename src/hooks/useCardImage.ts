
import { useState, useEffect } from 'react';
import { getCardImageUrl } from '@/services/ScryfallService';

interface UseCardImageProps {
  name?: string;
  set?: string;
  collectorNumber?: string;
  imageUrl?: string;
}

export const useCardImage = ({ name, set, collectorNumber, imageUrl }: UseCardImageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [finalImageUrl, setFinalImageUrl] = useState<string | undefined>(imageUrl);

  // Get the most reliable image URL based on available data
  const getOptimalImageUrl = (): string => {
    // If we already have an imageUrl, use it first
    if (imageUrl) return imageUrl;
    
    // If we have set and collector number, generate a direct URL
    if (set && collectorNumber) {
      return `https://cards.scryfall.io/normal/front/${set}/${collectorNumber}.jpg`;
    }
    
    // If we only have a name, use the API to get the image
    if (name) {
      return `https://api.scryfall.com/cards/named?format=image&exact=${encodeURIComponent(name)}`;
    }
    
    // Default to card back if we don't have any info
    return 'https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
  };

  const retryWithAlternative = () => {
    if (retryCount < 3) {
      setError(false);
      setIsLoading(true);
      setRetryCount(prev => prev + 1);
      
      // Use different strategies based on retry count
      let newUrl: string;
      
      if (retryCount === 0 && set && collectorNumber) {
        // First retry: Use CDN URL
        newUrl = `https://cards.scryfall.io/normal/front/${set}/${collectorNumber}.jpg`;
      } else if (retryCount === 1 && name) {
        // Second retry: Try by name
        newUrl = `https://api.scryfall.com/cards/named?format=image&exact=${encodeURIComponent(name)}`;
      } else {
        // Final retry: Use card back
        newUrl = 'https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg';
      }
      
      console.log(`Retry ${retryCount + 1} for card image with URL: ${newUrl}`);
      setFinalImageUrl(newUrl);
    }
  };

  // Initialize image URL
  useEffect(() => {
    if (!finalImageUrl) {
      setFinalImageUrl(getOptimalImageUrl());
    }
  }, [name, set, collectorNumber, imageUrl]);

  return {
    imageUrl: finalImageUrl,
    isLoading,
    setIsLoading,
    error,
    setError,
    retryWithAlternative,
    retryCount
  };
};
