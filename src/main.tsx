import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Dev server on a phone over wifi: iOS Safari drops Vite's live-reload socket
// every so often, and Vite answers a dropped socket by reloading the whole page,
// which throws away where you were in the flow. Off localhost, stay on the page
// instead (refresh by hand to pick up code changes). Waiting forever here holds
// back Vite's reload, which runs after this listener settles.
if (import.meta.hot && !['localhost', '127.0.0.1'].includes(location.hostname)) {
  import.meta.hot.on('vite:ws:disconnect', () => {
    console.info('[baton] Dev server connection dropped; staying on this page. Refresh to load code changes.')
    return new Promise<never>(() => {})
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
