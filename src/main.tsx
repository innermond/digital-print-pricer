import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Ergonomic host config: author real HTML in the page instead of escaped string
// props. The element marked rel="pricer" supplies the header (its inner markup →
// powerText), an initial category/product, and whether to show the Export/Import
// admin tools (hidden unless explicitly enabled). All absent → built-in title +
// tagline, no preselection, no Export/Import.
// e.g. <div rel="pricer" data-category="afis" data-export-import="true"><h2>Prețurile afișelor</h2></div>
const marker = document.querySelector('[rel="pricer"]')
const powerText = marker?.innerHTML || undefined
const initialCategoryId = marker?.getAttribute('data-category') || undefined
const initialProductId = marker?.getAttribute('data-product') || undefined
const showExportImport = marker?.getAttribute('data-export-import') === 'true'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      powerText={powerText}
      initialCategoryId={initialCategoryId}
      initialProductId={initialProductId}
      showExportImport={showExportImport}
    />
  </StrictMode>,
)
