export const BEZIQUE_VARIANT_IDS = ['classic', 'turkish'] as const;

export type BeziqueVariantId = typeof BEZIQUE_VARIANT_IDS[number];

export interface BeziqueVariant {
  id: BeziqueVariantId;
  pointValues: number[];
  briskPointValue: number;
}

export const isBeziqueVariantId = (value: unknown): value is BeziqueVariantId =>
  typeof value === 'string' && (BEZIQUE_VARIANT_IDS as readonly string[]).includes(value as BeziqueVariantId);
