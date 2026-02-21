'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UploadCloud, Trash2, Loader2 } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { COMPANIES } from '@/lib/types';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ManagePhotosModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  vehicle: Vehicle | null;
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

export default function ManagePhotosModal({ isOpen, setIsOpen, vehicle, onUpdateVehicle }: ManagePhotosModalProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (vehicle) {
      setPhotos(vehicle.photos || []);
    } else {
      setPhotos([]);
    }
  }, [vehicle, isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setIsLoading(true);

    const newPhotosPromises = Array.from(files).map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPhotosPromises)
      .then(newPhotoDataUris => {
        setPhotos(prev => [...prev, ...newPhotoDataUris]);
        setIsLoading(false);
        toast({ title: `${files.length} foto(s) adicionada(s).`, description: 'Clique em Salvar para confirmar.' });
      })
      .catch(() => {
        setIsLoading(false);
        toast({ variant: 'destructive', title: 'Erro ao carregar fotos.' });
      });
      
    // Clear the input value to allow uploading the same file again
    event.target.value = '';
  };
  
  const handleDeletePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!vehicle) return;
    onUpdateVehicle({ ...vehicle, photos });
    toast({ title: 'Galeria atualizada!', description: `As fotos do veículo ${vehicle.placa} foram salvas.` });
    setIsOpen(false);
  };
  
  const companyTheme = vehicle ? (COMPANIES[vehicle.empresa]?.theme.primary || 'primary') : 'primary';


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={`sm:max-w-3xl border-t-8 border-${companyTheme}`}>
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Gerenciar Fotos do Veículo</DialogTitle>
          <DialogDescription>
            Adicione ou remova fotos para o anúncio do veículo {vehicle?.placa}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <label htmlFor="photo-upload" className="relative border-2 border-dashed rounded-lg p-8 flex flex-col justify-center items-center text-center cursor-pointer hover:border-primary transition-colors">
            {isLoading ? (
                <>
                    <Loader2 className="h-10 w-10 text-muted-foreground mb-2 animate-spin" />
                    <p className="font-semibold">Carregando...</p>
                </>
            ) : (
                <>
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-semibold">Clique ou arraste para enviar</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, etc.</p>
                </>
            )}
            <Input
              id="photo-upload"
              type="file"
              multiple
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </label>

          {photos.length > 0 ? (
            <ScrollArea className="h-72 border rounded-md">
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                    <div key={index} className="relative group aspect-video">
                        <Image src={photo} alt={`Foto ${index + 1}`} fill className="object-cover rounded-md" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="destructive" size="icon" onClick={() => handleDeletePhoto(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                </div>
            </ScrollArea>
          ) : (
             <div className="text-center py-10 text-muted-foreground text-sm">
                Nenhuma foto adicionada ainda.
             </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} className={`bg-${companyTheme} hover:bg-${companyTheme}/90`}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
