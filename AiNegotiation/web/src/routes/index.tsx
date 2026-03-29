import { createBrowserRouter } from 'react-router-dom'
import { BaseLayout } from '../layouts/BaseLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import HomePage from '../features/negotiate/pages/HomePage'
import GamePage from '../features/negotiate/pages/GamePage'
import ResultsPage from '../features/negotiate/pages/ResultsPage'
import LeaderboardPage from '../features/leaderboard/pages/LeaderboardPage'
import AdminPage from '../features/admin/pages/AdminPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <BaseLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'game/:sessionId', element: <GamePage /> },
      { path: 'results/:sessionId', element: <ResultsPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
])
