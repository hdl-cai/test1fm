import { useAuthStore } from '@/stores/useAuthStore';
import { DataLayerError } from './errors';

export interface DataContextInput {
  orgId?: string | null;
  userId?: string | null;
  role?: string | null;
}

export interface DataContext {
  orgId: string | null;
  userId: string | null;
  role: string | null;
}

export function getDataContext(input: DataContextInput = {}): DataContext {
  const authUser = useAuthStore.getState().user;

  return {
    orgId: input.orgId ?? authUser?.orgId ?? null,
    userId: input.userId ?? authUser?.id ?? null,
    role: input.role ?? authUser?.role ?? null,
  };
}

export function requireOrgId(orgId?: string | null) {
  const resolvedOrgId = getDataContext({ orgId }).orgId;
  if (!resolvedOrgId) {
    throw new DataLayerError('Organization context is required.');
  }

  return resolvedOrgId;
}

export function requireUserId(userId?: string | null) {
  const resolvedUserId = getDataContext({ userId }).userId;
  if (!resolvedUserId) {
    throw new DataLayerError('User context is required.');
  }

  return resolvedUserId;
}
