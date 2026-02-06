import { Navigate, Route, Routes } from 'react-router-dom';
import BarPage from './pages/BarPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import RoomsPage from './pages/RoomsPage';
import UiKitPage from './pages/UiKitPage';

export const routePaths = {
  landing: '/',
  login: '/login',
  onboarding: '/onboarding',
  rooms: '/rooms',
  bar: '/bar/:roomId',
  uiKit: '/ui-kit',
} as const;

export function AppRoutes() {
  return (
    <Routes>
      <Route path={routePaths.landing} element={<LandingPage />} />
      <Route path={routePaths.login} element={<LoginPage />} />
      <Route path={routePaths.onboarding} element={<OnboardingPage />} />
      <Route path={routePaths.rooms} element={<RoomsPage />} />
      <Route path={routePaths.uiKit} element={<UiKitPage />} />
      <Route path={routePaths.bar} element={<BarPage />} />
      <Route path="*" element={<Navigate to={routePaths.landing} replace />} />
    </Routes>
  );
}
