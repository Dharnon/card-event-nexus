
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
  const [finalImageUrl, setFinalImageUrl] = useState<string | undefined>(imageUrl);

  // Initialize image URL
  useEffect(() => {
    if (!finalImageUrl || (imageUrl && imageUrl !== finalImageUrl)) {
      // Use the name directly - our getCardImageUrl function will clean up the name
      setFinalImageUrl(getCardImageUrl({
        name,
        set,
        collector_number: collectorNumber,
      }));
      setIsLoading(true);
      setError(false);
    }
  }, [name, set, collectorNumber, imageUrl, finalImageUrl]);

  return {
    imageUrl: finalImageUrl,
    isLoading,
    setIsLoading,
    error,
    setError
  };
};
