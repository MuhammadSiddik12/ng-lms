import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { User } from "../models";
import { ApiError } from "../utils/ApiError";
import { signAccessToken, toPublicUser } from "../utils/jwt";
import type { LoginInput, RegisterInput } from "../validations/auth.validation";

const SALT_ROUNDS = 10;

export async function registerUser(input: RegisterInput) {
  const email = input.email.toLowerCase();

  const existing = await User.findOne({
    where: { email: { [Op.iLike]: email } },
  });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await User.create({
    name: input.name,
    email,
    passwordHash,
    role: input.role,
  });

  const publicUser = toPublicUser(user);
  const token = signAccessToken(publicUser);

  return { user: publicUser, token };
}

export async function loginUser(input: LoginInput) {
  const email = input.email.toLowerCase();
  const user = await User.findOne({
    where: { email: { [Op.iLike]: email } },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const publicUser = toPublicUser(user);
  const token = signAccessToken(publicUser);

  return { user: publicUser, token };
}

export async function getUserById(id: string) {
  const user = await User.findByPk(id, {
    attributes: ["id", "email", "name", "role", "createdAt"],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}
