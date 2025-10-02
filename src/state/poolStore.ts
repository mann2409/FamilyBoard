import { create } from "zustand";
import { Pool, PoolMember } from "../types/pool";

interface PoolState {
  pools: Pool[];
  currentPoolId: string | null;
  poolMembers: Record<string, PoolMember[]>; // poolId -> members
  
  // Actions
  setCurrentPool: (poolId: string) => void;
  createPool: (name: string, description: string, userId: string, userName: string, userEmail: string) => Pool;
  joinPool: (inviteCode: string, userId: string, userName: string, userEmail: string) => Pool | null;
  addMemberToPool: (poolId: string, member: PoolMember) => void;
  removeMemberFromPool: (poolId: string, memberId: string) => void;
  updatePoolDetails: (poolId: string, updates: Partial<Pool>) => void;
  regenerateInviteCode: (poolId: string) => string;
  getCurrentPool: () => Pool | undefined;
  getPoolMembers: (poolId: string) => PoolMember[];
  isUserPoolAdmin: (poolId: string, userId: string) => boolean;
  leavePool: (poolId: string, userId: string) => void;
}

// Generate a random invite code
const generateInviteCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code.match(/.{1,4}/g)?.join("-") || code; // Format as XXXX-XXXX
};

export const usePoolStore = create<PoolState>((set, get) => ({
  pools: [],
  currentPoolId: null,
  poolMembers: {},

  setCurrentPool: (poolId: string) => {
    set({ currentPoolId: poolId });
  },

  createPool: (name: string, description: string, userId: string, userName: string, userEmail: string) => {
    const newPool: Pool = {
      id: `pool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      inviteCode: generateInviteCode(),
      memberIds: [userId],
      adminIds: [userId],
    };

    const creator: PoolMember = {
      id: userId,
      name: userName,
      email: userEmail,
      joinedAt: new Date().toISOString(),
      isAdmin: true,
    };

    set((state) => ({
      pools: [...state.pools, newPool],
      currentPoolId: newPool.id,
      poolMembers: {
        ...state.poolMembers,
        [newPool.id]: [creator],
      },
    }));

    return newPool;
  },

  joinPool: (inviteCode: string, userId: string, userName: string, userEmail: string) => {
    const pool = get().pools.find((p) => p.inviteCode === inviteCode);
    
    if (!pool) {
      return null;
    }

    // Check if user is already a member
    if (pool.memberIds.includes(userId)) {
      set({ currentPoolId: pool.id });
      return pool;
    }

    const newMember: PoolMember = {
      id: userId,
      name: userName,
      email: userEmail,
      joinedAt: new Date().toISOString(),
      isAdmin: false,
    };

    set((state) => ({
      pools: state.pools.map((p) =>
        p.id === pool.id
          ? { ...p, memberIds: [...p.memberIds, userId] }
          : p
      ),
      currentPoolId: pool.id,
      poolMembers: {
        ...state.poolMembers,
        [pool.id]: [...(state.poolMembers[pool.id] || []), newMember],
      },
    }));

    return pool;
  },

  addMemberToPool: (poolId: string, member: PoolMember) => {
    set((state) => {
      const pool = state.pools.find((p) => p.id === poolId);
      if (!pool || pool.memberIds.includes(member.id)) {
        return state;
      }

      return {
        pools: state.pools.map((p) =>
          p.id === poolId
            ? { ...p, memberIds: [...p.memberIds, member.id] }
            : p
        ),
        poolMembers: {
          ...state.poolMembers,
          [poolId]: [...(state.poolMembers[poolId] || []), member],
        },
      };
    });
  },

  removeMemberFromPool: (poolId: string, memberId: string) => {
    set((state) => ({
      pools: state.pools.map((p) =>
        p.id === poolId
          ? {
              ...p,
              memberIds: p.memberIds.filter((id) => id !== memberId),
              adminIds: p.adminIds.filter((id) => id !== memberId),
            }
          : p
      ),
      poolMembers: {
        ...state.poolMembers,
        [poolId]: state.poolMembers[poolId]?.filter((m) => m.id !== memberId) || [],
      },
    }));
  },

  updatePoolDetails: (poolId: string, updates: Partial<Pool>) => {
    set((state) => ({
      pools: state.pools.map((p) => (p.id === poolId ? { ...p, ...updates } : p)),
    }));
  },

  regenerateInviteCode: (poolId: string) => {
    const newCode = generateInviteCode();
    set((state) => ({
      pools: state.pools.map((p) =>
        p.id === poolId ? { ...p, inviteCode: newCode } : p
      ),
    }));
    return newCode;
  },

  getCurrentPool: () => {
    const { pools, currentPoolId } = get();
    return pools.find((p) => p.id === currentPoolId);
  },

  getPoolMembers: (poolId: string) => {
    return get().poolMembers[poolId] || [];
  },

  isUserPoolAdmin: (poolId: string, userId: string) => {
    const pool = get().pools.find((p) => p.id === poolId);
    return pool?.adminIds.includes(userId) || false;
  },

  leavePool: (poolId: string, userId: string) => {
    set((state) => {
      const updatedPools = state.pools.filter((p) => {
        if (p.id !== poolId) return true;
        // Remove pool if user is the last member
        return p.memberIds.length > 1;
      }).map((p) =>
        p.id === poolId
          ? {
              ...p,
              memberIds: p.memberIds.filter((id) => id !== userId),
              adminIds: p.adminIds.filter((id) => id !== userId),
            }
          : p
      );

      const newCurrentPoolId =
        state.currentPoolId === poolId
          ? updatedPools[0]?.id || null
          : state.currentPoolId;

      return {
        pools: updatedPools,
        currentPoolId: newCurrentPoolId,
        poolMembers: {
          ...state.poolMembers,
          [poolId]: state.poolMembers[poolId]?.filter((m) => m.id !== userId) || [],
        },
      };
    });
  },
}));

