import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Unregister any service workers so stale cached code never blocks updates
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister())
    if (regs.length > 0) window.location.reload()
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
