import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { SiteSettingsProvider } from './context/SiteSettings'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SiteSettingsProvider>
          <App />
        </SiteSettingsProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)
