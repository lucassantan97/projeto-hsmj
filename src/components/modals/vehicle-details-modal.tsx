
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { Vehicle, CompanyId, MaintenanceItem, Group, Sale } from '@/lib/types';
import { COMPANIES } from '@/lib/types';
import { formatCurrency, cn, getLicensingInfo } from '@/lib/utils';
import { Handshake, Pencil, Building, ArrowRightLeft, FileText, Undo2, Edit, CloudUpload, Wrench, Plus, Loader2, BrainCircuit, MessageSquareText, FileBadge, Check, Tag, XCircle } from 'lucide-react';
import { extractMaintenanceDataAction, analyzeMaintenanceHistoryAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import AddEditVehicleModal from './add-edit-vehicle-modal';
import SellVehicleModal from './sell-vehicle-modal';
import TransferGroupModal from './transfer-group-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface VehicleDetailsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  vehicle: Vehicle | null;
  allVehicles: Vehicle[];
  companyId: CompanyId;
  groups: Group[];
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: (vehicleData: Omit<Vehicle, 'id' | 'ownerUserId'>) => void;
  onAddGroup: (group: Omit<Group, 'id' | 'ownerUserId' | 'order'>) => void;
}

export default function VehicleDetailsModal({ 
    isOpen, 
    setIsOpen, 
    vehicle, 
    allVehicles,
    companyId, 
    groups, 
    onUpdateVehicle, 
    onAddVehicle, 
    onAddGroup 
}: VehicleDetailsModalProps) {
  const { toast } = useToast();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiAnalysisLoading, setIsAiAnalysisLoading] = useState(false);
  const [newMaintItems, setNewMaintItems] = useState<MaintenanceItem[]>([]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [maintDate, setMaintDate] = useState(new Date().toISOString().split('T')[0]);
  const [maintKm, setMaintKm] = useState('');
  const [maintFornecedor, setMaintFornecedor] = useState('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isSellModalOpen, setSellModalOpen] = useState(false);
  const [isTransferGroupModalOpen, setTransferGroupModalOpen] = useState(false);

  const otherCompany = companyId === 'HS' ? 'MJ' : 'HS';

  const resetForm = () => {
    setNewMaintItems([]);
    setNewItemDesc('');
    setNewItemValue('');
    setMaintDate(new Date().toISOString().split('T')[0]);
    setMaintKm(vehicle?.kmAtual?.toString() ?? '');
    setMaintFornecedor('');
    setAiAnalysisResult(null);
  }

  useEffect(() => {
    if(isOpen) resetForm();
  }, [isOpen, vehicle]);

  const handleMoveCompany = () => {
    if (!vehicle) return;
    onUpdateVehicle({ ...vehicle, empresa: otherCompany });
    toast({ title: 'Veículo Movido', description: `O veículo ${vehicle.placa} foi movido para a empresa ${otherCompany}.` });
    setIsOpen(false);
  };
  
  const handleTransferGroup = (newGroupId: string) => {
    if (!vehicle) return;
    onUpdateVehicle({ ...vehicle, cliente: newGroupId });
    setTransferGroupModalOpen(false);
    toast({ title: 'Grupo Transferido', description: `O veículo ${vehicle.placa} foi movido para o grupo ${newGroupId}.` });
  };

  const handleEditClick = () => {
    setIsOpen(false); // Close details
    setEditModalOpen(true); // Open edit
  };

  const handleSellClick = () => {
    setIsOpen(false);
    setSellModalOpen(true);
  };
  
  const handleCancelSale = () => {
    if(!vehicle) return;
    const { vendaInfo, ...restOfVehicle } = vehicle;
    onUpdateVehicle({ ...restOfVehicle, status: 'ativo' });
    toast({ title: 'Venda Cancelada', description: `O veículo ${vehicle.placa} está ativo novamente.` });
  };

  const handleSaveVehicle = (vehicleData: Omit<Vehicle, 'id' | 'ownerUserId'>) => {
    if(vehicle) {
      onUpdateVehicle({ ...vehicle, ...vehicleData });
    } else {
      onAddVehicle(vehicleData)
    }
  }

  const handleSold = (saleInfo: Sale) => {
    if (!vehicle) return;
    onUpdateVehicle({ ...vehicle, status: 'vendido', vendaInfo: saleInfo, forSale: false });
  };

  const handleAnnounceSale = () => {
    if (!vehicle) return;
    onUpdateVehicle({ ...vehicle, forSale: true });
    toast({ title: 'Veículo Anunciado', description: `O veículo ${vehicle.placa} agora está listado para venda.` });
  };

  const handleCancelAnnouncement = () => {
    if (!vehicle) return;
    onUpdateVehicle({ ...vehicle, forSale: false });
    toast({ title: 'Anúncio Removido', description: `O veículo ${vehicle.placa} não está mais listado para venda.` });
  };
  
  const handleMarkAsLicensed = () => {
    if (!vehicle) return;
    const newDueDate = getLicensingInfo(vehicle.placa, new Date().getFullYear() + 1).dueDate.toISOString().split('T')[0];
    onUpdateVehicle({ ...vehicle, licenciamento: newDueDate });
    toast({ title: "Licenciamento Atualizado", description: `Veículo ${vehicle.placa} regularizado até ${new Date(newDueDate).toLocaleDateString('pt-BR')}.` });
  };

  const generatePDF = () => {
    if (!vehicle) return;
    const doc = new jsPDF();
    const company = COMPANIES[vehicle.empresa];
  
    doc.setFontSize(18);
    doc.text(`Ficha do Veículo - ${company.name}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
  
    const vehicleDetails = [
      ["Placa", vehicle.placa],
      ["Modelo", vehicle.modelo],
      ["Grupo/Cliente", vehicle.cliente],
      ["Ano/Modelo", vehicle.anoModelo || 'N/A'],
      ["Renavam", vehicle.renavam || 'N/A'],
      ["Chassi", vehicle.chassi || 'N/A'],
      ["Data da Compra", vehicle.dataEntrada ? new Date(vehicle.dataEntrada).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'],
      ["Valor de Compra", formatCurrency(vehicle.valorCompra)],
    ];
    
    (doc as any).autoTable({
      startY: 30,
      head: [['Campo', 'Valor']],
      body: vehicleDetails,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 138] }, // Primary color
    });

    if (vehicle.observacao) {
      doc.setFontSize(12);
      doc.text("Observações", 14, (doc as any).lastAutoTable.finalY + 15);
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(vehicle.observacao, 180);
      doc.text(splitText, 14, (doc as any).lastAutoTable.finalY + 22);
    }
  
    if (vehicle.maintenances && vehicle.maintenances.length > 0) {
      doc.addPage();
      doc.setFontSize(18);
      doc.text("Histórico de Manutenção", 14, 22);
      
      vehicle.maintenances.forEach((maint, index) => {
        const startY = index === 0 ? 30 : (doc as any).lastAutoTable.finalY + 15;
        
        doc.setFontSize(12);
        doc.text(`Manutenção #${index + 1}`, 14, startY);
        
        const maintSummary = [
            ["Data", new Date(maint.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})],
            ["KM", maint.km.toLocaleString('pt-BR')],
            ["Fornecedor", maint.fornecedor],
            ["Custo Total", formatCurrency(maint.total)],
        ];

        (doc as any).autoTable({
          startY: startY + 5,
          head: [['', '']],
          body: maintSummary,
          theme: 'plain',
          styles: { cellPadding: 1 },
        });

        const itemsBody = maint.items.map(item => [item.descricao, formatCurrency(item.valor)]);
        
        (doc as any).autoTable({
            startY: (doc as any).lastAutoTable.finalY + 2,
            head: [['Item', 'Valor']],
            body: itemsBody,
            theme: 'grid',
            headStyles: { fillColor: [100, 116, 139] },
        });
      });
    }
  
    doc.save(`Ficha_Veiculo_${vehicle.placa}.pdf`);
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !vehicle) return;
    setIsAiLoading(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      const result = await extractMaintenanceDataAction(base64);

      if (result.success && result.data) {
        const data = result.data;
        if(data.date) setMaintDate(data.date);
        if(data.km) setMaintKm(data.km.toString());
        if(data.fornecedor) setMaintFornecedor(data.fornecedor);
        if(data.items) setNewMaintItems(data.items.map(desc => ({ descricao: desc, valor: 0 })));
        toast({ title: "Dados Extraídos!", description: "Nota fiscal lida com sucesso pela IA." });
      } else {
        toast({ variant: 'destructive', title: "Erro de Leitura", description: result.error });
      }
      setIsAiLoading(false);
    };
  };

  const handleAddItem = () => {
    if (newItemDesc) {
      setNewMaintItems([...newMaintItems, { descricao: newItemDesc, valor: parseFloat(newItemValue) || 0 }]);
      setNewItemDesc('');
      setNewItemValue('');
    }
  };

  const handleSaveMaintenance = () => {
    if (!vehicle || !maintDate || !maintKm || !maintFornecedor || newMaintItems.length === 0) {
        toast({ variant: "destructive", title: "Campos obrigatórios", description: "Data, KM, Fornecedor e ao menos um item são necessários." });
        return;
    }
    const newMaintenance = {
        id: `maint-${vehicle.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        data: maintDate,
        km: parseInt(maintKm, 10),
        fornecedor: maintFornecedor,
        items: newMaintItems,
        total: newMaintItems.reduce((acc, item) => acc + item.valor, 0),
    };
    const updatedVehicle = {
        ...vehicle,
        kmAtual: parseInt(maintKm, 10), // Update current KM as well
        maintenances: [...(vehicle.maintenances || []), newMaintenance],
    };
    onUpdateVehicle(updatedVehicle);
    toast({ title: "Manutenção Salva", description: "O histórico do veículo foi atualizado." });
    resetForm();
  }

  const handleAiAnalysis = async () => {
    if (!vehicle || !vehicle.maintenances || vehicle.maintenances.length === 0) {
      toast({ title: "Sem dados", description: "Não há histórico de manutenção para analisar." });
      return;
    }
    setIsAiAnalysisLoading(true);
    setAiAnalysisResult(null);
    const result = await analyzeMaintenanceHistoryAction({
      vehicleModel: vehicle.modelo,
      maintenances: vehicle.maintenances.map(m => ({
          data: m.data,
          km: m.km,
          total: m.total,
          items: m.items.map(i => ({ descricao: i.descricao, valor: i.valor })),
      })),
    });
    if (result.success && result.analysis) {
        setAiAnalysisResult(result.analysis);
    } else {
        toast({ variant: "destructive", title: "Erro na Análise", description: result.error });
    }
    setIsAiAnalysisLoading(false);
  }

  const newMaintenanceTotal = useMemo(() => newMaintItems.reduce((sum, item) => sum + item.valor, 0), [newMaintItems]);

  const licensingInfo = useMemo(() => {
    if (!vehicle) return null;
    return getLicensingInfo(vehicle.placa);
  }, [vehicle]);

  if (!vehicle || !licensingInfo) return null;
  const isSold = vehicle.status === 'vendido';
  const companyTheme = COMPANIES[companyId].theme.primary;

  const getStatusColor = () => {
    switch (licensingInfo.status) {
        case 'vencido': return 'text-red-500';
        case 'alerta': return 'text-yellow-500';
        default: return 'text-green-500';
    }
  };


  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b bg-muted/50 rounded-t-lg">
          <DialogTitle className="font-headline text-2xl">Ficha do Veículo</DialogTitle>
          <DialogDescription>{vehicle.placa} - {vehicle.modelo}</DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto">
          <Tabs defaultValue="details" className="p-6">
            <div className="flex justify-between items-start">
                <TabsList>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
                  <TabsTrigger value="licensing">Licenciamento</TabsTrigger>
                </TabsList>
                 <div className="flex flex-wrap justify-end mb-6 gap-2">
                    {!isSold && <Button variant="outline" size="sm" onClick={handleMoveCompany}><Building className="h-4 w-4 mr-2"/>Mover para {otherCompany}</Button>}
                    {!isSold && <Button variant="outline" size="sm" onClick={() => setTransferGroupModalOpen(true)}><ArrowRightLeft className="h-4 w-4 mr-2"/>Transferir Grupo</Button>}
                    {!isSold && <Button variant="outline" size="sm" onClick={handleEditClick}><Pencil className="h-4 w-4 mr-2"/>Editar</Button>}
                    
                    {!isSold && !vehicle.forSale && (
                        <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700" onClick={handleAnnounceSale}>
                            <Tag className="h-4 w-4 mr-2"/>Anunciar Venda
                        </Button>
                    )}
                    {!isSold && vehicle.forSale && (
                        <Button variant="outline" size="sm" className="border-rose-500 text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={handleCancelAnnouncement}>
                            <XCircle className="h-4 w-4 mr-2"/>Remover Anúncio
                        </Button>
                    )}
                    {!isSold && vehicle.forSale && (
                        <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700" onClick={handleSellClick}>
                            <Handshake className="h-4 w-4 mr-2"/>Registrar Venda
                        </Button>
                    )}

                    {isSold && <Button variant="outline" size="sm" className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleCancelSale}><Undo2 className="h-4 w-4 mr-2"/>Cancelar Venda</Button>}
                    {isSold && <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700" onClick={handleEditClick}><Edit className="h-4 w-4 mr-2"/>Editar Venda</Button>}
                    
                    <Button variant="outline" size="sm" onClick={generatePDF}><FileText className="h-4 w-4 mr-2 text-red-500"/>PDF</Button>
                </div>
            </div>
           
            <TabsContent value="details">
              <Card className="bg-muted/30 mb-8">
                  <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
                      <div className="font-medium"><p className="text-xs text-muted-foreground">Placa</p><p>{vehicle.placa}</p></div>
                      <div className="font-medium"><p className="text-xs text-muted-foreground">Modelo</p><p>{vehicle.modelo}</p></div>
                      <div className="font-medium"><p className="text-xs text-muted-foreground">Grupo</p><p>{vehicle.cliente}</p></div>
                      <div className="font-medium"><p className="text-xs text-muted-foreground">Valor de Compra</p><p>{formatCurrency(vehicle.valorCompra)}</p></div>
                      <div className="font-medium"><p className="text-xs text-muted-foreground">Data da Compra</p><p>{vehicle.dataEntrada ? new Date(vehicle.dataEntrada).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'}</p></div>
                      <div className="font-medium"><p className="text-xs text-muted-foreground">Ano/Modelo</p><p>{vehicle.anoModelo}</p></div>
                      <div className="font-medium"><p className="text-xs text-muted-foreground">KM Atual</p><p>{vehicle.kmAtual?.toLocaleString('pt-BR') || 'N/A'}</p></div>
                      <div className="font-medium"><p className="text-xs text-muted-foreground">Renavam</p><p>{vehicle.renavam || 'N/A'}</p></div>
                      {vehicle.chassi && (
                          <div className="font-medium col-span-2"><p className="text-xs text-muted-foreground">Chassi</p><p>{vehicle.chassi}</p></div>
                      )}
                      {vehicle.observacao && (
                        <div className="font-medium col-span-full">
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquareText className="h-3 w-3"/>Observação</p>
                          <p className="text-sm whitespace-pre-wrap">{vehicle.observacao}</p>
                        </div>
                      )}
                  </CardContent>
              </Card>
               <h3 className="text-lg font-bold font-headline mb-4">Histórico Completo</h3>
                <ScrollArea className="h-64 border rounded-lg">
                    <div className="space-y-3 p-4">
                    {(vehicle.maintenances && vehicle.maintenances.length > 0) ? vehicle.maintenances.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map(m => (
                        <div key={m.id} className="text-sm bg-muted/30 p-3 rounded-lg">
                            <div className="flex justify-between font-bold mb-1">
                                <span>{new Date(m.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} - {m.fornecedor}</span>
                                <Badge variant={m.total > 500 ? 'destructive' : 'secondary'}>{formatCurrency(m.total)}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">KM: {m.km.toLocaleString('pt-BR')}</p>
                            <ul className="list-disc ml-4 text-xs text-muted-foreground">
                                {m.items.map((item, i) => <li key={i}>{item.descricao} ({formatCurrency(item.valor)})</li>)}
                            </ul>
                        </div>
                    )) : <p className="text-center text-muted-foreground text-sm py-8">Sem histórico de manutenção.</p>}
                    </div>
                </ScrollArea>
            </TabsContent>
            <TabsContent value="maintenance">
               {!isSold && (
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/3">
                        <label htmlFor="fileInput" className={cn("border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer relative bg-muted/20 min-h-[200px] p-4 transition-colors hover:border-primary hover:bg-primary/5", isAiLoading && "cursor-wait")}>
                            <input type="file" id="fileInput" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,application/pdf" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} disabled={isAiLoading}/>
                            <CloudUpload className="h-10 w-10 text-muted-foreground mb-2"/>
                            <p className="font-bold text-foreground text-center text-sm">Arrastar Nota/Foto</p>
                            <p className="text-xs text-muted-foreground mt-1">IA preenche automático</p>
                            {isAiLoading && (
                                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                    <span className="text-xs font-bold text-primary">Lendo...</span>
                                </div>
                            )}
                        </label>
                    </div>

                    <Card className="overflow-hidden lg:w-2/3">
                        <CardHeader className="bg-muted/50 flex flex-row justify-between items-center p-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2 font-headline"><Wrench className={`h-5 w-5 text-${companyTheme}`} />Nova Manutenção</CardTitle>
                            <Button size="sm" variant="outline" className="sparkle-btn text-xs" onClick={handleAiAnalysis} disabled={isAiAnalysisLoading}>
                                {isAiAnalysisLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <><BrainCircuit className="h-4 w-4 mr-2"/> Análise IA</>}
                            </Button>
                        </CardHeader>

                        {aiAnalysisResult && (
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 border-b text-sm prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1" dangerouslySetInnerHTML={{ __html: aiAnalysisResult }}></div>
                        )}
                        
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <div><label className="text-xs font-bold text-muted-foreground uppercase">Data</label><input className="w-full p-2 border rounded-lg bg-background" type="date" value={maintDate} onChange={e => setMaintDate(e.target.value)} required /></div>
                               <div><label className="text-xs font-bold text-muted-foreground uppercase">KM REAL</label><input className="w-full p-2 border rounded-lg bg-background" type="number" value={maintKm} onChange={e => setMaintKm(e.target.value)} required /></div>
                               <div><label className="text-xs font-bold text-muted-foreground uppercase">Fornecedor</label><input className="w-full p-2 border rounded-lg bg-background" type="text" value={maintFornecedor} onChange={e => setMaintFornecedor(e.target.value)} required /></div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-xl border border-dashed">
                                <div className="flex flex-wrap items-end gap-3">
                                    <div className="flex-grow"><label className="text-xs font-bold text-muted-foreground uppercase">Descrição do Item</label><input className="w-full p-2 border rounded-lg bg-background" type="text" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} placeholder="Ex: Filtro de Óleo" /></div>
                                    <div className="w-32"><label className="text-xs font-bold text-muted-foreground uppercase">Valor (R$)</label><input className="w-full p-2 border rounded-lg bg-background" type="number" step="0.01" value={newItemValue} onChange={e => setNewItemValue(e.target.value)} placeholder="0.00"/></div>
                                    <Button size="icon" onClick={handleAddItem}><Plus className="h-4 w-4" /></Button>
                                </div>
                                <div className="mt-3 space-y-2 text-sm">
                                    {newMaintItems.map((item, i) => <div key={i} className="flex justify-between items-center"><p>{item.descricao}</p><p>{formatCurrency(item.valor)}</p></div>)}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-between items-center border-t pt-4">
                                 <div><span className="text-xs font-bold text-muted-foreground uppercase">Total</span><p className={`font-bold text-2xl text-${companyTheme}`}>{formatCurrency(newMaintenanceTotal)}</p></div>
                                 <Button onClick={handleSaveMaintenance} className="bg-green-600 hover:bg-green-700" disabled={newMaintItems.length === 0}>Lançar Histórico</Button>
                             </div>
                        </CardContent>
                    </Card>
                </div>
                )}
                 {isSold && (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>O veículo foi vendido. Não é possível adicionar novas manutenções.</p>
                    </div>
                )}
            </TabsContent>
             <TabsContent value="licensing">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline"><FileBadge /> Status do Licenciamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className={cn("p-4 rounded-lg flex items-center justify-between", {
                            'bg-green-100 dark:bg-green-900/30': licensingInfo.status === 'ok',
                            'bg-yellow-100 dark:bg-yellow-900/30': licensingInfo.status === 'alerta',
                            'bg-red-100 dark:bg-red-900/30': licensingInfo.status === 'vencido',
                        })}>
                            <div>
                                <p className={cn("font-bold text-lg", getStatusColor())}>
                                    {licensingInfo.status.toUpperCase()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Vencimento: {licensingInfo.dueDate.toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">{licensingInfo.daysRemaining > 0 ? licensingInfo.daysRemaining : '-'}</p>
                                <p className="text-xs text-muted-foreground">{licensingInfo.daysRemaining > 0 ? 'dias restantes' : 'dias vencidos'}</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            O cálculo do vencimento é baseado no final da placa para pessoa jurídica. 
                            A data de vencimento atualizada é {vehicle.licenciamento ? new Date(vehicle.licenciamento).toLocaleDateString('pt-BR') : licensingInfo.dueDate.toLocaleDateString('pt-BR')}.
                        </p>
                        {!isSold && (
                            <div className="flex gap-4 pt-4 border-t">
                                <Button onClick={handleMarkAsLicensed} className="w-full">
                                    <Check className="mr-2 h-4 w-4" /> Marcar como Regularizado para {new Date().getFullYear() + 1}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
    
    <AddEditVehicleModal 
        isOpen={isEditModalOpen}
        setIsOpen={setEditModalOpen}
        vehicle={vehicle}
        allVehicles={allVehicles}
        groups={groups}
        companyId={companyId}
        onSave={handleSaveVehicle}
    />
    <SellVehicleModal 
        isOpen={isSellModalOpen}
        setIsOpen={setSellModalOpen}
        vehicle={vehicle}
        onSold={handleSold}
    />
    <TransferGroupModal
        isOpen={isTransferGroupModalOpen}
        setIsOpen={setTransferGroupModalOpen}
        groups={groups}
        companyId={companyId}
        onTransfer={handleTransferGroup}
        onAddGroup={onAddGroup}
        currentVehicle={vehicle}
    />
    </>
  );
}

    