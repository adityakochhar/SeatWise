import bcrypt from "bcryptjs";
import { ApiError } from "../../lib/api-error";
import { signToken } from "../../lib/jwt";
import { toObjectId } from "../../lib/ids";
import { UserModel, toPublicUser, type PublicUser } from "../users/user.model";
import type { LoginInput, RegisterInput } from "./auth.schemas";

interface AuthResult {
  user: PublicUser;
  token: string;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await UserModel.exists({ email: input.email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists.");
  }
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await UserModel.create({ name: input.name, email: input.email, passwordHash });
  return { user: toPublicUser(user), token: signToken({ sub: user._id.toString(), role: user.role }) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() });
  const matches = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
  if (!user || !matches) {
    throw ApiError.unauthorized("Email or password is incorrect.");
  }
  return { user: toPublicUser(user), token: signToken({ sub: user._id.toString(), role: user.role }) };
}

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await UserModel.findById(toObjectId(userId));
  if (!user) {
    throw ApiError.notFound("Account not found.");
  }
  return toPublicUser(user);
}
