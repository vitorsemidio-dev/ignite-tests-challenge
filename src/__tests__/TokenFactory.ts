import { sign } from "jsonwebtoken";
import { User } from "../modules/users/entities/User";
import authConfig from "../config/auth";

export function makeJWTToken(user: User) {
  const { secret, expiresIn } = authConfig.jwt;

  const token = sign({ user }, secret, {
    subject: user.id,
    expiresIn,
  });

  return {
    token,
  };
}
