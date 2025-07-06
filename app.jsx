import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider, { useAuth } from './context/AuthContext';
import DataProvider from './context/DataProvider';
import Layout from './components/Layout';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

const DashboardPage = React.lazy(() => import('./DashboardPage'));
const TransactionsPage = React.lazy(() => import('./TransactionsPage'));
const NetWorthPage = React.lazy(() => import('./NetWorthPage'));
const GoalsPage = React.lazy(() => import('./GoalsPage'));
const SettingsPage = React.lazy(() => import('./SettingsPage'));
const NotFoundPage = React.lazy(() => import('./NotFoundPage'));

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <PrivateRoute>
                      <TransactionsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/net-worth"
                  element={
                    <PrivateRoute>
                      <NetWorthPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/goals"
                  element={
                    <PrivateRoute>
                      <GoalsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <SettingsPage />
                    </PrivateRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="*"
                  element={
                    <PrivateRoute>
                      <NotFoundPage />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;