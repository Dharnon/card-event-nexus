
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Image, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Photo {
  id: string;
  url: string;
  caption: string;
  date: string;
}

interface DeckPhotoGalleryProps {
  deckId: string;
  initialPhotos?: Photo[];
  onSave: (photos: Photo[]) => void;
}

const DeckPhotoGallery: React.FC<DeckPhotoGalleryProps> = ({ deckId, initialPhotos = [], onSave }) => {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, this would upload to a server or cloud storage.
    // For now, we'll just use a local URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhoto: Photo = {
        id: `photo-${Date.now()}`,
        url: reader.result as string,
        caption: caption,
        date: new Date().toISOString()
      };
      
      const updatedPhotos = [...photos, newPhoto];
      setPhotos(updatedPhotos);
      onSave(updatedPhotos);
      setCaption('');
      
      toast({
        title: "Foto añadida",
        description: "La foto ha sido añadida a la galería"
      });
    };
    
    reader.readAsDataURL(file);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deletePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    setPhotos(updatedPhotos);
    onSave(updatedPhotos);
    setSelectedPhoto(null);
    
    toast({
      title: "Foto eliminada",
      description: "La foto ha sido eliminada de la galería"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <Image className="mr-2 h-5 w-5" />
          Fotos del mazo
        </h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Añadir nueva foto</CardTitle>
          <CardDescription>
            Sube fotos de tu mazo para recordar configuraciones o compartir con amigos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="caption">Descripción (opcional)</Label>
              <Input 
                id="caption" 
                placeholder="Añade una descripción para esta foto..." 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photo">Seleccionar foto</Label>
              <Input 
                ref={fileInputRef}
                id="photo" 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Galería de fotos</h3>
        
        {photos.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <p className="text-muted-foreground mb-2">No hay fotos añadidas</p>
            <p className="text-sm text-muted-foreground">
              Usa el formulario de arriba para añadir tu primera foto
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Dialog key={photo.id}>
                <DialogTrigger asChild>
                  <div 
                    className="relative aspect-square rounded-md overflow-hidden cursor-pointer border hover:shadow-md transition-shadow"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img src={photo.url} alt={photo.caption || 'Deck photo'} className="w-full h-full object-cover" />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm px-2 py-1 text-xs truncate">
                        {photo.caption}
                      </div>
                    )}
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{photo.caption || 'Foto del mazo'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-md">
                      <img src={photo.url} alt={photo.caption || 'Deck photo'} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {new Date(photo.date).toLocaleDateString()}
                      </p>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deletePhoto(photo.id)}
                      >
                        <Trash className="mr-1 h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckPhotoGallery;
