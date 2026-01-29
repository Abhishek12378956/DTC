export interface Position {
  id?: number;
  code: string;
  title: string;
  description?: string;
}

export interface KSA {
  id?: number;
  code: string;
  name: string;
  description?: string;
  category?: string;
  requiredLevel?: number;
}

export interface DMT {
  id?: number;
  name: string;
  description?: string;
}

export interface Role {
  id?: number;
  name: string;
  description?: string;
}

export interface PositionKSA {
  id?: number;
  positionId: number;
  ksaId: number;
  requiredLevel?: number;
}

