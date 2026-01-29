export interface DMT {
  id?: number;
  name: string;
  description?: string;
}

export interface DMTCreateInput {
  name: string;
  description?: string;
}

export interface Position {
  id?: number;
  code: string;
  title: string;
  description?: string;
}

export interface PositionCreateInput {
  code: string;
  title: string;
  description?: string;
}

export interface Role {
  id?: number;
  name: string;
  description?: string;
}

