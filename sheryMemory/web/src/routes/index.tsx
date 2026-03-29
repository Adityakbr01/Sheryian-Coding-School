import { createBrowserRouter } from 'react-router-dom'
import { BaseLayout } from '../layouts/BaseLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import ItemDetailPage from '../features/items/pages/ItemDetailPage'
import CollectionDetailPage from '../features/collections/pages/CollectionDetailPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <BaseLayout />,
    children: [
      {
        index: true,
        element: (
          <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 text-center">
            <h1 className="font-HelveticaNow mb-4 text-5xl font-bold text-(--text-primary)">
              Explore <span className="text-(--accent)">SheryMemory</span>
            </h1>
            <p className="max-w-2xl text-xl text-(--text-secondary)">
              Start building your secure digital memory box. Please sign in or
              register to continue.
            </p>
          </div>
        ),
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
