export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface DepartmentCreateInput {
  name: string;
  description?: string;
}

export interface DepartmentUpdateInput {
  name?: string;
  description?: string;
}
