import type { Product, ProductCategory, Media, Size } from '../types';
import type { ProductConfig } from './mockData';
import { MOCK_PRODUCTS, PRODUCT_CONFIG, PRODUCT_CATEGORIES, MOCK_MEDIA, MOCK_SIZES } from './mockData';

// Everything the configurator needs to render, in one serializable object.
// Standalone dev uses MOCK_CATALOG (assembled from mockData); a host app
// (materialpublicitar) injects an equivalent object fetched from its endpoint.
export type Catalog = {
  products: Product[];
  config: Record<string, ProductConfig>;
  categories: ProductCategory[];
  media: Media[];
  sizes: Size[];
};

export const MOCK_CATALOG: Catalog = {
  products: MOCK_PRODUCTS,
  config: PRODUCT_CONFIG,
  categories: PRODUCT_CATEGORIES,
  media: MOCK_MEDIA,
  sizes: MOCK_SIZES,
};
