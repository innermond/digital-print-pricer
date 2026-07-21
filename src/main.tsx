import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Ergonomic header override: the host authors real HTML in the page rather than
// passing an escaped string prop. Any element marked rel="pricer" supplies its
// inner markup as the header (powerText); absent → built-in title + tagline.
// e.g. <div rel="pricer"><h2>Prețurile afișelor</h2></div>
const powerText = document.querySelector('[rel="pricer"]')?.innerHTML || undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App powerText={powerText} />
  </StrictMode>,
)
