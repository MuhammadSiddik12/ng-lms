import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { UserRole } from "../models/User";

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export function signAccessToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_SECRET as Secret, options);
}

export function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
