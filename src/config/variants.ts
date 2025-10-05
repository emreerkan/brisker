import type { BeziqueVariantId, BeziqueVariant } from '@/types/variant';
import { BEZIQUE_VARIANT_IDS } from '@/types/variant';

const VARIANT_CONFIGS: Record<BeziqueVariantId, BeziqueVariant> = {
  classic: {
    id: 'classic',
    pointValues: [10, 20, 40, 60, 80, 100, 250, 500],
    briskPointValue: 10,
  },
  turkish: {
    id: 'turkish',
    pointValues: [20, 40, 50, 60, 80, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1500],
    briskPointValue: 20,
  },
};

export const DEFAULT_VARIANT: BeziqueVariantId = 'classic';

export const getVariantConfig = (variantId?: BeziqueVariantId | null): BeziqueVariant => {
  if (!variantId) return VARIANT_CONFIGS[DEFAULT_VARIANT];
  return VARIANT_CONFIGS[variantId] ?? VARIANT_CONFIGS[DEFAULT_VARIANT];
};

export const getAvailableVariants = (): BeziqueVariant[] => BEZIQUE_VARIANT_IDS.map(id => VARIANT_CONFIGS[id]);

export const isSupportedVariant = (variantId: unknown): variantId is BeziqueVariantId =>
  typeof variantId === 'string' && variantId in VARIANT_CONFIGS;
