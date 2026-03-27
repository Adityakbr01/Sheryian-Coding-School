import { createBrowserRouter } from 'react-router-dom';
import { BaseLayout } from '../layouts/BaseLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ItemDetailPage from '../features/items/pages/ItemDetailPage';
import CollectionDetailPage from '../features/collections/pages/CollectionDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <BaseLayout />,
    children: [
      {
        index: true,
        element: (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
            <h1 className="text-5xl font-HelveticaNow font-bold text-[var(--text-primary)] mb-4">
              Explore <span className="text-[var(--accent)]">SheryMemory</span>
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl">
              Start building your secure digital memory box. Please sign in or register to continue.
            </p>
          </div>
        )
      }
    ]
  },
  {
    path: '/dashboard',
    element: <DashboardPage />
  },
  {
    path: '/items/:id',
    element: <ItemDetailPage />
  },
  {
    path: '/collections/:id',
    element: <CollectionDetailPage />
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/register',
        element: <RegisterPage />
      }
    ]
  }
]);
