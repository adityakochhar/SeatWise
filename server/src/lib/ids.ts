import { Types } from "mongoose";
import { ApiError } from "./api-error";

export function toObjectId(value: string, label = "id"): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) {
    throw ApiError.badRequest(`Invalid ${label}.`);
  }
  return new Types.ObjectId(value);
}

export function idOf(doc: { _id: Types.ObjectId }): string {
  return doc._id.toString();
}
