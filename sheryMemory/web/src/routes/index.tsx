import { createBrowserRouter } from 'react-router-dom'
import { BaseLayout } from '../layouts/BaseLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import ItemDetailPage from '../features/items/pages/ItemDetailPage'
import CollectionDetailPage from '../features/collections/pages/CollectionDetailPage'
import { HomePage } from '../features/home/pages/HomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <BaseLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/items/:id',
    element: <ItemDetailPage />,
  },
  {
    path: '/collections/:id',
    element: <CollectionDetailPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
])
