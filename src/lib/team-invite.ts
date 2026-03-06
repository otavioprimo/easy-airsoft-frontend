const TEAM_INVITE_SESSION_KEY = "pendingTeamInviteCode";

function normalizeInviteCode(value: string) {
  return value.trim().toUpperCase();
}

export function getPendingTeamInviteCode() {
  const code = sessionStorage.getItem(TEAM_INVITE_SESSION_KEY);
  if (!code) {
    return null;
  }

  const normalizedCode = normalizeInviteCode(code);
  return normalizedCode || null;
}

export function setPendingTeamInviteCode(code: string) {
  const normalizedCode = normalizeInviteCode(code);

  if (!normalizedCode) {
    return;
  }

  sessionStorage.setItem(TEAM_INVITE_SESSION_KEY, normalizedCode);
}

export function clearPendingTeamInviteCode() {
  sessionStorage.removeItem(TEAM_INVITE_SESSION_KEY);
}

export function buildTeamInviteDeepLink(inviteCode: string) {
  const normalizedCode = normalizeInviteCode(inviteCode);
  const baseUrl = window.location.origin;
  const url = new URL("/invite", baseUrl);

  url.searchParams.set("code", normalizedCode);

  return url.toString();
}
