export interface KSA {
  id?: number;
  code: string;
  name: string;
  description?: string;
  category?: string;
  requiredLevel?: number; // For position-KSA mapping
}

export interface KSACreateInput {
  code: string;
  name: string;
  description?: string;
  category?: string;
}

export interface PositionKSA {
  id?: number;
  positionId: number;
  ksaId: number;
  requiredLevel?: number;
}

export interface PositionKSACreateInput {
  positionId: number;
  ksaId: number;
  requiredLevel?: number;
}

