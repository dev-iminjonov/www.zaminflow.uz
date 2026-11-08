/**
 * Canonical avatar resolver for ZaminFlow users and team members.
 * Prevents assigning a real team member's photograph to a different person's name,
 * and ensures that known team members always get their authentic portrait.
 */
export function resolveUserAvatar(
  fullName?: string | null,
  email?: string | null
): string | null {
  const haystack = `${fullName || ""} ${email || ""}`.toLowerCase();

  if (
    haystack.includes("muhammadaziz") ||
    haystack.includes("mukhammadaziz") ||
    haystack.includes("iminjonov") ||
    haystack.includes("admin@zaminflow.uz")
  ) {
    return "/images/team-muhammadaziz.webp";
  }

  if (haystack.includes("sevinchoy") || haystack.includes("soporboyeva")) {
    return "/images/team-sevinchoy.webp";
  }

  if (haystack.includes("akrom") || haystack.includes("abdumanov")) {
    return "/images/team-akrom.webp";
  }

  if (
    haystack.includes("shohjahon") ||
    haystack.includes("shokhjakhon") ||
    haystack.includes("abdufattohov")
  ) {
    return "/images/team-shohjahon.webp";
  }

  return null;
}

export function getDisplayInitials(fullName?: string | null): string {
  if (!fullName || !fullName.trim()) return "U";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}
