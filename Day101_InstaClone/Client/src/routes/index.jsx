import { createBrowserRouter, Navigate } from 'react-router'
import App from '../App.jsx'
import LoginPage from '../features/auth/pages/LoginPage.jsx'
import RegisterPage from '../features/auth/pages/RegisterPage.jsx'

const routes = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
])

export default routes
