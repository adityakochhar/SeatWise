import { Schema, model, type Types } from "mongoose";

export type UserRole = "user" | "admin";

export interface User {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const UserModel = model<User>("User", userSchema);

export function toPublicUser(user: User): PublicUser {
  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
}
