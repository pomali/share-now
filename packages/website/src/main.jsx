import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from './components/ui/provider'
import { Toaster } from './components/ui/toaster'
import App from './App.jsx'

globalThis.__quietMemoryInitializerPrefixURL = globalThis.__quietMemoryInitializerPrefixURL || ''

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider>
      <App />
      <Toaster />
    </Provider>
  </StrictMode>,
)
