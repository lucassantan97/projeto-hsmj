
export type CompanyId = 'HS' | 'MJ';

export interface User {
  name: string;
  avatarUrl: string;
}

export interface Vehicle {
  id: string;
  ownerUserId: string;
  placa: string;
  modelo: string;
  cliente: string; // Group
  anoModelo: string;
  valorCompra: number;
  status: 'ativo' | 'vendido';
  empresa: CompanyId;
  renavam?: string;
  chassi?: string;
  dataEntrada?: string;
  observacao?: string;
  vendaInfo?: Sale;
  maintenances?: Maintenance[];
  totalMaint?: number;
  kmAtual?: number; // Current KM for alert calculation
  licenciamento?: string; // Licensing due date
  forSale?: boolean;
  photos?: string[];
  fipeValue?: number;
}

export interface Sale {
  dataVenda: string;
  valorVenda: number;
  comprador: string;
  salesDescription?: string;
}

export interface Maintenance {
  id: string;
  data: string;
  km: number;
  fornecedor: string;
  items: MaintenanceItem[];
  total: number;
  arquivoUrl?: string;
  arquivoNome?: string;
}

export interface MaintenanceItem {
  descricao: string;
  valor: number;
}

export interface Group {
    id: string;
    ownerUserId: string;
    name: string;
    company: CompanyId;
    order?: number;
}

export interface MaintenanceAlert {
  vehicleId: string;
  type: 'km' | 'time';
  message: string;
}

export interface LicensingAlert {
  vehicleId: string;
  dueDate: string;
  daysRemaining: number;
  status: 'vencido' | 'alerta' | 'ok';
}

export const COMPANIES = {
  HS: {
    id: 'HS',
    name: 'HS Locadora',
    cnpj: '10.606.395/0001-24',
    theme: {
      primary: 'hsRed',
      secondary: 'hsYellow',
    },
  },
  MJ: {
    id: 'MJ',
    name: 'MJ Locadora',
    cnpj: '40.108.340/0001-24',
    theme: {
      primary: 'mjOrange',
      secondary: 'mjGray',
    },
  },
} as const;
