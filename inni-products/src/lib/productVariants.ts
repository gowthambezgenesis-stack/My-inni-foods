import { Product, ProductWeightVariant } from '../types';

export const DEFAULT_PRODUCT_WEIGHT_OPTIONS: ProductWeightVariant[] = [
  { weight: '100g', price: 100 },
  { weight: '250g', price: 250 },
  { weight: '500g', price: 500 },
  { weight: '1kg', price: 1000 },
];

export function isOfferProduct(product: Pick<Product, 'category' | 'id'>): boolean {
  return product.category === 'offers' || product.id.startsWith('combo-offer');
}

export function supportsWeightVariants(product: Pick<Product, 'category' | 'id' | 'isSignatureKit'>): boolean {
  return !isOfferProduct(product) && !product.isSignatureKit;
}

export function getWeightOptionsForProduct(product: Pick<Product, 'weightVariants'>): ProductWeightVariant[] {
  return product.weightVariants?.length ? product.weightVariants : DEFAULT_PRODUCT_WEIGHT_OPTIONS;
}

export function getCartLineKey(product: Pick<Product, 'id' | 'weight'>): string {
  return `${product.id}::${product.weight}`;
}

export function applyProductVariant(product: Product, option: ProductWeightVariant): Product {
  return {
    ...product,
    weight: option.weight,
    price: option.price,
  };
}

export function findWeightOption(
  product: Pick<Product, 'weightVariants'>,
  weight: string,
): ProductWeightVariant | undefined {
  return getWeightOptionsForProduct(product).find((option) => option.weight === weight);
}
