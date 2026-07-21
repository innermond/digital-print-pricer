import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Ergonomic host config: author real HTML in the page instead of escaped string
// props. The element marked rel="pricer" supplies the header (its inner markup →
// powerText) and, via data-* attributes, an initial category/product. All absent
// → built-in title + tagline and no preselection.
// e.g. <div rel="pricer" data-category="afis"><h2>Prețurile afișelor</h2></div>
const marker = document.querySelector('[rel="pricer"]')
const powerText = marker?.innerHTML || undefined
const initialCategoryId = marker?.getAttribute('data-category') || undefined
const initialProductId = marker?.getAttribute('data-product') || undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App powerText={powerText} initialCategoryId={initialCategoryId} initialProductId={initialProductId} />
  </StrictMode>,
)
