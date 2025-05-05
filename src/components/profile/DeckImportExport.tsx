
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Deck, Card as MagicCard } from '@/types';
import { Download, Upload } from 'lucide-react';

interface DeckImportExportProps {
  deck?: Deck;
  onImport: (deckData: { name: string, format: string, cards: MagicCard[] }) => void;
}

const DeckImportExport: React.FC<DeckImportExportProps> = ({ deck, onImport }) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  // Parse deck file content
  const parseDeckFile = (content: string) => {
    try {
      // Try parsing as JSON first (.deck format)
      try {
        const jsonData = JSON.parse(content);
        if (jsonData.name && jsonData.cards) {
          return {
            name: jsonData.name,
            format: jsonData.format || 'Standard',
            cards: jsonData.cards.map((card: any, index: number) => ({
              id: `imported-card-${index}`,
              name: card.name,
              quantity: card.quantity || 1
            }))
          };
        }
      } catch (jsonError) {
        // Not valid JSON, try parsing as text format
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length === 0) throw new Error('Empty file');
        
        // Assume first line might be the deck name
        let name = lines[0];
        let startIndex = 0;
        
        // If the first line doesn't look like a card entry, use it as the name
        if (!name.match(/^\d+\s+\w/)) {
          startIndex = 1;
        } else {
          name = 'Imported Deck';
        }
        
        // Process cards
        const cards: MagicCard[] = [];
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Try to match quantity and card name pattern (e.g., "4 Lightning Bolt" or "4x Lightning Bolt")
          const match = line.match(/^(\d+)(\s+|\s*x\s*)(.+)$/i);
          if (match) {
            cards.push({
              id: `imported-card-${i}`,
              name: match[3].trim(),
              quantity: parseInt(match[1], 10)
            });
          } else {
            // If no quantity specified, assume 1
            cards.push({
              id: `imported-card-${i}`,
              name: line,
              quantity: 1
            });
          }
        }
        
        if (cards.length === 0) throw new Error('No valid card entries found');
        
        return { name, format: 'Standard', cards };
      }
    } catch (error: any) {
      console.error('Error parsing deck file:', error);
      toast({
        title: 'Error importing deck',
        description: error.message || 'Could not parse the deck file format',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Import deck from file
  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a deck file to import',
        variant: 'destructive'
      });
      return;
    }

    try {
      const content = await importFile.text();
      const deckData = parseDeckFile(content);
      
      if (deckData) {
        onImport(deckData);
        toast({
          title: 'Deck imported successfully',
          description: `Imported ${deckData.name} with ${deckData.cards.length} cards`,
        });
      }
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: 'Error reading file',
        description: 'Could not read the selected file',
        variant: 'destructive'
      });
    }
  };

  // Export deck to file
  const handleExport = () => {
    if (!deck) {
      toast({
        title: 'No deck to export',
        description: 'Please select a deck to export first',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create exportable deck data
      const exportData = {
        name: deck.name,
        format: deck.format,
        cards: deck.cards.map(card => ({
          name: card.name,
          quantity: card.quantity
        }))
      };

      // Create text format
      let textFormat = `${deck.name}\n\n`;
      deck.cards.forEach(card => {
        textFormat += `${card.quantity} ${card.name}\n`;
      });

      // Create JSON format
      const jsonFormat = JSON.stringify(exportData, null, 2);

      // Create downloadable blob for .deck (JSON) format
      const deckBlob = new Blob([jsonFormat], { type: 'application/json' });
      const deckUrl = URL.createObjectURL(deckBlob);
      const deckLink = document.createElement('a');
      deckLink.href = deckUrl;
      deckLink.download = `${deck.name.replace(/\s+/g, '_').toLowerCase()}.deck`;
      
      // Create downloadable blob for .txt format
      const txtBlob = new Blob([textFormat], { type: 'text/plain' });
      const txtUrl = URL.createObjectURL(txtBlob);
      const txtLink = document.createElement('a');
      txtLink.href = txtUrl;
      txtLink.download = `${deck.name.replace(/\s+/g, '_').toLowerCase()}.txt`;
      
      // Trigger downloads
      deckLink.click();
      setTimeout(() => {
        txtLink.click();
        
        // Clean up
        URL.revokeObjectURL(deckUrl);
        URL.revokeObjectURL(txtUrl);
      }, 100);
      
      toast({
        title: 'Deck exported successfully',
        description: `${deck.name} exported in .deck and .txt formats`,
      });
    } catch (error) {
      console.error('Error exporting deck:', error);
      toast({
        title: 'Error exporting deck',
        description: 'Could not export the deck',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import/Export Deck</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="import-file">Import deck from file (.txt or .deck)</Label>
          <div className="flex gap-2">
            <Input 
              id="import-file" 
              type="file" 
              accept=".txt,.deck"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button onClick={handleImport} disabled={!importFile}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Supported formats: .txt (one card per line with quantity) or .deck (JSON)
          </p>
        </div>
        
        {deck && (
          <div className="pt-2">
            <Button 
              onClick={handleExport} 
              variant="outline" 
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export {deck.name} (.deck and .txt)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeckImportExport;
