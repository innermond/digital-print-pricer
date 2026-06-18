// Public entry point for consuming digital-print-pricer as a component
// (e.g. embedded in materialpublicitar via git submodule). Standalone dev
// still uses App.tsx / main.tsx and is unaffected by this file.
export { default as ProductConfigurator } from './components/ProductConfigurator';
export { MOCK_CATALOG } from './data/catalog';
export type { Catalog } from './data/catalog';
export * from './types';
