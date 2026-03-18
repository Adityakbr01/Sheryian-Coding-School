import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { router } from './navigation'
import { ThemeProvider } from './theme/theme-provider'
import Nav from './layouts/nav'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Nav />
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
