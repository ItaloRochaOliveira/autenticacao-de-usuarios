import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export enum USER_ROLES {
  NORMAL = "NORMAL",
  ADMIN = "ADMIN",
}

export interface tokenPayload {
  id: string;
  name: string;
  role: USER_ROLES;
}

export class TokenManage {
  public createToken = (payload: tokenPayload) => {
    const token = jwt.sign(payload, process.env.JWT_KEY as string, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return token;
  };
}
