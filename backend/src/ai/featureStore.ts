type FeatureVector = {
  userId: string;
  tenantId?: string;
  styleAffinity: Record<string, number>;
  fitPreference: Record<string, number>;
  budgetSensitivity: number;
  updatedAt: string;
};

const store = new Map<string, FeatureVector>();

export function upsertFeatureVector(vector: FeatureVector) {
  store.set(vector.userId, vector);
}

export function getFeatureVector(userId: string): FeatureVector | null {
  return store.get(userId) || null;
}
