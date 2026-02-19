export const role = {
  admin: "admin",
  manager: "manager",
  employee: "employee",
} as const;

export type Role = (typeof role)[keyof typeof role];

declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        role: Role;
      };
    }
  }
}

export {};