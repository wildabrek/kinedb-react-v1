// permissions.ts

export type Role = "admin" | "manager" | "teacher" | "student";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    "dashboard",
    "manage_schools",
    "manage_teachers",
    "manage_students",
    "manage_classes",
    "manage_games",
    "manage_game_impacts",
    "manage_strengths",
    "manage_areas",
    "manage_skills",
    "manage_analytics",
    "manage_reports",
    "manage_notifications",
    "manage_settings",
  ],
  manager: [
    "dashboard",
    "manage_teachers",
    "manage_students",
    "manage_classes",
    "view_games",
    "view_analytics",
    "view_reports",
    "manage_feedback",
  ],
  teacher: [
    "dashboard",
    "view_students",
    "view_classes",
    "view_games",
    "view_analytics",
    "view_reports",
    "view_notifications",
    "manage_feedback",
  ],
  student: [
    "dashboard",
    "play_games",
    "view_own_progress",
  ],
};
