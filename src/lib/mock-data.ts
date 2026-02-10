import type { User, Vehicle, Group, CompanyId, Maintenance } from './types';

// This mockUser is no longer the primary source of user data,
// but can be kept for testing or as a fallback structure.
export const mockUser: User = {
    name: 'Analista',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
};

const generateMaintenances = (count: number, vehicleId: string): Maintenance[] => {
    const maintenances: Maintenance[] = [];
    const suppliers = ['Oficina do Zé', 'Auto Peças JS', 'Pneu Forte', 'Elétrica Carvalho'];
    const items = ['Troca de óleo', 'Alinhamento e Balanceamento', 'Troca de pastilhas de freio', 'Revisão geral', 'Troca de pneu'];
    let lastKm = 0;
    for (let i = 0; i < count; i++) {
        const maintDate = new Date(2023, i * 4 , Math.floor(Math.random() * 28) + 1);
        const maintItems = Array.from({ length: Math.ceil(Math.random() * 3) }, () => ({
            descricao: items[Math.floor(Math.random() * items.length)],
            valor: Math.random() * 200 + 50,
        }));
        lastKm += 10000 + Math.floor(Math.random() * 2000 - 1000);
        maintenances.push({
            id: `maint-${vehicleId}-${i}-${Math.random().toString(36).slice(2)}`,
            data: maintDate.toISOString().split('T')[0],
            km: lastKm,
            fornecedor: suppliers[Math.floor(Math.random() * suppliers.length)],
            items: maintItems,
            total: maintItems.reduce((acc, item) => acc + item.valor, 0),
        });
    }
    return maintenances;
}

export const mockVehicles: Vehicle[] = [
    { id: '1', placa: 'RNS4G55', modelo: 'Fiat Mobi', cliente: 'Prefeitura de Itapema', anoModelo: '2023/2024', valorCompra: 68000, status: 'ativo', empresa: 'HS', dataEntrada: '2023-01-15', totalMaint: 1200, maintenances: generateMaintenances(2, '1'), kmAtual: 28000 },
    { id: '2', placa: 'RBS1A23', modelo: 'VW Gol', cliente: 'Secretaria de Saúde', anoModelo: '2022/2022', valorCompra: 72000, status: 'ativo', empresa: 'HS', dataEntrada: '2022-06-20', totalMaint: 850, maintenances: generateMaintenances(3, '2'), kmAtual: 35000 },
    // Vehicle needing time-based maintenance
    { id: '3', placa: 'QWR5F67', modelo: 'Hyundai HB20', cliente: 'Prefeitura de Itapema', anoModelo: '2023/2023', valorCompra: 85000, status: 'ativo', empresa: 'HS', dataEntrada: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0], totalMaint: 450, maintenances: [], kmAtual: 8000 },
    { id: '4', placa: 'XYZ1B23', modelo: 'Onix Plus', cliente: 'Particular', anoModelo: '2021/2022', valorCompra: 78000, status: 'vendido', empresa: 'HS', dataEntrada: '2021-11-05', totalMaint: 1500, maintenances: generateMaintenances(4, '4'), kmAtual: 50000, vendaInfo: { dataVenda: '2024-05-20', valorVenda: 75000, comprador: 'João Silva' } },
    { id: '5', placa: 'PLT7H89', modelo: 'Renault Kwid', cliente: 'Casan', anoModelo: '2023/2024', valorCompra: 65000, status: 'ativo', empresa: 'MJ', dataEntrada: '2023-02-01', totalMaint: 980, maintenances: generateMaintenances(2, '5'), kmAtual: 22000 },
    // Vehicle needing km-based maintenance
    { id: '6', placa: 'MJF2C34', modelo: 'Fiat Strada', cliente: 'Urbana', anoModelo: '2024/2024', valorCompra: 120000, status: 'ativo', empresa: 'MJ', dataEntrada: '2024-01-30', totalMaint: 200, maintenances: generateMaintenances(1, '6'), kmAtual: 25000 },
    { id: '7', placa: 'MJS9G88', modelo: 'VW Saveiro', cliente: 'Urbana', anoModelo: '2023/2023', valorCompra: 95000, status: 'ativo', empresa: 'MJ', dataEntrada: '2023-05-15', totalMaint: 0, maintenances: [], kmAtual: 9000 },
    { id: '8', placa: 'INT8E76', modelo: 'Toyota Hilux', cliente: 'Particular', anoModelo: '2020/2021', valorCompra: 180000, status: 'vendido', empresa: 'MJ', dataEntrada: '2020-09-01', totalMaint: 3400, maintenances: generateMaintenances(5, '8'), kmAtual: 80000, vendaInfo: { dataVenda: '2024-06-10', valorVenda: 175000, comprador: 'Maria Souza' } },
];

export const mockGroups: Group[] = [
    { id: 'g1', name: 'Prefeitura de Itapema', company: 'HS' },
    { id: 'g2', name: 'Secretaria de Saúde', company: 'HS' },
    { id: 'g3', name: 'Casan', company: 'MJ' },
    { id: 'g4', name: 'Urbana', company: 'MJ' },
];
