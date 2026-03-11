import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { usePublicProfileByUsernameQuery } from "@/hooks/queries/useUsersQueries";

export default function PublicUserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const profileQuery = usePublicProfileByUsernameQuery(username);

  useEffect(() => {
    if (profileQuery.isError) {
      navigate("/app", { replace: true });
    }
  }, [profileQuery.isError, navigate]);

  if (profileQuery.isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="rounded-2xl border border-primary/20 bg-white px-6 py-4 text-primary shadow-sm">
            <p className="font-medium">Carregando perfil...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!profileQuery.data) {
    return (
      <AppShell>
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="rounded-2xl border border-danger/20 bg-white px-6 py-4 text-danger shadow-sm">
            <p className="font-medium">Usuário não encontrado</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const profile = profileQuery.data;
  const location = profile.city && profile.state ? `${profile.city}, ${profile.state}` : null;
  const createdAtDate = profile.createdAt ? new Date(profile.createdAt) : null;
  const createdAtFormatted = createdAtDate?.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-neutral-light to-neutral-light py-8 px-4">
        <div className="mx-auto max-w-2xl">
          {/* Profile Card */}
          <div className="rounded-3xl border border-primary/10 bg-white p-8 shadow-lg">
            {/* Header com botão voltar */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-neutral-dark hover:text-primary"
              >
                ← Voltar
              </Button>
            </div>

            {/* Profile Photo */}
            <div className="mb-6 flex justify-center">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.name}
                  className="h-32 w-32 rounded-full border-4 border-primary/20 object-cover"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary/20 bg-primary/10">
                  <span className="text-4xl text-primary/60">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-neutral-dark">
                {profile.name}
              </h1>
              {profile.username && (
                <p className="text-sm text-neutral-medium">
                  @{profile.username}
                </p>
              )}

              {profile.bio && (
                <p className="pt-4 text-base text-neutral-dark">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Location and Member Since */}
            <div className="mt-8 space-y-3 border-t border-neutral-light pt-6">
              {location && (
                <div className="flex items-center justify-center space-x-2 text-neutral-medium">
                  <span className="text-lg">📍</span>
                  <span>{location}</span>
                </div>
              )}

              {createdAtFormatted && (
                <div className="flex items-center justify-center space-x-2 text-neutral-medium">
                  <span className="text-lg">📅</span>
                  <span>Membro desde {createdAtFormatted}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
