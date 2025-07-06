import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/errorboundary'
import { AuthProvider, useAuth } from './contexts/authcontext'
import DataProvider from './contexts/dataprovider'
import { ThemeProvider } from './contexts/themecontext'
import OfflineBanner from './components/offlinebanner'
import Navbar from './components/navbar'
import LoadingSpinner from './components/loadingspinner'
import Footer from './components/footer'

const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Transactions = React.lazy(() => import('./pages/Transactions'))
const NetWorth = React.lazy(() => import('./pages/NetWorth'))
const Goals = React.lazy(() => import('./pages/Goals'))
const Reports = React.lazy(() => import('./pages/Reports'))
const Login = React.lazy(() => import('./pages/auth/Login'))
const Signup = React.lazy(() => import('./pages/auth/Signup'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <ThemeProvider>
            <Router>
              <OfflineBanner />
              <Navbar />
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <ProtectedRoute>
                        <Transactions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/net-worth"
                    element={
                      <ProtectedRoute>
                        <NetWorth />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/goals"
                    element={
                      <ProtectedRoute>
                        <Goals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Footer />
            </Router>
          </ThemeProvider>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}