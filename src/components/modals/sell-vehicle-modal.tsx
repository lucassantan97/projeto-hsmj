'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Vehicle, Sale } from '@/lib/types';
import { generateSalesAdAction } from '@/lib/actions';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '../ui/alert';

const saleSchema = z.object({
  dataVenda: z.string().min(1, 'Data é obrigatória'),
  valorVenda: z.coerce.number().positive('Valor deve ser positivo'),
  comprador: z.string().min(2, 'Comprador é obrigatório'),
  salesDescription: z.string().optional(),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SellVehicleModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  vehicle: Vehicle | null;
  onSold: (saleInfo: Sale) => void;
}

export default function SellVehicleModal({ isOpen, setIsOpen, vehicle, onSold }: SellVehicleModalProps) {
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      dataVenda: new Date().toISOString().split('T')[0],
      valorVenda: vehicle?.valorCompra || 0,
      comprador: '',
      salesDescription: '',
    },
  });

  useEffect(() => {
    if (vehicle) {
      form.reset({
        dataVenda: new Date().toISOString().split('T')[0],
        valorVenda: vehicle.vendaInfo?.valorVenda || vehicle.valorCompra,
        comprador: vehicle.vendaInfo?.comprador || '',
        salesDescription: vehicle.vendaInfo?.salesDescription || '',
      });
    }
  }, [vehicle, isOpen, form]);

  const handleGenerateAd = async () => {
    if (!vehicle) return;
    setIsGeneratingAd(true);
    const saleData = form.getValues();
    const tempVehicleData = {...vehicle, vendaInfo: {...saleData, salesDescription: saleData.salesDescription || ""}};
    
    const result = await generateSalesAdAction(tempVehicleData);
    if (result.success && result.ad) {
      form.setValue('salesDescription', result.ad);
      toast({ title: "Anúncio gerado!", description: "O anúncio de vendas foi criado pela IA." });
    } else {
      toast({ variant: "destructive", title: "Erro", description: result.error });
    }
    setIsGeneratingAd(false);
  };

  const onSubmit: SubmitHandler<SaleFormData> = (data) => {
    onSold(data);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg border-t-8 border-mjOrange">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Registrar Venda</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
            <FormField control={form.control} name="dataVenda" render={({ field }) => (<FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="valorVenda" render={({ field }) => (<FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="comprador" render={({ field }) => (<FormItem><FormLabel>Comprador</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

            <Alert className="bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30">
              <div className="flex justify-between items-center mb-2">
                <FormLabel className="text-orange-800 dark:text-orange-300">Descrição da Venda (Opcional)</FormLabel>
                <Button type="button" size="sm" className="sparkle-btn rounded-full text-xs h-7" onClick={handleGenerateAd} disabled={isGeneratingAd}>
                  {isGeneratingAd ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                  Gerar com IA
                </Button>
              </div>
              <FormField control={form.control} name="salesDescription" render={({ field }) => (<FormItem><FormControl><Textarea className="h-24 bg-card" {...field} placeholder="Detalhes adicionais da venda..." /></FormControl></FormItem>)} />
            </Alert>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-mjOrange hover:bg-mjOrange/90 text-primary-foreground">Concluir Venda</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
