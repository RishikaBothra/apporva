import bcrypt from "bcrypt";
import { findUserByEmail, createUser } from "../db/repositories/user_repository";
import type { UserRole } from "../db/schema/user";

type SignupInput = {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
};

export async function signupService(input: SignupInput): Promise<void> {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await createUser({
    fullName: input.fullName,
    email: input.email,
    password: hashedPassword,
    role: input.role,
  });
}