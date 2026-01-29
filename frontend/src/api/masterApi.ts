import axiosInstance from './axiosInstance';
import { Position, KSA, DMT, Role, PositionKSA } from '../types/ksa.types';

export const masterApi = {
  // Positions
  getPositions: async (): Promise<Position[]> => {
    const response = await axiosInstance.get<Position[]>('/dmt/positions');
    return response.data;
  },

  createPosition: async (position: Position): Promise<Position> => {
    const response = await axiosInstance.post<Position>('/dmt/positions', position);
    return response.data;
  },

  // KSA
  getKSA: async (): Promise<KSA[]> => {
    const response = await axiosInstance.get<KSA[]>('/ksa');
    return response.data;
  },

  createKSA: async (ksa: KSA): Promise<KSA> => {
    const response = await axiosInstance.post<KSA>('/ksa', ksa);
    return response.data;
  },

  getKSAByPosition: async (positionId: number): Promise<KSA[]> => {
    const response = await axiosInstance.get<KSA[]>(`/ksa/${positionId}/position`);
    return response.data;
  },

  createPositionKSA: async (
    positionId: number,
    ksaId: number,
    requiredLevel?: number
  ): Promise<PositionKSA> => {
    const response = await axiosInstance.post('/ksa/position-ksa', {
      positionId,
      ksaId,
      requiredLevel,
    });
    return response.data;
  },

  // DMT
  getDMT: async (): Promise<DMT[]> => {
    const response = await axiosInstance.get<DMT[]>('/dmt/dmt');
    return response.data;
  },

  createDMT: async (dmt: DMT): Promise<DMT> => {
    const response = await axiosInstance.post<DMT>('/dmt/dmt', dmt);
    return response.data;
  },

  // Roles
  getRoles: async (): Promise<Role[]> => {
    const response = await axiosInstance.get<Role[]>('/dmt/roles');
    return response.data;
  },
};

