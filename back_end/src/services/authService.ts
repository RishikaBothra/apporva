import bcrypt from "bcrypt";
import {
    findUserByEmail,
    createUser,
} from "../db/repositories/user_repository";
import type { UserRole } from "../db/schema/user";
import { generateToken } from "src/utils/jwt-utils";
import { Role } from "src/types/user.type";

type SignupInput = {
    fullName: string;
    email: string;
    password: string;
};

export async function signupService(input: SignupInput): Promise<void> {
    const existingUser = await findUserByEmail(input.email);

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    await createUser({
        fullName: input.fullName,
        email: input.email,
        password: hashedPassword,
    });
}

export async function signinService(
    email: string,
    password: string,
): Promise<{ token: string }> {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    const token = generateToken({
        id: user.id,
        role: user.role as Role,
    });

    return { token };
}
