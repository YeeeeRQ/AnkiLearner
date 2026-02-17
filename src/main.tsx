import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'jotai'
import { HashRouter } from 'react-router-dom'
import './index.css'
import AppRouter from './AppRouter'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <HashRouter>
        <AppRouter />
      </HashRouter>
    </Provider>
  </StrictMode>,
)
