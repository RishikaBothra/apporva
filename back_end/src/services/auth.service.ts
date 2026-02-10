import bcrypt from "bcrypt";
import { findUserByEmail, createUser } from "../repositories/user.repository";

type SignupInput = {
  fullName: string;
  email: string;
  password: string;
  role: "employee" | "manager" | "admin";
};

export async function signupService(input: SignupInput) {
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

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
}
