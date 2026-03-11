import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ConfirmEmailPage from "@/pages/ConfirmEmailPage";
import CreateGamePage from "@/pages/CreateGamePage";
import EditFieldPage from "@/pages/EditFieldPage";
import EditGamePage from "@/pages/EditGamePage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import GameDetailsPage from "@/pages/GameDetailsPage";
import HomePage from "@/pages/HomePage";
import InviteTeamPage from "@/pages/InviteTeamPage";
import LoginPage from "@/pages/LoginPage";
import MyTeamsPage from "@/pages/MyTeamsPage";
import ProfilePage from "@/pages/ProfilePage";
import PublicUserProfilePage from "@/pages/PublicUserProfilePage";
import RegisterPage from "@/pages/RegisterPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import TeamDetailsPage from "@/pages/TeamDetailsPage";
import TeamOverviewPage from "@/pages/TeamOverviewPage";
import SearchTeamsPage from "@/pages/SearchTeamsPage";

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-light px-4">
        <div className="rounded-2xl border border-primary/20 bg-white px-6 py-4 text-primary shadow-sm">
          <p className="font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invite" element={<InviteTeamPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/confirm-email" element={<ConfirmEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/games/new"
        element={
          <ProtectedRoute>
            <CreateGamePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/games/:gameId"
        element={<GameDetailsPage />}
      />
      <Route path="/games/:gameId" element={<GameDetailsPage />} />
      <Route
        path="/app/games/:gameId/edit"
        element={
          <ProtectedRoute>
            <EditGamePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/teams"
        element={
          <ProtectedRoute>
            <MyTeamsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/teams/search"
        element={
          <ProtectedRoute>
            <SearchTeamsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/teams/new"
        element={
          <ProtectedRoute>
            <TeamDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/teams/:teamId/fields/new"
        element={
          <ProtectedRoute>
            <EditFieldPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/teams/:teamId/fields/:fieldId/edit"
        element={
          <ProtectedRoute>
            <EditFieldPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/teams/:teamId"
        element={
          <ProtectedRoute>
            <TeamOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route path="/teams/:teamId" element={<TeamOverviewPage />} />
      <Route
        path="/app/teams/:teamId/edit"
        element={
          <ProtectedRoute>
            <TeamDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={<PublicUserProfilePage />}
      />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

export default App;
