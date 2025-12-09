'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Vehicle, Group, CompanyId } from '@/lib/types';
import { COMPANIES } from '@/lib/types';

const vehicleSchema = z.object({
  placa: z.string().min(7, 'Placa inválida').max(7, 'Placa inválida'),
  modelo: z.string().min(2, 'Modelo é obrigatório'),
  cliente: z.string().min(2, 'Grupo é obrigatório'),
  anoModelo: z.string().optional(),
  renavam: z.string().optional(),
  chassi: z.string().optional(),
  dataEntrada: z.string().optional(),
  valorCompra: z.coerce.number().positive('Valor deve ser positivo'),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface AddEditVehicleModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  vehicle: Vehicle | null;
  groups: Group[];
  companyId: CompanyId;
  onSave: (data: Omit<Vehicle, 'id' | 'status' | 'empresa'> & {empresa: CompanyId; status: 'ativo'}) => void;
}

export default function AddEditVehicleModal({
  isOpen,
  setIsOpen,
  vehicle,
  groups,
  companyId,
  onSave,
}: AddEditVehicleModalProps) {
  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      placa: '',
      modelo: '',
      cliente: '',
      anoModelo: '',
      renavam: '',
      chassi: '',
      dataEntrada: new Date().toISOString().split('T')[0],
      valorCompra: 0,
    },
  });
  
  const companyTheme = COMPANIES[companyId].theme.primary;

  useEffect(() => {
    if (vehicle) {
      form.reset({
        placa: vehicle.placa,
        modelo: vehicle.modelo,
        cliente: vehicle.cliente,
        anoModelo: vehicle.anoModelo,
        renavam: vehicle.renavam,
        chassi: vehicle.chassi,
        dataEntrada: vehicle.dataEntrada?.split('T')[0] || new Date().toISOString().split('T')[0],
        valorCompra: vehicle.valorCompra,
      });
    } else {
      form.reset({
        placa: '',
        modelo: '',
        cliente: '',
        anoModelo: '',
        renavam: '',
        chassi: '',
        dataEntrada: new Date().toISOString().split('T')[0],
        valorCompra: 0,
      });
    }
  }, [vehicle, isOpen, form]);

  const onSubmit: SubmitHandler<VehicleFormData> = (data) => {
    onSave({ ...data, empresa: companyId, status: 'ativo'});
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={`sm:max-w-2xl max-h-[90vh] overflow-y-auto border-t-8 border-${companyTheme}`}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {vehicle ? 'Editar Veículo' : 'Novo Veículo'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="placa"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Placa</FormLabel>
                        <FormControl>
                            <Input {...field} className="uppercase" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="modelo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Modelo</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                 <FormField
                    control={form.control}
                    name="cliente"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-xs uppercase font-bold text-blue-800 dark:text-blue-300">Grupo / Órgão</FormLabel>
                        <FormControl>
                            <div>
                            <Input {...field} list="existingGroupsList" autoComplete="off" placeholder="Selecione ou digite novo..."/>
                            <datalist id="existingGroupsList">
                                {groups.map(g => <option key={g.id} value={g.name} />)}
                            </datalist>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="renavam" render={({ field }) => ( <FormItem><FormLabel className="text-xs uppercase font-bold text-muted-foreground">Renavam</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
                <FormField control={form.control} name="chassi" render={({ field }) => ( <FormItem><FormLabel className="text-xs uppercase font-bold text-muted-foreground">Chassi</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="anoModelo" render={({ field }) => ( <FormItem><FormLabel className="text-xs uppercase font-bold text-muted-foreground">Ano/Modelo</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
                <FormField control={form.control} name="dataEntrada" render={({ field }) => ( <FormItem><FormLabel className="text-xs uppercase font-bold text-muted-foreground">Data Compra</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem> )} />
            </div>
             <FormField
                control={form.control}
                name="valorCompra"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Valor de Compra (R$)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <DialogFooter className="pt-4 border-t">
                <Button type="submit" className={`bg-${companyTheme} hover:bg-${companyTheme}/90 text-primary-foreground font-bold py-3 px-10 rounded-xl`}>
                    Salvar Veículo
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
