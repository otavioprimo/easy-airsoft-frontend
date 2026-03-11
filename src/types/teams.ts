export type Team = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  city?: string | null;
  state?: string | null;
  logoUrl?: string | null;
  createdBy?: string | null;
  followersCount?: number | null;
  createdAt?: string | null;
  currentUserRole?: TeamRole | null;
  canEdit?: boolean;
  currentUserPermissions?: {
    canEditTeam: boolean;
    canGenerateInviteCode: boolean;
    canManageMembers: boolean;
    canPromoteToAdmin: boolean;
    canRemoveAdmins: boolean;
    canDeleteTeam: boolean;
  } | null;
};

export type TeamRole = "OWNER" | "ADMIN" | "MEMBER";

export type TeamMemberUser = {
  id: string;
  name: string;
  username?: string | null;
  profilePhoto?: string | null;
  city?: string | null;
  state?: string | null;
};

export type TeamMember = {
  id: string;
  teamId?: string | null;
  userId?: string | null;
  role: TeamRole;
  createdAt?: string | null;
  user?: TeamMemberUser | null;
};

export type TeamFollowing = {
  teamId: string;
  userId: string;
  createdAt?: string | null;
  team: Team;
};

export type ListTeamsResponse = {
  items: Team[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateTeamPayload = {
  name: string;
  description?: string;
  city?: string;
  state?: string;
  logoUrl?: string;
};

export type UpdateTeamPayload = {
  name?: string;
  description?: string;
  city?: string;
  state?: string;
  logoUrl?: string;
};

export type TeamInviteCodePayload = {
  expiresInDays?: number;
};

export type TeamInviteCodeResponse = {
  teamId: string;
  teamName: string;
  inviteCode: string;
  expiresAt: string;
};

export type JoinTeamByCodePayload = {
  inviteCode: string;
};

export type JoinTeamByCodeResponse = {
  teamId: string;
  teamName: string;
  role: TeamRole;
};

export type SetTeamMemberRolePayload = {
  userId: string;
  role: Exclude<TeamRole, "OWNER">;
};
