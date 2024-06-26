import { select } from '@libs/dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './styles.css'

createRoot(select('#root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
