import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log(`
  🔥🔥🔥🔥🔥🔥     🔥🔥🔥🔥🔥🔥
  🔥🔥     🔥🔥     🔥🔥     🔥🔥
  🔥🔥               🔥🔥   
  🔥🔥               🔥🔥
  🔥🔥               🔥🔥🔥🔥🔥🔥
  🔥🔥                         🔥🔥
  🔥🔥                         🔥🔥
  🔥🔥     🔥🔥     🔥🔥     🔥🔥
  🔥🔥🔥🔥🔥🔥     🔥🔥🔥🔥🔥🔥

Developed Solo! 💪
If you spot a bug, respect the system and inform! ➡️📧
`);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
