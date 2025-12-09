'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Group, CompanyId } from '@/lib/types';
import { Alert, AlertDescription } from '../ui/alert';

interface ManageGroupsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  groups: Group[];
  companyId: CompanyId;
  onAddGroup: (group: Omit<Group, 'id'>) => void;
  onUpdateGroup: (id: string, newName: string) => void;
  onDeleteGroup: (id: string) => void;
}

export default function ManageGroupsModal({
  isOpen,
  setIsOpen,
  groups,
  companyId,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
}: ManageGroupsModalProps) {
  const [newGroupName, setNewGroupName] = useState('');

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      onAddGroup({ name: newGroupName.trim(), company: companyId });
      setNewGroupName('');
    }
  };

  const handleRenameGroup = (id: string, oldName: string) => {
    const newName = prompt('Novo nome para o grupo:', oldName);
    if (newName && newName.trim() !== oldName) {
      onUpdateGroup(id, newName.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Gerenciar Grupos</DialogTitle>
          <DialogDescription>
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 mt-2">
                <AlertDescription>
                    Crie ou renomeie grupos. As alterações serão refletidas em todos os veículos associados.
                </AlertDescription>
            </Alert>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex gap-2">
                <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddGroup()}
                    placeholder="Nome do novo grupo"
                />
                <Button onClick={handleAddGroup}><Plus className="h-4 w-4 mr-2" /> Criar</Button>
            </div>
            <ScrollArea className="h-60 border rounded-lg">
                <div className="p-2 space-y-2">
                {groups.map((group) => (
                    <div key={group.id} className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                        <span className="font-medium text-sm text-foreground">{group.name}</span>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600" onClick={() => handleRenameGroup(group.id, group.name)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onDeleteGroup(group.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                </div>
            </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
