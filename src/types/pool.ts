export interface Pool {
  id: string;
  name: string;
  description?: string;
  createdBy: string; // User ID
  createdAt: string; // ISO string
  inviteCode: string; // Unique code for joining
  memberIds: string[]; // Array of user IDs
  adminIds: string[]; // Array of admin user IDs
}

export interface PoolMember {
  id: string;
  name: string;
  email: string;
  joinedAt: string; // ISO string
  isAdmin: boolean;
  profilePicture?: string;
}

export interface PoolInvite {
  poolId: string;
  code: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  usageCount: number;
  maxUsage?: number;
}

