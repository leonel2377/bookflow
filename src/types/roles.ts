/** Rôles utilisateur — sans import Prisma (compatible middleware Edge). */
export const UserRole = {
  CLIENT: "CLIENT",
  PROVIDER: "PROVIDER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
