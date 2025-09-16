import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignInScreen from "./screens/SignIn/SignInScreen";
import SidebarLayout from "./components/SidebarLayout";
import FloatingWidgets from "./components/FloatingWidgets";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastSystem";

// Import your page components
import HomePage from "./screens/HomePage/HomePage";
import InsightsPage from "./screens/InsightsPage/InsightsPage";
import ConnectPage from "./screens/ConnectPage/ConnectPage";
import LaunchPadPage from "./screens/ControlCenterPage/ControlCenterPage";
import BoosterPage from "./screens/BoosterPage/BoosterPage";
import ReferralPage from "./screens/ReferralPage/ReferralPage";
import ReportsPage from "./screens/ReportScreen/ReportScreen";
import SettingsPage from "./screens/SettingsPage/SettingsPage";
import BillingPage from "./screens/SettingsPage/BillingPage";
import ProfilePage from "./screens/ProfilePage";

// Import consolidated contexts
import { CoreProvider, useAuth, useApp } from "./context/CoreContext";
import {
  UIProvider,
  NotificationContainer,
  useNotifications,
} from "./context/UIContext";
import { BusinessDataProvider } from "./context/BusinessDataContext";
import { DataProvider } from "./context/DataContext";
import { ConnectProvider } from "./context/ConnectContext";
import { ConfigProvider } from "./context/ConfigContext";

import "./App.css";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/signin" replace />;
};

// Main App Layout component that wraps protected routes
const AppLayout = ({ children }) => {
  const { user, signOut } = useAuth();
  const { getHealthStatus } = useApp();

  return (
    <>
      <SidebarLayout
        user={user}
        onSignOut={signOut}
        healthStatus={getHealthStatus()}
      >
        {children}
      </SidebarLayout>
      <FloatingWidgets />
    </>
  );
};

const AppContent = () => {
  const { user } = useAuth();

  // Show loading state while checking auth
  if (user === undefined) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Public route for sign in */}
          <Route
            path="/signin"
            element={user ? <Navigate to="/" replace /> : <SignInScreen />}
          />

          {/* Protected routes wrapped in layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HomePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <InsightsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/connect"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ConnectPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/control-center"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LaunchPadPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/booster"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BoosterPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/referral"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ReferralPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ReportsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Settings routes - now separate pages */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/location"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/billing"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BillingPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
};

// BusinessData wrapper that provides notification hooks
const BusinessDataWithNotifications = ({ children }) => {
  const notificationHooks = useNotifications();

  return (
    <BusinessDataProvider notificationHooks={notificationHooks}>
      {children}
    </BusinessDataProvider>
  );
};

// Main App component with consolidated providers
const App = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ConfigProvider>
          <UIProvider>
            <CoreProvider>
              <DataProvider>
                <ConnectProvider>
                  <BusinessDataWithNotifications>
                    <AppContent />
                    <NotificationContainer />
                  </BusinessDataWithNotifications>
                </ConnectProvider>
              </DataProvider>
            </CoreProvider>
          </UIProvider>
        </ConfigProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
