import { Button } from "@/components/ui/button";
import { SearchSelect } from "@/components/ui/search-select";
import { UserLink } from "@/components/ui/UserLink";
import type { TeamMember, TeamRole } from "@/types/teams";

type TeamMembersPanelProps = {
  members: TeamMember[];
  currentUserId?: string;
  currentUserRole?: TeamRole;
  isLoading: boolean;
  isUpdatingRole: boolean;
  isRemovingMember: boolean;
  errorMessage: string;
  successMessage: string;
  onChangeRole: (userId: string, role: Exclude<TeamRole, "OWNER">) => void;
  onRemoveMember: (userId: string) => void;
};

function formatRoleLabel(role: TeamRole) {
  if (role === "OWNER") return "Dono";
  if (role === "ADMIN") return "Admin";
  return "Membro";
}

export function TeamMembersPanel({
  members,
  currentUserId,
  currentUserRole,
  isLoading,
  isUpdatingRole,
  isRemovingMember,
  errorMessage,
  successMessage,
  onChangeRole,
  onRemoveMember,
}: TeamMembersPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">Membros</h2>
        <p className="text-sm text-gray-600">Carregando membros...</p>
      </div>
    );
  }

  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  return (
    <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-primary">Membros</h2>
        <p className="text-sm text-gray-600">
          Gerencie papéis e participantes do time.
        </p>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-gray-600">Nenhum membro encontrado.</p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const memberUserId = member.userId ?? member.user?.id ?? "";
            const isCurrentUser = memberUserId === currentUserId;
            const memberName = member.user?.name || "Usuário";
            const memberLocation = member.user?.city && member.user?.state
              ? `${member.user.city}/${member.user.state}`
              : "Sem localização";
            const hasValidUserId = Boolean(memberUserId);

            const canChangeRole =
              canManage &&
              hasValidUserId &&
              !isCurrentUser &&
              member.role !== "OWNER" &&
              (currentUserRole === "OWNER" || member.role === "MEMBER");

            const canRemove =
              canManage &&
              hasValidUserId &&
              !isCurrentUser &&
              member.role !== "OWNER" &&
              (currentUserRole === "OWNER" || member.role === "MEMBER");

            return (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <UserLink username={member.user?.username}>
                    {memberName}
                  </UserLink>
                  <p className="text-sm text-gray-600">
                    {memberLocation} • {formatRoleLabel(member.role)}
                    {isCurrentUser ? " • você" : ""}
                  </p>
                </div>

                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                  {canChangeRole ? (
                    <SearchSelect
                      items={[
                        { value: "ADMIN", label: "Admin" },
                        { value: "MEMBER", label: "Membro" },
                      ]}
                      value={member.role}
                      onChange={(nextRole) => {
                        if (nextRole === "ADMIN" || nextRole === "MEMBER") {
                          onChangeRole(memberUserId, nextRole);
                        }
                      }}
                      disabled={isUpdatingRole || isRemovingMember}
                      className="min-w-36"
                      searchPlaceholder="Buscar papel..."
                      emptyText="Nenhum papel encontrado."
                    />
                  ) : (
                    <span className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      {formatRoleLabel(member.role)}
                    </span>
                  )}

                  {canRemove && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        onRemoveMember(memberUserId);
                      }}
                      disabled={isUpdatingRole || isRemovingMember}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {errorMessage && (
        <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      )}
    </div>
  );
}
