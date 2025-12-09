
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import type { Group, CompanyId, Vehicle } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';

interface TransferGroupModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  groups: Group[];
  companyId: CompanyId;
  onTransfer: (newGroupName: string) => void;
  onAddGroup: (group: Omit<Group, 'id'>) => void;
  currentVehicle: Vehicle | null;
}

export default function TransferGroupModal({
  isOpen,
  setIsOpen,
  groups,
  companyId,
  onTransfer,
  onAddGroup,
  currentVehicle
}: TransferGroupModalProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  const handleAddNewGroup = () => {
    if (newGroupName.trim()) {
      onAddGroup({ name: newGroupName.trim(), company: companyId });
      onTransfer(newGroupName.trim());
      setNewGroupName('');
    }
  };
  
  const handleTransfer = () => {
      if (selectedGroup) {
          onTransfer(selectedGroup);
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Transferir Grupo do Veículo</DialogTitle>
          <DialogDescription>
            Mova o veículo <span className="font-bold">{currentVehicle?.placa}</span> para um grupo novo ou existente.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Transferir para Grupo Existente</label>
                 <Select onValueChange={setSelectedGroup} value={selectedGroup}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um grupo..." />
                    </SelectTrigger>
                    <SelectContent>
                        {groups.map((group) => (
                            <SelectItem key={group.id} value={group.name}>{group.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Button onClick={handleTransfer} disabled={!selectedGroup} className="w-full">
                    Transferir para este Grupo
                </Button>
            </div>
           
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">OU</span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Criar e Transferir para Novo Grupo</label>
                <div className="flex gap-2">
                    <Input
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Nome do novo grupo"
                    />
                    <Button onClick={handleAddNewGroup} variant="secondary" disabled={!newGroupName.trim()}>
                        <Plus className="h-4 w-4 mr-2" /> Criar e Transferir
                    </Button>
                </div>
            </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
