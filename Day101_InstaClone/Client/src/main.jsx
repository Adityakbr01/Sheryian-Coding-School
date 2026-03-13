import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.scss'
import routes from './routes/index.jsx'
import { AuthProvider } from './provider/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={routes} />
    </AuthProvider>
  </StrictMode>,
)
